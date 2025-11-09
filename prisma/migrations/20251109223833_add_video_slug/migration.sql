/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN "slug" TEXT;

-- Backfill slugs from title (simple slugify: lowercase, replace non-alphanum with dash, trim dashes)
UPDATE "Video"
SET "slug" = trim(both '-' from regexp_replace(lower(coalesce("title", 'video')), '[^a-z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Ensure uniqueness among duplicates by appending -N for N>0
WITH d AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY id) AS rn
  FROM "Video"
  WHERE slug IS NOT NULL
)
UPDATE "Video" v
SET slug = CASE WHEN d.rn = 1 THEN d.slug ELSE d.slug || '-' || (d.rn - 1)::text END
FROM d
WHERE v.id = d.id;

-- Create unique index on slug
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");
