import { siteUrl } from "./site-url";

export type MailMessage = {
	to: string;
	subject: string;
	html: string;
	text: string;
	// Preenchido pelo worker (ex.: comprovativo de inscrição em PDF).
	attachments?: MailAttachment[];
	// Responder vai para este endereço (ex.: o contacto da empresa num pedido).
	replyTo?: string;
};

export type MailAttachment = {
	filename: string;
	content: Buffer;
	contentType: string;
};

const BRAND = "Academia Pumangol";
const BRAND_COLOR = "#07525D";
const ACCENT_COLOR = "#75A63D";
const CTA_COLOR = "#00764A";
const TEXT_COLOR = "#1F2933";
const MUTED_COLOR = "#6B7280";
const BORDER_COLOR = "#E5E7EB";
const ADDRESS = "Talatona, Luanda, Angola";
const FONT = "Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif";

// Logótipo embutido como anexo inline (CID) pelo worker: aparece mesmo sem o site acessível
// e não é bloqueado como imagem remota pela maioria dos clientes.
// Versão oficial a cores sem assinatura (496×139 px), para fundo branco.
export const LOGO_CID = "logo@pumangol-academy";
export const LOGO_FILE = "public/assets/img/email/logo.png";

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function firstName(name: string) {
	return name.trim().split(/\s+/)[0] || name;
}

export function formatCourseDate(value: string) {
	return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long", timeZone: "UTC" }).format(
		new Date(`${value}T00:00:00Z`)
	);
}

type LayoutItem = { title: string; details?: string[] };

type LayoutInput = {
	to: string;
	subject: string;
	preheader: string;
	heading: string;
	greeting: string;
	paragraphs: string[];
	items?: LayoutItem[];
	cta?: { label: string; url: string };
	footnote?: string;
};

function renderItems(items: LayoutItem[]) {
	const rows = items
		.map(
			(item) => `<li style="margin:0 0 12px;padding-left:4px;">
<strong style="color:${TEXT_COLOR};">${escapeHtml(item.title)}</strong>${
				item.details?.length
					? `<br><span style="font-size:14px;color:${MUTED_COLOR};">${item.details.map(escapeHtml).join(" &middot; ")}</span>`
					: ""
			}
</li>`
		)
		.join("\n");
	return `<ul style="margin:0 0 20px;padding-left:22px;color:${ACCENT_COLOR};">\n${rows}\n</ul>`;
}

