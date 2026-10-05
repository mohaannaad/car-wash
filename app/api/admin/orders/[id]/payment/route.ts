import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PaymentMethod } from "@prisma/client";
import { prisma } from "../../../../../../lib/prisma";

const methods = Object.values(PaymentMethod) as string[];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const store = await cookies();
  if (!store.get("admin_session")?.value) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { paymentMethod } = await request.json();

    if (!methods.includes(paymentMethod)) {
      return NextResponse.json({ error: "طريقة الدفع غير صحيحة" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (order.status !== "COMPLETED") {
      return NextResponse.json({ error: "يمكن تغيير طريقة الدفع بعد التنفيذ فقط" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentMethod: paymentMethod as PaymentMethod },
      select: { id: true, paymentMethod: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}