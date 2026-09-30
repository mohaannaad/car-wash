import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "من فضلك اكتب رقم الجوال والباسورد" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({ where: { phone: phone.trim() } });

    if (!employee || !employee.password || !employee.isActive) {
      return NextResponse.json({ error: "رقم الجوال أو الباسورد غير صحيح" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) {
      return NextResponse.json({ error: "رقم الجوال أو الباسورد غير صحيح" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, name: employee.name });
    response.cookies.set("employee_session", employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}