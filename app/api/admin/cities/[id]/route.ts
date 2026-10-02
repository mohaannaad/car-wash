import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, isActive } = body;

    const city = await prisma.city.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // لو المدينة اتوقفت، نوقف كل الأحياء التابعة ليها، وكل الموظفين في الأحياء دي
    if (isActive === false) {
      const districts = await prisma.district.findMany({ where: { cityId: id } });
      await prisma.district.updateMany({ where: { cityId: id }, data: { isActive: false } });
      await prisma.employee.updateMany({
        where: { districtId: { in: districts.map((d) => d.id) } },
        data: { isActive: false },
      });
    }

    return NextResponse.json(city);
  } catch (error) {
    return NextResponse.json({ error: "فشل في التعديل" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.city.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}