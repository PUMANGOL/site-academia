CREATE TYPE "public"."email_job_status" AS ENUM('pending', 'processing', 'sent', 'failed');--> statement-breakpoint
CREATE TABLE "email_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template" varchar(60) NOT NULL,
	"to" varchar(320) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "email_job_status" DEFAULT 'pending' NOT NULL,
	"priority" smallint DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"published_at" timestamp,
	"sent_at" timestamp,
	"last_error" text,
	"dedupe_key" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_jobs_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE INDEX "email_jobs_unpublished_idx" ON "email_jobs" USING btree ("created_at") WHERE "email_jobs"."published_at" is null;