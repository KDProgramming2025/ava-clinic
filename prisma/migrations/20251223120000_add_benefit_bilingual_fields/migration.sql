-- Add bilingual fields for benefits
ALTER TABLE "Benefit" ADD COLUMN IF NOT EXISTS "textEn" TEXT;
ALTER TABLE "Benefit" ADD COLUMN IF NOT EXISTS "textFa" TEXT;

-- Backfill from existing text
UPDATE "Benefit" SET
  "textEn" = COALESCE("textEn", "text"),
  "textFa" = COALESCE("textFa", "text");
