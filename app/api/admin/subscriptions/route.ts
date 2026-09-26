import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const weekDayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        customer: true,
        package: true,
        washes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = subscriptions.map((sub: {
  id: string;
  customer: { name: string; phone: string };
  package: { name: string; price: number };
  dayOfWeek: number;
  time: string;
  status: string;
  washes: { status: string }[];
  createdAt: Date;
}) => ({
      id: sub.id,
      customer: { name: sub.customer.name, phone: sub.customer.phone },
      package: { name: sub.package.name, price: sub.package.price },
      dayLabel: weekDayNames[sub.dayOfWeek],
      time: sub.time,
      status: sub.status,
      washesTotal: sub.washes.length,
     washesCompleted: sub.washes.filter((w: { status: string }) => w.status === "COMPLETED").length,
      createdAt: sub.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الاشتراكات" }, { status: 500 });
  }
}