import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, originalPrice, durationMinutes, carTypeId } = body;

    if (!name || !price || !durationMinutes || !carTypeId) {
      return NextResponse.json({ error: "البيانات ناقصة، لازم تحدد نوع السيارة" }, { status: 400 });
    }

    // السعر قبل الخصم (اختياري)
    const original =
      originalPrice === null || originalPrice === undefined || originalPrice === ""
        ? null
        : Number(originalPrice);

    if (original !== null && (!Number.isFinite(original) || original <= Number(price))) {
      return NextResponse.json(
        { error: "السعر قبل الخصم لازم يكون أكبر من السعر بعد الخصم" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        originalPrice: original,
        durationMinutes: Number(durationMinutes),
        carTypeId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة" }, { status: 500 });
  }
}