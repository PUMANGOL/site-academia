"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { emailJobs } from "@/db/schema";
import { reportDbError } from "@/lib/content";
import { EMAIL_PRIORITY } from "@/lib/mail/jobs";
import { enqueueEmail } from "@/lib/mail/queue";

const schema = z.object({
	email: z.email("Indique um email válido.").max(320),
});

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const globalForLimit = globalThis as unknown as { catalogRequestHits?: Map<string, number[]> };
const hits: Map<string, number[]> = (globalForLimit.catalogRequestHits ??= new Map());

function rateLimited(ip: string) {
	const now = Date.now();
	const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
	if (recent.length >= MAX_PER_WINDOW) {
		hits.set(ip, recent);
		return true;
	}
	hits.set(ip, [...recent, now]);
	return false;
}

function dayKey(date = new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Africa/Luanda",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export async function requestCatalog(input: { email: string }) {
	const parsed = schema.safeParse(input);
	if (!parsed.success) {
		return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Indique um email válido." };
	}

	const headerList = await headers();
	const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
	if (rateLimited(ip)) {
		return { ok: false as const, error: "Recebemos vários pedidos seguidos. Tente novamente dentro de alguns minutos." };
	}

	const email = parsed.data.email.toLowerCase();
	const requestedAt = new Date().toISOString();
	const dailyKey = `catalog:${email}:${dayKey()}`;
	try {
		const queued = await enqueueEmail({
			template: "catalog",
			to: email,
			priority: EMAIL_PRIORITY.normal,
			dedupeKey: dailyKey,
			payload: { requestedAt },
		});
		if (queued.length) return { ok: true as const };

		// O mesmo email no mesmo dia já tem um registo. Se esse envio já saiu da fila,
		// um novo clique pede outra cópia. Se ainda está pendente, não se duplica.
		const [existing] = await db
			.select({ status: emailJobs.status })
			.from(emailJobs)
			.where(eq(emailJobs.dedupeKey, dailyKey))
			.limit(1);
		if (existing && existing.status !== "sent" && existing.status !== "failed") {
			return { ok: true as const };
		}

		await enqueueEmail({
			template: "catalog",
			to: email,
			priority: EMAIL_PRIORITY.normal,
			dedupeKey: `catalog:${email}:${requestedAt}`,
			payload: { requestedAt },
		});
		return { ok: true as const };
	} catch (error) {
		return {
			ok: false as const,
			error: reportDbError("requestCatalog", error, "Não foi possível enviar o catálogo. Tente novamente."),
		};
	}
}
