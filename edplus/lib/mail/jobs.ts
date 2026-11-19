import type { ReportFilters, ReportType } from "@/lib/reports";
import {
	adminReportEmail,
	catalogEmail,
	companyRequestNotificationEmail,
	companyRequestReceivedEmail,
	courseFeedbackEmail,
	courseReminderEmail,
	enrollmentConfirmationEmail,
	passwordResetEmail,
	type MailCourse,
	type MailMessage,
} from "./templates";
import type { EnrollmentReceipt } from "./receipts";

// Cada template da fila e os dados de que precisa para ser gerado pelo worker.
export type EmailJobPayloads = {
	// `receipts`: um comprovativo em PDF por inscrição (ausente em jobs antigos).
	enrollment_confirmation: { name: string; courses: MailCourse[]; receipts?: EnrollmentReceipt[] };
	password_reset: { name: string; url: string };
	course_reminder: { name: string; course: MailCourse };
	course_feedback: { name: string; course: MailCourse; feedbackUrl: string };
	// Confirmação ao contacto da empresa.
	company_request_received: { name: string; companyName: string };
	// Aviso à caixa da Academia (ACADEMY_INBOX_EMAIL) com os dados do pedido.
	company_request_notification: CompanyRequestSummary;
	// Catálogo ilustrativo em PDF, gerado pelo worker no momento do envio.
	catalog: { requestedAt: string };
	// Relatório em Excel: o worker gera o ficheiro a partir da BD no momento do envio.
	admin_report: {
		name: string;
		report: ReportType;
		filters: ReportFilters;
		// Descrição legível dos filtros (curso, estado...) para o email e para a folha.
		filterSummary: string[];
		requestedAt: string;
	};
};

export type CompanyRequestSummary = {
	requestId: string;
	companyName: string;
	contactName: string;
	jobTitle: string | null;
	email: string;
	phone: string | null;
	sector: string | null;
	participants: number | null;
	trainingAreas: string;
	modality: string;
	message: string | null;
	createdAt: string;
};

export type EmailTemplate = keyof EmailJobPayloads;

export type EmailJobInput = {
	[T in EmailTemplate]: {
		template: T;
		to: string;
		payload: EmailJobPayloads[T];
		priority?: number;
		dedupeKey?: string;
	};
}[EmailTemplate];

// Prioridade da mensagem no RabbitMQ: as filas quorum tratam > 4 como alta prioridade.
export const EMAIL_PRIORITY = {
	urgent: 10,
	normal: 4,
	bulk: 0,
} as const;

export function renderEmailJob(template: string, to: string, payload: unknown): MailMessage {
	switch (template as EmailTemplate) {
		case "enrollment_confirmation": {
			const data = payload as EmailJobPayloads["enrollment_confirmation"];
			return enrollmentConfirmationEmail({ to, ...data, withReceipt: Boolean(data.receipts?.length) });
		}
		case "password_reset":
			return passwordResetEmail({ to, ...(payload as EmailJobPayloads["password_reset"]) });
		case "course_reminder":
			return courseReminderEmail({ to, ...(payload as EmailJobPayloads["course_reminder"]) });
		case "course_feedback":
			return courseFeedbackEmail({ to, ...(payload as EmailJobPayloads["course_feedback"]) });
		case "company_request_received":
			return companyRequestReceivedEmail({ to, ...(payload as EmailJobPayloads["company_request_received"]) });
		case "company_request_notification":
			return companyRequestNotificationEmail({ to, request: payload as CompanyRequestSummary });
		case "catalog":
			return catalogEmail({ to, ...(payload as EmailJobPayloads["catalog"]) });
		case "admin_report":
			return adminReportEmail({ to, ...(payload as EmailJobPayloads["admin_report"]) });
		default:
			throw new Error(`Template de email desconhecido: ${template}`);
	}
}
