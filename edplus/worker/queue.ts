import { and, asc, count, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { emailJobs } from "@/db/schema";

export type EmailJob = typeof emailJobs.$inferSelect;

// Reserva o job para envio. Só um worker consegue passá-lo de "pending" para
// "processing"; uma mensagem reentregue (o worker caiu a meio) pode retomar um
// job que ficou em "processing".
export async function claimJob(id: string, redelivered: boolean) {
	const [job] = await db
		.update(emailJobs)
		.set({ status: "processing", attempts: sql`${emailJobs.attempts} + 1` })
		.where(
			and(
				eq(emailJobs.id, id),
				redelivered
					? inArray(emailJobs.status, ["pending", "processing"])
					: eq(emailJobs.status, "pending")
			)
		)
		.returning();
	return job ?? null;
}

export async function markSent(job: EmailJob) {
	await db
		.update(emailJobs)
		.set({ status: "sent", sentAt: sql`now()`, lastError: null })
		.where(eq(emailJobs.id, job.id));
}

// Devolve o job a "pending" (vai esperar numa fila de retry) ou marca-o como falhado.
export async function markFailed(job: EmailJob, message: string, final: boolean) {
	await db
		.update(emailJobs)
		.set({ status: final ? "failed" : "pending", lastError: message.slice(0, 2000) })
		.where(eq(emailJobs.id, job.id));
}

// Jobs gravados há mais de 1 minuto que o site não conseguiu publicar no RabbitMQ.
export async function findUnpublished(limit: number) {
	return db
		.select({ id: emailJobs.id, priority: emailJobs.priority })
		.from(emailJobs)
		.where(
			and(
				isNull(emailJobs.publishedAt),
				eq(emailJobs.status, "pending"),
				lt(emailJobs.createdAt, sql`now() - interval '1 minute'`)
			)
		)
		.orderBy(asc(emailJobs.createdAt))
		.limit(limit);
}

export async function markPublished(ids: string[]) {
	if (!ids.length) return;
	await db
		.update(emailJobs)
		.set({ publishedAt: sql`now()` })
		.where(inArray(emailJobs.id, ids));
}

export async function purgeSentJobs(olderThanDays: number) {
	const purged = await db
		.delete(emailJobs)
		.where(
			and(
				eq(emailJobs.status, "sent"),
				lt(emailJobs.sentAt, sql`now() - make_interval(days => ${olderThanDays})`)
			)
		)
		.returning({ id: emailJobs.id });
	return purged.length;
}

export async function jobStats() {
	const rows = await db
		.select({ status: emailJobs.status, total: count() })
		.from(emailJobs)
		.groupBy(emailJobs.status);
	return Object.fromEntries(rows.map((row) => [row.status, row.total]));
}
