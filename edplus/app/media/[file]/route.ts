import { readFile } from "node:fs/promises";
import { contentTypeFor, isSafeFileName, mediaPath } from "@/lib/media";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ file: string }> }
) {
	const { file } = await params;
	const contentType = contentTypeFor(file);
	if (!isSafeFileName(file) || !contentType) {
		return new Response("Not found", { status: 404 });
	}

	try {
		const data = await readFile(mediaPath(file));
		return new Response(data, {
			headers: {
				"Content-Type": contentType,
				// O nome é um uuid novo por upload, portanto o conteúdo nunca muda.
				"Cache-Control": "public, max-age=31536000, immutable",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch {
		return new Response("Not found", { status: 404 });
	}
}
