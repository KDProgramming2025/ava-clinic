-- Add table for managing map coordinates displayed on the Contact page
CREATE TABLE IF NOT EXISTS "ContactMap" (
    "id" INTEGER PRIMARY KEY,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "zoom" INTEGER DEFAULT 15,
    "markerLabel" TEXT
);
