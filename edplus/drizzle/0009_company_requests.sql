CREATE TYPE "public"."company_request_status" AS ENUM('new', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."training_modality" AS ENUM('in_person', 'online', 'hybrid', 'undecided');--> statement-breakpoint
CREATE TABLE "company_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(180) NOT NULL,
	"contact_name" varchar(180) NOT NULL,
	"job_title" varchar(120),
	"email" varchar(320) NOT NULL,
	"phone" varchar(40),
	"sector" varchar(120),
	"participants" integer,
	"training_areas" text NOT NULL,
	"modality" "training_modality" DEFAULT 'undecided' NOT NULL,
	"message" text,
	"privacy_consent" boolean DEFAULT false NOT NULL,
	"status" "company_request_status" DEFAULT 'new' NOT NULL,
	"internal_notes" text,
	"handled_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_requests" ADD CONSTRAINT "company_requests_handled_by_user_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "company_requests_created_idx" ON "company_requests" USING btree ("created_at");