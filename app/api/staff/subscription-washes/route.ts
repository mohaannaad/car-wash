import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_session")?.value;
  if (!employeeId) return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });

  const washes = await prisma.subscriptionWash.findMany({
    where: { employeeId },
    include: {
      subscription: {
        include: { customer: true, package: true },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

    const formatted = washes.map((w) => ({
    id: w.id,
    status: w.status,
    scheduledDate: w.scheduledDate,
    scheduledTime: w.scheduledTime,
    packageName: w.subscription.package.name,
    customer: { name: w.subscription.customer.name, phone: w.subscription.customer.phone },
    locationText: w.subscription.locationText,
    locationLat: w.subscription.locationLat,
    locationLng: w.subscription.locationLng,
    plateNumber: w.subscription.plateNumber,
  }));

  return NextResponse.json(formatted);
}