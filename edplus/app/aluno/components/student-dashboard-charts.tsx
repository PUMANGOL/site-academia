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
import type { Localized } from "@/db/schema";
import { pickLocale } from "@/lib/i18n-content";

const COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
];

type ChartsData = {
	coursesByCategory: { name: Localized; value: number }[];
	enrollmentsByMonth: { month: string; value: number }[];
	notStarted: number;
	inProgress: number;
	completed: number;
};

export default function StudentDashboardCharts({ data }: { data: ChartsData }) {
	// Cinzento (por iniciar), Midnight Green (em curso) e verde (concluído):
	// fatias vizinhas sempre com cores bem distintas.
	const statusData = [
		{ label: "Não iniciados", value: data.notStarted, fill: COLORS[2] },
		{ label: "Em progresso", value: data.inProgress, fill: COLORS[0] },
		{ label: "Concluídos", value: data.completed, fill: COLORS[1] },
	].filter((item) => item.value > 0);

	// Série única: todas as barras em Midnight Green, a cor principal da marca.
	const categoryData = data.coursesByCategory.map((item) => ({
		name: pickLocale(item.name, "pt"),
		value: item.value,
		fill: COLORS[0],
	}));

	const monthData = data.enrollmentsByMonth.map((item) => ({
		month: item.month,
		value: item.value,
	}));

	return (
		<div className="admin-chart-grid">
			<ChartCard title="Estado dos cursos">
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
											<Cell key={entry.label} fill={entry.fill} />
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

			<ChartCard title="Matrículas por mês">
				{monthData.length ? (
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
								<Tooltip content={<ChartTooltip />} />
								<Line
									type="monotone"
									dataKey="value"
									name="Matrículas"
									stroke="var(--chart-1)"
									strokeWidth={2}
									dot={{ r: 4, fill: "var(--chart-1)" }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				) : (
					<EmptyState />
				)}
			</ChartCard>
		</div>
	);
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="admin-card">
			<div className="admin-card-header">
				<h3 className="admin-card-title">{title}</h3>
			</div>
			<div className="admin-card-body">{children}</div>
		</div>
	);
}

function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
	return (
		<div className="admin-chart-legend">
			{items.map((item) => (
				<span key={item.label} className="admin-chart-legend-item">
					<span className="admin-chart-legend-dot" style={{ backgroundColor: item.color }} />
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

function EmptyState() {
	return (
		<p className="text-center mb-0" style={{ color: "var(--body)", padding: "2.5rem 0" }}>
			Sem dados suficientes.
		</p>
	);
}
