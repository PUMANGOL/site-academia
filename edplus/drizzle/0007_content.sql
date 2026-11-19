CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" varchar(120) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(80) NOT NULL,
	"size" integer NOT NULL,
	"alt" varchar(255) DEFAULT '' NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_file_name_unique" UNIQUE("file_name")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(180) NOT NULL,
	"draft_blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published_blocks" jsonb,
	"published_at" timestamp,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(180) NOT NULL,
	"title" jsonb NOT NULL,
	"excerpt" jsonb DEFAULT '{"pt":"","en":""}'::jsonb NOT NULL,
	"category" jsonb DEFAULT '{"pt":"","en":""}'::jsonb NOT NULL,
	"body" jsonb DEFAULT '{"pt":null,"en":null}'::jsonb NOT NULL,
	"cover_image_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"author_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;