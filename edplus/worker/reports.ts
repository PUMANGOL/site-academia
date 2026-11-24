// Relatórios em Excel (template "admin_report"): o worker consulta a BD no momento do envio,
// gera o livro com o logótipo da Academia e anexa-o ao email.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { sql, type SQL } from "drizzle-orm";
import ExcelJS from "exceljs";
import { db } from "@/db";
import type { EmailJobPayloads } from "@/lib/mail/jobs";
import type { MailAttachment } from "@/lib/mail/templates";
import {
	cleanReportFilters,
	companyRequestStatusLabels,
	describePeriod,
	enrollmentStatusLabels,
	reportDefinitionMap,
	roleLabels,
	trainingModalityLabels,
	type ReportFilters,
	type ReportType,
} from "@/lib/reports";

const TIME_ZONE = "Africa/Luanda";
const BRAND = "Academia Pumangol";
const BRAND_COLOR = "FF07525D";
const ACCENT_COLOR = "FF75A63D";
const MUTED_COLOR = "FF6B7280";
const ZEBRA_COLOR = "FFF4F6F9";
const BORDER_COLOR = "FFD1D5DB";

// Versão do logótipo usada nos emails: oficial a cores, sem assinatura (496×139 px, sem margens).
const LOGO_PATH = fileURLToPath(new URL("../public/assets/img/email/logo.png", import.meta.url));
const LOGO_SIZE = { width: 200, height: 56 };

// Linhas do cabeçalho: 1–3 logótipo, 4 título, 5 emissão, 6 filtros, 7 filete, 8 cabeçalhos da tabela.
const HEADER_ROW = 8;

type Format = "text" | "int" | "money" | "percent" | "date" | "datetime";

type Column = { header: string; key: string; width: number; format?: Format };

type Row = Record<string, string | number | Date | null>;

type Summary = { label: string; value: string | number; format?: Format }[];

type Report = {
	sheetName: string;
	columns: Column[];
	rows: Row[];
	summary: Summary;
	// Colunas somadas na linha de totais.
	totals?: string[];
};

const numFmt: Record<Format, string | undefined> = {
	text: undefined,
	int: "#,##0",
	money: '#,##0 "Kz"',
	percent: "0.0%",
	date: "dd/mm/yyyy",
	datetime: "dd/mm/yyyy hh:mm",
};

// ---------- Consultas ----------

// Datas guardadas em UTC, mostradas na hora de Luanda. Devolve texto ISO sem fuso,
// convertido depois em Date "UTC" para o Excel mostrar a hora local exacta.
const localTs = (column: SQL) =>
	sql`to_char((${column} at time zone 'UTC') at time zone ${TIME_ZONE}, 'YYYY-MM-DD"T"HH24:MI:SS')`;
const localDay = (column: SQL) => sql`((${column} at time zone 'UTC') at time zone ${TIME_ZONE})::date`;

function periodWhere(column: SQL, filters: ReportFilters) {
	const parts: SQL[] = [];
	if (filters.from) parts.push(sql`${localDay(column)} >= ${filters.from}::date`);
	if (filters.to) parts.push(sql`${localDay(column)} <= ${filters.to}::date`);
	return parts;
}

function where(parts: SQL[]) {
	return parts.length ? sql`where ${sql.join(parts, sql` and `)}` : sql``;
}

const asDate = (value: unknown) => {
	if (typeof value !== "string" || !value) return null;
	return new Date(value.length === 10 ? `${value}T00:00:00Z` : `${value}Z`);
};
const asNumber = (value: unknown) => (value === null || value === undefined ? null : Number(value));

async function rows<T>(query: SQL) {
	return (await db.execute(query)) as unknown as T[];
}

