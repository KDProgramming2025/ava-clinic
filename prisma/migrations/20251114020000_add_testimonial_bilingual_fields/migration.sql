-- Add bilingual testimonial fields
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "nameEn" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "nameFa" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "textEn" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "textFa" TEXT;

-- Backfill from existing data when missing
UPDATE "Testimonial" SET
  "nameEn" = COALESCE("nameEn", "name"),
  "nameFa" = COALESCE("nameFa", "name"),
  "textEn" = COALESCE("textEn", "text"),
  "textFa" = COALESCE("textFa", "text");
