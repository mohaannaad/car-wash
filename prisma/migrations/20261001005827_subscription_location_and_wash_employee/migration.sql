-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "locationLat" DOUBLE PRECISION,
ADD COLUMN     "locationLng" DOUBLE PRECISION,
ADD COLUMN     "locationText" TEXT,
ADD COLUMN     "plateNumber" TEXT;

-- AlterTable
ALTER TABLE "SubscriptionWash" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "SubscriptionWash" ADD CONSTRAINT "SubscriptionWash_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
