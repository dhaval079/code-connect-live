/*
  Warnings:

  - Added the required column `updatedAt` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- Example manual migration fix
-- Edit the generated migration file to include DEFAULT values

-- Add updatedAt column with default value
ALTER TABLE "messages" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have proper updatedAt values
UPDATE "messages" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Add any other columns that need defaults
-- Example: if role needs to be converted to enum
-- ALTER TABLE "messages" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";