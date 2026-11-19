import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { emailJobs } from "@/db/schema";
import type { EmailJobInput } from "./jobs";
import { getPublisherChannel, publishEmail } from "./rabbit";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type QueuedEmail = { id: string; priority: number };

// Publica no RabbitMQ os emails já gravados e marca-os como publicados.
// Nunca lança: se o RabbitMQ estiver indisponível, o worker volta a publicá-los
// mais tarde (ver republishUnpublished em worker/queue.ts).
export async function dispatchEmails(queued: QueuedEmail[]) {
	if (!queued.length) return;
	try {
		const channel = await getPublisherChannel();
		for (const job of queued) {
			await publishEmail(channel, job.id, job.priority);
		}
		await db
			.update(emailJobs)
			.set({ publishedAt: sql`now()` })
			.where(inArray(emailJobs.id, queued.map((job) => job.id)));
	} catch (error) {
		console.error("[mail] Falha ao publicar no RabbitMQ; o worker volta a tentar:", error);
	}
}

// Grava os emails em email_jobs. Jobs com dedupeKey repetida são ignorados.
//
// Sem `tx`, publica logo no RabbitMQ. Com `tx`, os emails ficam gravados na mesma
// transacção (só existem se ela for confirmada) e quem chama deve publicar depois
// do commit com dispatchEmails(); se não o fizer, o worker publica-os ao fim de 1 min.
export async function enqueueEmails(jobs: EmailJobInput[], options: { tx?: Transaction } = {}) {
	if (!jobs.length) return [];

	const queued = await (options.tx ?? db)
		.insert(emailJobs)
		.values(
			jobs.map((job) => ({
				template: job.template,
				to: job.to,
				payload: job.payload,
				priority: job.priority ?? 0,
				dedupeKey: job.dedupeKey ?? null,
			}))
		)
		.onConflictDoNothing({ target: emailJobs.dedupeKey })
		.returning({ id: emailJobs.id, priority: emailJobs.priority });

	if (!options.tx) await dispatchEmails(queued);
	return queued;
}

export function enqueueEmail(job: EmailJobInput, options: { tx?: Transaction } = {}) {
	return enqueueEmails([job], options);
}
