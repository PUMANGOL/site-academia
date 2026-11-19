import {
	and,
	count,
	desc,
	eq,
	gte,
	inArray,
	lt,
	sql,
	type AnyColumn,
} from "drizzle-orm";
import { db } from "@/db";
import {
	categories,
	courseCategories,
	courses,
	enrollments,
	instructorProfiles,
	user,
} from "@/db/schema";

export const DASHBOARD_PERIODS = [
	"7d",
	"30d",
	"90d",
	"12m",
	"all",
	"custom",
] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export type DateRange = { from: Date | null; to: Date | null };

export type DashboardFilters = {
	range: DateRange;
	categoryId: string | null;
};

const periodDays: Record<Exclude<DashboardPeriod, "all" | "custom">, number> = {
	"7d": 7,
	"30d": 30,
	"90d": 90,
	"12m": 365,
};

export function periodStart(period: DashboardPeriod) {
	if (period === "all" || period === "custom") return null;
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() - periodDays[period]);
	return date;
}

function hasRange(range: DateRange) {
	return range.from !== null || range.to !== null;
}

function coursesInCategory(categoryId: string | null) {
	if (!categoryId) return undefined;
	return inArray(
		courses.id,
		db
			.select({ id: courseCategories.courseId })
			.from(courseCategories)
			.where(eq(courseCategories.categoryId, categoryId))
	);
}

function enrollmentsInCategory(categoryId: string | null) {
	if (!categoryId) return undefined;
	return inArray(
		enrollments.courseId,
		db
			.select({ id: courseCategories.courseId })
			.from(courseCategories)
			.where(eq(courseCategories.categoryId, categoryId))
	);
}

// `to` é exclusivo: a página envia o início do dia seguinte à data final escolhida.
function createdInRange(column: AnyColumn, range: DateRange) {
	return and(
		range.from ? gte(column, range.from) : undefined,
		range.to ? lt(column, range.to) : undefined
	);
}

function rangeSql(column: AnyColumn, range: DateRange) {
	const parts = [
		range.from ? sql`${column} >= ${range.from.toISOString()}` : undefined,
		range.to ? sql`${column} < ${range.to.toISOString()}` : undefined,
	].filter((part) => part !== undefined);
	return sql.join(parts, sql` and `);
}

// Conta total e, quando há intervalo, quantos registos novos entraram nele.
function countWithNew(range: DateRange, column: AnyColumn) {
	return {
		total: count(),
		recent: hasRange(range)
			? sql<number>`count(*) filter (where ${rangeSql(column, range)})`.mapWith(Number)
			: sql<number>`0`.mapWith(Number),
	};
}

export async function getAdminStats(filters: DashboardFilters) {
	const { range } = filters;
	const courseScope = coursesInCategory(filters.categoryId);
	const enrollmentScope = enrollmentsInCategory(filters.categoryId);

	const [
		coursesByStatus,
		[courseTotals],
		[studentTotals],
		[instructorTotals],
		[enrollmentTotals],
		[categoryTotals],
		[userTotals],
	] = await Promise.all([
		db
			.select({ status: courses.status, value: count() })
			.from(courses)
			.where(courseScope)
			.groupBy(courses.status),
		db
			.select(countWithNew(range, courses.createdAt))
			.from(courses)
			.where(courseScope),
		db
			.select(countWithNew(range, user.createdAt))
			.from(user)
			.where(eq(user.role, "student")),
		db
			.select(countWithNew(range, instructorProfiles.createdAt))
			.from(instructorProfiles),
		db
			.select({
				...countWithNew(range, enrollments.createdAt),
				completed: sql<number>`count(*) filter (where ${enrollments.status} = 'completed')`.mapWith(Number),
			})
			.from(enrollments)
			.where(enrollmentScope),
		db
			.select({
				total: count(),
				active: sql<number>`count(*) filter (where ${categories.isActive})`.mapWith(Number),
			})
			.from(categories),
		db.select(countWithNew(range, user.createdAt)).from(user),
	]);

	const byStatus = (status: string) =>
		coursesByStatus.find((row) => row.status === status)?.value ?? 0;

	return {
		courses: {
			total: courseTotals?.total ?? 0,
			recent: courseTotals?.recent ?? 0,
			published: byStatus("published"),
			draft: byStatus("draft"),
		},
		students: {
			total: studentTotals?.total ?? 0,
			recent: studentTotals?.recent ?? 0,
		},
		instructors: {
			total: instructorTotals?.total ?? 0,
			recent: instructorTotals?.recent ?? 0,
		},
		enrollments: {
			total: enrollmentTotals?.total ?? 0,
			recent: enrollmentTotals?.recent ?? 0,
			completed: enrollmentTotals?.completed ?? 0,
		},
		categories: {
			total: categoryTotals?.total ?? 0,
			active: categoryTotals?.active ?? 0,
		},
		users: {
			total: userTotals?.total ?? 0,
			recent: userTotals?.recent ?? 0,
		},
	};
}

