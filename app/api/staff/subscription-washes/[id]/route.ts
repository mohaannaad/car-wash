import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { whenOf } from "../../../../../lib/riyadhDate";

const nextStatus: Record<string, string | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "ON_THE_WAY",
  ON_THE_WAY: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_session")?.value;
  if (!employeeId) return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status } = body;

    const wash = await prisma.subscriptionWash.findUnique({ where: { id } });
    if (!wash || wash.employeeId !== employeeId) {
      return NextResponse.json({ error: "المهمة غير مسموح لك بتعديلها" }, { status: 403 });
    }

    if (action === "call") {
      const updated = await prisma.subscriptionWash.update({
        where: { id },
        data: { customerCalledAt: wash.customerCalledAt ?? new Date() },
      });
      return NextResponse.json(updated);
    }

    if (!status) {
      return NextResponse.json({ error: "الحالة مطلوبة" }, { status: 400 });
    }
    if (whenOf(wash.scheduledDate) === "upcoming") {
      return NextResponse.json({ error: "موعد المهمة دي لسه ماجاش" }, { status: 400 });
    }
    if (nextStatus[wash.status] !== status) {
      return NextResponse.json({ error: "ترتيب الحالات غير صحيح" }, { status: 400 });
    }
    if (status === "CONFIRMED" && !wash.customerCalledAt) {
      return NextResponse.json({ error: "لازم تتصل بالعميل الأول لتأكيد الموعد" }, { status: 400 });
    }

    const updated = await prisma.subscriptionWash.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        ...(status === "COMPLETED" && { completedAt: new Date() }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}