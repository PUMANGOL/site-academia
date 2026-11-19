import { pgEnum, pgTable, integer, text, timestamp, uuid, varchar, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const companyRequestStatusEnum = pgEnum("company_request_status", [
	"new",
	"in_progress",
	"closed",
]);

export type CompanyRequestStatus = (typeof companyRequestStatusEnum.enumValues)[number];

export const trainingModalityEnum = pgEnum("training_modality", [
	"in_person",
	"online",
	"hybrid",
	"undecided",
]);

export type TrainingModality = (typeof trainingModalityEnum.enumValues)[number];

// Pedidos de formação à medida enviados por empresas na página de parceiros.
export const companyRequests = pgTable(
	"company_requests",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		companyName: varchar("company_name", { length: 180 }).notNull(),
		contactName: varchar("contact_name", { length: 180 }).notNull(),
		jobTitle: varchar("job_title", { length: 120 }),
		email: varchar("email", { length: 320 }).notNull(),
		phone: varchar("phone", { length: 40 }),
		sector: varchar("sector", { length: 120 }),
		participants: integer("participants"),
		trainingAreas: text("training_areas").notNull(),
		modality: trainingModalityEnum("modality").notNull().default("undecided"),
		message: text("message"),
		// Aceitação da política de privacidade no momento do envio.
		privacyConsent: boolean("privacy_consent").notNull().default(false),
		status: companyRequestStatusEnum("status").notNull().default("new"),
		internalNotes: text("internal_notes"),
		handledBy: text("handled_by").references(() => user.id, { onDelete: "set null" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("company_requests_created_idx").on(table.createdAt)]
);
