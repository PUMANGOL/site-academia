// Worker de emails: consome a fila do RabbitMQ e corre as tarefas diárias.
//   bun run worker             → modo contínuo
//   bun run worker --daily-now → só coloca na fila os lembretes/feedback de hoje e termina
import type { ChannelModel, ConfirmChannel, ConsumeMessage } from "amqplib";
import { renderEmailJob } from "@/lib/mail/jobs";
import {
	assertEmailTopology,
	connectRabbit,
	EMAIL_QUEUE,
	FAILED_QUEUE,
	parseEmailMessage,
	publishEmail,
	publishFailed,
	publishRetry,
	RETRY_QUEUES,
} from "@/lib/mail/rabbit";
import { closeMailer, dryRun, mailerConfigured, sendMail } from "./mailer";
import { emailJobAttachments } from "./attachments";
import { claimJob, findUnpublished, jobStats, markFailed, markPublished, markSent } from "./queue";
import { enqueueCourseEmails, hourInTimeZone, isoDay, TIME_ZONE } from "./scheduled";

// Microsoft 365 aceita até 30 mensagens/minuto por caixa: 1 email a cada 2 s.
const MIN_SEND_INTERVAL_MS = Number(process.env.MAIL_MIN_INTERVAL_MS || 2_000);
// Hora (em Luanda) a partir da qual correm as tarefas diárias.
const DAILY_RUN_HOUR = Number(process.env.WORKER_DAILY_HOUR || 8);
const HEALTH_PORT = Number(process.env.WORKER_PORT ?? 4100);
const RECONNECT_DELAY_MS = 5_000;
const OUTBOX_INTERVAL_MS = 30_000;

const log = (...args: unknown[]) => console.log(new Date().toISOString(), "[worker]", ...args);

let running = true;
let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null = null;
let consumerTag: string | null = null;
let inFlight: Promise<void> | null = null;
let lastSendAt = 0;
let lastDailyRun: string | null = null;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

async function throttle() {
	const wait = lastSendAt + MIN_SEND_INTERVAL_MS - Date.now();
	if (wait > 0) await delay(wait);
	lastSendAt = Date.now();
}

async function handleMessage(ch: ConfirmChannel, msg: ConsumeMessage) {
	const message = parseEmailMessage(msg.content);
	if (!message) {
		log("mensagem inválida descartada:", msg.content.toString("utf8").slice(0, 200));
		ch.ack(msg);
		return;
	}

	const job = await claimJob(message.jobId, msg.fields.redelivered);
	if (!job) {
		// Já enviado, já falhado, em tratamento noutro worker ou apagado.
		ch.ack(msg);
		return;
	}

	try {
		const email = renderEmailJob(job.template, job.to, job.payload);
		email.attachments = await emailJobAttachments(job.template, job.to, job.payload);
		await throttle();
		await sendMail(email);
		await markSent(job);
		ch.ack(msg);
		log(`enviado ${job.template} → ${job.to} (${job.id})`);
	} catch (error) {
		const reason = errorMessage(error);
		const final = job.attempts >= job.maxAttempts;
		await markFailed(job, reason, final);
		if (final) {
			await publishFailed(ch, job.id, reason);
		} else {
			await publishRetry(ch, job.id, job.priority, job.attempts);
		}
		ch.ack(msg);
		log(
			final
				? `FALHOU DEFINITIVAMENTE (→ ${FAILED_QUEUE}): ${job.template} → ${job.to}`
				: `falhou, nova tentativa agendada: ${job.template} → ${job.to}`,
			`(tentativa ${job.attempts}/${job.maxAttempts})`,
			reason
		);
	}
}

function onMessage(ch: ConfirmChannel, msg: ConsumeMessage | null) {
	if (!msg) return; // consumidor cancelado pelo broker; a ligação vai ser refeita
	inFlight = handleMessage(ch, msg)
		.catch(async (error) => {
			// Erro de base de dados ou RabbitMQ: devolve a mensagem à fila e tenta de novo.
			log("erro a processar mensagem, devolvida à fila:", errorMessage(error));
			await delay(RECONNECT_DELAY_MS);
			try {
				ch.nack(msg, false, true);
			} catch {
				// canal já fechado: o RabbitMQ reentrega a mensagem sozinho
			}
		})
		.finally(() => {
			inFlight = null;
		});
}

