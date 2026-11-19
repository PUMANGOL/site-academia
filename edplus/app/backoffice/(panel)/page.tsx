import DashboardCharts from "@/app/backoffice/components/dashboard-charts";
import DashboardFilters from "@/app/backoffice/components/dashboard-filters";
import PageHeader from "@/app/backoffice/components/page-header";
import StatCard from "@/app/backoffice/components/stat-card";
import {
	DASHBOARD_PERIODS,
	getAdminChartsData,
	getAdminStats,
	getCategoryOptions,
	periodStart,
	type DashboardPeriod,
	type DateRange,
} from "@/db/queries/admin";

export const dynamic = "force-dynamic";

const periodLabel: Record<Exclude<DashboardPeriod, "all">, string> = {
	"7d": "nos últimos 7 dias",
	"30d": "nos últimos 30 dias",
	"90d": "nos últimos 90 dias",
	"12m": "nos últimos 12 meses",
	custom: "no intervalo",
};

type SearchValue = string | string[] | undefined;

function parsePeriod(value: SearchValue): DashboardPeriod {
	return DASHBOARD_PERIODS.find((period) => period === value) ?? "all";
}

// Aceita só "YYYY-MM-DD" (formato do <input type="date">).
function parseDateParam(value: SearchValue) {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return { raw: "", date: null };
	}
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return Number.isNaN(date.getTime()) ? { raw: "", date: null } : { raw: value, date };
}

function resolveRange(
	period: DashboardPeriod,
	from: Date | null,
	to: Date | null
): DateRange {
	if (period !== "custom") return { from: periodStart(period), to: null };
	// A data final é inclusiva: o limite passa para o início do dia seguinte.
	const end = to ? new Date(to) : null;
	end?.setDate(end.getDate() + 1);
	return { from, to: end };
}

export default async function BackofficeDashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const categoryOptions = await getCategoryOptions();
	const period = parsePeriod(params.periodo);
	const from = parseDateParam(params.de);
	const to = parseDateParam(params.ate);
	const categoryId =
		categoryOptions.find((category) => category.id === params.categoria)?.id ??
		null;
	const range = resolveRange(period, from.date, to.date);
	const filters = { range, categoryId };
	const hasRange = range.from !== null || range.to !== null;

	const [stats, chartsData] = await Promise.all([
		getAdminStats(filters),
		getAdminChartsData(filters),
	]);

	const trend = (recent: number) =>
		period === "all" || !hasRange
			? undefined
			: `+${recent} ${periodLabel[period]}`;

	return (
		<div>
			<PageHeader
				title="Dashboard"
				description="Visão geral da Academia Pumangol"
			/>

			<DashboardFilters
				period={period}
				dates={{ from: from.raw, to: to.raw }}
				categoryId={categoryId}
				categories={categoryOptions.map((category) => ({
					value: category.id,
					label: category.name.pt,
				}))}
			/>

			<div className="admin-stat-grid">
				<StatCard
					label="Cursos"
					value={stats.courses.total}
					icon="ph-book-open"
					tone="blue"
					href="/backoffice/cursos"
					trend={trend(stats.courses.recent)}
					hint={`${stats.courses.published} publicados · ${stats.courses.draft} rascunhos`}
				/>
				<StatCard
					label="Estudantes"
					value={stats.students.total}
					icon="ph-student"
					tone="green"
					href="/backoffice/utilizadores?funcao=student"
					trend={trend(stats.students.recent)}
					hint="Contas com função de estudante"
				/>
				<StatCard
					label="Instrutores"
					value={stats.instructors.total}
					icon="ph-chalkboard-teacher"
					tone="orange"
					href="/backoffice/instrutores"
					trend={trend(stats.instructors.recent)}
					hint="Perfis públicos de formador"
				/>
				<StatCard
					label="Inscrições"
					value={stats.enrollments.total}
					icon="ph-clipboard-text"
					tone="teal"
					trend={trend(stats.enrollments.recent)}
					hint={`${stats.enrollments.completed} concluídas`}
				/>
				<StatCard
					label="Categorias"
					value={stats.categories.total}
					icon="ph-tag"
					tone="yellow"
					href="/backoffice/categorias"
					hint={`${stats.categories.active} ativas`}
				/>
				<StatCard
					label="Utilizadores"
					value={stats.users.total}
					icon="ph-users"
					tone="blue"
					href="/backoffice/utilizadores"
					trend={trend(stats.users.recent)}
					hint="Todas as contas registadas"
				/>
			</div>

			<DashboardCharts data={chartsData} />
		</div>
	);
}