async function enrollmentsReport(filters: ReportFilters): Promise<Report> {
	const parts = periodWhere(sql`e.created_at`, filters);
	if (filters.courseId) parts.push(sql`e.course_id = ${filters.courseId}::uuid`);
	if (filters.status) parts.push(sql`e.status = ${filters.status}`);

	const data = await rows<Record<string, unknown>>(sql`
		select
			${localTs(sql`e.created_at`)} as enrolled_at,
			u.name, u.email,
			c.title->>'pt' as course,
			(select string_agg(cat.name->>'pt', ', ' order by cat.sort_order)
				from course_categories cc join categories cat on cat.id = cc.category_id
				where cc.course_id = c.id) as categories,
			c.modality, c.start_date::text as start_date, c.end_date::text as end_date,
			e.status, e.progress,
			${localTs(sql`e.completed_at`)} as completed_at,
			c.is_free,
			coalesce(oi.unit_price, case when c.is_free then 0 else c.price end) as amount,
			o.status as order_status, o.payment_reference,
			${localTs(sql`o.paid_at`)} as paid_at
		from enrollments e
		join "user" u on u.id = e.user_id
		join courses c on c.id = e.course_id
		left join orders o on o.id = e.order_id
		left join order_items oi on oi.order_id = e.order_id and oi.course_id = e.course_id
		${where(parts)}
		order by e.created_at desc`);

	const paymentLabel = (row: Record<string, unknown>) => {
		if (row.is_free) return "Gratuito";
		if (row.order_status === "paid") return "Pago";
		if (row.order_status === "cancelled") return "Cancelado";
		return row.order_status ? "Pendente" : "Sem encomenda";
	};

	const mapped: Row[] = data.map((row) => ({
		enrolledAt: asDate(row.enrolled_at),
		name: String(row.name),
		email: String(row.email),
		course: String(row.course ?? ""),
		categories: (row.categories as string) ?? "",
		modality: row.modality === "online" ? "Online" : "Presencial",
		startDate: asDate(row.start_date),
		endDate: asDate(row.end_date),
		status: enrollmentStatusLabels[String(row.status)] ?? String(row.status),
		progress: (asNumber(row.progress) ?? 0) / 100,
		completedAt: asDate(row.completed_at),
		amount: asNumber(row.amount),
		payment: paymentLabel(row),
		reference: (row.payment_reference as string) ?? "",
		paidAt: asDate(row.paid_at),
	}));

	const count = (status: string) => data.filter((row) => row.status === status).length;
	const paid = data.filter((row) => row.order_status === "paid");

	return {
		sheetName: "Inscrições",
		columns: [
			{ header: "Data de inscrição", key: "enrolledAt", width: 18, format: "datetime" },
			{ header: "Formando", key: "name", width: 28 },
			{ header: "Email", key: "email", width: 32 },
			{ header: "Curso", key: "course", width: 40 },
			{ header: "Categorias", key: "categories", width: 26 },
			{ header: "Modalidade", key: "modality", width: 13 },
			{ header: "Início", key: "startDate", width: 12, format: "date" },
			{ header: "Fim", key: "endDate", width: 12, format: "date" },
			{ header: "Estado", key: "status", width: 14 },
			{ header: "Progresso", key: "progress", width: 11, format: "percent" },
			{ header: "Concluído em", key: "completedAt", width: 18, format: "datetime" },
			{ header: "Valor", key: "amount", width: 14, format: "money" },
			{ header: "Pagamento", key: "payment", width: 14 },
			{ header: "Referência", key: "reference", width: 14 },
			{ header: "Pago em", key: "paidAt", width: 18, format: "datetime" },
		],
		rows: mapped,
		totals: ["amount"],
		summary: [
			{ label: "Total de inscrições", value: data.length, format: "int" },
			{ label: "Não iniciadas", value: count("not_started"), format: "int" },
			{ label: "Em curso", value: count("in_progress"), format: "int" },
			{ label: "Concluídas", value: count("completed"), format: "int" },
			{ label: "Inscrições gratuitas", value: data.filter((row) => row.is_free).length, format: "int" },
			{ label: "Inscrições pagas", value: paid.length, format: "int" },
			{ label: "Receita recebida", value: paid.reduce((sum, row) => sum + (asNumber(row.amount) ?? 0), 0), format: "money" },
		],
	};
}

