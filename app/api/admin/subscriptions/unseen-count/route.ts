import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    const count = await prisma.subscription.count({ where: { viewed: false } });
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب العدد" }, { status: 500 });
  }
}