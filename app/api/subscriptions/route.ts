import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, dayOfWeek, time, scheduleDates, customer } = body;

    if (!packageId || dayOfWeek === undefined || !time || !customer?.phone) {
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
        dayOfWeek,
        time,
        washes: {
          create: (scheduleDates as string[]).map((date) => ({
            scheduledDate: new Date(date),
          })),
        },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في تفعيل الاشتراك" }, { status: 500 });
  }
}