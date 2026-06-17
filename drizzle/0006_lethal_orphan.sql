CREATE TABLE "scan_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" integer NOT NULL,
	"cues" text DEFAULT '' NOT NULL,
	"confidence" text DEFAULT 'medium' NOT NULL,
	"questionnaire_answers" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;