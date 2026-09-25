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
    const { name, description, price, durationMinutes } = body;

    if (!name || !price || !durationMinutes) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        durationMinutes: Number(durationMinutes),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة" }, { status: 500 });
  }
}