CREATE TABLE "forms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'project' NOT NULL,
	"attribute_count" text DEFAULT '0' NOT NULL,
	"usage_count" text DEFAULT '0' NOT NULL,
	"attributes" text DEFAULT '[]' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
