ALTER TYPE "public"."contentType" RENAME TO "mediaType";--> statement-breakpoint
ALTER TABLE "postMedia" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."mediaType";--> statement-breakpoint
CREATE TYPE "public"."mediaType" AS ENUM('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');--> statement-breakpoint
ALTER TABLE "postMedia" ALTER COLUMN "type" SET DATA TYPE "public"."mediaType" USING "type"::"public"."mediaType";--> statement-breakpoint
ALTER TABLE "postMedia" ALTER COLUMN "type" SET NOT NULL;