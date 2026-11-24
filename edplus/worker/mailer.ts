import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer, { type Transporter } from "nodemailer";
import { LOGO_CID, LOGO_FILE, type MailAttachment, type MailMessage } from "@/lib/mail/templates";

// Resolvido a partir deste ficheiro para não depender do directório onde o worker arranca.
const logoPath = fileURLToPath(new URL(`../${LOGO_FILE}`, import.meta.url));
const previewDir = fileURLToPath(new URL("../storage/mail-preview/", import.meta.url));

let transport: Transporter | null = null;

// MAIL_DRY_RUN=true: gera o email completo mas só o escreve no log (desenvolvimento/testes).
export const dryRun = process.env.MAIL_DRY_RUN === "true";

export function mailerConfigured() {
	return dryRun || Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function getTransport() {
	if (!mailerConfigured()) {
		throw new Error("SMTP não configurado (SMTP_HOST, SMTP_USER, SMTP_PASSWORD).");
	}
	transport ??= nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		// Microsoft 365: porta 587 com STARTTLS obrigatório.
		secure: false,
		requireTLS: true,
		pool: true,
		maxConnections: 1,
		auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
	});
	return transport;
}

// Lança em caso de erro: o worker regista a falha e agenda nova tentativa.
export async function sendMail({ attachments = [], ...message }: MailMessage) {
	if (dryRun) {
		const saved = await saveDryRunAttachments(attachments);
		console.log(
			`[mail:dry-run] para=${message.to} assunto="${message.subject}"\n${message.text}\n` +
				(saved.length ? `anexos: ${saved.join(", ")}\n` : "")
		);
		return;
	}
	await getTransport().sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		...message,
		attachments: [
			{ filename: "academia-pumangol.png", path: logoPath, cid: LOGO_CID },
			...attachments,
		],
	});
}

// Em MAIL_DRY_RUN os anexos (ex.: comprovativos em PDF) ficam em storage/mail-preview para revisão.
async function saveDryRunAttachments(attachments: MailAttachment[]) {
	if (!attachments.length) return [];
	await mkdir(previewDir, { recursive: true });
	return Promise.all(
		attachments.map(async (attachment) => {
			const file = path.join(previewDir, attachment.filename);
			await writeFile(file, attachment.content);
			return file;
		})
	);
}

export function closeMailer() {
	transport?.close();
	transport = null;
}
