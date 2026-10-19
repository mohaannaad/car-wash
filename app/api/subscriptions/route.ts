import { NextResponse, after } from "next/server";
import { prisma } from "../../../lib/prisma";
import { notifySubscriptionCreated } from "../../../lib/smsEvents";
import { lockDistrict, pickEmployeeForSlot } from "../../../lib/capacity";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, appointments, districtId, location, plateNumber, customer } = body;

    if (!packageId || !Array.isArray(appointments) || appointments.length === 0 || !customer?.phone || !location) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const customerRecord = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: { name: customer.name },
      create: { name: customer.name, phone: customer.phone },
    });

    const typedAppointments = appointments as { date: string; time: string }[];
    const result = await prisma.$transaction(
      async (tx) => {
        await lockDistrict(tx, districtId);

        const extraLoad = new Map<string, number>();
        const assignments: (string | null)[] = [];
        for (const a of typedAppointments) {
          const pick = await pickEmployeeForSlot(tx, districtId, new Date(a.date), a.time, extraLoad);
          if (pick.full) return { full: true as const, date: a.date, time: a.time };
          assignments.push(pick.employeeId);
          if (pick.employeeId) extraLoad.set(pick.employeeId, (extraLoad.get(pick.employeeId) ?? 0) + 1);
        }

        const created = await tx.subscription.create({
          data: {
            customerId: customerRecord.id,
            packageId,
            districtId: districtId ?? undefined,
            plateNumber,
            locationLat: location.lat,
            locationLng: location.lng,
            locationText: location.address,
            washes: {
              create: typedAppointments.map((a, index) => ({
                scheduledDate: new Date(a.date),
                scheduledTime: a.time,
                employeeId: assignments[index] ?? undefined,
              })),
            },
          },
        });
        return { full: false as const, subscription: created };
      },
      { timeout: 20000 }
    );

    if (result.full) {
      return NextResponse.json(
        {
          error: `الموعد ${result.date} - ${result.time} اكتمل حجزه، من فضلك اختر موعدًا آخر`,
          code: "SLOT_FULL",
        },
        { status: 409 }
      );
    }
    const subscription = result.subscription;

    after(() => notifySubscriptionCreated(subscription.id));

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في تفعيل الاشتراك" }, { status: 500 });
  }
}