// Botão "à prova de bala": tabela com bgcolor para o Outlook, link com padding para os restantes.
function renderButton(cta: { label: string; url: string }) {
	const url = escapeHtml(cta.url);
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 24px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr><td align="center" bgcolor="${CTA_COLOR}" style="border-radius:6px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:13px 32px;font-family:${FONT};font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:6px;">${escapeHtml(cta.label)}</a>
</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding-top:14px;font-size:12px;line-height:1.5;color:${MUTED_COLOR};">
Se o botão não funcionar, copie este link para o navegador:<br><a href="${url}" style="color:${BRAND_COLOR};word-break:break-all;">${url}</a>
</td></tr>
</table>`;
}

// HTML simples, fundo branco, em tabelas com estilos inline (compatível com Outlook) + versão em texto.
function render({ to, subject, preheader, heading, greeting, paragraphs, items, cta, footnote }: LayoutInput): MailMessage {
	const site = siteUrl("/");
	const year = new Date().getFullYear();
	const html = `<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(subject)}</title>
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
<!--<![endif]-->
<style>:root{color-scheme:light only;supported-color-schemes:light only;}</style>
<!--[if mso]><style>body,table,td,h1,p,ul,li,a,span,strong{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:${FONT};color:${TEXT_COLOR};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="background:#FFFFFF;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td align="center" style="padding:0 0 24px;border-bottom:3px solid ${ACCENT_COLOR};">
<a href="${escapeHtml(site)}" target="_blank" style="text-decoration:none;"><img src="cid:${LOGO_CID}" width="220" height="62" alt="${BRAND}" style="display:block;border:0;outline:none;width:220px;height:auto;max-width:220px;font-family:${FONT};font-size:20px;font-weight:bold;color:${BRAND_COLOR};"></a>
</td></tr>
<tr><td style="padding:32px 8px 8px;font-size:15px;line-height:1.6;">
<h1 style="margin:0 0 20px;font-family:${FONT};font-size:26px;line-height:1.25;color:${BRAND_COLOR};font-weight:700;letter-spacing:-0.02em;">${escapeHtml(heading)}</h1>
<p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
${paragraphs.map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p)}</p>`).join("\n")}
${items?.length ? renderItems(items) : ""}
${cta ? renderButton(cta) : ""}
${footnote ? `<p style="margin:0 0 16px;font-size:14px;color:${MUTED_COLOR};">${escapeHtml(footnote)}</p>` : ""}
<p style="margin:24px 0 0;">Com os melhores cumprimentos.</p>
</td></tr>
<tr><td style="padding:32px 8px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding-top:24px;border-top:1px solid ${BORDER_COLOR};font-size:12px;line-height:1.7;color:${MUTED_COLOR};">
<p style="margin:0 0 2px;font-size:13px;font-weight:bold;color:${BRAND_COLOR};">${BRAND}</p>
<p style="margin:0 0 12px;">${ADDRESS}</p>
<p style="margin:0;font-size:11px;color:#9CA3AF;">Este é um email automático, por favor não responda a esta mensagem.<br>&copy; ${year} ${BRAND}. Todos os direitos reservados.</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

	const text = [
		heading,
		"",
		greeting,
		"",
		...paragraphs.flatMap((p) => [p, ""]),
		...(items?.length
			? [...items.map((item) => [`- ${item.title}`, ...(item.details?.length ? [`  ${item.details.join(" · ")}`] : [])].join("\n")), ""]
			: []),
		...(cta ? [`${cta.label}: ${cta.url}`, ""] : []),
		...(footnote ? [footnote, ""] : []),
		"Com os melhores cumprimentos.",
		"",
		`--`,
		`${BRAND} · ${ADDRESS}`,
		"Email automático, por favor não responda.",
	].join("\n");

	return { to, subject, html, text };
}

export type MailCourse = {
	title: string;
	slug: string;
	startDate: string | null;
	endDate: string | null;
	modality: "in_person" | "online";
};

function describeCourse(course: MailCourse): LayoutItem {
	const modality = course.modality === "online" ? "Online" : "Presencial";
	const details = [modality];
	if (course.startDate) {
		const dates =
			course.endDate && course.endDate !== course.startDate
				? `${formatCourseDate(course.startDate)} a ${formatCourseDate(course.endDate)}`
				: formatCourseDate(course.startDate);
		details.unshift(dates);
	}
	return { title: course.title, details };
}

export function enrollmentConfirmationEmail(input: {
	to: string;
	name: string;
	courses: MailCourse[];
	withReceipt?: boolean;
}) {
	const single = input.courses.length === 1;
	const receiptNote = single
		? "Em anexo segue o comprovativo da sua inscrição, em PDF."
		: "Em anexo seguem os comprovativos das suas inscrições, em PDF.";
	return render({
		to: input.to,
		subject: single
			? `Inscrição confirmada: ${input.courses[0].title}`
			: "Inscrições confirmadas",
		preheader: single
			? `A sua inscrição em "${input.courses[0].title}" está confirmada.`
			: `As suas inscrições em ${input.courses.length} cursos estão confirmadas.`,
		heading: single ? "Inscrição confirmada" : "Inscrições confirmadas",
		greeting: `Olá ${firstName(input.name)},`,
		paragraphs: [
			single
				? "A sua inscrição no seguinte curso foi confirmada:"
				: "As suas inscrições nos seguintes cursos foram confirmadas:",
		],
		items: input.courses.map(describeCourse),
		cta: { label: "Ver os meus cursos", url: siteUrl("/aluno/cursos") },
		footnote: [
			input.withReceipt ? receiptNote : null,
			"Receberá um lembrete por email antes do início de cada curso.",
		]
			.filter(Boolean)
			.join(" "),
	});
}

export function passwordResetEmail(input: { to: string; name: string; url: string }) {
	return render({
		to: input.to,
		subject: "Recuperação de palavra-passe",
		preheader: "Redefina a palavra-passe da sua conta. O link é válido durante 1 hora.",
		heading: "Redefinir palavra-passe",
		greeting: `Olá ${firstName(input.name)},`,
		paragraphs: [
			"Recebemos um pedido para redefinir a palavra-passe da sua conta.",
			"Clique no botão abaixo para escolher uma nova palavra-passe. O link é válido durante 1 hora.",
		],
		cta: { label: "Redefinir palavra-passe", url: input.url },
		footnote: "Se não fez este pedido, ignore este email: a sua palavra-passe não será alterada.",
	});
}

export function courseReminderEmail(input: { to: string; name: string; course: MailCourse }) {
	return render({
		to: input.to,
		subject: `Lembrete: ${input.course.title} começa em breve`,
		preheader: input.course.startDate
			? `"${input.course.title}" começa no dia ${formatCourseDate(input.course.startDate)}.`
			: `"${input.course.title}" começa em breve.`,
		heading: "O seu curso está a chegar",
		greeting: `Olá ${firstName(input.name)},`,
		paragraphs: ["Lembramos que o seguinte curso em que está inscrito começa em breve:"],
		items: [describeCourse(input.course)],
		cta: { label: "Ver detalhes do curso", url: siteUrl(`/courses/${input.course.slug}`) },
		footnote:
			input.course.modality === "online"
				? "O curso é online. Verifique a sua ligação à internet antes do início."
				: "O curso é presencial. Recomendamos que chegue com alguns minutos de antecedência.",
	});
}

export function courseFeedbackEmail(input: {
	to: string;
	name: string;
	course: MailCourse;
	feedbackUrl: string;
}) {
	return render({
		to: input.to,
		subject: `Como correu o curso "${input.course.title}"?`,
		preheader: "A sua opinião ajuda-nos a melhorar. Leva apenas alguns minutos.",
		heading: "Como correu o curso?",
		greeting: `Olá ${firstName(input.name)},`,
		paragraphs: [
			`Obrigado por ter participado no curso "${input.course.title}".`,
			"A sua opinião ajuda-nos a melhorar as nossas formações. Leva apenas alguns minutos.",
		],
		cta: { label: "Dar feedback", url: input.feedbackUrl },
	});
}

export function companyRequestReceivedEmail(input: { to: string; name: string; companyName: string }) {
	return render({
		to: input.to,
		subject: "Recebemos o seu pedido de formação",
		preheader: `O pedido de formação para ${input.companyName} foi recebido. Entraremos em contacto em breve.`,
		heading: "Pedido recebido",
		greeting: `Olá ${firstName(input.name)},`,
		paragraphs: [
			`Obrigado pelo interesse na ${BRAND}. Recebemos o pedido de formação para ${input.companyName}.`,
			"A nossa equipa vai analisar as necessidades indicadas e entrará em contacto consigo nos próximos dias úteis para preparar uma proposta.",
		],
		cta: { label: "Ver o catálogo de cursos", url: siteUrl("/courses") },
	});
}

const REQUEST_MODALITY: Record<string, string> = {
	in_person: "Presencial",
	online: "Online",
	hybrid: "Híbrido",
	undecided: "A definir",
};

export function companyRequestNotificationEmail(input: {
	to: string;
	request: {
		requestId: string;
		companyName: string;
		contactName: string;
		jobTitle: string | null;
		email: string;
		phone: string | null;
		sector: string | null;
		participants: number | null;
		trainingAreas: string;
		modality: string;
		message: string | null;
		createdAt: string;
	};
}) {
	const { request } = input;
	const field = (title: string, value: string | number | null): LayoutItem | null =>
		value === null || value === "" ? null : { title, details: [String(value)] };
	const items = [
		field("Empresa", request.companyName),
		field("Contacto", request.jobTitle ? `${request.contactName} (${request.jobTitle})` : request.contactName),
		field("Email", request.email),
		field("Telefone", request.phone),
		field("Sector", request.sector),
		field("N.º de participantes", request.participants),
		field("Modalidade pretendida", REQUEST_MODALITY[request.modality] ?? request.modality),
		field("Áreas de formação", request.trainingAreas),
		field("Mensagem", request.message),
	].filter((item): item is LayoutItem => item !== null);

	return {
		...render({
			to: input.to,
			subject: `Novo pedido de formação: ${request.companyName}`,
			preheader: `${request.contactName} pediu formação para ${request.companyName}.`,
			heading: "Novo pedido de empresa",
			greeting: "Olá,",
			paragraphs: ["Foi recebido um novo pedido de formação à medida através da página de parceiros:"],
			items,
			cta: { label: "Abrir no backoffice", url: siteUrl("/backoffice/pedidos") },
			footnote: "Pode responder directamente a este email para contactar a empresa.",
		}),
		replyTo: request.email,
	};
}

export function catalogEmail(input: { to: string; requestedAt: string }) {
	const requested = new Intl.DateTimeFormat("pt-PT", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "Africa/Luanda",
	}).format(new Date(input.requestedAt));
	return render({
		to: input.to,
		subject: "O seu Catálogo de Formação 2026",
		preheader: "O Catálogo de Formações 2026 da Academia Pumangol segue em anexo, em PDF.",
		heading: "O catálogo segue em anexo",
		greeting: "Olá,",
		paragraphs: [
			`Obrigado pelo interesse na ${BRAND}. Em anexo segue o Catálogo de Formações 2026, em PDF, pedido em ${requested}.`,
			"Os valores e as datas confirmam-se com a equipa de formação. Para uma turma da sua empresa, peça uma proposta.",
		],
		cta: { label: "Pedir proposta", url: siteUrl("/contact") },
		footnote: "Se não pediu este catálogo, pode ignorar este email.",
	});
}

export function adminReportEmail(input: {
	to: string;
	name: string;
	report: string;
	filterSummary: string[];
	requestedAt: string;
}) {
	const requested = new Intl.DateTimeFormat("pt-PT", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "Africa/Luanda",
	}).format(new Date(input.requestedAt));
	const label = REPORT_LABELS[input.report] ?? "Relatório";
	return render({
		to: input.to,
		subject: `Relatório: ${label}`,
		preheader: `O relatório "${label}" que pediu está em anexo, em Excel.`,
		heading: `Relatório de ${label.toLowerCase()}`,
		greeting: `Olá ${firstName(input.name)},`,
		paragraphs: [`Em anexo segue o relatório que pediu no backoffice em ${requested}, em formato Excel.`],
		items: input.filterSummary.length ? [{ title: "Filtros aplicados", details: input.filterSummary }] : undefined,
		cta: { label: "Pedir outro relatório", url: siteUrl("/backoffice/relatorios") },
		footnote: "O ficheiro contém dados pessoais: guarde-o em local seguro e não o reencaminhe para fora da organização.",
	});
}

const REPORT_LABELS: Record<string, string> = {
	enrollments: "Inscrições",
	courses: "Cursos e ocupação",
	users: "Utilizadores",
	companyRequests: "Pedidos de empresas",
};
