// O email de pedido de catálogo anexa o PDF oficial, não um documento gerado.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { MailAttachment } from "@/lib/mail/templates";

const CATALOG_PATH = fileURLToPath(new URL("../content/catalogo-2026.pdf", import.meta.url));

export async function catalogAttachment(): Promise<MailAttachment> {
	return {
		filename: "catalogo-de-formacoes-2026.pdf",
		content: await readFile(CATALOG_PATH),
		contentType: "application/pdf",
	};
}
