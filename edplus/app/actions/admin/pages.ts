"use server";

import { desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { pageVersions, pages, user } from "@/db/schema";
import type { PageBlock } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { reportDbError } from "@/lib/content";
import { editablePages, isEditablePage, sanitizeBlocks } from "@/lib/page-blocks";

async function assertAdmin() {
	const session = await getAdminSession();
	if (!session) throw new Error("Não autorizado.");
	return session;
}

const MAX_VERSIONS = 30;

type Result ={ ok: true; publishedAt?: string } | { ok: false; error: string };

function clean(blocks: unknown): PageBlock[] | string {
	try {
		return sanitizeBlocks(blocks);
	} catch (error) {
		return error instanceof Error ? error.message : "Blocos inválidos.";
	}
}

export async function savePageDraft(slug: string, blocks: unknown): Promise<Result> {
	if (!isEditablePage(slug)) return { ok: false, error: "Página desconhecida." };
	const cleaned = clean(blocks);
	if (typeof cleaned === "string") return { ok: false, error: cleaned };

	try {
		const session = await assertAdmin();
		await db
			.insert(pages)
			.values({
				slug,
				title: editablePages[slug].title,
				draftBlocks: cleaned,
				updatedBy: session.user.id,
			})
			.onConflictDoUpdate({
				target: pages.slug,
				set: { draftBlocks: cleaned, updatedBy: session.user.id },
			});
		revalidatePath("/backoffice/paginas");
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: reportDbError("savePageDraft", error, "Não foi possível guardar o rascunho."),
		};
	}
}

export async function publishPage(slug: string, blocks: unknown): Promise<Result> {
	if (!isEditablePage(slug)) return { ok: false, error: "Página desconhecida." };
	const cleaned = clean(blocks);
	if (typeof cleaned === "string") return { ok: false, error: cleaned };

	try {
		const session = await assertAdmin();
		const publishedAt = new Date();
		const values = {
			draftBlocks: cleaned,
			publishedBlocks: cleaned,
			publishedAt,
			updatedBy: session.user.id,
		};
		await db.transaction(async (tx) => {
			const [page] = await tx
				.insert(pages)
				.values({ slug, title: editablePages[slug].title, ...values })
				.onConflictDoUpdate({ target: pages.slug, set: values })
				.returning({ id: pages.id });

			await tx
				.insert(pageVersions)
				.values({ pageId: page.id, blocks: cleaned, createdBy: session.user.id });

			// Guarda só as últimas MAX_VERSIONS publicações.
			const old = await tx
				.select({ id: pageVersions.id })
				.from(pageVersions)
				.where(eq(pageVersions.pageId, page.id))
				.orderBy(desc(pageVersions.createdAt))
				.offset(MAX_VERSIONS);
			if (old.length) {
				await tx.delete(pageVersions).where(inArray(pageVersions.id, old.map((row) => row.id)));
			}
		});
		revalidatePath("/backoffice/paginas");
		revalidatePath(editablePages[slug].path);
		return { ok: true, publishedAt: publishedAt.toISOString() };
	} catch (error) {
		return {
			ok: false,
			error: reportDbError("publishPage", error, "Não foi possível publicar a página."),
		};
	}
}

export type PageVersionSummary = {
	id: string;
	createdAt: string;
	author: string | null;
	blockCount: number;
};

export async function listPageVersions(
	slug: string
): Promise<{ ok: true; versions: PageVersionSummary[] } | { ok: false; error: string }> {
	if (!isEditablePage(slug)) return { ok: false, error: "Página desconhecida." };

	try {
		await assertAdmin();
		const rows = await db
			.select({
				id: pageVersions.id,
				createdAt: pageVersions.createdAt,
				author: user.name,
				blockCount: sql<number>`jsonb_array_length(${pageVersions.blocks})`,
			})
			.from(pageVersions)
			.innerJoin(pages, eq(pages.id, pageVersions.pageId))
			.leftJoin(user, eq(user.id, pageVersions.createdBy))
			.where(eq(pages.slug, slug))
			.orderBy(desc(pageVersions.createdAt))
			.limit(MAX_VERSIONS);
		return {
			ok: true,
			versions: rows.map((row) => ({
				...row,
				blockCount: Number(row.blockCount),
				createdAt: row.createdAt.toISOString(),
			})),
		};
	} catch (error) {
		return {
			ok: false,
			error: reportDbError("listPageVersions", error, "Não foi possível carregar o histórico."),
		};
	}
}

export async function getPageVersionBlocks(
	versionId: string
): Promise<{ ok: true; blocks: PageBlock[] } | { ok: false; error: string }> {
	if (!/^[0-9a-f-]{36}$/i.test(versionId)) return { ok: false, error: "Versão inválida." };

	try {
		await assertAdmin();
		const [row] = await db
			.select({ blocks: pageVersions.blocks })
			.from(pageVersions)
			.where(eq(pageVersions.id, versionId))
			.limit(1);
		if (!row) return { ok: false, error: "Versão não encontrada." };
		return { ok: true, blocks: row.blocks };
	} catch (error) {
		return {
			ok: false,
			error: reportDbError("getPageVersionBlocks", error, "Não foi possível carregar a versão."),
		};
	}
}

// Volta o rascunho à versão publicada (ou ao layout padrão, se nunca foi publicada).
export async function discardPageDraft(
	slug: string
): Promise<{ ok: true; blocks: PageBlock[] } | { ok: false; error: string }> {
	if (!isEditablePage(slug)) return { ok: false, error: "Página desconhecida." };

	try {
		await assertAdmin();
		const [page] = await db
			.select({ publishedBlocks: pages.publishedBlocks })
			.from(pages)
			.where(eq(pages.slug, slug))
			.limit(1);
		const blocks = page?.publishedBlocks ?? editablePages[slug].defaultBlocks;
		if (page) {
			await db.update(pages).set({ draftBlocks: blocks }).where(eq(pages.slug, slug));
		}
		revalidatePath("/backoffice/paginas");
		return { ok: true, blocks };
	} catch (error) {
		return {
			ok: false,
			error: reportDbError("discardPageDraft", error, "Não foi possível descartar as alterações."),
		};
	}
}