async function coursesReport(filters: ReportFilters): Promise<Report> {
	const period = periodWhere(sql`e.created_at`, filters);
	const inPeriod = period.length ? sql.join(period, sql` and `) : sql`true`;

	const data = await rows<Record<string, unknown>>(sql`
		select
			c.title->>'pt' as course, c.status, c.modality,
			c.start_date::text as start_date, c.end_date::text as end_date,
			c.seats, c.price, c.is_free,
			(select string_agg(cat.name->>'pt', ', ' order by cat.sort_order)
				from course_categories cc join categories cat on cat.id = cc.category_id
				where cc.course_id = c.id) as categories,
			coalesce(
				(select string_agg(ip.name, ', ' order by ci.sort_order)
					from course_instructors ci join instructor_profiles ip on ip.id = ci.instructor_id
					where ci.course_id = c.id),
				(select ip.name from instructor_profiles ip where ip.id = c.instructor_id)
			) as instructors,
			(select count(*) from enrollments e where e.course_id = c.id) as total_enrolled,
			(select count(*) from enrollments e where e.course_id = c.id and ${inPeriod}) as period_enrolled,
			(select count(*) from enrollments e where e.course_id = c.id and e.status = 'completed' and ${inPeriod}) as completed,
			(select coalesce(sum(oi.unit_price), 0)
				from enrollments e
				join orders o on o.id = e.order_id and o.status = 'paid'
				join order_items oi on oi.order_id = o.id and oi.course_id = e.course_id
				where e.course_id = c.id and ${inPeriod}) as revenue
		from courses c
		order by c.start_date desc nulls last, c.title->>'pt'`);

	const statusLabel: Record<string, string> = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };
	const mapped: Row[] = data.map((row) => {
		const seats = asNumber(row.seats);
		const total = asNumber(row.total_enrolled) ?? 0;
		return {
			course: String(row.course ?? ""),
			status: statusLabel[String(row.status)] ?? String(row.status),
			categories: (row.categories as string) ?? "",
			instructors: (row.instructors as string) ?? "",
			modality: row.modality === "online" ? "Online" : "Presencial",
			startDate: asDate(row.start_date),
			endDate: asDate(row.end_date),
			price: row.is_free ? 0 : asNumber(row.price),
			seats,
			periodEnrolled: asNumber(row.period_enrolled),
			totalEnrolled: total,
			occupancy: seats ? total / seats : null,
			completed: asNumber(row.completed),
			revenue: asNumber(row.revenue),
		};
	});

	const withSeats = mapped.filter((row) => typeof row.occupancy === "number");
	const avgOccupancy = withSeats.length
		? withSeats.reduce((sum, row) => sum + (row.occupancy as number), 0) / withSeats.length
		: 0;

	return {
		sheetName: "Cursos",
		columns: [
			{ header: "Curso", key: "course", width: 40 },
			{ header: "Estado", key: "status", width: 12 },
			{ header: "Categorias", key: "categories", width: 26 },
			{ header: "Formadores", key: "instructors", width: 28 },
			{ header: "Modalidade", key: "modality", width: 13 },
			{ header: "Início", key: "startDate", width: 12, format: "date" },
			{ header: "Fim", key: "endDate", width: 12, format: "date" },
			{ header: "Preço", key: "price", width: 14, format: "money" },
			{ header: "Vagas", key: "seats", width: 9, format: "int" },
			{ header: "Inscritos no período", key: "periodEnrolled", width: 12, format: "int" },
			{ header: "Total de inscritos", key: "totalEnrolled", width: 12, format: "int" },
			{ header: "Ocupação", key: "occupancy", width: 11, format: "percent" },
			{ header: "Concluídos", key: "completed", width: 11, format: "int" },
			{ header: "Receita", key: "revenue", width: 15, format: "money" },
		],
		rows: mapped,
		totals: ["periodEnrolled", "totalEnrolled", "completed", "revenue"],
		summary: [
			{ label: "Cursos", value: mapped.length, format: "int" },
			{ label: "Cursos publicados", value: data.filter((row) => row.status === "published").length, format: "int" },
			{ label: "Inscrições no período", value: mapped.reduce((sum, row) => sum + ((row.periodEnrolled as number) ?? 0), 0), format: "int" },
			{ label: "Ocupação média (cursos com vagas)", value: avgOccupancy, format: "percent" },
			{ label: "Receita no período", value: mapped.reduce((sum, row) => sum + ((row.revenue as number) ?? 0), 0), format: "money" },
		],
	};
}

