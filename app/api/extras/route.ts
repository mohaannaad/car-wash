import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const extras = await prisma.extra.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(extras);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}