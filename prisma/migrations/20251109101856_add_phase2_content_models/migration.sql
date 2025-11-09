-- CreateEnum
CREATE TYPE "ContactInfoType" AS ENUM ('phone', 'email', 'address', 'hours');

-- CreateEnum
CREATE TYPE "QuickActionType" AS ENUM ('call', 'email', 'chat', 'custom');

-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "group" TEXT,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "languagesJson" JSONB,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeHero" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "ctaPrimaryLabel" TEXT,
    "ctaSecondaryLabel" TEXT,

    CONSTRAINT "HomeHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeStat" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "icon" TEXT,

    CONSTRAINT "HomeStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFeature" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "HomeFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeCTA" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heading" TEXT,
    "subheading" TEXT,
    "buttonLabel" TEXT,

    CONSTRAINT "HomeCTA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutTimeline" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AboutTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutValue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "AboutValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "AboutSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutMission" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heading" TEXT,
    "paragraph" TEXT,

    CONSTRAINT "AboutMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutMissionBullet" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "AboutMissionBullet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfoBlock" (
    "id" TEXT NOT NULL,
    "type" "ContactInfoType" NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ContactInfoBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfoValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "ContactInfoValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "ContactFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickAction" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "QuickActionType" NOT NULL,
    "target" TEXT NOT NULL,

    CONSTRAINT "QuickAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "headline" TEXT,
    "description" TEXT,
    "buttonLabel" TEXT,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingTopic" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TrendingTopic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactInfoValue" ADD CONSTRAINT "ContactInfoValue_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ContactInfoBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
