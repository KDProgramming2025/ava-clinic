-- Add bilingual branding/SEO fields for settings
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "siteTitleEn" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "siteTitleFa" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "metaDescriptionEn" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "metaDescriptionFa" TEXT;

-- Optional backfill from existing canonical fields
UPDATE "Settings" SET
  "siteTitleEn" = COALESCE("siteTitleEn", "siteTitle"),
  "siteTitleFa" = COALESCE("siteTitleFa", "siteTitle"),
  "metaDescriptionEn" = COALESCE("metaDescriptionEn", "metaDescription"),
  "metaDescriptionFa" = COALESCE("metaDescriptionFa", "metaDescription");
