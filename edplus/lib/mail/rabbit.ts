import amqp, { type ChannelModel, type ConfirmChannel, type Options } from "amqplib";

// Nome base: exchange e fila principal. Filas derivadas: <base>.retry.<atraso> e <base>.failed.
export const EMAIL_QUEUE = process.env.RABBITMQ_EMAIL_QUEUE || "academia.emails";
export const EMAIL_EXCHANGE = EMAIL_QUEUE;
export const FAILED_QUEUE = `${EMAIL_QUEUE}.failed`;
const SEND_ROUTING_KEY = "send";

// Nova tentativa após 1 min, 5 min, 30 min e 2 h: a mensagem espera na fila de retry
// até expirar e o RabbitMQ devolve-a (dead-letter) à fila principal.
export const RETRY_QUEUES = [
	{ name: `${EMAIL_QUEUE}.retry.1m`, ttlMs: 60_000 },
	{ name: `${EMAIL_QUEUE}.retry.5m`, ttlMs: 5 * 60_000 },
	{ name: `${EMAIL_QUEUE}.retry.30m`, ttlMs: 30 * 60_000 },
	{ name: `${EMAIL_QUEUE}.retry.2h`, ttlMs: 2 * 60 * 60_000 },
] as const;

export type EmailMessage = { jobId: string };

// Filas quorum: replicadas num cluster e com suporte a prioridade (normal/alta).
const QUORUM: Options.AssertQueue = { durable: true, arguments: { "x-queue-type": "quorum" } };

export function rabbitUrl() {
	const url = process.env.RABBITMQ_URL;
	if (!url) throw new Error("RABBITMQ_URL não configurado.");
	// A porta 15672 é a UI de gestão (HTTP); o broker fala AMQP (5672, ou 5671 com TLS).
	if (!/^amqps?:\/\//i.test(url)) {
		throw new Error(
			"RABBITMQ_URL deve usar amqp:// ou amqps:// (ex.: amqp://utilizador:password@host:5672/vhost), não o endereço HTTP da UI de gestão."
		);
	}
	return url;
}

export async function connectRabbit(connectionName: string) {
	return amqp.connect(rabbitUrl(), { clientProperties: { connection_name: connectionName } });
}

// Idempotente: pode ser chamado por qualquer processo que publique ou consuma.
export async function assertEmailTopology(channel: ConfirmChannel) {
	await channel.assertExchange(EMAIL_EXCHANGE, "direct", { durable: true });
	await channel.assertQueue(EMAIL_QUEUE, QUORUM);
	await channel.bindQueue(EMAIL_QUEUE, EMAIL_EXCHANGE, SEND_ROUTING_KEY);
	await channel.assertQueue(FAILED_QUEUE, QUORUM);
	for (const retry of RETRY_QUEUES) {
		await channel.assertQueue(retry.name, {
			durable: true,
			arguments: {
				"x-queue-type": "quorum",
				"x-message-ttl": retry.ttlMs,
				"x-dead-letter-exchange": EMAIL_EXCHANGE,
				"x-dead-letter-routing-key": SEND_ROUTING_KEY,
				"x-dead-letter-strategy": "at-least-once",
				"x-overflow": "reject-publish",
			},
		});
	}
}

function messageOptions(priority: number, headers?: Record<string, unknown>): Options.Publish {
	return {
		persistent: true,
		contentType: "application/json",
		priority,
		headers,
	};
}

function encode(message: EmailMessage) {
	return Buffer.from(JSON.stringify(message));
}

// Publica e espera a confirmação do broker (publisher confirms).
export async function publishEmail(channel: ConfirmChannel, jobId: string, priority: number) {
	channel.publish(EMAIL_EXCHANGE, SEND_ROUTING_KEY, encode({ jobId }), messageOptions(priority));
	await channel.waitForConfirms();
}

export async function publishRetry(
	channel: ConfirmChannel,
	jobId: string,
	priority: number,
	attempt: number
) {
	const queue = RETRY_QUEUES[Math.min(attempt, RETRY_QUEUES.length) - 1];
	channel.sendToQueue(queue.name, encode({ jobId }), messageOptions(priority, { "x-attempt": attempt }));
	await channel.waitForConfirms();
	return queue.ttlMs;
}

export async function publishFailed(channel: ConfirmChannel, jobId: string, error: string) {
	channel.sendToQueue(FAILED_QUEUE, encode({ jobId }), messageOptions(0, { "x-error": error.slice(0, 500) }));
	await channel.waitForConfirms();
}

export function parseEmailMessage(content: Buffer): EmailMessage | null {
	try {
		const data = JSON.parse(content.toString("utf8"));
		return typeof data?.jobId === "string" ? { jobId: data.jobId } : null;
	} catch {
		return null;
	}
}

// Ligação partilhada do lado do site (Next), criada só quando é precisa.
const globalForRabbit = globalThis as unknown as {
	emailPublisher: Promise<{ connection: ChannelModel; channel: ConfirmChannel }> | undefined;
};

async function openPublisher() {
	const connection = await connectRabbit("academia-site");
	const channel = await connection.createConfirmChannel();
	await assertEmailTopology(channel);
	const reset = () => {
		globalForRabbit.emailPublisher = undefined;
	};
	connection.on("close", reset);
	connection.on("error", reset);
	return { connection, channel };
}

export async function getPublisherChannel() {
	globalForRabbit.emailPublisher ??= openPublisher().catch((error) => {
		globalForRabbit.emailPublisher = undefined;
		throw error;
	});
	return (await globalForRabbit.emailPublisher).channel;
}
