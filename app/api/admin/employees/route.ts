import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, role } = body;

    if (!name || !phone || !role) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: { name: name.trim(), phone: phone.trim(), role: role.trim() },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة، تأكد إن رقم الجوال مش مستخدم قبل كده" }, { status: 500 });
  }
}