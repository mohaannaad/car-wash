import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OrderStatus, PaymentMethod } from "@prisma/client";
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

const paymentMethods = Object.values(PaymentMethod) as string[];

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
    const { action, status, paymentMethod, reason } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.employeeId !== employeeId) {
      return NextResponse.json({ error: "الطلب غير مسموح لك بتعديله" }, { status: 403 });
    }

    // تسجيل إن الموظف اتصل بالعميل
    if (action === "call") {
      const updated = await prisma.order.update({
        where: { id },
        data: { customerCalledAt: order.customerCalledAt ?? new Date() },
      });
      return NextResponse.json(updated);
    }

    // رفض الطلب بعد الاتصال بالعميل
    if (action === "reject") {
      if (order.status !== "PENDING") {
        return NextResponse.json({ error: "لا يمكن رفض الطلب بعد قبوله" }, { status: 400 });
      }
      if (whenOf(order.scheduledDate) === "upcoming") {
        return NextResponse.json({ error: "موعد الطلب ده لسه ماجاش" }, { status: 400 });
      }
      if (!order.customerCalledAt) {
        return NextResponse.json({ error: "لازم تتصل بالعميل الأول" }, { status: 400 });
      }
      const text = typeof reason === "string" ? reason.trim() : "";
      if (text.length < 3) {
        return NextResponse.json({ error: "اكتب سبب الرفض" }, { status: 400 });
      }
      const updated = await prisma.order.update({
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
    if (whenOf(order.scheduledDate) === "upcoming") {
      return NextResponse.json({ error: "موعد الطلب ده لسه ماجاش" }, { status: 400 });
    }
    if (nextStatus[order.status] !== status) {
      return NextResponse.json({ error: "ترتيب الحالات غير صحيح" }, { status: 400 });
    }
    if (status === "CONFIRMED" && !order.customerCalledAt) {
      return NextResponse.json({ error: "لازم تتصل بالعميل الأول لتأكيد الموعد" }, { status: 400 });
    }
    if (status === "IN_PROGRESS" && !(await hasAllPhotos("order", id, "BEFORE"))) {
      return NextResponse.json({ error: "لازم تصوّر السيارة من الأماكن الستة قبل بدء التنفيذ" }, { status: 400 });
    }
    if (status === "COMPLETED" && !(await hasAllPhotos("order", id, "AFTER"))) {
      return NextResponse.json({ error: "لازم تصوّر السيارة من الأماكن الستة بعد التنفيذ" }, { status: 400 });
    }

    const data: {
      status: OrderStatus;
      paymentMethod?: PaymentMethod;
      completedAt?: Date;
      pointsAwarded?: number;
    } = {
      status: status as OrderStatus,
    };

    if (status === "COMPLETED") {
      if (!paymentMethods.includes(paymentMethod)) {
        return NextResponse.json({ error: "اختار طريقة الدفع الأول" }, { status: 400 });
      }
      const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
      data.paymentMethod = paymentMethod as PaymentMethod;
      data.completedAt = new Date();
      data.pointsAwarded = settings?.pointsPerTask ?? 10;
    }

    const updated = await prisma.order.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}