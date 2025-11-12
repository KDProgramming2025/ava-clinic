-- Add optional username with unique index for AdminUser
ALTER TABLE "AdminUser" ADD COLUMN "username" TEXT;

-- Unique index allowing multiple NULLs by default in Postgres
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
