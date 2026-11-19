import { listMyReportRequests } from "@/app/actions/admin/reports";
import PageHeader from "@/app/backoffice/components/page-header";
import ReportsPanel from "@/app/backoffice/components/reports-panel";
import { getAdminCourses } from "@/db/queries/admin";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
	const session = await requireAdmin();
	const [courses, recent] = await Promise.all([getAdminCourses(), listMyReportRequests()]);

	return (
		<div>
			<PageHeader
				title="Relatórios"
				description="Exportar dados para Excel. O ficheiro é enviado para o seu email."
			/>
			<ReportsPanel
				email={session.user.email}
				courses={courses.map((course) => ({ id: course.id, label: course.title.pt }))}
				recent={recent}
			/>
		</div>
	);
}
