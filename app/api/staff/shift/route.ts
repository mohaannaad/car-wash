import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { riyadhTodayKey } from "../../../../lib/riyadhDate";
import { MAX_SHIFT_MS, workedMinutes } from "../../../../lib/shiftMath";

type Shift = { id: string; startedAt: Date; breakStartedAt: Date | null; breakMinutes: number };

async function getEmployeeId() {
  const store = await cookies();
  return store.get("employee_session")?.value ?? null;
}

async function getState(employeeId: string) {
  const now = new Date();
  const open = await prisma.workShift.findFirst({
    where: { employeeId, endedAt: null },
    orderBy: { startedAt: "desc" },
  });
  const dayStart = new Date(`${riyadhTodayKey()}T00:00:00+03:00`);
  const todayShifts = await prisma.workShift.findMany({
    where: { employeeId, startedAt: { gte: dayStart } },
  });
  const todayMinutes = todayShifts.reduce((sum, s) => sum + workedMinutes(s, now), 0);

  const ongoingBreak = open?.breakStartedAt
    ? Math.max(0, Math.round((now.getTime() - open.breakStartedAt.getTime()) / 60000))
    : 0;

  return {
    shift: open
      ? {
          id: open.id,
          startedAt: open.startedAt,
          onBreak: !!open.breakStartedAt,
          breakTotalMinutes: open.breakMinutes + ongoingBreak,
          workedMinutes: workedMinutes(open, now),
          stale: now.getTime() - open.startedAt.getTime() > MAX_SHIFT_MS,
        }
      : null,
    todayMinutes,
  };
}

async function closeShift(s: Shift, now: Date) {
  const end = new Date(Math.min(now.getTime(), s.startedAt.getTime() + MAX_SHIFT_MS));
  const extra = s.breakStartedAt
    ? Math.max(0, Math.round((end.getTime() - s.breakStartedAt.getTime()) / 60000))
    : 0;
  await prisma.workShift.update({
    where: { id: s.id },
    data: { endedAt: end, breakStartedAt: null, breakMinutes: s.breakMinutes + extra },
  });
}

export async function GET() {
  const employeeId = await getEmployeeId();
  if (!employeeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json(await getState(employeeId));
}

export async function POST(req: Request) {
  const employeeId = await getEmployeeId();
  if (!employeeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const { action } = await req.json();
    const now = new Date();
    const open = await prisma.workShift.findFirst({
      where: { employeeId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });

    if (action === "start") {
      if (open) {
        if (now.getTime() - open.startedAt.getTime() <= MAX_SHIFT_MS) {
          return NextResponse.json({ error: "عندك دوام مفتوح بالفعل" }, { status: 400 });
        }
        // دوام قديم نسي الموظف يقفله: نقفله بحد أقصى 16 ساعة
        await closeShift(open, now);
      }
      await prisma.workShift.create({ data: { employeeId } });
    } else if (!open) {
      return NextResponse.json({ error: "ابدأ الدوام أولًا" }, { status: 400 });
    } else if (action === "break_start") {
      if (open.breakStartedAt) {
        return NextResponse.json({ error: "أنت في استراحة بالفعل" }, { status: 400 });
      }
      await prisma.workShift.update({ where: { id: open.id }, data: { breakStartedAt: now } });
    } else if (action === "break_end") {
      if (!open.breakStartedAt) {
        return NextResponse.json({ error: "أنت لست في استراحة" }, { status: 400 });
      }
      const minutes = Math.max(0, Math.round((now.getTime() - open.breakStartedAt.getTime()) / 60000));
      await prisma.workShift.update({
        where: { id: open.id },
        data: { breakMinutes: { increment: minutes }, breakStartedAt: null },
      });
    } else if (action === "end") {
      await closeShift(open, now);
    } else {
      return NextResponse.json({ error: "إجراء غير صحيح" }, { status: 400 });
    }

    return NextResponse.json(await getState(employeeId));
  } catch {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}