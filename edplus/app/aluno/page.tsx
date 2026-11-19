import PageHeader from "@/app/backoffice/components/page-header";
import StatCard, { type StatTone } from "@/app/backoffice/components/stat-card";
import StudentDashboardCharts from "@/app/aluno/components/student-dashboard-charts";
import { getStudentChartsData, getStudentStats } from "@/db/queries/student";
import { requireUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const statCards: {
	key: "enrolled" | "notStarted" | "inProgress" | "completed";
	label: string;
	icon: string;
	tone: StatTone;
}[] = [
	{ key: "enrolled", label: "Cursos matriculados", icon: "ph-books", tone: "blue" },
	{ key: "notStarted", label: "Não iniciados", icon: "ph-hourglass", tone: "yellow" },
	{ key: "inProgress", label: "Em progresso", icon: "ph-play-circle", tone: "orange" },
	{ key: "completed", label: "Concluídos", icon: "ph-seal-check", tone: "green" },
];

export default async function AlunoDashboardPage() {
	const session = await requireUser();
	const [stats, chartsData] = await Promise.all([
		getStudentStats(session.user.id),
		getStudentChartsData(session.user.id),
	]);

	return (
		<div>
			<PageHeader
				title={`Olá, ${session.user.name.split(" ")[0]}`}
				description="Visão geral da sua formação na Academia Pumangol"
			/>

			<div className="admin-stat-grid">
				{statCards.map((card) => (
					<StatCard
						key={card.key}
						label={card.label}
						value={stats[card.key]}
						icon={card.icon}
						tone={card.tone}
					/>
				))}
			</div>

			<StudentDashboardCharts
				data={{
					coursesByCategory: chartsData.coursesByCategory,
					enrollmentsByMonth: chartsData.enrollmentsByMonth,
					notStarted: stats.notStarted,
					inProgress: stats.inProgress,
					completed: stats.completed,
				}}
			/>
		</div>
	);
}
