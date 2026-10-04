-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "carTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