async function usersReport(filters: ReportFilters): Promise<Report> {
	const parts = periodWhere(sql`u.created_at`, filters);
	if (filters.role) parts.push(sql`u.role = ${filters.role}`);

	const data = await rows<Record<string, unknown>>(sql`
		select
			u.name, u.email, u.username, u.role, u.email_verified, coalesce(u.banned, false) as banned,
			${localTs(sql`u.created_at`)} as created_at,
			(select count(*) from enrollments e where e.user_id = u.id) as enrollments,
			(select count(*) from enrollments e where e.user_id = u.id and e.status = 'completed') as completed,
			(select ${localTs(sql`max(s.updated_at)`)} from session s where s.user_id = u.id) as last_seen
		from "user" u
		${where(parts)}
		order by u.created_at desc`);

	const mapped: Row[] = data.map((row) => ({
		name: String(row.name),
		email: String(row.email),
		username: (row.username as string) ?? "",
		role: roleLabels[String(row.role)] ?? String(row.role),
		verified: row.email_verified ? "Sim" : "Não",
		banned: row.banned ? "Sim" : "Não",
		createdAt: asDate(row.created_at),
		enrollments: asNumber(row.enrollments),
		completed: asNumber(row.completed),
		lastSeen: asDate(row.last_seen),
	}));

	const byRole = (role: string) => data.filter((row) => row.role === role).length;

	return {
		sheetName: "Utilizadores",
		columns: [
			{ header: "Nome", key: "name", width: 28 },
			{ header: "Email", key: "email", width: 32 },
			{ header: "Utilizador", key: "username", width: 18 },
			{ header: "Perfil", key: "role", width: 14 },
			{ header: "Email verificado", key: "verified", width: 11 },
			{ header: "Bloqueado", key: "banned", width: 11 },
			{ header: "Registado em", key: "createdAt", width: 18, format: "datetime" },
			{ header: "Inscrições", key: "enrollments", width: 11, format: "int" },
			{ header: "Cursos concluídos", key: "completed", width: 11, format: "int" },
			{ header: "Último acesso", key: "lastSeen", width: 18, format: "datetime" },
		],
		rows: mapped,
		totals: ["enrollments", "completed"],
		summary: [
			{ label: "Utilizadores", value: data.length, format: "int" },
			{ label: "Alunos", value: byRole("student"), format: "int" },
			{ label: "Formadores", value: byRole("instructor"), format: "int" },
			{ label: "Administradores", value: byRole("admin"), format: "int" },
			{ label: "Com email verificado", value: data.filter((row) => row.email_verified).length, format: "int" },
			{ label: "Bloqueados", value: data.filter((row) => row.banned).length, format: "int" },
		],
	};
}

async function companyRequestsReport(filters: ReportFilters): Promise<Report> {
	const parts = periodWhere(sql`r.created_at`, filters);
	if (filters.status) parts.push(sql`r.status = ${filters.status}`);

	const data = await rows<Record<string, unknown>>(sql`
		select r.*, ${localTs(sql`r.created_at`)} as created_local, h.name as handled_by_name
		from company_requests r
		left join "user" h on h.id = r.handled_by
		${where(parts)}
		order by r.created_at desc`);

	const mapped: Row[] = data.map((row) => ({
		createdAt: asDate(row.created_local),
		company: String(row.company_name),
		contact: String(row.contact_name),
		jobTitle: (row.job_title as string) ?? "",
		email: String(row.email),
		phone: (row.phone as string) ?? "",
		sector: (row.sector as string) ?? "",
		participants: asNumber(row.participants),
		modality: trainingModalityLabels[String(row.modality)] ?? String(row.modality),
		areas: String(row.training_areas),
		message: (row.message as string) ?? "",
		status: companyRequestStatusLabels[String(row.status)] ?? String(row.status),
		handledBy: (row.handled_by_name as string) ?? "",
		notes: (row.internal_notes as string) ?? "",
	}));

	const byStatus = (status: string) => data.filter((row) => row.status === status).length;

	return {
		sheetName: "Pedidos de empresas",
		columns: [
			{ header: "Data do pedido", key: "createdAt", width: 18, format: "datetime" },
			{ header: "Empresa", key: "company", width: 28 },
			{ header: "Contacto", key: "contact", width: 24 },
			{ header: "Cargo", key: "jobTitle", width: 18 },
			{ header: "Email", key: "email", width: 30 },
			{ header: "Telefone", key: "phone", width: 16 },
			{ header: "Sector", key: "sector", width: 18 },
			{ header: "Participantes", key: "participants", width: 12, format: "int" },
			{ header: "Modalidade", key: "modality", width: 13 },
			{ header: "Áreas de formação", key: "areas", width: 40 },
			{ header: "Mensagem", key: "message", width: 50 },
			{ header: "Estado", key: "status", width: 14 },
			{ header: "Tratado por", key: "handledBy", width: 22 },
			{ header: "Notas internas", key: "notes", width: 40 },
		],
		rows: mapped,
		totals: ["participants"],
		summary: [
			{ label: "Pedidos", value: data.length, format: "int" },
			{ label: "Novos", value: byStatus("new"), format: "int" },
			{ label: "Em tratamento", value: byStatus("in_progress"), format: "int" },
			{ label: "Fechados", value: byStatus("closed"), format: "int" },
			{
				label: "Participantes estimados",
				value: data.reduce((sum, row) => sum + (asNumber(row.participants) ?? 0), 0),
				format: "int",
			},
		],
	};
}

