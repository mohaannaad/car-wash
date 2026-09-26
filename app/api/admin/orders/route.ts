import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true, carType: true, service: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الطلبات" }, { status: 500 });
  }
}