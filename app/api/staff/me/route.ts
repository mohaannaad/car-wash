import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const employeeId = cookieStore.get("employee_session")?.value;

    if (!employeeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { district: { include: { city: true } } },
    });

    if (!employee) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      district: employee.district
        ? { name: employee.district.name, city: employee.district.city.name }
        : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}