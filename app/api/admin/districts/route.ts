import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, cityId } = body;
    if (!name || !cityId) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }
    const district = await prisma.district.create({ data: { name: name.trim(), cityId } });
    return NextResponse.json(district, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة" }, { status: 500 });
  }
}