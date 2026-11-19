import { relations } from "drizzle-orm";
import {
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { courses } from "./catalog";

export const carts = pgTable("carts", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").unique().references(() => user.id, {
		onDelete: "cascade",
	}),
	guestId: text("guest_id").unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const cartItems = pgTable(
	"cart_items",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		cartId: uuid("cart_id")
			.notNull()
			.references(() => carts.id, { onDelete: "cascade" }),
		courseId: uuid("course_id")
			.notNull()
			.references(() => courses.id, { onDelete: "cascade" }),
		quantity: integer("quantity").notNull().default(1),
		unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [unique("cart_items_cart_course_unique").on(table.cartId, table.courseId)]
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
	user: one(user, {
		fields: [carts.userId],
		references: [user.id],
	}),
	items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id],
	}),
	course: one(courses, {
		fields: [cartItems.courseId],
		references: [courses.id],
	}),
}));
