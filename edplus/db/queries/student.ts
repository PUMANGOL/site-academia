import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	categories,
	courseCategories,
	courses,
	enrollments,
	instructorProfiles,
} from "@/db/schema";

export async function getStudentStats(userId: string) {
	const rows = await db
		.select({ status: enrollments.status, value: count() })
		.from(enrollments)
		.where(eq(enrollments.userId, userId))
		.groupBy(enrollments.status);

	const byStatus = Object.fromEntries(rows.map((row) => [row.status, row.value]));
	const notStarted = byStatus.not_started ?? 0;
	const inProgress = byStatus.in_progress ?? 0;
	const completed = byStatus.completed ?? 0;

	return {
		enrolled: notStarted + inProgress + completed,
		notStarted,
		inProgress,
		completed,
		certificates: completed,
	};
}

export async function getStudentChartsData(userId: string) {
	const [coursesByCategory, enrollmentsByMonth] = await Promise.all([
		db
			.select({
				name: categories.name,
				value: count(courseCategories.courseId),
			})
			.from(enrollments)
			.innerJoin(courseCategories, eq(courseCategories.courseId, enrollments.courseId))
			.innerJoin(categories, eq(categories.id, courseCategories.categoryId))
			.where(eq(enrollments.userId, userId))
			.groupBy(categories.id)
			.orderBy(desc(count(courseCategories.courseId)))
			.limit(6),
		db
			.select({
				month: sql<string>`to_char(date_trunc('month', ${enrollments.createdAt}), 'YYYY-MM')`,
				value: count(),
			})
			.from(enrollments)
			.where(eq(enrollments.userId, userId))
			.groupBy(sql`date_trunc('month', ${enrollments.createdAt})`)
			.orderBy(sql`date_trunc('month', ${enrollments.createdAt})`)
			.limit(12),
	]);

	return { coursesByCategory, enrollmentsByMonth };
}

export async function getStudentCourses(userId: string) {
	const rows = await db
		.select({
			enrollmentId: enrollments.id,
			status: enrollments.status,
			progress: enrollments.progress,
			completedAt: enrollments.completedAt,
			enrolledAt: enrollments.createdAt,
			courseId: courses.id,
			slug: courses.slug,
			title: courses.title,
			imageUrl: courses.imageUrl,
			durationMinutes: courses.durationMinutes,
			lessonsCount: courses.lessonsCount,
			instructorName: instructorProfiles.name,
		})
		.from(enrollments)
		.innerJoin(courses, eq(enrollments.courseId, courses.id))
		.leftJoin(instructorProfiles, eq(courses.instructorId, instructorProfiles.id))
		.where(eq(enrollments.userId, userId))
		.orderBy(desc(enrollments.createdAt));

	return rows;
}
