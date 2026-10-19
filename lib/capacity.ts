import type { Prisma, PrismaClient } from "@prisma/client";

// أقصى عدد حجوزات للموظف الواحد في نفس الساعة
export const MAX_PER_SLOT = 2;

type Db = PrismaClient | Prisma.TransactionClient;

// يقفل المنطقة طوال الـ transaction علشان حجزين في نفس اللحظة ميعدّوش الحد
export async function lockDistrict(tx: Prisma.TransactionClient, districtId?: string | null) {
  const key = `slot:${districtId ?? "all"}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}::text))`;
}

export async function getDistrictEmployees(db: Db, districtId?: string | null) {
  return db.employee.findMany({
    where: { isActive: true, ...(districtId ? { districtId } : {}) },
    select: { id: true },
  });
}

// الحجوزات (طلبات + غسلات اشتراك غير ملغية) لكل موظف في يوم معين: Map<employeeId, Map<time, count>>
export async function loadDayCounts(db: Db, employeeIds: string[], date: Date) {
  const [orders, washes] = await Promise.all([
    db.order.findMany({
      where: { employeeId: { in: employeeIds }, scheduledDate: date, status: { not: "CANCELLED" } },
      select: { employeeId: true, scheduledTime: true },
    }),
    db.subscriptionWash.findMany({
      where: { employeeId: { in: employeeIds }, scheduledDate: date, status: { not: "CANCELLED" } },
      select: { employeeId: true, scheduledTime: true },
    }),
  ]);

  const counts = new Map<string, Map<string, number>>();
  for (const row of [...orders, ...washes]) {
    if (!row.employeeId) continue;
    const perTime = counts.get(row.employeeId) ?? new Map<string, number>();
    perTime.set(row.scheduledTime, (perTime.get(row.scheduledTime) ?? 0) + 1);
    counts.set(row.employeeId, perTime);
  }
  return counts;
}

// المواعيد المكتملة في يوم معين لمنطقة معينة (كل موظفين المنطقة وصلوا للحد)
export async function getFullTimes(db: Db, districtId: string | undefined | null, date: Date) {
  const employees = await getDistrictEmployees(db, districtId);
  if (employees.length === 0) return [] as string[]; // مفيش موظفين = مفيش حد
  const counts = await loadDayCounts(db, employees.map((e) => e.id), date);

  const allTimes = new Set<string>();
  counts.forEach((perTime) => perTime.forEach((_, time) => allTimes.add(time)));

  const full: string[] = [];
  allTimes.forEach((time) => {
    const everyoneFull = employees.every((e) => (counts.get(e.id)?.get(time) ?? 0) >= MAX_PER_SLOT);
    if (everyoneFull) full.push(time);
  });
  return full;
}

export type PickResult = { full: true } | { full: false; employeeId: string | null };

// يختار موظف متاح في الموعد ده (أقل واحد عليه شغل مفتوح)، أو يرجّع full لو الكل وصل للحد
export async function pickEmployeeForSlot(
  db: Db,
  districtId: string | undefined | null,
  date: Date,
  time: string,
  extraLoad: Map<string, number> = new Map()
): Promise<PickResult> {
  const employees = await getDistrictEmployees(db, districtId);
  if (employees.length === 0) return { full: false, employeeId: null };

  const counts = await loadDayCounts(db, employees.map((e) => e.id), date);
  const free = employees.filter((e) => (counts.get(e.id)?.get(time) ?? 0) < MAX_PER_SLOT);
  if (free.length === 0) return { full: true };

  const loads = await Promise.all(
    free.map(async (e) => {
      const [openOrders, openWashes] = await Promise.all([
        db.order.count({ where: { employeeId: e.id, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
        db.subscriptionWash.count({ where: { employeeId: e.id, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
      ]);
      return { id: e.id, load: openOrders + openWashes + (extraLoad.get(e.id) ?? 0) };
    })
  );
  loads.sort((a, b) => a.load - b.load);
  return { full: false, employeeId: loads[0].id };
}
