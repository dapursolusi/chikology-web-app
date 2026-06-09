CREATE TYPE "public"."access_event_type" AS ENUM('view_started', 'download_requested', 'access_denied');--> statement-breakpoint
CREATE TABLE "chapter_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"event_type" "access_event_type" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chapter_access_logs_user_id_chapter_id_event_type_created_at_unique" UNIQUE("user_id","chapter_id","event_type","created_at")
);
--> statement-breakpoint
ALTER TABLE "chapter_access_logs" ADD CONSTRAINT "chapter_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_access_logs" ADD CONSTRAINT "chapter_access_logs_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE no action ON UPDATE no action;