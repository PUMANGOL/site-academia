import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, user } from "@/db/schema";
import type { EnrollmentStatus } from "@/db/schema/orders";

export async function getEnrollmentCounts() {
	const rows = await db
		.select({
			courseId: enrollments.courseId,
			total: count(),
		})
		.from(enrollments)
		.groupBy(enrollments.courseId);

	return new Map(rows.map((row) => [row.courseId, row.total]));
}

export async function countCourseEnrollments(courseId: string) {
	const [row] = await db
		.select({ total: count() })
		.from(enrollments)
		.where(eq(enrollments.courseId, courseId));

	return row?.total ?? 0;
}

export function hasOpenSeats(seats: number | null, enrolled: number) {
	return seats === null || enrolled < seats;
}

export type CourseEnrollee = {
	id: string;
	name: string;
	email: string;
	status: EnrollmentStatus;
	createdAt: Date;
};

export async function getCourseEnrollees(courseId: string): Promise<CourseEnrollee[]> {
	const rows = await db
		.select({
			id: enrollments.id,
			name: user.name,
			email: user.email,
			status: enrollments.status,
			createdAt: enrollments.createdAt,
		})
		.from(enrollments)
		.innerJoin(user, eq(enrollments.userId, user.id))
		.where(eq(enrollments.courseId, courseId))
		.orderBy(desc(enrollments.createdAt));

	return rows;
}
