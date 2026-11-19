import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { instructorProfiles } from "@/db/schema";
import type { Localized } from "@/db/schema";
import { getPublishedCourses, type CourseListItem } from "@/db/queries/courses";

const DEFAULT_PHOTO = "/assets/img/courses/author/1.png";

export type PublicInstructor = {
	slug: string;
	name: string;
	headline: Localized;
	bio: Localized;
	photoUrl: string;
	isFeatured: boolean;
	coursesCount: number;
	studentsCount: number;
};

// Cursos publicados de um formador: ligação em course_instructors ou, em cursos antigos, courses.instructor_id.
const publishedCoursesOf = sql`
	select c.id from courses c
	where c.status = 'published'
	and (
		exists (select 1 from course_instructors ci where ci.course_id = c.id and ci.instructor_id = ${instructorProfiles.id})
		or (c.instructor_id = ${instructorProfiles.id}
			and not exists (select 1 from course_instructors ci where ci.course_id = c.id))
	)`;

const columns = {
	slug: instructorProfiles.slug,
	name: instructorProfiles.name,
	headline: instructorProfiles.headline,
	bio: instructorProfiles.bio,
	photoUrl: instructorProfiles.photoUrl,
	isFeatured: instructorProfiles.isFeatured,
	coursesCount: sql<number>`(select count(*) from (${publishedCoursesOf}) pc)`.mapWith(Number),
	studentsCount: sql<number>`(select count(distinct e.user_id) from enrollments e where e.course_id in (${publishedCoursesOf}))`.mapWith(Number),
};

function withPhoto<T extends { photoUrl: string | null }>(row: T) {
	return { ...row, photoUrl: row.photoUrl || DEFAULT_PHOTO };
}

export async function getPublicInstructors(): Promise<PublicInstructor[]> {
	const rows = await db
		.select(columns)
		.from(instructorProfiles)
		.orderBy(desc(instructorProfiles.isFeatured), asc(instructorProfiles.name));
	return rows.map(withPhoto);
}

export async function getPublicInstructor(
	slug: string
): Promise<{ instructor: PublicInstructor; courses: CourseListItem[] } | null> {
	const [row] = await db.select(columns).from(instructorProfiles).where(eq(instructorProfiles.slug, slug)).limit(1);
	if (!row) return null;
	const courses = (await getPublishedCourses()).filter((course) => course.instructorSlugs.includes(slug));
	return { instructor: withPhoto(row), courses };
}
