import Link from "next/link";
import CoursesTable from "@/app/backoffice/components/courses-table";
import PageHeader from "@/app/backoffice/components/page-header";
import { getAdminCourses } from "@/db/queries/admin";
import { getEnrollmentCounts } from "@/db/queries/enrollments";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { estado } = await searchParams;
	const [courses, enrollmentCounts] = await Promise.all([
		getAdminCourses(),
		getEnrollmentCounts(),
	]);

	const rows = courses.map((course) => ({
		id: course.id,
		slug: course.slug,
		titlePt: course.title.pt,
		status: course.status,
		price: course.price,
		currency: course.currency,
		instructorName: course.instructor?.name ?? null,
		categories: course.categoryLinks.map((link) => link.category.name.pt),
		seats: course.seats,
		enrolled: enrollmentCounts.get(course.id) ?? 0,
		createdAt: course.createdAt,
	}));

	return (
		<div>
			<PageHeader
				title="Cursos e formações"
				description="Gerir catálogo de formações da academia"
			>
				<Link
					href="/backoffice/cursos/novo"
					className="admin-btn admin-btn-secondary"
				>
					Novo curso
				</Link>
			</PageHeader>
			<CoursesTable
				courses={rows}
				initialStatus={typeof estado === "string" ? estado : ""}
			/>
		</div>
	);
}
