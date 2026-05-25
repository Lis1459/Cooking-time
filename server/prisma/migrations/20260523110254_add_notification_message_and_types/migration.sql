-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_RATING';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "message" TEXT;
