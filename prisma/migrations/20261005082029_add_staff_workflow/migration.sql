-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "customerCalledAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod";

-- AlterTable
ALTER TABLE "SubscriptionWash" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "customerCalledAt" TIMESTAMP(3);
