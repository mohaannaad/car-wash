import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: { customer: true, package: true, washes: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = subscriptions.map((sub) => ({
      id: sub.id,
      customer: { name: sub.customer.name, phone: sub.customer.phone },
      package: { name: sub.package.name, price: sub.package.price },
      status: sub.status,
      washes: sub.washes
        .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
        .map((w) => ({ date: w.scheduledDate, time: w.scheduledTime, status: w.status })),
      washesTotal: sub.washes.length,
      washesCompleted: sub.washes.filter((w) => w.status === "COMPLETED").length,
      createdAt: sub.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الاشتراكات" }, { status: 500 });
  }
}