import Link from "next/link";
import { notFound } from "next/navigation";
import CourseForm from "@/app/backoffice/components/course-form";
import PageHeader from "@/app/backoffice/components/page-header";
import {
	getAdminCourse,
	getCategoryOptions,
	getInstructorOptions,
} from "@/db/queries/admin";
import { countCourseEnrollments } from "@/db/queries/enrollments";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [course, instructors, categories, enrolledCount] = await Promise.all([
		getAdminCourse(id),
		getInstructorOptions(),
		getCategoryOptions(),
		countCourseEnrollments(id),
	]);

	if (!course) notFound();

	return (
		<div>
			<PageHeader title="Editar curso" description={course.title.pt}>
				<Link
					href={`/backoffice/cursos/${course.id}/inscritos`}
					className="admin-btn admin-btn-outline"
				>
					Ver inscritos
				</Link>
			</PageHeader>
			<CourseForm
				mode="edit"
				courseId={course.id}
				enrolledCount={enrolledCount}
				initial={{
					slug: course.slug,
					titlePt: course.title.pt,
					titleEn: course.title.en,
					excerptPt: course.excerpt.pt,
					excerptEn: course.excerpt.en,
					imageUrl: course.imageUrl,
					price: course.price,
					skillLevel: course.skillLevel,
					status: course.status,
					descriptionPt: course.description.pt,
					descriptionEn: course.description.en,
					objectivesPt: course.objectives.pt,
					objectivesEn: course.objectives.en,
					instructorIds: course.instructorLinks.length
						? course.instructorLinks.map((link) => link.instructorId)
						: course.instructorId
							? [course.instructorId]
							: [],
					modality: course.modality,
					durationHours:
						course.durationMinutes == null ? null : course.durationMinutes / 60,
					startDate: course.startDate,
					endDate: course.endDate,
					categoryIds: course.categoryLinks.map((link) => link.categoryId),
					isFeatured: course.isFeatured,
					isFree: course.isFree,
					seats: course.seats,
				}}
				instructors={instructors.map((i) => ({ id: i.id, label: i.name }))}
				categories={categories.map((c) => ({
					id: c.id,
					label: c.name.pt,
				}))}
			/>
		</div>
	);
}
