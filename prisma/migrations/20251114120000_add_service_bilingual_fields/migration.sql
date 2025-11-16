-- This migration intentionally reasserts bilingual Service columns for compatibility.
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "titleEn" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "titleFa" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "subtitleEn" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "subtitleFa" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "descriptionFa" TEXT;

-- Backfill any missing localized values from canonical fields
UPDATE "Service" SET
    "titleEn" = COALESCE("titleEn", "title"),
    "titleFa" = COALESCE("titleFa", "title"),
    "subtitleEn" = COALESCE("subtitleEn", "subtitle"),
    "subtitleFa" = COALESCE("subtitleFa", "subtitle"),
    "descriptionEn" = COALESCE("descriptionEn", "description"),
    "descriptionFa" = COALESCE("descriptionFa", "description");
