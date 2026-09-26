import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carTypeId, serviceId, extras, plateNumber, location, date, time, customer, totalPrice } = body;

    if (!carTypeId || !serviceId || !customer?.phone || !location) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const customerRecord = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: { name: customer.name },
      create: { name: customer.name, phone: customer.phone },
    });

    const order = await prisma.order.create({
      data: {
        customerId: customerRecord.id,
        carTypeId,
        serviceId,
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في حفظ الطلب" }, { status: 500 });
  }
}