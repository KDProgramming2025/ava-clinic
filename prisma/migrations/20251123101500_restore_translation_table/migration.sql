-- Recreate Translation table to back bilingual content + SEO overrides
CREATE TABLE IF NOT EXISTS "Translation" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Translation_pkey" PRIMARY KEY ("key")
);
