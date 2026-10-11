import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

// الأدمن يشوف آخر موقع للموظف (لو دوامه شغال)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const shift = await prisma.workShift.findFirst({
      where: {
        employeeId: id,
        endedAt: null,
        startedAt: { gte: new Date(Date.now() - 16 * 60 * 60 * 1000) },
      },
      orderBy: { startedAt: "desc" },
      include: { employee: { select: { name: true, phone: true } } },
    });

    if (!shift) return NextResponse.json({ onShift: false });

    return NextResponse.json({
      onShift: true,
      name: shift.employee.name,
      phone: shift.employee.phone,
      onBreak: !!shift.breakStartedAt,
      startedAt: shift.startedAt,
      lat: shift.lastLat,
      lng: shift.lastLng,
      accuracy: shift.lastAccuracy,
      updatedAt: shift.lastLocationAt,
    });
  } catch {
    return NextResponse.json({ error: "فشل في جلب الموقع" }, { status: 500 });
  }
}
