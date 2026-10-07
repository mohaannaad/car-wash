-- AlterTable
ALTER TABLE "Extra" ADD COLUMN     "originalPrice" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "originalPrice" INTEGER;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "pointValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pointsPerTask" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "SubscriptionWash" ADD COLUMN     "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "WorkShift" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "breakStartedAt" TIMESTAMP(3),
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkShift_employeeId_idx" ON "WorkShift"("employeeId");

-- AddForeignKey
ALTER TABLE "WorkShift" ADD CONSTRAINT "WorkShift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
