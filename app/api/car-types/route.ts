import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const carTypes = await prisma.carType.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(carTypes);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}