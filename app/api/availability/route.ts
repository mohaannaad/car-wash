import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getFullTimes } from "../../../lib/capacity";

// GET /api/availability?districtId=...&date=YYYY-MM-DD
// بيرجّع المواعيد المكتملة (full) في اليوم ده للمنطقة دي
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get("districtId") || undefined;
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "تاريخ غير صالح" }, { status: 400 });
  }

  try {
    const full = await getFullTimes(prisma, districtId, new Date(date));
    return NextResponse.json({ full });
  } catch {
    return NextResponse.json({ full: [] });
  }
}
