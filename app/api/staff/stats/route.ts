import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { riyadhTodayKey, whenOf } from "../../../../lib/riyadhDate";

const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });

export async function GET() {
  const store = await cookies();
  const employeeId = store.get("employee_session")?.value;
  if (!employeeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const where = { employeeId, status: { not: "CANCELLED" as const } };
  const select = { status: true, scheduledDate: true, completedAt: true, pointsAwarded: true };

  const [orders, washes, settings] = await Promise.all([
    prisma.order.findMany({ where, select }),
    prisma.subscriptionWash.findMany({ where, select }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  const all = [...orders, ...washes];
  const today = all.filter((t) => whenOf(t.scheduledDate) === "today");
  const todayDone = today.filter((t) => t.status === "COMPLETED").length;

  const todayKey = riyadhTodayKey();
  let points = 0;
  let todayPoints = 0;
  for (const t of all) {
    if (t.status !== "COMPLETED") continue;
    points += t.pointsAwarded;
    if (t.completedAt && dayKey(new Date(t.completedAt)) === todayKey) {
      todayPoints += t.pointsAwarded;
    }
  }

  return NextResponse.json({
    todayTotal: today.length,
    todayDone,
    todayRemaining: today.length - todayDone,
    allTotal: all.length,
    points,
    todayPoints,
    pointValue: settings?.pointValue ?? 0,
  });
}