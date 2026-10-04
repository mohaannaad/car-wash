import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const carTypeId = searchParams.get("carTypeId");

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(carTypeId && { carTypeId }),
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}