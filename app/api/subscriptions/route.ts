import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, appointments, customer } = body;

    if (!packageId || !Array.isArray(appointments) || appointments.length === 0 || !customer?.phone) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const customerRecord = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: { name: customer.name },
      create: { name: customer.name, phone: customer.phone },
    });

    const subscription = await prisma.subscription.create({
      data: {
        customerId: customerRecord.id,
        packageId,
        washes: {
          create: (appointments as { date: string; time: string }[]).map((a) => ({
            scheduledDate: new Date(a.date),
            scheduledTime: a.time,
          })),
        },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في تفعيل الاشتراك" }, { status: 500 });
  }
}