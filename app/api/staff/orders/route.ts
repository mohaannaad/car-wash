import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_session")?.value;
  if (!employeeId) return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { employeeId },
    include: { customer: true, carType: true, service: true },
    orderBy: { scheduledDate: "asc" },
  });

  return NextResponse.json(orders);
}