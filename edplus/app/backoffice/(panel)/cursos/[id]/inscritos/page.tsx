import Link from "next/link";
import { notFound } from "next/navigation";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import EnrolleesTable from "@/app/backoffice/components/enrollees-table";
import PageHeader from "@/app/backoffice/components/page-header";
import { getAdminCourse } from "@/db/queries/admin";
import { getCourseEnrollees } from "@/db/queries/enrollments";

export const dynamic = "force-dynamic";

export default async function CourseEnrolleesPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [course, enrollees] = await Promise.all([
		getAdminCourse(id),
		getCourseEnrollees(id),
	]);

	if (!course) notFound();

	const enrolled = enrollees.length;
	const remaining =
		course.seats === null ? null : Math.max(0, course.seats - enrolled);

	return (
		<div>
			<PageHeader
				title="Inscritos"
				description={course.title.pt}
			>
				<Link
					href={`/backoffice/cursos/${course.id}`}
					className="admin-btn admin-btn-outline"
				>
					Editar curso
				</Link>
			</PageHeader>

			<div className="d-flex flex-wrap gap-2 mb-4">
				<AdminBadge variant="default">
					{enrolled === 1 ? "1 inscrito" : `${enrolled} inscritos`}
				</AdminBadge>
				{course.seats === null ? (
					<AdminBadge variant="muted">Sem limite de vagas</AdminBadge>
				) : remaining === 0 ? (
					<AdminBadge variant="danger">
						Esgotado ({enrolled} / {course.seats})
					</AdminBadge>
				) : (
					<AdminBadge variant="success">
						{remaining} disponíveis ({enrolled} / {course.seats})
					</AdminBadge>
				)}
			</div>

			{enrollees.length === 0 ? (
				<div className="admin-empty">
					Ainda não há inscritos neste curso.
				</div>
			) : (
				<EnrolleesTable enrollees={enrollees} />
			)}
		</div>
	);
}
