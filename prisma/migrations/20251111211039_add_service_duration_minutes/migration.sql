-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "durationMinutes" INTEGER;

-- CreateTable
CREATE TABLE "BookingSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "timeSlots" JSONB,
    "blackoutDates" JSONB,
    "disclaimer" TEXT,
    "bufferMinutes" INTEGER,
    "defaultDurationMinutes" INTEGER DEFAULT 60,
    "businessHours" JSONB,

    CONSTRAINT "BookingSettings_pkey" PRIMARY KEY ("id")
);
