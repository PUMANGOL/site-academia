import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import {
	MEDIA_MAX_BYTES,
	MEDIA_TYPES,
	MEDIA_URL_PREFIX,
	UPLOAD_DIR,
	matchesSignature,
	mediaPath,
} from "@/lib/media";

// O upload usa um route handler e não uma server action: as actions têm limite de 1 MB no corpo.

export async function GET() {
	const session = await getAdminSession();
	if (!session) return Response.json({ error: "Não autorizado." }, { status: 401 });

	const rows = await db
		.select()
		.from(media)
		.orderBy(desc(media.createdAt))
		.limit(200);

	return Response.json({
		items: rows.map((row) => ({
			id: row.id,
			url: `${MEDIA_URL_PREFIX}${row.fileName}`,
			originalName: row.originalName,
			alt: row.alt,
			size: row.size,
		})),
	});
}

export async function POST(request: Request) {
	const session = await getAdminSession();
	if (!session) return Response.json({ error: "Não autorizado." }, { status: 401 });

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return Response.json({ error: "Pedido inválido." }, { status: 400 });
	}

	const file = form.get("file");
	if (!(file instanceof File) || file.size === 0) {
		return Response.json({ error: "Escolha uma imagem." }, { status: 400 });
	}

	const ext = MEDIA_TYPES[file.type];
	if (!ext) {
		return Response.json(
			{ error: "Formato não suportado. Use JPG, PNG, WebP, GIF ou AVIF." },
			{ status: 400 }
		);
	}

	if (file.size > MEDIA_MAX_BYTES) {
		const maxMb = Math.round(MEDIA_MAX_BYTES / 1024 / 1024);
		return Response.json(
			{ error: `A imagem excede o limite de ${maxMb} MB.` },
			{ status: 400 }
		);
	}

	const bytes = new Uint8Array(await file.arrayBuffer());
	if (!matchesSignature(file.type, bytes)) {
		return Response.json(
			{ error: "O ficheiro não corresponde ao formato indicado." },
			{ status: 400 }
		);
	}

	const fileName = `${randomUUID()}.${ext}`;
	const alt = String(form.get("alt") ?? "").trim().slice(0, 255);

	try {
		await mkdir(UPLOAD_DIR, { recursive: true });
		await writeFile(mediaPath(fileName), bytes);
		await db.insert(media).values({
			fileName,
			originalName: file.name.slice(0, 255) || fileName,
			mimeType: file.type,
			size: file.size,
			alt,
			uploadedBy: session.user.id,
		});
	} catch (error) {
		console.error("media upload:", error);
		return Response.json(
			{ error: "Não foi possível guardar a imagem." },
			{ status: 500 }
		);
	}

	return Response.json({ url: `${MEDIA_URL_PREFIX}${fileName}` });
}
