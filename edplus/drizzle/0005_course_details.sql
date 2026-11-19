CREATE TYPE "public"."course_modality" AS ENUM('in_person', 'online');--> statement-breakpoint
CREATE TABLE "course_instructors" (
	"course_id" uuid NOT NULL,
	"instructor_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "course_instructors_course_id_instructor_id_pk" PRIMARY KEY("course_id","instructor_id")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "objectives" jsonb DEFAULT '{"pt":"","en":""}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "modality" "course_modality" DEFAULT 'in_person' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "start_date" date;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructors" ADD CONSTRAINT "course_instructors_instructor_id_instructor_profiles_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "course_instructors" ("course_id", "instructor_id", "sort_order")
SELECT "id", "instructor_id", 0 FROM "courses" WHERE "instructor_id" IS NOT NULL
ON CONFLICT DO NOTHING;