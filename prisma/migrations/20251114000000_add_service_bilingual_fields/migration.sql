-- Add bilingual fields for Service titles/subtitles/descriptions
ALTER TABLE "Service" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Service" ADD COLUMN "titleFa" TEXT;
ALTER TABLE "Service" ADD COLUMN "subtitleEn" TEXT;
ALTER TABLE "Service" ADD COLUMN "subtitleFa" TEXT;
ALTER TABLE "Service" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Service" ADD COLUMN "descriptionFa" TEXT;

-- Optional: backfill new fields from existing data
UPDATE "Service" SET
  "titleEn" = COALESCE("titleEn", "title"),
  "titleFa" = COALESCE("titleFa", "title"),
  "subtitleEn" = COALESCE("subtitleEn", "subtitle"),
  "subtitleFa" = COALESCE("subtitleFa", "subtitle"),
  "descriptionEn" = COALESCE("descriptionEn", "description"),
  "descriptionFa" = COALESCE("descriptionFa", "description");
