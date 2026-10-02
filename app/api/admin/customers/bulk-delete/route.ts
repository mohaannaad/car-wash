import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST() {
  try {
    const result = await prisma.customer.deleteMany({});
    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (error) {
    return NextResponse.json({ error: "فشل في حذف العملاء" }, { status: 500 });
  }
}