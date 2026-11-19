import type { MailCourse } from "./templates";

// Dados de um comprovativo de inscrição, gravados no payload do email para que o
// worker gere o PDF sem voltar à base de dados.
export type EnrollmentReceipt = {
	enrollmentId: string;
	code: string;
	enrolledAt: string;
	course: MailCourse & { durationMinutes: number | null; language: string };
	amount: number;
	currency: string;
	isFree: boolean;
	payment: { entity: string; reference: string; paidAt: string } | null;
};

// Número legível do comprovativo, derivado do id da inscrição (ex.: PA-2026-3F9A12BC).
export function enrollmentCode(enrollmentId: string, enrolledAt: Date) {
	const suffix = enrollmentId.replace(/-/g, "").slice(0, 8).toUpperCase();
	return `PA-${enrolledAt.getUTCFullYear()}-${suffix}`;
}
