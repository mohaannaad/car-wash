/*
  Warnings:

  - You are about to drop the column `carTypeId` on the `Package` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Package" DROP CONSTRAINT "Package_carTypeId_fkey";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "carTypeId";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "carTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
