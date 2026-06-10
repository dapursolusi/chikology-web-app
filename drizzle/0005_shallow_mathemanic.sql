CREATE TABLE "scan_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scan_date" date DEFAULT now() NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "scan_usage_user_id_scan_date_unique" UNIQUE("user_id","scan_date")
);
--> statement-breakpoint
ALTER TABLE "scan_usage" ADD CONSTRAINT "scan_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;