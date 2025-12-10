ALTER TABLE "Settings"
  ADD COLUMN "instagramAccessToken" TEXT,
  ADD COLUMN "instagramUserId" TEXT,
  ADD COLUMN "instagramUsername" TEXT,
  ADD COLUMN "instagramAccountType" TEXT,
  ADD COLUMN "instagramConnectedAt" TIMESTAMP(3),
  ADD COLUMN "instagramTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN "instagramFeedCache" JSONB,
  ADD COLUMN "instagramFeedCachedAt" TIMESTAMP(3),
  ADD COLUMN "instagramLastError" TEXT;
