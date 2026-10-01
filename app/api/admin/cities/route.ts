import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      include: { districts: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ error: "اسم المدينة مطلوب" }, { status: 400 });
    }
    const city = await prisma.city.create({ data: { name: name.trim() } });
    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة" }, { status: 500 });
  }
}