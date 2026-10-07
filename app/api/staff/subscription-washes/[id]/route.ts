import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { whenOf } from "../../../../../lib/riyadhDate";
import { hasAllPhotos } from "../../../../../lib/photoGate";

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
    const { action, status, reason } = body;

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

    if (action === "reject") {
      if (wash.status !== "PENDING") {
        return NextResponse.json({ error: "لا يمكن رفض المهمة بعد قبولها" }, { status: 400 });
      }
      if (whenOf(wash.scheduledDate) === "upcoming") {
        return NextResponse.json({ error: "موعد المهمة دي لسه ماجاش" }, { status: 400 });
      }
      if (!wash.customerCalledAt) {
        return NextResponse.json({ error: "لازم تتصل بالعميل الأول" }, { status: 400 });
      }
      const text = typeof reason === "string" ? reason.trim() : "";
      if (text.length < 3) {
        return NextResponse.json({ error: "اكتب سبب الرفض" }, { status: 400 });
      }
      const updated = await prisma.subscriptionWash.update({
        where: { id },
        data: {
          status: "CANCELLED",
          rejectionReason: text.slice(0, 500),
          rejectedAt: new Date(),
        },
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
    if (status === "IN_PROGRESS" && !(await hasAllPhotos("wash", id, "BEFORE"))) {
      return NextResponse.json({ error: "لازم تصوّر السيارة من الأماكن الستة قبل بدء التنفيذ" }, { status: 400 });
    }
    if (status === "COMPLETED" && !(await hasAllPhotos("wash", id, "AFTER"))) {
      return NextResponse.json({ error: "لازم تصوّر السيارة من الأماكن الستة بعد التنفيذ" }, { status: 400 });
    }

    let points = 0;
    if (status === "COMPLETED") {
      const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
      points = settings?.pointsPerTask ?? 10;
    }

    const updated = await prisma.subscriptionWash.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        ...(status === "COMPLETED" && { completedAt: new Date(), pointsAwarded: points }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}