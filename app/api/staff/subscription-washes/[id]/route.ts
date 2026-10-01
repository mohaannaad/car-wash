import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_session")?.value;
  if (!employeeId) return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const wash = await prisma.subscriptionWash.findUnique({ where: { id } });
    if (!wash || wash.employeeId !== employeeId) {
      return NextResponse.json({ error: "غير مسموح لك بتعديل هذه المهمة" }, { status: 403 });
    }

    const updated = await prisma.subscriptionWash.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 });
  }
}