import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        district: { include: { city: true } },
        shifts: {
          where: {
            endedAt: null,
            startedAt: { gte: new Date(Date.now() - 16 * 60 * 60 * 1000) },
          },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });
    const safe = employees.map(({ password, shifts, ...rest }) => ({
      ...rest,
      onShift: shifts.length > 0,
    }));
    return NextResponse.json(safe);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
       const { name, phone, role, password, districtId } = body;

    if (!name || !phone || !role || !password) {
      return NextResponse.json({ error: "البيانات ناقصة، لازم تحط باسورد للموظف" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.create({
      data: { name: name.trim(), phone: phone.trim(), role: role.trim(), password: hashedPassword, districtId: districtId || undefined },
    });

    const { password: _pw, ...safeEmployee } = employee;
    return NextResponse.json(safeEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة، تأكد إن رقم الجوال مش مستخدم قبل كده" }, { status: 500 });
  }
}