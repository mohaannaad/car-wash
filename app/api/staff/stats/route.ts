import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { whenOf } from "../../../../lib/riyadhDate";

export async function GET() {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_session")?.value;
  if (!employeeId) return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });

  const [orders, washes] = await Promise.all([
    prisma.order.findMany({
      where: { employeeId, status: { not: "CANCELLED" } },
      select: { status: true, scheduledDate: true },
    }),
    prisma.subscriptionWash.findMany({
      where: { employeeId, status: { not: "CANCELLED" } },
      select: { status: true, scheduledDate: true },
    }),
  ]);

  const all = [...orders, ...washes];
  const today = all.filter((x) => whenOf(x.scheduledDate) === "today");
  const todayDone = today.filter((x) => x.status === "COMPLETED").length;

  return NextResponse.json({
    todayTotal: today.length,
    todayDone,
    todayRemaining: today.length - todayDone,
    allTotal: all.length,
  });
}