const builders: Record<ReportType, (filters: ReportFilters) => Promise<Report>> = {
	enrollments: enrollmentsReport,
	courses: coursesReport,
	users: usersReport,
	companyRequests: companyRequestsReport,
};

// ---------- Livro Excel ----------

function formatIssued(date: Date) {
	return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long", timeStyle: "short", timeZone: TIME_ZONE }).format(date);
}

function addHeader(
	sheet: ExcelJS.Worksheet,
	logoId: number,
	lastColumn: number,
	title: string,
	lines: string[]
) {
	for (const row of [1, 2, 3]) sheet.getRow(row).height = 17;
	sheet.addImage(logoId, { tl: { col: 0.15, row: 0.2 }, ext: LOGO_SIZE, editAs: "absolute" });

	const titleCell = sheet.getCell(4, 1);
	titleCell.value = title;
	titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: BRAND_COLOR } };
	sheet.getRow(4).height = 26;

	lines.forEach((line, index) => {
		const cell = sheet.getCell(5 + index, 1);
		cell.value = line;
		cell.font = { name: "Calibri", size: 10, color: { argb: MUTED_COLOR } };
	});

	// Filete verde da marca por cima da tabela.
	const rule = sheet.getRow(HEADER_ROW - 1);
	rule.height = 4;
	for (let col = 1; col <= lastColumn; col++) {
		rule.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: ACCENT_COLOR } };
	}
}

function styleHeaderCell(cell: ExcelJS.Cell) {
	cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } };
	cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLOR } };
	cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
	cell.border = { bottom: { style: "thin", color: { argb: BRAND_COLOR } } };
}

function addDataSheet(
	workbook: ExcelJS.Workbook,
	logoId: number,
	report: Report,
	title: string,
	headerLines: string[]
) {
	const sheet = workbook.addWorksheet(report.sheetName, {
		views: [{ state: "frozen", ySplit: HEADER_ROW, showGridLines: false }],
		pageSetup: {
			orientation: "landscape",
			paperSize: 9,
			fitToPage: true,
			fitToWidth: 1,
			fitToHeight: 0,
			printTitlesRow: `${HEADER_ROW}:${HEADER_ROW}`,
		},
		headerFooter: { oddFooter: `&L${BRAND}&RPágina &P de &N` },
	});

	report.columns.forEach((column, index) => {
		sheet.getColumn(index + 1).width = column.width;
	});
	addHeader(sheet, logoId, report.columns.length, title, headerLines);

	const header = sheet.getRow(HEADER_ROW);
	report.columns.forEach((column, index) => {
		header.getCell(index + 1).value = column.header;
		styleHeaderCell(header.getCell(index + 1));
	});
	header.height = 30;

	report.rows.forEach((row, rowIndex) => {
		const excelRow = sheet.getRow(HEADER_ROW + 1 + rowIndex);
		report.columns.forEach((column, index) => {
			const cell = excelRow.getCell(index + 1);
			cell.value = row[column.key] ?? null;
			const format = numFmt[column.format ?? "text"];
			if (format) cell.numFmt = format;
			cell.font = { name: "Calibri", size: 10 };
			cell.alignment = { vertical: "top", wrapText: column.width >= 40 };
			cell.border = { bottom: { style: "hair", color: { argb: BORDER_COLOR } } };
			if (rowIndex % 2 === 1) {
				cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_COLOR } };
			}
		});
	});

	const lastDataRow = HEADER_ROW + report.rows.length;
	if (report.rows.length) {
		sheet.autoFilter = {
			from: { row: HEADER_ROW, column: 1 },
			to: { row: lastDataRow, column: report.columns.length },
		};
	} else {
		const empty = sheet.getCell(HEADER_ROW + 1, 1);
		empty.value = "Sem registos para os filtros escolhidos.";
		empty.font = { name: "Calibri", size: 10, italic: true, color: { argb: MUTED_COLOR } };
	}

	// Linha de totais com fórmulas: continua certa se alguém filtrar ou editar o ficheiro.
	if (report.totals?.length && report.rows.length) {
		const totalRow = sheet.getRow(lastDataRow + 1);
		totalRow.getCell(1).value = "Total";
		report.columns.forEach((column, index) => {
			const cell = totalRow.getCell(index + 1);
			cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: BRAND_COLOR } };
			cell.border = { top: { style: "thin", color: { argb: BRAND_COLOR } } };
			if (!report.totals!.includes(column.key)) return;
			const letter = sheet.getColumn(index + 1).letter;
			// SUBTOTAL(109) ignora as linhas escondidas pelo filtro automático.
			// `result` guarda o valor já calculado para visualizadores que não recalculam fórmulas.
			const result = report.rows.reduce((sum, row) => sum + (Number(row[column.key]) || 0), 0);
			cell.value = { formula: `SUBTOTAL(109,${letter}${HEADER_ROW + 1}:${letter}${lastDataRow})`, result };
			const format = numFmt[column.format ?? "text"];
			if (format) cell.numFmt = format;
		});
	}
}

