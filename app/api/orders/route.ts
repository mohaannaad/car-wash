import { NextResponse, after } from "next/server";
import { prisma } from "../../../lib/prisma";
import { notifyOrderCreated } from "../../../lib/smsEvents";
import { lockDistrict, pickEmployeeForSlot } from "../../../lib/capacity";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carTypeId, serviceId, extras, districtId, plateNumber, location, date, time, customer, totalPrice } = body;

    if (!carTypeId || !serviceId || !customer?.phone || !location || !date || !time) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const customerRecord = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: { name: customer.name },
      create: { name: customer.name, phone: customer.phone },
    });

    const result = await prisma.$transaction(
      async (tx) => {
        await lockDistrict(tx, districtId);
        const pick = await pickEmployeeForSlot(tx, districtId, new Date(date), time);
        if (pick.full) return { full: true as const };

        const created = await tx.order.create({
          data: {
            customerId: customerRecord.id,
            carTypeId,
            serviceId,
            employeeId: pick.employeeId ?? undefined,
            districtId: districtId ?? undefined,
            plateNumber,
            locationLat: location.lat,
            locationLng: location.lng,
            locationText: location.address,
            scheduledDate: new Date(date),
            scheduledTime: time,
            totalPrice,
            extrasSnapshot: extras ?? [],
          },
        });
        return { full: false as const, order: created };
      },
      { timeout: 15000 }
    );

    if (result.full) {
      return NextResponse.json(
        { error: "هذا الموعد اكتمل حجزه، من فضلك اختر موعدًا آخر", code: "SLOT_FULL" },
        { status: 409 }
      );
    }
    const order = result.order;

    after(() => notifyOrderCreated(order.id));

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في حفظ الطلب" }, { status: 500 });
  }
}