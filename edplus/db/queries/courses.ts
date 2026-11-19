import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import type { CourseModality, Localized } from "@/db/schema";
import {
	countCourseEnrollments,
	getEnrollmentCounts,
	hasOpenSeats,
} from "@/db/queries/enrollments";
import { normalizeSearch } from "@/lib/search";

const DEFAULT_AUTHOR_IMAGE = "/assets/img/courses/author/1.png";

export type CourseListItem = {
	id: string;
	slug: string;
	title: Localized;
	excerpt: Localized;
	categoryName: Localized;
	categorySlugs: string[];
	imageUrl: string;
	videoId: string | null;
	price: string;
	compareAtPrice: string | null;
	isFree: boolean;
	currency: string;
	lessonsCount: number;
	durationMinutes: number | null;
	// Inscrições reais na tabela enrollments.
	studentsCount: number;
	ratingAvg: string;
	reviewsCount: number;
	author: string;
	authorImage: string;
	instructorNames: string[];
	instructorSlugs: string[];
	modality: CourseModality;
	startDate: string | null;
	endDate: string | null;
	// Texto normalizado (título, resumo, descrição, objectivos, categorias e formadores
	// em PT e EN) usado pela pesquisa global.
	searchText: string;
};

export type CourseInstructor = {
	slug: string;
	name: string;
	headline: Localized;
	bio: Localized;
	photoUrl: string;
};

export type CourseDetail = CourseListItem & {
	description: Localized;
	objectives: Localized;
	durationMinutes: number | null;
	skillLevel: string;
	language: string;
	seats: number | null;
	seatsLeft: number | null;
	updatedAt: Date;
	instructors: CourseInstructor[];
};

const courseRelations = {
	instructor: true,
	instructorLinks: {
		orderBy: (table, { asc }) => [asc(table.sortOrder)],
		with: { instructor: true },
	},
	categoryLinks: {
		with: {
			category: true,
		},
	},
} as const satisfies NonNullable<
	Parameters<typeof db.query.courses.findMany>[0]
>["with"];

type CourseRow = NonNullable<
	Awaited<
		ReturnType<typeof db.query.courses.findFirst<{ with: typeof courseRelations }>>
	>
>;

function courseInstructorsOf(course: CourseRow): CourseInstructor[] {
	const profiles = course.instructorLinks.length
		? course.instructorLinks.map((link) => link.instructor)
		: course.instructor
			? [course.instructor]
			: [];

	return profiles.map((profile) => ({
		slug: profile.slug,
		name: profile.name,
		headline: profile.headline,
		bio: profile.bio,
		photoUrl: profile.photoUrl ?? DEFAULT_AUTHOR_IMAGE,
	}));
}

function toListItem(course: CourseRow, enrolled: number): CourseListItem {
	const primary = course.categoryLinks[0]?.category;
	const instructors = courseInstructorsOf(course);
	const localized = [
		course.title,
		course.excerpt,
		course.description,
		course.objectives,
		...course.categoryLinks.map((link) => link.category.name),
	].flatMap((value) => [value.pt, value.en]);

	return {
		id: course.id,
		slug: course.slug,
		title: course.title,
		excerpt: course.excerpt,
		categoryName: primary?.name ?? { pt: "", en: "" },
		categorySlugs: course.categoryLinks.map((link) => link.category.slug),
		imageUrl: course.imageUrl,
		videoId: course.videoId,
		price: course.price,
		compareAtPrice: course.compareAtPrice,
		isFree: course.isFree,
		currency: course.currency,
		lessonsCount: course.lessonsCount,
		durationMinutes: course.durationMinutes,
		studentsCount: enrolled,
		ratingAvg: course.ratingAvg,
		reviewsCount: course.reviewsCount,
		author: instructors[0]?.name ?? "",
		authorImage: instructors[0]?.photoUrl ?? DEFAULT_AUTHOR_IMAGE,
		instructorNames: instructors.map((instructor) => instructor.name),
		instructorSlugs: instructors.map((instructor) => instructor.slug),
		modality: course.modality,
		startDate: course.startDate,
		endDate: course.endDate,
		searchText: normalizeSearch(
			[...localized, ...instructors.map((instructor) => instructor.name)].join(" ")
		),
	};
}

export async function getPublishedCourses(): Promise<CourseListItem[]> {
	try {
		const [rows, enrollmentCounts] = await Promise.all([
			db.query.courses.findMany({
				where: eq(courses.status, "published"),
				orderBy: (table, { desc }) => [desc(table.publishedAt)],
				with: courseRelations,
			}),
			getEnrollmentCounts(),
		]);

		return rows.flatMap((course) => {
			const enrolled = enrollmentCounts.get(course.id) ?? 0;
			return hasOpenSeats(course.seats, enrolled)
				? [toListItem(course, enrolled)]
				: [];
		});
	} catch (error) {
		console.error("Failed to load courses from database:", error);
		return [];
	}
}

export async function getPublishedCourseBySlug(
	slug: string
): Promise<CourseDetail | null> {
	try {
		const course = await db.query.courses.findFirst({
			where: and(eq(courses.slug, slug), eq(courses.status, "published")),
			with: courseRelations,
		});
		if (!course) return null;

		const enrolled = await countCourseEnrollments(course.id);

		return {
			...toListItem(course, enrolled),
			description: course.description,
			objectives: course.objectives,
			durationMinutes: course.durationMinutes,
			skillLevel: course.skillLevel,
			language: course.language,
			seats: course.seats,
			seatsLeft:
				course.seats === null ? null : Math.max(course.seats - enrolled, 0),
			updatedAt: course.updatedAt,
			instructors: courseInstructorsOf(course),
		};
	} catch (error) {
		console.error("Failed to load course from database:", error);
		return null;
	}
}
