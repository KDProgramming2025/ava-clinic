-- CreateTable
CREATE TABLE "BookingInfo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BookingInfo_pkey" PRIMARY KEY ("id")
);
