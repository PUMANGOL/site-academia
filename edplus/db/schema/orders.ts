import { relations } from "drizzle-orm";
import {
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { courses } from "./catalog";

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"paid",
	"cancelled",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
	"not_started",
	"in_progress",
	"completed",
]);

export type EnrollmentStatus = (typeof enrollmentStatusEnum.enumValues)[number];

export const orders = pgTable("orders", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: orderStatusEnum("status").notNull().default("pending"),
	total: numeric("total", { precision: 12, scale: 2 }).notNull(),
	currency: varchar("currency", { length: 3 }).notNull().default("AOA"),
	paymentEntity: varchar("payment_entity", { length: 20 }).notNull(),
	paymentReference: varchar("payment_reference", { length: 20 })
		.notNull()
		.unique(),
	paidAt: timestamp("paid_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const orderItems = pgTable("order_items", {
	id: uuid("id").defaultRandom().primaryKey(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	courseId: uuid("course_id")
		.notNull()
		.references(() => courses.id, { onDelete: "restrict" }),
	quantity: integer("quantity").notNull().default(1),
	unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enrollments = pgTable(
	"enrollments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		courseId: uuid("course_id")
			.notNull()
			.references(() => courses.id, { onDelete: "cascade" }),
		orderId: uuid("order_id").references(() => orders.id, {
			onDelete: "set null",
		}),
		status: enrollmentStatusEnum("status").notNull().default("not_started"),
		progress: integer("progress").notNull().default(0),
		completedAt: timestamp("completed_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [unique("enrollments_user_course_unique").on(table.userId, table.courseId)]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
	user: one(user, {
		fields: [orders.userId],
		references: [user.id],
	}),
	items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	course: one(courses, {
		fields: [orderItems.courseId],
		references: [courses.id],
	}),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
	user: one(user, {
		fields: [enrollments.userId],
		references: [user.id],
	}),
	course: one(courses, {
		fields: [enrollments.courseId],
		references: [courses.id],
	}),
	order: one(orders, {
		fields: [enrollments.orderId],
		references: [orders.id],
	}),
}));
