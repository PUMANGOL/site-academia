import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { EMAIL_PRIORITY } from "./jobs";
import { enqueueEmail } from "./queue";
import { enrollmentCode, type EnrollmentReceipt } from "./receipts";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type NewEnrollment = {
	id: string;
	courseId: string;
	createdAt: Date;
	// Valor efectivamente pago por esta inscrição (0 nos cursos gratuitos).
	amount: number;
};

// Grava na transacção o email de confirmação, com os dados do comprovativo em PDF.
// O email só existe se a transacção for confirmada; publicar depois com dispatchEmails().
export async function enqueueEnrollmentConfirmation(
	tx: Transaction,
	input: {
		user: { name: string; email: string };
		enrollments: NewEnrollment[];
		payment: { entity: string; reference: string; paidAt: Date } | null;
	}
) {
	if (!input.enrollments.length) return [];

	const rows = await tx
		.select({
			id: courses.id,
			title: courses.title,
			slug: courses.slug,
			startDate: courses.startDate,
			endDate: courses.endDate,
			modality: courses.modality,
			durationMinutes: courses.durationMinutes,
			language: courses.language,
			currency: courses.currency,
		})
		.from(courses)
		.where(inArray(courses.id, input.enrollments.map((enrollment) => enrollment.courseId)));
	const byId = new Map(rows.map((course) => [course.id, course]));

	const receipts: EnrollmentReceipt[] = input.enrollments.flatMap((enrollment) => {
		const course = byId.get(enrollment.courseId);
		if (!course) return [];
		const isFree = enrollment.amount <= 0;
		return [
			{
				enrollmentId: enrollment.id,
				code: enrollmentCode(enrollment.id, enrollment.createdAt),
				enrolledAt: enrollment.createdAt.toISOString(),
				course: {
					title: course.title.pt,
					slug: course.slug,
					startDate: course.startDate,
					endDate: course.endDate,
					modality: course.modality,
					durationMinutes: course.durationMinutes,
					language: course.language,
				},
				amount: enrollment.amount,
				currency: course.currency,
				isFree,
				payment:
					input.payment && !isFree
						? {
								entity: input.payment.entity,
								reference: input.payment.reference,
								paidAt: input.payment.paidAt.toISOString(),
							}
						: null,
			},
		];
	});

	return enqueueEmail(
		{
			template: "enrollment_confirmation",
			to: input.user.email,
			payload: {
				name: input.user.name,
				courses: receipts.map(({ course }) => ({
					title: course.title,
					slug: course.slug,
					startDate: course.startDate,
					endDate: course.endDate,
					modality: course.modality,
				})),
				receipts,
			},
			priority: EMAIL_PRIORITY.normal,
		},
		{ tx }
	);
}
