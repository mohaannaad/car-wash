import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const orders = await prisma.order.findMany({
      where: { customerId: id },
      include: { service: true, carType: true },
      orderBy: { createdAt: "desc" },
    });

    const subscriptions = await prisma.subscription.findMany({
      where: { customerId: id },
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        type: "order",
        label: `${o.service.name} - ${o.carType.name}`,
        price: o.totalPrice,
        date: o.createdAt,
      })),
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        type: "subscription",
        label: `باقة ${s.package.name} (${s.package.washCount} غسلات)`,
        price: s.package.price,
        date: s.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}