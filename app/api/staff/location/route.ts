import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

// الموظف يبعت موقعه أثناء الدوام فقط
export async function POST(req: Request) {
  const store = await cookies();
  const employeeId = store.get("employee_session")?.value;
  if (!employeeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const accuracy = body.accuracy === undefined || body.accuracy === null ? null : Number(body.accuracy);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return NextResponse.json({ error: "إحداثيات غير صحيحة" }, { status: 400 });
    }

    const open = await prisma.workShift.findFirst({
      where: { employeeId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });
    if (!open) return NextResponse.json({ error: "ابدأ الدوام أولًا" }, { status: 400 });

    // أثناء الاستراحة ما بنسجلش الموقع (خصوصية الموظف)
    if (open.breakStartedAt) return NextResponse.json({ ok: true, skipped: true });

    await prisma.workShift.update({
      where: { id: open.id },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastAccuracy: accuracy !== null && Number.isFinite(accuracy) ? accuracy : null,
        lastLocationAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "فشل في تحديث الموقع" }, { status: 500 });
  }
}
