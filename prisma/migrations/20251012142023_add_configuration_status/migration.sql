-- CreateEnum
CREATE TYPE "public"."ConfigurationStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Configuration" ADD COLUMN     "status" "public"."ConfigurationStatus" NOT NULL DEFAULT 'PENDING';
