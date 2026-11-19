"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
];

const statusOrder = ["published", "draft", "archived"] as const;
const statusLabel: Record<(typeof statusOrder)[number], string> = {
	published: "Publicado",
	draft: "Rascunho",
	archived: "Arquivado",
};

const roleOrder = ["student", "instructor", "admin"] as const;
const roleLabel: Record<(typeof roleOrder)[number], string> = {
	student: "Estudante",
	instructor: "Instrutor",
	admin: "Administrador",
};

type ChartsData = {
	coursesByStatus: { status: string; value: number }[];
	coursesByCategory: { name: string; value: number }[];
	usersByRole: { role: string; value: number }[];
	activityByMonth: { month: string; courses: number; enrollments: number }[];
};

const monthFormat = new Intl.DateTimeFormat("pt-PT", { month: "short" });

// "2026-08" -> "ago. 2026" (o formato pt-PT com ano devolve "08/26").
function formatMonth(month: string) {
	const [year, value] = month.split("-").map(Number);
	return `${monthFormat.format(new Date(year, value - 1, 1))} ${year}`;
}

export default function DashboardCharts({ data }: { data: ChartsData }) {
	const statusData = statusOrder
		.map((status, index) => {
			const row = data.coursesByStatus.find((item) => item.status === status);
			return {
				status,
				label: statusLabel[status],
				value: row?.value ?? 0,
				fill: COLORS[index],
			};
		})
		.filter((item) => item.value > 0);

	const categoryData = data.coursesByCategory.map((item, index) => ({
		name: item.name,
		value: item.value,
		fill: COLORS[index % COLORS.length],
	}));

	const monthData = data.activityByMonth.map((item) => ({
		...item,
		month: formatMonth(item.month),
	}));

	const roleData = roleOrder
		.map((role, index) => {
			const row = data.usersByRole.find((item) => item.role === role);
			return {
				role,
				label: roleLabel[role],
				value: row?.value ?? 0,
				fill: COLORS[index],
			};
		})
		.filter((item) => item.value > 0);

	return (
		<div className="admin-chart-grid">
			<ChartCard title="Cursos por estado">
				{statusData.length ? (
					<>
						<div className="admin-chart">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Tooltip content={<ChartTooltip />} />
									<Pie
										data={statusData}
										dataKey="value"
										nameKey="label"
										innerRadius={50}
										outerRadius={80}
										strokeWidth={2}
										stroke="var(--paper)"
									>
										{statusData.map((entry) => (
											<Cell key={entry.status} fill={entry.fill} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</div>
						<ChartLegend items={statusData.map((item) => ({ label: item.label, color: item.fill }))} />
					</>
				) : (
					<EmptyState />
				)}
			</ChartCard>

			<ChartCard title="Cursos por categoria">
				{categoryData.length ? (
					<div className="admin-chart">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={categoryData} layout="vertical" margin={{ left: 8 }}>
								<CartesianGrid horizontal={false} />
								<XAxis type="number" allowDecimals={false} hide />
								<YAxis
									type="category"
									dataKey="name"
									tickLine={false}
									axisLine={false}
									width={110}
								/>
								<Tooltip content={<ChartTooltip />} />
								<Bar dataKey="value" name="Cursos" radius={4}>
									{categoryData.map((entry) => (
										<Cell key={entry.name} fill={entry.fill} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<EmptyState />
				)}
			</ChartCard>

			<ChartCard title="Atividade por mês">
				{monthData.length ? (
					<>
						<div className="admin-chart">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={monthData} margin={{ left: 8, right: 8 }}>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="month"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
									/>
									<YAxis allowDecimals={false} tickLine={false} axisLine={false} />
									<Tooltip content={<SeriesTooltip />} />
									<Line
										type="monotone"
										dataKey="enrollments"
										name="Inscrições"
										stroke="var(--chart-1)"
										strokeWidth={2}
										dot={{ r: 4, fill: "var(--chart-1)" }}
									/>
									<Line
										type="monotone"
										dataKey="courses"
										name="Cursos criados"
										stroke="var(--chart-2)"
										strokeWidth={2}
										dot={{ r: 4, fill: "var(--chart-2)" }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
						<ChartLegend
							items={[
								{ label: "Inscrições", color: "var(--chart-1)" },
								{ label: "Cursos criados", color: "var(--chart-2)" },
							]}
						/>
					</>
				) : (
					<EmptyState />
				)}
			</ChartCard>

			<ChartCard title="Utilizadores por função">
				{roleData.length ? (
					<>
						<div className="admin-chart">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Tooltip content={<ChartTooltip />} />
									<Pie
										data={roleData}
										dataKey="value"
										nameKey="label"
										innerRadius={50}
										outerRadius={80}
										strokeWidth={2}
										stroke="var(--paper)"
									>
										{roleData.map((entry) => (
											<Cell key={entry.role} fill={entry.fill} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</div>
						<ChartLegend items={roleData.map((item) => ({ label: item.label, color: item.fill }))} />
					</>
				) : (
					<EmptyState />
				)}
			</ChartCard>
		</div>
	);
}

function ChartCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="admin-card">
			<div className="admin-card-header">
				<h3 className="admin-card-title">{title}</h3>
			</div>
			<div className="admin-card-body">{children}</div>
		</div>
	);
}

function ChartLegend({
	items,
}: {
	items: { label: string; color: string }[];
}) {
	return (
		<div className="admin-chart-legend">
			{items.map((item) => (
				<span key={item.label} className="admin-chart-legend-item">
					<span
						className="admin-chart-legend-dot"
						style={{ backgroundColor: item.color }}
					/>
					{item.label}
				</span>
			))}
		</div>
	);
}

function ChartTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: { name?: string; value?: number; payload?: { label?: string } }[];
	label?: string;
}) {
	if (!active || !payload?.length) return null;

	const item = payload[0];
	const name = item.payload?.label || item.name || label;

	return (
		<div className="admin-chart-tooltip">
			{name ? <strong>{name}</strong> : null}
			<div>{item.value?.toLocaleString("pt-PT")}</div>
		</div>
	);
}

function SeriesTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: { name?: string; value?: number; color?: string }[];
	label?: string;
}) {
	if (!active || !payload?.length) return null;

	return (
		<div className="admin-chart-tooltip">
			{label ? <strong className="admin-chart-tooltip-title">{label}</strong> : null}
			{payload.map((item) => (
				<div key={item.name} className="admin-chart-tooltip-row">
					<span className="admin-chart-tooltip-name">
						<span
							className="admin-chart-legend-dot"
							style={{ backgroundColor: item.color }}
						/>
						{item.name}
					</span>
					<span className="admin-chart-tooltip-value">
						{item.value?.toLocaleString("pt-PT")}
					</span>
				</div>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<p className="text-center mb-0" style={{ color: "var(--body)", padding: "2.5rem 0" }}>
			Sem dados suficientes.
		</p>
	);
}
