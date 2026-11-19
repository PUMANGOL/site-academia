import type { RichTextDoc } from "@/db/schema";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Limite de segurança para o JSON guardado por campo de rich text.
const MAX_RICH_TEXT_BYTES = 512 * 1024;

export function isValidRichText(doc: RichTextDoc | null | undefined) {
	if (doc == null) return true;
	if (typeof doc !== "object" || doc.type !== "doc") return false;
	if (doc.content !== undefined && !Array.isArray(doc.content)) return false;
	return JSON.stringify(doc).length <= MAX_RICH_TEXT_BYTES;
}

type PgError = { code?: string; message?: string; cause?: PgError };

// O Drizzle embrulha o erro do Postgres em `cause`.
function pgError(error: unknown): PgError {
	const outer = error as PgError | undefined;
	return outer?.cause ?? outer ?? {};
}

export function isUniqueViolation(error: unknown) {
	return (error as PgError)?.code === "23505" || pgError(error).code === "23505";
}

// Regista no log a causa real (código e mensagem do Postgres) e devolve a mensagem
// genérica para o backoffice: detalhes da base de dados nunca chegam à interface.
// 42P01 / 42703 = tabela ou coluna inexistente, normalmente migrations por aplicar.
export function reportDbError(scope: string, error: unknown, message: string) {
	const cause = pgError(error);
	const hint =
		cause.code === "42P01" || cause.code === "42703" ? ' (execute "npm run db:migrate")' : "";
	console.error(`${scope}: [${cause.code ?? "?"}] ${cause.message ?? String(error)}${hint}`);
	return message;
}

export function slugify(value: string) {
	return value
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 180);
}
