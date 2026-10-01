-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "dayOfWeek" DROP NOT NULL,
ALTER COLUMN "time" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionWash" ADD COLUMN     "scheduledTime" TEXT NOT NULL DEFAULT '';
