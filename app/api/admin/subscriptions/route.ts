import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
 const subscriptions = await prisma.subscription.findMany({
  include: { customer: true, package: true, washes: { include: { employee: true } }, district: { include: { city: true } } },
  orderBy: { createdAt: "desc" },
});

    const formatted = subscriptions.map((sub) => ({
  id: sub.id,
  customer: { name: sub.customer.name, phone: sub.customer.phone },
  package: { name: sub.package.name, price: sub.package.price },
  plateNumber: sub.plateNumber,
  locationText: sub.locationText,
  area: sub.district ? `${sub.district.city.name} - ${sub.district.name}` : "غير محدد",
  status: sub.status,
      washes: sub.washes
  .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  .map((w) => ({ date: w.scheduledDate, time: w.scheduledTime, status: w.status, employeeName: w.employee?.name ?? "غير محدد" })),
      washesTotal: sub.washes.length,
      washesCompleted: sub.washes.filter((w) => w.status === "COMPLETED").length,
      createdAt: sub.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الاشتراكات" }, { status: 500 });
  }
}