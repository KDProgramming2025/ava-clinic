-- Service bilingual operational fields
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "priceRangeEn" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "priceRangeFa" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "durationEn" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "durationFa" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "recoveryEn" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "recoveryFa" TEXT;

-- ProcessStep bilingual fields
ALTER TABLE "ProcessStep" ADD COLUMN IF NOT EXISTS "titleEn" TEXT;
ALTER TABLE "ProcessStep" ADD COLUMN IF NOT EXISTS "titleFa" TEXT;
ALTER TABLE "ProcessStep" ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT;
ALTER TABLE "ProcessStep" ADD COLUMN IF NOT EXISTS "descriptionFa" TEXT;

-- FAQ bilingual fields
ALTER TABLE "Faq" ADD COLUMN IF NOT EXISTS "questionEn" TEXT;
ALTER TABLE "Faq" ADD COLUMN IF NOT EXISTS "questionFa" TEXT;
ALTER TABLE "Faq" ADD COLUMN IF NOT EXISTS "answerEn" TEXT;
ALTER TABLE "Faq" ADD COLUMN IF NOT EXISTS "answerFa" TEXT;

-- Backfill from canonical fields
UPDATE "Service" SET
  "priceRangeEn" = COALESCE("priceRangeEn", "priceRange"),
  "priceRangeFa" = COALESCE("priceRangeFa", "priceRange"),
  "durationEn" = COALESCE("durationEn", "duration"),
  "durationFa" = COALESCE("durationFa", "duration"),
  "recoveryEn" = COALESCE("recoveryEn", "recovery"),
  "recoveryFa" = COALESCE("recoveryFa", "recovery");

UPDATE "ProcessStep" SET
  "titleEn" = COALESCE("titleEn", "title"),
  "titleFa" = COALESCE("titleFa", "title"),
  "descriptionEn" = COALESCE("descriptionEn", "description"),
  "descriptionFa" = COALESCE("descriptionFa", "description");

UPDATE "Faq" SET
  "questionEn" = COALESCE("questionEn", "question"),
  "questionFa" = COALESCE("questionFa", "question"),
  "answerEn" = COALESCE("answerEn", "answer"),
  "answerFa" = COALESCE("answerFa", "answer");
