import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pages, posts } from "@/db/schema";
import type { Localized, LocalizedRichText } from "@/db/schema";

export type PostListItem = {
	id: string;
	slug: string;
	title: Localized;
	excerpt: Localized;
	category: Localized;
	coverImageUrl: string | null;
	isFeatured: boolean;
	publishedAt: string;
};

export type PostDetail = PostListItem & { body: LocalizedRichText };

const listColumns = {
	id: posts.id,
	slug: posts.slug,
	title: posts.title,
	excerpt: posts.excerpt,
	category: posts.category,
	coverImageUrl: posts.coverImageUrl,
	isFeatured: posts.isFeatured,
	publishedAt: posts.publishedAt,
};

function isVisible() {
	return eq(posts.status, "published");
}

function serialize<T extends { publishedAt: Date | null }>(row: T) {
	return { ...row, publishedAt: (row.publishedAt ?? new Date()).toISOString() };
}

export async function getPublishedPosts(limit?: number): Promise<PostListItem[]> {
	const query = db
		.select(listColumns)
		.from(posts)
		.where(isVisible())
		.orderBy(desc(posts.isFeatured), desc(posts.publishedAt));
	const rows = limit ? await query.limit(limit) : await query;
	return rows.map(serialize);
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
	const [row] = await db
		.select({ ...listColumns, body: posts.body })
		.from(posts)
		.where(and(eq(posts.slug, slug), isVisible()))
		.limit(1);
	return row ? serialize(row) : null;
}

export async function getAdminPosts() {
	return db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			category: posts.category,
			status: posts.status,
			isFeatured: posts.isFeatured,
			publishedAt: posts.publishedAt,
			updatedAt: posts.updatedAt,
		})
		.from(posts)
		.orderBy(desc(posts.updatedAt));
}

export async function getAdminPost(id: string) {
	if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
	const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	return row ?? null;
}

export async function getPageBySlug(slug: string) {
	const [row] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
	return row ?? null;
}
