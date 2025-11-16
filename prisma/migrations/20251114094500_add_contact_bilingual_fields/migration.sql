-- Add bilingual columns to contact-related tables
ALTER TABLE "ContactInfoBlock"
  ADD COLUMN IF NOT EXISTS "titleEn" TEXT,
  ADD COLUMN IF NOT EXISTS "titleFa" TEXT;

ALTER TABLE "ContactInfoValue"
  ADD COLUMN IF NOT EXISTS "valueEn" TEXT,
  ADD COLUMN IF NOT EXISTS "valueFa" TEXT;

ALTER TABLE "ContactFaq"
  ADD COLUMN IF NOT EXISTS "questionEn" TEXT,
  ADD COLUMN IF NOT EXISTS "questionFa" TEXT,
  ADD COLUMN IF NOT EXISTS "answerEn" TEXT,
  ADD COLUMN IF NOT EXISTS "answerFa" TEXT;

ALTER TABLE "SocialLink"
  ADD COLUMN IF NOT EXISTS "platformEn" TEXT,
  ADD COLUMN IF NOT EXISTS "platformFa" TEXT;

ALTER TABLE "QuickAction"
  ADD COLUMN IF NOT EXISTS "labelEn" TEXT,
  ADD COLUMN IF NOT EXISTS "labelFa" TEXT;

-- Prefill new columns with existing canonical values
UPDATE "ContactInfoBlock" SET "titleEn" = "title", "titleFa" = "title" WHERE "title" IS NOT NULL;
UPDATE "ContactInfoValue" SET "valueEn" = "value", "valueFa" = "value" WHERE "value" IS NOT NULL;
UPDATE "ContactFaq" SET "questionEn" = "question", "questionFa" = "question", "answerEn" = "answer", "answerFa" = "answer" WHERE "question" IS NOT NULL;
UPDATE "SocialLink" SET "platformEn" = "platform", "platformFa" = "platform" WHERE "platform" IS NOT NULL;
UPDATE "QuickAction" SET "labelEn" = "label", "labelFa" = "label" WHERE "label" IS NOT NULL;