export async function getAdminChartsData(filters: DashboardFilters) {
	const { range } = filters;
	const courseScope = and(
		coursesInCategory(filters.categoryId),
		createdInRange(courses.createdAt, range)
	);
	const enrollmentScope = and(
		enrollmentsInCategory(filters.categoryId),
		createdInRange(enrollments.createdAt, range)
	);
	const courseMonth = sql`date_trunc('month', ${courses.createdAt})`;
	const enrollmentMonth = sql`date_trunc('month', ${enrollments.createdAt})`;

	const [
		coursesByStatus,
		coursesByCategory,
		usersByRole,
		coursesByMonth,
		enrollmentsByMonth,
	] = await Promise.all([
		db
			.select({ status: courses.status, value: count() })
			.from(courses)
			.where(courseScope)
			.groupBy(courses.status),
		db
			.select({
				name: categories.name,
				value: count(courses.id),
			})
			.from(categories)
			.leftJoin(
				courseCategories,
				eq(courseCategories.categoryId, categories.id)
			)
			.leftJoin(
				courses,
				and(
					eq(courses.id, courseCategories.courseId),
					createdInRange(courses.createdAt, range)
				)
			)
			.where(filters.categoryId ? eq(categories.id, filters.categoryId) : undefined)
			.groupBy(categories.id)
			.orderBy(desc(count(courses.id)))
			.limit(6),
		db
			.select({ role: user.role, value: count() })
			.from(user)
			.where(createdInRange(user.createdAt, range))
			.groupBy(user.role),
		db
			.select({
				month: sql<string>`to_char(${courseMonth}, 'YYYY-MM')`,
				value: count(),
			})
			.from(courses)
			.where(courseScope)
			.groupBy(courseMonth)
			.orderBy(courseMonth),
		db
			.select({
				month: sql<string>`to_char(${enrollmentMonth}, 'YYYY-MM')`,
				value: count(),
			})
			.from(enrollments)
			.where(enrollmentScope)
			.groupBy(enrollmentMonth)
			.orderBy(enrollmentMonth),
	]);

	const months = [
		...new Set([
			...coursesByMonth.map((row) => row.month),
			...enrollmentsByMonth.map((row) => row.month),
		]),
	].sort();

	return {
		coursesByStatus: coursesByStatus.map((row) => ({
			status: row.status,
			value: row.value,
		})),
		coursesByCategory: coursesByCategory.map((row) => ({
			name: row.name.pt,
			value: row.value,
		})),
		usersByRole: usersByRole.map((row) => ({
			role: row.role,
			value: row.value,
		})),
		activityByMonth: months.map((month) => ({
			month,
			courses: coursesByMonth.find((row) => row.month === month)?.value ?? 0,
			enrollments:
				enrollmentsByMonth.find((row) => row.month === month)?.value ?? 0,
		})),
	};
}

export async function getAdminCourses() {
	return db.query.courses.findMany({
		orderBy: [desc(courses.updatedAt)],
		with: {
			instructor: true,
			categoryLinks: { with: { category: true } },
		},
	});
}

export async function getAdminCourse(id: string) {
	return db.query.courses.findFirst({
		where: eq(courses.id, id),
		with: {
			instructor: true,
			categoryLinks: { with: { category: true } },
			instructorLinks: {
				orderBy: (table, { asc }) => [asc(table.sortOrder)],
			},
		},
	});
}

export async function getAdminCategories() {
	return db.query.categories.findMany({
		orderBy: [categories.sortOrder, desc(categories.createdAt)],
	});
}

export async function getAdminUsers() {
	return db.query.user.findMany({
		orderBy: [desc(user.createdAt)],
		columns: {
			id: true,
			name: true,
			email: true,
			username: true,
			role: true,
			emailVerified: true,
			createdAt: true,
			banned: true,
			banReason: true,
		},
	});
}

export async function getAdminInstructors() {
	return db.query.instructorProfiles.findMany({
		orderBy: [desc(instructorProfiles.createdAt)],
		with: { user: true },
	});
}

export async function getInstructorOptions() {
	return db.query.instructorProfiles.findMany({
		columns: { id: true, name: true },
		orderBy: [instructorProfiles.name],
	});
}

export async function getCategoryOptions() {
	return db.query.categories.findMany({
		where: eq(categories.isActive, true),
		columns: { id: true, slug: true, name: true },
		orderBy: [categories.sortOrder],
	});
}
