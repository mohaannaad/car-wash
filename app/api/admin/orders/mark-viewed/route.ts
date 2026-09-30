import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST() {
  try {
    await prisma.order.updateMany({
      where: { viewed: false },
      data: { viewed: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}