async function consumeForever() {
	while (running) {
		try {
			connection = await connectRabbit("academia-worker");
			const ch = await connection.createConfirmChannel();
			await assertEmailTopology(ch);
			// Um email de cada vez: o ritmo é limitado pelo SMTP, não pelo RabbitMQ.
			await ch.prefetch(1);
			const closed = new Promise<void>((resolve) => connection!.once("close", () => resolve()));
			connection.on("error", (error) => log("erro na ligação ao RabbitMQ:", errorMessage(error)));
			channel = ch;
			consumerTag = (await ch.consume(EMAIL_QUEUE, (msg) => onMessage(ch, msg), { noAck: false })).consumerTag;
			log(`ligado ao RabbitMQ, a consumir "${EMAIL_QUEUE}"`);
			await closed;
			if (running) log("ligação ao RabbitMQ perdida");
		} catch (error) {
			log("não foi possível ligar ao RabbitMQ:", errorMessage(error));
		}
		channel = null;
		consumerTag = null;
		connection = null;
		if (running) await delay(RECONNECT_DELAY_MS);
	}
}

// Publica jobs que ficaram só na base de dados (ex.: RabbitMQ em baixo quando o site gravou).
async function republishUnpublished() {
	const ch = channel;
	if (!ch) return;
	const pending = await findUnpublished(100);
	for (const job of pending) {
		await publishEmail(ch, job.id, job.priority);
	}
	await markPublished(pending.map((job) => job.id));
	if (pending.length) log(`${pending.length} job(s) por publicar enviados para o RabbitMQ`);
}

async function runDailyTasks() {
	const now = new Date();
	const today = isoDay(now);
	if (lastDailyRun === today || hourInTimeZone(now) < DAILY_RUN_HOUR) return;

	const result = await enqueueCourseEmails(now);
	lastDailyRun = today;
	log("tarefas diárias:", result);
}

async function queueDepths() {
	const ch = channel;
	if (!ch) return null;
	const names = [EMAIL_QUEUE, ...RETRY_QUEUES.map((queue) => queue.name), FAILED_QUEUE];
	const depths: Record<string, number> = {};
	for (const name of names) {
		depths[name] = (await ch.checkQueue(name)).messageCount;
	}
	return depths;
}

function startHealthServer() {
	if (!HEALTH_PORT) return null;
	return Bun.serve({
		hostname: "127.0.0.1",
		port: HEALTH_PORT,
		async fetch(request) {
			if (new URL(request.url).pathname !== "/health") {
				return new Response("Not found", { status: 404 });
			}
			try {
				const rabbitConnected = channel !== null;
				return Response.json(
					{
						status: rabbitConnected ? "ok" : "degraded",
						rabbitConnected,
						smtpConfigured: mailerConfigured(),
						lastDailyRun,
						jobs: await jobStats(),
						queues: await queueDepths(),
					},
					{ status: rabbitConnected ? 200 : 503 }
				);
			} catch (error) {
				return Response.json({ status: "error", error: errorMessage(error) }, { status: 500 });
			}
		},
	});
}

function every(ms: number, task: () => Promise<void>, label: string) {
	return setInterval(() => {
		task().catch((error) => log(`erro em ${label}:`, errorMessage(error)));
	}, ms);
}

async function main() {
	if (process.argv.includes("--daily-now")) {
		log("tarefas diárias (manual):", await enqueueCourseEmails());
		process.exit(0);
	}

	if (!mailerConfigured()) {
		log("AVISO: SMTP não configurado — os emails vão falhar e ficar a aguardar nova tentativa.");
	}
	if (dryRun) log("MAIL_DRY_RUN activo: os emails são escritos no log e não são enviados.");

	const server = startHealthServer();
	const timers = [
		every(60_000, runDailyTasks, "tarefas diárias"),
		every(OUTBOX_INTERVAL_MS, republishUnpublished, "republicação"),
	];

	const shutdown = async (signal: string) => {
		if (!running) return;
		running = false;
		log(`${signal} recebido, a terminar depois do email em curso...`);
		timers.forEach(clearInterval);
		try {
			if (channel && consumerTag) await channel.cancel(consumerTag);
			await inFlight;
			await connection?.close();
		} catch {
			// a ligação pode já estar fechada
		}
		server?.stop();
		closeMailer();
		log("terminado.");
		process.exit(0);
	};
	process.on("SIGINT", () => void shutdown("SIGINT"));
	process.on("SIGTERM", () => void shutdown("SIGTERM"));

	log(
		`a arrancar (envio mín. ${MIN_SEND_INTERVAL_MS} ms, tarefas diárias às ${DAILY_RUN_HOUR}h ${TIME_ZONE}` +
			(server ? `, health em http://127.0.0.1:${server.port}/health)` : ")")
	);

	runDailyTasks().catch((error) => log("erro nas tarefas diárias:", errorMessage(error)));
	await consumeForever();
}

main().catch((error) => {
	log("erro fatal:", error);
	process.exit(1);
});
