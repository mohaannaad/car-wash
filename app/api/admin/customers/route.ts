import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: { select: { totalPrice: true } },
      },
    });

    const result = customers.map((c) => {
      const ordersCount = c.orders.length;
      const totalSpent = c.orders.reduce((sum, o) => sum + o.totalPrice, 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        createdAt: c.createdAt,
        ordersCount,
        totalSpent,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب العملاء" }, { status: 500 });
  }
}