import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

async function assignEmployeesForWashes(count: number) {
  const activeEmployees = await prisma.employee.findMany({ where: { isActive: true } });
  if (activeEmployees.length === 0) return Array(count).fill(null);

  const loads = await Promise.all(
    activeEmployees.map(async (emp) => {
      const openOrders = await prisma.order.count({
        where: { employeeId: emp.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      });
      const openWashes = await prisma.subscriptionWash.count({
        where: { employeeId: emp.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      });
      return { id: emp.id, load: openOrders + openWashes };
    })
  );

  // كل مرة بناخد أقل موظف تحميل، ونزود تحميله مؤقتًا عشان لو في أكتر من يوم في نفس الطلب، يتوزعوا بينهم بدل ما ياخدهم موظف واحد
  const assignments: string[] = [];
  for (let i = 0; i < count; i++) {
    loads.sort((a, b) => a.load - b.load);
    assignments.push(loads[0].id);
    loads[0].load += 1;
  }
  return assignments;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, appointments, location, plateNumber, customer } = body;

    if (!packageId || !Array.isArray(appointments) || appointments.length === 0 || !customer?.phone || !location) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const customerRecord = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: { name: customer.name },
      create: { name: customer.name, phone: customer.phone },
    });

    const typedAppointments = appointments as { date: string; time: string }[];
    const employeeAssignments = await assignEmployeesForWashes(typedAppointments.length);

    const subscription = await prisma.subscription.create({
      data: {
        customerId: customerRecord.id,
        packageId,
        plateNumber,
        locationLat: location.lat,
        locationLng: location.lng,
        locationText: location.address,
        washes: {
          create: typedAppointments.map((a, index) => ({
            scheduledDate: new Date(a.date),
            scheduledTime: a.time,
            employeeId: employeeAssignments[index] ?? undefined,
          })),
        },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في تفعيل الاشتراك" }, { status: 500 });
  }
}