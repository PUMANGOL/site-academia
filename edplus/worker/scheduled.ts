import { and, between, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, user } from "@/db/schema";
import { EMAIL_PRIORITY, type EmailJobInput } from "@/lib/mail/jobs";
import { enqueueEmails } from "@/lib/mail/queue";
import { siteUrl } from "@/lib/mail/site-url";
import { purgeSentJobs } from "./queue";

export const TIME_ZONE = "Africa/Luanda";
// Lembrete quando faltam até N dias para o início do curso.
const REMINDER_DAYS_BEFORE = 2;
// Feedback entre o dia seguinte ao fim do curso e N dias depois.
const FEEDBACK_WINDOW_DAYS = 7;
// Emails enviados são apagados da fila ao fim de N dias.
const SENT_RETENTION_DAYS = 90;

export function isoDay(date: Date) {
	// en-CA formata como YYYY-MM-DD.
	return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

export function hourInTimeZone(date: Date) {
	return Number(
		new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", hourCycle: "h23" }).format(date)
	);
}

function addDays(day: string, days: number) {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

async function enrollmentsByCourseDay(courseDay: ReturnType<typeof sql<string>>, from: string, to: string) {
	return db
		.select({
			enrollmentId: enrollments.id,
			email: user.email,
			name: user.name,
			course: {
				title: courses.title,
				slug: courses.slug,
				startDate: courses.startDate,
				endDate: courses.endDate,
				modality: courses.modality,
			},
		})
		.from(enrollments)
		.innerJoin(courses, eq(courses.id, enrollments.courseId))
		.innerJoin(user, eq(user.id, enrollments.userId))
		.where(and(eq(courses.status, "published"), between(courseDay, from, to)));
}

// Pode correr várias vezes no mesmo dia: a dedupeKey garante um só email por inscrição.
export async function enqueueCourseEmails(now = new Date()) {
	const today = isoDay(now);
	const [upcoming, finished] = await Promise.all([
		enrollmentsByCourseDay(sql<string>`${courses.startDate}`, today, addDays(today, REMINDER_DAYS_BEFORE)),
		// Sem data de fim, considera-se que o curso termina no dia em que começa.
		enrollmentsByCourseDay(
			sql<string>`coalesce(${courses.endDate}, ${courses.startDate})`,
			addDays(today, -FEEDBACK_WINDOW_DAYS),
			addDays(today, -1)
		),
	]);

	const feedbackUrl = process.env.FEEDBACK_URL || siteUrl("/contact");
	const reminders: EmailJobInput[] = upcoming.map((row) => ({
		template: "course_reminder",
		to: row.email,
		payload: { name: row.name, course: { ...row.course, title: row.course.title.pt } },
		priority: EMAIL_PRIORITY.bulk,
		dedupeKey: `course_reminder:${row.enrollmentId}`,
	}));
	const feedback: EmailJobInput[] = finished.map((row) => ({
		template: "course_feedback",
		to: row.email,
		payload: { name: row.name, course: { ...row.course, title: row.course.title.pt }, feedbackUrl },
		priority: EMAIL_PRIORITY.bulk,
		dedupeKey: `course_feedback:${row.enrollmentId}`,
	}));

	return {
		today,
		reminders: await enqueueEmails(reminders),
		feedback: await enqueueEmails(feedback),
		purged: await purgeSentJobs(SENT_RETENTION_DAYS),
	};
}
