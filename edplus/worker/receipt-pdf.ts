// Comprovativo de inscrição em PDF (A4), gerado pelo worker e anexado ao email de confirmação.
// Estilo institucional: fundo branco, tipografia sóbria, cor da marca só em títulos e filetes.
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import { formatPrice } from "@/lib/i18n-content";
import type { EmailJobPayloads } from "@/lib/mail/jobs";
import type { EnrollmentReceipt } from "@/lib/mail/receipts";
import { siteUrl } from "@/lib/mail/site-url";
import { formatCourseDate, type MailAttachment } from "@/lib/mail/templates";

const BRAND = "Academia Pumangol";
const ADDRESS = "Talatona, Luanda, Angola";
const TIME_ZONE = "Africa/Luanda";

const BRAND_COLOR = "#07525D";
const ACCENT_COLOR = "#75A63D";
const TEXT_COLOR = "#1F2933";
const MUTED_COLOR = "#6B7280";
const RULE_COLOR = "#D1D5DB";

const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

const PAGE_MARGIN = 56;
const LABEL_WIDTH = 150;

// Logótipo oficial a cores com a assinatura "Cria futuro." (1149×428 px, sem margens
// transparentes): o desenho fica alinhado com a margem da página.
const LOGO_PATH = fileURLToPath(new URL("../public/assets/img/logo.png", import.meta.url));
const LOGO_WIDTH = 168;

const MODALITY_LABELS: Record<string, string> = { in_person: "Presencial", online: "Online" };
const LANGUAGE_LABELS: Record<string, string> = { pt: "Português", en: "Inglês" };

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("pt-PT", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: TIME_ZONE,
	}).format(new Date(value));
}

function formatDuration(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	if (!hours) return `${rest} min`;
	return rest ? `${hours} h ${rest} min` : `${hours} ${hours === 1 ? "hora" : "horas"}`;
}

function courseDates(course: EnrollmentReceipt["course"]) {
	if (!course.startDate) return "A definir";
	if (course.endDate && course.endDate !== course.startDate) {
		return `${formatCourseDate(course.startDate)} a ${formatCourseDate(course.endDate)}`;
	}
	return formatCourseDate(course.startDate);
}

type Row = [label: string, value: string];

