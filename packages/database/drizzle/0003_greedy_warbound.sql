ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "form_fields" SET "type" = 'SHORT_TEXT' WHERE "type" = 'TEXT';--> statement-breakpoint
DROP TYPE "public"."field_type_enum";--> statement-breakpoint
CREATE TYPE "public"."field_type_enum" AS ENUM('SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'NUMBER', 'SINGLE_SELECT', 'MULTI_SELECT', 'YES_NO', 'PASSWORD', 'RATING', 'DATE');--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "type" SET DATA TYPE "public"."field_type_enum" USING "type"::"public"."field_type_enum";--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "options" jsonb DEFAULT '[]'::jsonb NOT NULL;