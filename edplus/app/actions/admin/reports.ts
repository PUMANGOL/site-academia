"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, emailJobs } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { reportDbError } from "@/lib/content";
import { EMAIL_PRIORITY } from "@/lib/mail/jobs";
import { enqueueEmail } from "@/lib/mail/queue";
import {
	cleanReportFilters,
	companyRequestStatusLabels,
	describePeriod,
	enrollmentStatusLabels,
	reportDefinitionMap,
	roleLabels,
	type ReportFilters,
	type ReportType,
} from "@/lib/reports";

async function assertAdmin() {
	const session = await getAdminSession();
	if (!session) throw new Error("Não autorizado.");
	return session;
}

async function describeFilters(type: ReportType, filters: ReportFilters) {
	const summary: string[] = [];
	if (filters.courseId) {
		const [course] = await db
			.select({ title: courses.title })
			.from(courses)
			.where(eq(courses.id, filters.courseId))
			.limit(1);
		if (!course) throw new Error("Curso não encontrado.");
		summary.push(`Curso: ${course.title.pt}`);
	}
	if (filters.status) {
		const labels = type === "companyRequests" ? companyRequestStatusLabels : enrollmentStatusLabels;
		summary.push(`Estado: ${labels[filters.status]}`);
	}
	if (filters.role) summary.push(`Perfil: ${roleLabels[filters.role]}`);
	return summary;
}

// Coloca o relatório na fila de emails: o worker gera o Excel e envia-o para o email do administrador.
export async function requestReport(type: ReportType, input: ReportFilters) {
	if (!reportDefinitionMap.has(type)) return { ok: false as const, error: "Tipo de relatório desconhecido." };

	let filters: ReportFilters;
	try {
		filters = cleanReportFilters(type, input);
	} catch (error) {
		return { ok: false as const, error: error instanceof Error ? error.message : "Filtros inválidos." };
	}

	try {
		const session = await assertAdmin();
		const filterSummary = await describeFilters(type, filters);
		const requestedAt = new Date();
		// O mesmo pedido, pela mesma pessoa, no mesmo minuto só gera um email (duplo clique).
		const minute = requestedAt.toISOString().slice(0, 16);
		const queued = await enqueueEmail({
			template: "admin_report",
			to: session.user.email,
			payload: {
				name: session.user.name,
				report: type,
				filters,
				filterSummary,
				requestedAt: requestedAt.toISOString(),
			},
			priority: EMAIL_PRIORITY.normal,
			dedupeKey: `admin_report:${session.user.id}:${type}:${JSON.stringify(filters)}:${minute}`,
		});
		return { ok: true as const, email: session.user.email, duplicate: queued.length === 0 };
	} catch (error) {
		if (error instanceof Error && error.message === "Curso não encontrado.") {
			return { ok: false as const, error: error.message };
		}
		return {
			ok: false as const,
			error: reportDbError("requestReport", error, "Não foi possível pedir o relatório."),
		};
	}
}

export type ReportRequestRow = {
	id: string;
	report: ReportType;
	filterSummary: string[];
	status: "pending" | "processing" | "sent" | "failed";
	createdAt: string;
	sentAt: string | null;
};

// Últimos pedidos do próprio administrador (estado do envio, sem detalhes técnicos).
export async function listMyReportRequests(): Promise<ReportRequestRow[]> {
	const session = await assertAdmin();
	const rows = await db
		.select({
			id: emailJobs.id,
			payload: emailJobs.payload,
			status: emailJobs.status,
			createdAt: emailJobs.createdAt,
			sentAt: emailJobs.sentAt,
		})
		.from(emailJobs)
		.where(and(eq(emailJobs.template, "admin_report"), eq(emailJobs.to, session.user.email)))
		.orderBy(desc(emailJobs.createdAt))
		.limit(10);

	return rows.map((row) => {
		const payload = row.payload as { report: ReportType; filterSummary?: string[]; filters?: ReportFilters };
		return {
			id: row.id,
			report: payload.report,
			filterSummary: [
				...(payload.filters?.from || payload.filters?.to ? [describePeriod(payload.filters)] : []),
				...(payload.filterSummary ?? []),
			],
			status: row.status,
			createdAt: row.createdAt.toISOString(),
			sentAt: row.sentAt?.toISOString() ?? null,
		};
	});
}
