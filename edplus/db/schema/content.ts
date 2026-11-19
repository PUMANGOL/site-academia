import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import type {
	ContentStatus,
	Localized,
	LocalizedRichText,
	PageBlock,
} from "./types";

export const contentStatusEnum = pgEnum("content_status", [
	"draft",
	"published",
	"archived",
]);

// Ficheiros enviados pelo backoffice. O binário fica em UPLOAD_DIR e é servido por /media/<fileName>.
export const media = pgTable("media", {
	id: uuid("id").defaultRandom().primaryKey(),
	fileName: varchar("file_name", { length: 120 }).notNull().unique(),
	originalName: varchar("original_name", { length: 255 }).notNull(),
	mimeType: varchar("mime_type", { length: 80 }).notNull(),
	size: integer("size").notNull(),
	alt: varchar("alt", { length: 255 }).notNull().default(""),
	uploadedBy: text("uploaded_by").references(() => user.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notícias publicadas em /noticias.
export const posts = pgTable("posts", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: varchar("slug", { length: 180 }).notNull().unique(),
	title: jsonb("title").$type<Localized>().notNull(),
	excerpt: jsonb("excerpt").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	category: jsonb("category").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	body: jsonb("body").$type<LocalizedRichText>().notNull().default({
		pt: null,
		en: null,
	}),
	coverImageUrl: text("cover_image_url"),
	isFeatured: boolean("is_featured").notNull().default(false),
	status: contentStatusEnum("status")
		.$type<ContentStatus>()
		.notNull()
		.default("draft"),
	publishedAt: timestamp("published_at"),
	authorId: text("author_id").references(() => user.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Páginas montadas por blocos. `draftBlocks` é o que o backoffice edita;
// `publishedBlocks` é o que o site mostra (null = ainda não publicada, usa o layout padrão).
export const pages = pgTable("pages", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: varchar("slug", { length: 120 }).notNull().unique(),
	title: varchar("title", { length: 180 }).notNull(),
	draftBlocks: jsonb("draft_blocks").$type<PageBlock[]>().notNull().default([]),
	publishedBlocks: jsonb("published_blocks").$type<PageBlock[]>(),
	publishedAt: timestamp("published_at"),
	updatedBy: text("updated_by").references(() => user.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// Cópia dos blocos em cada publicação, para o histórico de versões do editor de páginas.
export const pageVersions = pgTable(
	"page_versions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		pageId: uuid("page_id")
			.notNull()
			.references(() => pages.id, { onDelete: "cascade" }),
		blocks: jsonb("blocks").$type<PageBlock[]>().notNull(),
		createdBy: text("created_by").references(() => user.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("page_versions_page_created_idx").on(table.pageId, table.createdAt)]
);

export const postsRelations = relations(posts, ({ one }) => ({
	author: one(user, {
		fields: [posts.authorId],
		references: [user.id],
	}),
}));
