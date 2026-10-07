import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const extras = await prisma.extra.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(extras);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, originalPrice } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
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

    const extra = await prisma.extra.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        originalPrice: original,
      },
    });

    return NextResponse.json(extra, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة" }, { status: 500 });
  }
}