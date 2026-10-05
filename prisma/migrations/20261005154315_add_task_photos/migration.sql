-- CreateEnum
CREATE TYPE "PhotoStage" AS ENUM ('BEFORE', 'AFTER');

-- CreateTable
CREATE TABLE "TaskPhoto" (
    "id" TEXT NOT NULL,
    "stage" "PhotoStage" NOT NULL,
    "spot" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT,
    "washId" TEXT,

    CONSTRAINT "TaskPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskPhoto_orderId_idx" ON "TaskPhoto"("orderId");

-- CreateIndex
CREATE INDEX "TaskPhoto_washId_idx" ON "TaskPhoto"("washId");

-- AddForeignKey
ALTER TABLE "TaskPhoto" ADD CONSTRAINT "TaskPhoto_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskPhoto" ADD CONSTRAINT "TaskPhoto_washId_fkey" FOREIGN KEY ("washId") REFERENCES "SubscriptionWash"("id") ON DELETE CASCADE ON UPDATE CASCADE;