function addSummarySheet(
	workbook: ExcelJS.Workbook,
	logoId: number,
	report: Report,
	title: string,
	headerLines: string[]
) {
	const sheet = workbook.addWorksheet("Resumo", {
		views: [{ showGridLines: false }],
		pageSetup: { orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
	});
	sheet.getColumn(1).width = 42;
	sheet.getColumn(2).width = 22;
	addHeader(sheet, logoId, 2, title, headerLines);

	const header = sheet.getRow(HEADER_ROW);
	header.getCell(1).value = "Indicador";
	header.getCell(2).value = "Valor";
	styleHeaderCell(header.getCell(1));
	styleHeaderCell(header.getCell(2));
	header.height = 22;

	report.summary.forEach((item, index) => {
		const row = sheet.getRow(HEADER_ROW + 1 + index);
		row.getCell(1).value = item.label;
		row.getCell(2).value = item.value;
		const format = numFmt[item.format ?? "text"];
		if (format) row.getCell(2).numFmt = format;
		row.getCell(2).alignment = { horizontal: "right" };
		row.getCell(1).font = { name: "Calibri", size: 10.5 };
		row.getCell(2).font = { name: "Calibri", size: 10.5, bold: true, color: { argb: BRAND_COLOR } };
		for (const cell of [row.getCell(1), row.getCell(2)]) {
			cell.border = { bottom: { style: "hair", color: { argb: BORDER_COLOR } } };
			if (index % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_COLOR } };
		}
		row.height = 20;
	});
	return sheet;
}

export async function renderReport(input: EmailJobPayloads["admin_report"], issuedAt = new Date()) {
	const def = reportDefinitionMap.get(input.report);
	if (!def) throw new Error(`Relatório desconhecido: ${input.report}`);
	const filters = cleanReportFilters(input.report, input.filters);
	const report = await builders[input.report](filters);

	const workbook = new ExcelJS.Workbook();
	workbook.creator = BRAND;
	workbook.company = BRAND;
	workbook.title = `Relatório de ${def.label.toLowerCase()}`;
	workbook.created = issuedAt;

	// Os tipos do exceljs ainda usam o Buffer antigo do @types/node.
	const logo = (await readFile(LOGO_PATH)) as unknown as ExcelJS.Buffer;
	const logoId = workbook.addImage({ buffer: logo, extension: "png" });
	const title = `Relatório de ${def.label.toLowerCase()}`;
	const lines = [
		`Emitido em ${formatIssued(issuedAt)} por ${input.name} · ${report.rows.length} registo(s)`,
		[`${def.periodLabel}: ${describePeriod(filters)}`, ...input.filterSummary].join(" · "),
	];

	addSummarySheet(workbook, logoId, report, title, lines);
	addDataSheet(workbook, logoId, report, title, lines);
	// Abre na folha de dados; o resumo fica como primeira folha.
	workbook.views = [{ x: 0, y: 0, width: 20000, height: 12000, firstSheet: 0, activeTab: 1, visibility: "visible" }];

	return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function reportAttachment(payload: EmailJobPayloads["admin_report"]): Promise<MailAttachment> {
	const issuedAt = new Date();
	const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(issuedAt);
	const slug = { enrollments: "inscricoes", courses: "cursos", users: "utilizadores", companyRequests: "pedidos-empresas" }[
		payload.report
	];
	return {
		filename: `relatorio-${slug}-${stamp}.xlsx`,
		content: await renderReport(payload, issuedAt),
		contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	};
}
