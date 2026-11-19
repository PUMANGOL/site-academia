import { sql } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	smallint,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const emailJobStatusEnum = pgEnum("email_job_status", [
	"pending",
	"processing",
	"sent",
	"failed",
]);

export type EmailJobStatus = (typeof emailJobStatusEnum.enumValues)[number];

// Registo de cada email (conteúdo, estado e histórico). O transporte até ao worker é
// feito pelo RabbitMQ; esta tabela funciona como "outbox": se a publicação falhar,
// o worker volta a publicar os jobs com publishedAt vazio.
export const emailJobs = pgTable(
	"email_jobs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		template: varchar("template", { length: 60 }).notNull(),
		to: varchar("to", { length: 320 }).notNull(),
		payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
		status: emailJobStatusEnum("status").notNull().default("pending"),
		// Prioridade da mensagem no RabbitMQ (> 4 = alta, ex.: recuperação de palavra-passe).
		priority: smallint("priority").notNull().default(0),
		attempts: integer("attempts").notNull().default(0),
		maxAttempts: integer("max_attempts").notNull().default(5),
		publishedAt: timestamp("published_at"),
		sentAt: timestamp("sent_at"),
		lastError: text("last_error"),
		// Impede duplicados (ex.: "course_reminder:<enrollmentId>" só é enviado uma vez).
		dedupeKey: varchar("dedupe_key", { length: 200 }).unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("email_jobs_unpublished_idx")
			.on(table.createdAt)
			.where(sql`${table.publishedAt} is null`),
	]
);
