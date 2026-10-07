import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { riyadhTodayKey } from "../../../../lib/riyadhDate";
import { workedMinutes } from "../../../../lib/shiftMath";

const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });

async function isAdmin() {
  const store = await cookies();
  return !!store.get("admin_session")?.value;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let month = searchParams.get("month") || riyadhTodayKey().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) month = riyadhTodayKey().slice(0, 7);

  const [y, m] = month.split("-").map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const start = new Date(`${month}-01T00:00:00+03:00`);
  const end = new Date(`${nextMonth}-01T00:00:00+03:00`);
  const now = new Date();

  const [employees, shifts, settings, ordersMonth, washesMonth, ordersAll, washesAll, openShifts] =
    await Promise.all([
      prisma.employee.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.workShift.findMany({
        where: { startedAt: { gte: start, lt: end } },
        orderBy: { startedAt: "desc" },
      }),
      prisma.settings.findUnique({ where: { id: "singleton" } }),
      prisma.order.groupBy({
        by: ["employeeId"],
        where: { status: "COMPLETED", completedAt: { gte: start, lt: end } },
        _sum: { pointsAwarded: true },
        _count: { _all: true },
      }),
      prisma.subscriptionWash.groupBy({
        by: ["employeeId"],
        where: { status: "COMPLETED", completedAt: { gte: start, lt: end } },
        _sum: { pointsAwarded: true },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ["employeeId"],
        where: { status: "COMPLETED" },
        _sum: { pointsAwarded: true },
      }),
      prisma.subscriptionWash.groupBy({
        by: ["employeeId"],
        where: { status: "COMPLETED" },
        _sum: { pointsAwarded: true },
      }),
      prisma.workShift.findMany({ where: { endedAt: null }, select: { employeeId: true } }),
    ]);

  const sumBy = (rows: { employeeId: string | null; _sum: { pointsAwarded: number | null } }[], id: string) =>
    rows.find((r) => r.employeeId === id)?._sum.pointsAwarded ?? 0;
  const countBy = (rows: { employeeId: string | null; _count: { _all: number } }[], id: string) =>
    rows.find((r) => r.employeeId === id)?._count._all ?? 0;

  const rows = employees.map((e) => {
    const mine = shifts.filter((s) => s.employeeId === e.id);
    return {
      id: e.id,
      name: e.name,
      onShift: openShifts.some((s) => s.employeeId === e.id),
      minutes: mine.reduce((sum, s) => sum + workedMinutes(s, now), 0),
      days: new Set(mine.map((s) => dayKey(s.startedAt))).size,
      tasks: countBy(ordersMonth, e.id) + countBy(washesMonth, e.id),
      pointsMonth: sumBy(ordersMonth, e.id) + sumBy(washesMonth, e.id),
      pointsTotal: sumBy(ordersAll, e.id) + sumBy(washesAll, e.id),
      shifts: mine.slice(0, 31).map((s) => ({
        id: s.id,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        breakMinutes: s.breakMinutes,
        minutes: workedMinutes(s, now),
      })),
    };
  });

  return NextResponse.json({
    month,
    settings: {
      pointsPerTask: settings?.pointsPerTask ?? 10,
      pointValue: settings?.pointValue ?? 0,
    },
    employees: rows,
  });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const pointsPerTask = Number(body.pointsPerTask);
    const pointValue = Number(body.pointValue);

    if (!Number.isInteger(pointsPerTask) || pointsPerTask < 0 || pointsPerTask > 100000) {
      return NextResponse.json({ error: "عدد النقاط غير صحيح" }, { status: 400 });
    }
    if (!Number.isFinite(pointValue) || pointValue < 0 || pointValue > 100000) {
      return NextResponse.json({ error: "قيمة النقطة غير صحيحة" }, { status: 400 });
    }

    const saved = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: { pointsPerTask, pointValue },
      create: { id: "singleton", pointsPerTask, pointValue },
    });
    return NextResponse.json({ pointsPerTask: saved.pointsPerTask, pointValue: saved.pointValue });
  } catch {
    return NextResponse.json({ error: "فشل في الحفظ" }, { status: 500 });
  }
}