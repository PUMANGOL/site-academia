import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	date,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import type {
	CourseModality,
	CourseStatus,
	Localized,
	SkillLevel,
} from "./types";

export const skillLevelEnum = pgEnum("skill_level", [
	"beginner",
	"intermediate",
	"advanced",
]);

export const courseStatusEnum = pgEnum("course_status", [
	"draft",
	"published",
	"archived",
]);

export const courseModalityEnum = pgEnum("course_modality", [
	"in_person",
	"online",
]);

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: varchar("slug", { length: 120 }).notNull().unique(),
	name: jsonb("name").$type<Localized>().notNull(),
	description: jsonb("description").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	iconUrl: text("icon_url"),
	imageUrl: text("image_url"),
	sortOrder: integer("sort_order").notNull().default(0),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const instructorProfiles = pgTable("instructor_profiles", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
	slug: varchar("slug", { length: 160 }).notNull().unique(),
	name: varchar("name", { length: 180 }).notNull(),
	headline: jsonb("headline").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	bio: jsonb("bio").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	photoUrl: text("photo_url"),
	isFeatured: boolean("is_featured").notNull().default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const courses = pgTable("courses", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: varchar("slug", { length: 180 }).notNull().unique(),
	instructorId: uuid("instructor_id").references(() => instructorProfiles.id, {
		onDelete: "set null",
	}),
	title: jsonb("title").$type<Localized>().notNull(),
	excerpt: jsonb("excerpt").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	description: jsonb("description").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	objectives: jsonb("objectives").$type<Localized>().notNull().default({
		pt: "",
		en: "",
	}),
	imageUrl: text("image_url").notNull(),
	videoId: varchar("video_id", { length: 40 }),
	price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
	compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
	currency: varchar("currency", { length: 3 }).notNull().default("AOA"),
	lessonsCount: integer("lessons_count").notNull().default(0),
	seats: integer("seats"),
	studentsCount: integer("students_count").notNull().default(0),
	ratingAvg: numeric("rating_avg", { precision: 2, scale: 1 })
		.notNull()
		.default("0"),
	reviewsCount: integer("reviews_count").notNull().default(0),
	durationMinutes: integer("duration_minutes"),
	modality: courseModalityEnum("modality")
		.$type<CourseModality>()
		.notNull()
		.default("in_person"),
	startDate: date("start_date"),
	endDate: date("end_date"),
	skillLevel: skillLevelEnum("skill_level")
		.$type<SkillLevel>()
		.notNull()
		.default("beginner"),
	language: varchar("language", { length: 8 }).notNull().default("pt"),
	isFree: boolean("is_free").notNull().default(false),
	isFeatured: boolean("is_featured").notNull().default(false),
	status: courseStatusEnum("status")
		.$type<CourseStatus>()
		.notNull()
		.default("draft"),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const courseCategories = pgTable(
	"course_categories",
	{
		courseId: uuid("course_id")
			.notNull()
			.references(() => courses.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.courseId, table.categoryId] })]
);

export const courseInstructors = pgTable(
	"course_instructors",
	{
		courseId: uuid("course_id")
			.notNull()
			.references(() => courses.id, { onDelete: "cascade" }),
		instructorId: uuid("instructor_id")
			.notNull()
			.references(() => instructorProfiles.id, { onDelete: "cascade" }),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => [primaryKey({ columns: [table.courseId, table.instructorId] })]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
	courseLinks: many(courseCategories),
}));

export const instructorProfilesRelations = relations(
	instructorProfiles,
	({ one, many }) => ({
		user: one(user, {
			fields: [instructorProfiles.userId],
			references: [user.id],
		}),
		courses: many(courses),
		courseLinks: many(courseInstructors),
	})
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
	instructor: one(instructorProfiles, {
		fields: [courses.instructorId],
		references: [instructorProfiles.id],
	}),
	categoryLinks: many(courseCategories),
	instructorLinks: many(courseInstructors),
}));

export const courseInstructorsRelations = relations(
	courseInstructors,
	({ one }) => ({
		course: one(courses, {
			fields: [courseInstructors.courseId],
			references: [courses.id],
		}),
		instructor: one(instructorProfiles, {
			fields: [courseInstructors.instructorId],
			references: [instructorProfiles.id],
		}),
	})
);

export const courseCategoriesRelations = relations(
	courseCategories,
	({ one }) => ({
		course: one(courses, {
			fields: [courseCategories.courseId],
			references: [courses.id],
		}),
		category: one(categories, {
			fields: [courseCategories.categoryId],
			references: [categories.id],
		}),
	})
);
