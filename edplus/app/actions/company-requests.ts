"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { companyRequests } from "@/db/schema";
import { reportDbError } from "@/lib/content";
import { EMAIL_PRIORITY } from "@/lib/mail/jobs";
import { dispatchEmails, enqueueEmails } from "@/lib/mail/queue";

// Caixa da Academia que recebe os pedidos de empresas.
const ACADEMY_INBOX = process.env.ACADEMY_INBOX_EMAIL || "jose.pinto@pumangol.co.ao";

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => value || null);

const schema = z.object({
	companyName: z.string().trim().min(2, "Indique o nome da empresa.").max(180),
	contactName: z.string().trim().min(2, "Indique o seu nome.").max(180),
	jobTitle: optionalText(120),
	email: z.email("Indique um email válido.").max(320),
	phone: optionalText(40).refine((value) => !value || /^[+\d\s().-]{6,40}$/.test(value), "Telefone inválido."),
	sector: optionalText(120),
	participants: z
		.string()
		.trim()
		.transform((value, ctx) => {
			if (!value) return null;
			const number = Number(value);
			if (!Number.isInteger(number) || number < 1 || number > 10000) {
				ctx.addIssue({ code: "custom", message: "Indique um número de participantes válido." });
				return z.NEVER;
			}
			return number;
		}),
	trainingAreas: z.string().trim().min(3, "Indique as áreas de formação pretendidas.").max(2000),
	modality: z.enum(["in_person", "online", "hybrid", "undecided"]),
	message: optionalText(4000),
	privacyConsent: z.literal(true, "É necessário aceitar a política de privacidade."),
	// Campo escondido: só robôs o preenchem.
	website: z.string().max(0).optional(),
});

export type CompanyRequestInput = z.input<typeof schema>;

// Limite simples por IP (por instância do servidor): 5 pedidos a cada 10 minutos.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const globalForLimit = globalThis as unknown as { companyRequestHits?: Map<string, number[]> };
const hits = (globalForLimit.companyRequestHits ??= new Map());

function rateLimited(ip: string) {
	const now = Date.now();
	const recent = (hits.get(ip) ?? []).filter((time: number) => now - time < WINDOW_MS);
	if (recent.length >= MAX_PER_WINDOW) {
		hits.set(ip, recent);
		return true;
	}
	hits.set(ip, [...recent, now]);
	return false;
}

export async function submitCompanyRequest(input: CompanyRequestInput) {
	const parsed = schema.safeParse(input);
	if (!parsed.success) {
		// Robô (campo escondido preenchido): responde como se tivesse corrido bem.
		if (parsed.error.issues.some((issue) => issue.path[0] === "website")) return { ok: true as const };
		return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
	}

	const headerList = await headers();
	const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
	if (rateLimited(ip)) {
		return { ok: false as const, error: "Recebemos vários pedidos seguidos. Tente novamente dentro de alguns minutos." };
	}

	const { website: _website, ...data } = parsed.data;
	void _website;

	try {
		// Pedido e emails na mesma transacção (outbox): ou fica tudo gravado, ou nada.
		const queued = await db.transaction(async (tx) => {
			const [request] = await tx.insert(companyRequests).values(data).returning();
			return enqueueEmails(
				[
					{
						template: "company_request_notification",
						to: ACADEMY_INBOX,
						payload: {
							requestId: request.id,
							companyName: request.companyName,
							contactName: request.contactName,
							jobTitle: request.jobTitle,
							email: request.email,
							phone: request.phone,
							sector: request.sector,
							participants: request.participants,
							trainingAreas: request.trainingAreas,
							modality: request.modality,
							message: request.message,
							createdAt: request.createdAt.toISOString(),
						},
						priority: EMAIL_PRIORITY.normal,
						dedupeKey: `company_request_notification:${request.id}`,
					},
					{
						template: "company_request_received",
						to: request.email,
						payload: { name: request.contactName, companyName: request.companyName },
						priority: EMAIL_PRIORITY.normal,
						dedupeKey: `company_request_received:${request.id}`,
					},
				],
				{ tx }
			);
		});
		await dispatchEmails(queued);
		return { ok: true as const };
	} catch (error) {
		return {
			ok: false as const,
			error: reportDbError("submitCompanyRequest", error, "Não foi possível enviar o pedido. Tente novamente."),
		};
	}
}
