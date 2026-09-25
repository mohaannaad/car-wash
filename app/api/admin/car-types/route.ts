import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET: يجيب كل أنواع السيارات
export async function GET() {
  try {
    const carTypes = await prisma.carType.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(carTypes);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

// POST: يضيف نوع سيارة جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, imageUrl } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }

    const carType = await prisma.carType.create({
      data: {
        name: name.trim(),
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(carType, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في إضافة نوع السيارة" }, { status: 500 });
  }
}