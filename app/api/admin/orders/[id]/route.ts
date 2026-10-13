import { NextResponse, after } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { notifyOrder } from "../../../../../lib/smsEvents";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, employeeId, date, time } = body;

    // اعتماد تغيير الموعد (بنفس رقم الطلب) + رسالة للعميل
    if (action === "approve_reschedule") {
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof time !== "string" || !time.trim()) {
        return NextResponse.json({ error: "التاريخ والوقت الجديدين مطلوبين" }, { status: 400 });
      }
      const order = await prisma.order.update({
        where: { id },
        data: {
          scheduledDate: new Date(date),
          scheduledTime: time.trim(),
          callOutcome: null,
          customerCalledAt: null,
        },
      });
      after(() => notifyOrder(id, "RESCHEDULED"));
      return NextResponse.json(order);
    }

    // اعتماد إلغاء الحجز + رسالة للعميل
    if (action === "approve_cancel") {
      const order = await prisma.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      after(() => notifyOrder(id, "CANCELLED"));
      return NextResponse.json(order);
    }

    // رفض الطلب (تغيير الموعد/الإلغاء) وإرجاعه للمندوب من غير رسالة
    if (action === "dismiss_request") {
      const order = await prisma.order.update({
        where: { id },
        data: { callOutcome: null, customerCalledAt: null },
      });
      return NextResponse.json(order);
    }

    const before =
      status !== undefined
        ? await prisma.order.findUnique({ where: { id }, select: { status: true, callOutcome: true } })
        : null;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(employeeId !== undefined && { employeeId: employeeId || null }),
      },
    });

    if (status !== undefined && before && before.status !== status) {
      if (status === "ON_THE_WAY" || status === "COMPLETED") {
        after(() => notifyOrder(id, status));
      } else if (status === "CANCELLED" && before.callOutcome === "CANCEL_REQUEST") {
        after(() => notifyOrder(id, "CANCELLED"));
      }
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}
