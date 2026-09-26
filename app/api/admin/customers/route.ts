import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { orders: { select: { totalPrice: true } } },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((customer: { id: string; name: string; phone: string; createdAt: Date; orders: { totalPrice: number }[] }) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      createdAt: customer.createdAt,
      ordersCount: customer.orders.length,
      totalSpent: customer.orders.reduce((sum: number, order: { totalPrice: number }) => sum + order.totalPrice, 0),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب العملاء" }, { status: 500 });
  }
}