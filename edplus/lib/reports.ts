// Relatórios em Excel pedidos no backoffice. O pedido fica em email_jobs (template
// "admin_report") e o worker gera o ficheiro e envia-o por email ao administrador.

export type ReportType = "enrollments" | "courses" | "users" | "companyRequests";

export type ReportFilters = {
	// yyyy-mm-dd, inclusivo. Vazio = sem limite.
	from?: string;
	to?: string;
	courseId?: string;
	status?: string;
	role?: string;
};

export type ReportDefinition = {
	type: ReportType;
	label: string;
	description: string;
	icon: string;
	// Que data o período filtra.
	periodLabel: string;
	filters: ("period" | "course" | "status" | "role")[];
	statusOptions?: { value: string; label: string }[];
};

export const enrollmentStatusLabels: Record<string, string> = {
	not_started: "Não iniciado",
	in_progress: "Em curso",
	completed: "Concluído",
};

export const companyRequestStatusLabels: Record<string, string> = {
	new: "Novo",
	in_progress: "Em tratamento",
	closed: "Fechado",
};

export const trainingModalityLabels: Record<string, string> = {
	in_person: "Presencial",
	online: "Online",
	hybrid: "Híbrido",
	undecided: "A definir",
};

export const roleLabels: Record<string, string> = {
	student: "Aluno",
	instructor: "Formador",
	admin: "Administrador",
};

const toOptions = (labels: Record<string, string>) =>
	Object.entries(labels).map(([value, label]) => ({ value, label }));

export const reportDefinitions: ReportDefinition[] = [
	{
		type: "enrollments",
		label: "Inscrições",
		description: "Todas as inscrições com formando, curso, estado, valor e pagamento.",
		icon: "ph-clipboard-text",
		periodLabel: "Data de inscrição",
		filters: ["period", "course", "status"],
		statusOptions: toOptions(enrollmentStatusLabels),
	},
	{
		type: "courses",
		label: "Cursos e ocupação",
		description: "Por curso: vagas, inscritos, taxa de ocupação, conclusões e receita.",
		icon: "ph-chart-bar",
		periodLabel: "Inscrições feitas entre",
		filters: ["period"],
	},
	{
		type: "users",
		label: "Utilizadores",
		description: "Contas registadas com perfil, estado, número de inscrições e último acesso.",
		icon: "ph-users",
		periodLabel: "Data de registo",
		filters: ["period", "role"],
	},
	{
		type: "companyRequests",
		label: "Pedidos de empresas",
		description: "Pedidos de formação à medida recebidos pela página de parceiros.",
		icon: "ph-buildings",
		periodLabel: "Data do pedido",
		filters: ["period", "status"],
		statusOptions: toOptions(companyRequestStatusLabels),
	},
];

export const reportDefinitionMap = new Map(reportDefinitions.map((def) => [def.type, def]));

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f-]{36}$/i;

// Valida os filtros (no pedido e outra vez no worker). Lança Error com mensagem para o utilizador.
export function cleanReportFilters(type: ReportType, input: ReportFilters): ReportFilters {
	const def = reportDefinitionMap.get(type);
	if (!def) throw new Error("Tipo de relatório desconhecido.");
	const filters: ReportFilters = {};

	if (def.filters.includes("period")) {
		for (const key of ["from", "to"] as const) {
			const value = input[key]?.trim();
			if (!value) continue;
			if (!DATE.test(value)) throw new Error("Indique datas válidas.");
			filters[key] = value;
		}
		if (filters.from && filters.to && filters.to < filters.from) {
			throw new Error("A data final não pode ser anterior à inicial.");
		}
	}
	if (def.filters.includes("course") && input.courseId) {
		if (!UUID.test(input.courseId)) throw new Error("Curso inválido.");
		filters.courseId = input.courseId;
	}
	if (def.filters.includes("status") && input.status) {
		if (!def.statusOptions?.some((option) => option.value === input.status)) {
			throw new Error("Estado inválido.");
		}
		filters.status = input.status;
	}
	if (def.filters.includes("role") && input.role) {
		if (!roleLabels[input.role]) throw new Error("Perfil inválido.");
		filters.role = input.role;
	}
	return filters;
}

export function formatReportDay(value: string) {
	const [year, month, day] = value.split("-");
	return `${day}/${month}/${year}`;
}

export function describePeriod(filters: ReportFilters) {
	if (filters.from && filters.to) return `${formatReportDay(filters.from)} a ${formatReportDay(filters.to)}`;
	if (filters.from) return `Desde ${formatReportDay(filters.from)}`;
	if (filters.to) return `Até ${formatReportDay(filters.to)}`;
	return "Todo o período";
}
