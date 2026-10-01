import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

async function findLeastBusyEmployee(districtId?: string) {
  const activeEmployees = await prisma.employee.findMany({
    where: { isActive: true, ...(districtId && { districtId }) },
  });
  if (activeEmployees.length === 0) return null;

  const loads = await Promise.all(
    activeEmployees.map(async (emp) => {
      const openOrders = await prisma.order.count({
        where: { employeeId: emp.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      });
      return { id: emp.id, openOrders };
    })
  );

  loads.sort((a, b) => a.openOrders - b.openOrders);
  return loads[0].id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carTypeId, serviceId, extras, districtId, plateNumber, location, date, time, customer, totalPrice } = body;

    if (!carTypeId || !serviceId || !customer?.phone || !location) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const customerRecord = await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: { name: customer.name },
      create: { name: customer.name, phone: customer.phone },
    });

    const assignedEmployeeId = await findLeastBusyEmployee(districtId);

    const order = await prisma.order.create({
      data: {
        customerId: customerRecord.id,
        carTypeId,
        serviceId,
        employeeId: assignedEmployeeId ?? undefined,
        districtId: districtId ?? undefined,
        plateNumber,
        locationLat: location.lat,
        locationLng: location.lng,
        locationText: location.address,
        scheduledDate: new Date(date),
        scheduledTime: time,
        totalPrice,
        extrasSnapshot: extras ?? [],
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في حفظ الطلب" }, { status: 500 });
  }
}