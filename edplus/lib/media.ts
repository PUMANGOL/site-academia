import path from "node:path";

// Pasta onde ficam os ficheiros enviados pelo backoffice. Em produção deve apontar
// para um volume persistente (fora do build do Next).
export const UPLOAD_DIR =
	process.env.UPLOAD_DIR ||
	path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads");

// O caminho só é conhecido em runtime; o comentário evita que o Turbopack inclua o projeto inteiro no build.
export function mediaPath(fileName: string) {
	return path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, fileName);
}

export const MEDIA_MAX_BYTES =
	Number(process.env.MEDIA_MAX_MB || 5) * 1024 * 1024;

export const MEDIA_URL_PREFIX = "/media/";

// SVG fica de fora de propósito: pode levar scripts embutidos.
export const MEDIA_TYPES: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/avif": "avif",
};

const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
	Object.entries(MEDIA_TYPES).map(([mime, ext]) => [ext, mime])
);

export function contentTypeFor(fileName: string) {
	const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
	return CONTENT_TYPES[ext] ?? null;
}

// Nome gerado pelo servidor: <uuid>.<ext>. Qualquer outra coisa é recusada (evita path traversal).
export function isSafeFileName(fileName: string) {
	return /^[0-9a-f-]{36}\.(jpg|png|webp|gif|avif)$/.test(fileName);
}

// Confirma pelos primeiros bytes que o ficheiro é mesmo do tipo declarado.
export function matchesSignature(mime: string, bytes: Uint8Array) {
	const ascii = (start: number, end: number) =>
		String.fromCharCode(...bytes.subarray(start, end));

	switch (mime) {
		case "image/jpeg":
			return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
		case "image/png":
			return ascii(1, 4) === "PNG";
		case "image/gif":
			return ascii(0, 4) === "GIF8";
		case "image/webp":
			return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
		case "image/avif":
			return ascii(4, 8) === "ftyp";
		default:
			return false;
	}
}