export async function renderEnrollmentReceipt(input: {
	name: string;
	email: string;
	receipt: EnrollmentReceipt;
	issuedAt?: Date;
}): Promise<Buffer> {
	const { receipt } = input;
	const issuedAt = (input.issuedAt ?? new Date()).toISOString();

	const doc = new PDFDocument({
		size: "A4",
		margin: PAGE_MARGIN,
		info: {
			Title: `Comprovativo de inscrição ${receipt.code}`,
			Author: BRAND,
			Subject: receipt.course.title,
		},
	});

	const chunks: Buffer[] = [];
	doc.on("data", (chunk: Buffer) => chunks.push(chunk));
	const finished = new Promise<Buffer>((resolve, reject) => {
		doc.on("end", () => resolve(Buffer.concat(chunks)));
		doc.on("error", reject);
	});

	const left = PAGE_MARGIN;
	const right = doc.page.width - PAGE_MARGIN;
	const contentWidth = right - left;

	const rule = (y: number, color = RULE_COLOR, width = 0.75) => {
		doc.save().moveTo(left, y).lineTo(right, y).lineWidth(width).strokeColor(color).stroke().restore();
	};

	// Cabeçalho: logótipo à esquerda, identificação do documento à direita.
	const top = PAGE_MARGIN;
	const logoHeight = LOGO_WIDTH * (428 / 1149);
	doc.image(LOGO_PATH, left, top, { width: LOGO_WIDTH });

	const metaWidth = 220;
	doc
		.font(FONT_BOLD)
		.fontSize(8.5)
		.fillColor(MUTED_COLOR)
		.text("COMPROVATIVO DE INSCRIÇÃO", right - metaWidth, top + 2, {
			width: metaWidth,
			align: "right",
			characterSpacing: 0.8,
		})
		.moveDown(0.35)
		.font(FONT_BOLD)
		.fontSize(12)
		.fillColor(BRAND_COLOR)
		.text(`N.º ${receipt.code}`, { width: metaWidth, align: "right" })
		.moveDown(0.25)
		.font(FONT)
		.fontSize(8.5)
		.fillColor(MUTED_COLOR)
		.text(`Emitido em ${formatDateTime(issuedAt)}`, { width: metaWidth, align: "right" });

	const headerBottom = Math.max(top + logoHeight, doc.y) + 18;
	rule(headerBottom, ACCENT_COLOR, 2);

	// Título e declaração.
	doc
		.font(FONT_BOLD)
		.fontSize(19)
		.fillColor(BRAND_COLOR)
		.text("Comprovativo de Inscrição", left, headerBottom + 30, { width: contentWidth })
		.moveDown(0.7)
		.font(FONT)
		.fontSize(10.5)
		.fillColor(TEXT_COLOR)
		.text(
			`A ${BRAND} declara, para os devidos efeitos, que a inscrição abaixo identificada se encontra confirmada no curso indicado.`,
			{ width: contentWidth, lineGap: 3 }
		);

	const section = (title: string, rows: Row[]) => {
		doc.moveDown(1.8);
		doc
			.font(FONT_BOLD)
			.fontSize(8.5)
			.fillColor(BRAND_COLOR)
			.text(title.toUpperCase(), left, doc.y, { width: contentWidth, characterSpacing: 1 });
		const ruleY = doc.y + 5;
		rule(ruleY);
		let y = ruleY + 11;

		for (const [label, value] of rows) {
			const valueWidth = contentWidth - LABEL_WIDTH;
			doc.font(FONT).fontSize(10.5);
			const height = Math.max(doc.heightOfString(value, { width: valueWidth, lineGap: 2 }), 13);
			doc
				.font(FONT)
				.fontSize(9.5)
				.fillColor(MUTED_COLOR)
				.text(label, left, y + 1, { width: LABEL_WIDTH - 12 });
			doc
				.font(FONT)
				.fontSize(10.5)
				.fillColor(TEXT_COLOR)
				.text(value, left + LABEL_WIDTH, y, { width: valueWidth, lineGap: 2 });
			y += height + 9;
		}
		doc.y = y - 9;
	};

	section("Dados do formando", [
		["Nome", input.name],
		["Email", input.email],
	]);

	const course = receipt.course;
	const courseRows: Row[] = [
		["Curso", course.title],
		["Modalidade", MODALITY_LABELS[course.modality] ?? course.modality],
		["Datas", courseDates(course)],
	];
	if (course.durationMinutes) courseRows.push(["Duração", formatDuration(course.durationMinutes)]);
	courseRows.push(["Idioma", LANGUAGE_LABELS[course.language] ?? course.language.toUpperCase()]);
	section("Curso", courseRows);

	const enrollmentRows: Row[] = [
		["N.º de inscrição", receipt.code],
		["Data de inscrição", formatDateTime(receipt.enrolledAt)],
		["Estado", "Confirmada"],
		["Valor", receipt.isFree ? "Gratuito" : formatPrice(receipt.amount, receipt.currency)],
	];
	if (receipt.payment) {
		enrollmentRows.push(
			["Pagamento", `Referência Multicaixa · Entidade ${receipt.payment.entity} · Ref. ${receipt.payment.reference}`],
			["Data do pagamento", formatDateTime(receipt.payment.paidAt)]
		);
	}
	section("Inscrição", enrollmentRows);

	doc.moveDown(2.2);
	doc
		.font(FONT)
		.fontSize(9.5)
		.fillColor(MUTED_COLOR)
		.text(
			"Pode consultar os seus cursos e o estado da inscrição na área de aluno. Receberá um lembrete por email antes do início do curso.",
			left,
			doc.y,
			{ width: contentWidth, lineGap: 2 }
		);

	// Rodapé fixo no fundo da página.
	const footerTop = doc.page.height - PAGE_MARGIN - 34;
	rule(footerTop);
	doc
		.font(FONT_BOLD)
		.fontSize(8.5)
		.fillColor(BRAND_COLOR)
		.text(BRAND, left, footerTop + 10, { width: contentWidth, lineBreak: false })
		.font(FONT)
		.fontSize(8)
		.fillColor(MUTED_COLOR)
		.text(`${ADDRESS} · ${siteUrl("/").replace(/^https?:\/\//, "").replace(/\/$/, "")}`, left, footerTop + 22, {
			width: contentWidth,
			lineBreak: false,
		})
		.text("Documento emitido electronicamente, válido sem assinatura.", left, footerTop + 10, {
			width: contentWidth,
			align: "right",
			lineBreak: false,
		});

	doc.end();
	return finished;
}

// Um PDF por inscrição confirmada.
export async function receiptAttachments(
	to: string,
	payload: EmailJobPayloads["enrollment_confirmation"]
): Promise<MailAttachment[]> {
	const { name, receipts = [] } = payload;
	return Promise.all(
		receipts.map(async (receipt) => ({
			filename: `comprovativo-inscricao-${receipt.code}.pdf`,
			content: await renderEnrollmentReceipt({ name, email: to, receipt }),
			contentType: "application/pdf",
		}))
	);
}
