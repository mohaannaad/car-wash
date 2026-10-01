import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      include: { districts: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}