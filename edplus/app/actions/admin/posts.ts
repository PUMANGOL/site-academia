"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { posts } from "@/db/schema";
import type { ContentStatus, RichTextDoc } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { isUniqueViolation, isValidRichText, reportDbError, SLUG_PATTERN } from "@/lib/content";

async function assertAdmin() {
	const session = await getAdminSession();
	if (!session) throw new Error("Não autorizado.");
	return session;
}

export type PostFormInput = {
	slug: string;
	titlePt: string;
	titleEn: string;
	excerptPt: string;
	excerptEn: string;
	categoryPt: string;
	categoryEn: string;
	bodyPt: RichTextDoc | null;
	bodyEn: RichTextDoc | null;
	coverImageUrl: string;
	status: ContentStatus;
	isFeatured?: boolean;
};

const STATUSES: ContentStatus[] = ["draft", "published", "archived"];

function validateInput(input: PostFormInput) {
	if (!SLUG_PATTERN.test(input.slug.trim())) {
		return "O slug só pode ter letras minúsculas, números e hífens.";
	}
	if (!input.titlePt.trim()) return "Indique o título em português.";
	if (!STATUSES.includes(input.status)) return "Estado inválido.";
	if (!isValidRichText(input.bodyPt) || !isValidRichText(input.bodyEn)) {
		return "O conteúdo do artigo é inválido ou demasiado grande.";
	}
	return null;
}

// A data de publicação é a da primeira vez que a notícia é publicada e não muda nas edições.
function toPostValues(input: PostFormInput, existingPublishedAt?: Date | null) {
	const publishedAt =
		existingPublishedAt ?? (input.status === "published" ? new Date() : null);

	return {
		slug: input.slug.trim(),
		title: { pt: input.titlePt.trim(), en: input.titleEn.trim() },
		excerpt: { pt: input.excerptPt.trim(), en: input.excerptEn.trim() },
		category: { pt: input.categoryPt.trim(), en: input.categoryEn.trim() },
		body: { pt: input.bodyPt, en: input.bodyEn },
		coverImageUrl: input.coverImageUrl.trim() || null,
		status: input.status,
		publishedAt,
		isFeatured: input.isFeatured ?? false,
	};
}

function revalidatePosts() {
	revalidatePath("/backoffice/noticias");
	revalidatePath("/noticias", "layout");
	revalidatePath("/");
}

const DUPLICATE_SLUG = "Já existe uma notícia com este slug.";

export async function createPost(input: PostFormInput) {
	const invalid = validateInput(input);
	if (invalid) return { ok: false as const, error: invalid };

	try {
		const session = await assertAdmin();
		await db
			.insert(posts)
			.values({ ...toPostValues(input), authorId: session.user.id });
		revalidatePosts();
		return { ok: true as const };
	} catch (error) {
		if (isUniqueViolation(error)) return { ok: false as const, error: DUPLICATE_SLUG };
		return {
			ok: false as const,
			error: reportDbError("createPost", error, "Não foi possível criar a notícia."),
		};
	}
}

export async function updatePost(id: string, input: PostFormInput) {
	const invalid = validateInput(input);
	if (invalid) return { ok: false as const, error: invalid };

	try {
		await assertAdmin();
		const [existing] = await db
			.select({ publishedAt: posts.publishedAt })
			.from(posts)
			.where(eq(posts.id, id))
			.limit(1);
		if (!existing) return { ok: false as const, error: "Notícia não encontrada." };

		await db
			.update(posts)
			.set(toPostValues(input, existing.publishedAt))
			.where(eq(posts.id, id));
		revalidatePosts();
		return { ok: true as const };
	} catch (error) {
		if (isUniqueViolation(error)) return { ok: false as const, error: DUPLICATE_SLUG };
		return {
			ok: false as const,
			error: reportDbError("updatePost", error, "Não foi possível atualizar a notícia."),
		};
	}
}

export async function updatePostStatus(id: string, status: ContentStatus) {
	if (!STATUSES.includes(status)) return { ok: false as const, error: "Estado inválido." };

	try {
		await assertAdmin();
		const [existing] = await db
			.select({ publishedAt: posts.publishedAt })
			.from(posts)
			.where(eq(posts.id, id))
			.limit(1);
		if (!existing) return { ok: false as const, error: "Notícia não encontrada." };

		await db
			.update(posts)
			.set({
				status,
				publishedAt:
					status === "published" && !existing.publishedAt
						? new Date()
						: existing.publishedAt,
			})
			.where(eq(posts.id, id));
		revalidatePosts();
		return { ok: true as const };
	} catch (error) {
		return {
			ok: false as const,
			error: reportDbError("updatePostStatus", error, "Não foi possível alterar o estado."),
		};
	}
}

export async function deletePost(id: string) {
	try {
		await assertAdmin();
		await db.delete(posts).where(eq(posts.id, id));
		revalidatePosts();
		return { ok: true as const };
	} catch (error) {
		return {
			ok: false as const,
			error: reportDbError("deletePost", error, "Não foi possível eliminar a notícia."),
		};
	}
}
