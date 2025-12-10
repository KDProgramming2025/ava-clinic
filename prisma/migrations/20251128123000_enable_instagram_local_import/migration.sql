-- Add Instagram import metadata columns and remove obsolete embedHtml
ALTER TABLE "Video"
  ADD COLUMN "sourceUrl" TEXT,
  ADD COLUMN "caption" TEXT,
  ADD COLUMN "media" JSONB,
  ADD COLUMN "takenAt" TIMESTAMP(3),
  ADD COLUMN "authorUsername" TEXT,
  ADD COLUMN "authorFullName" TEXT;

ALTER TABLE "Video"
  DROP COLUMN "embedHtml";
