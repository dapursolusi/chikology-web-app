CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "app_settings" ("key", "value") VALUES ('ebook_live', 'false') ON CONFLICT ("key") DO NOTHING;
