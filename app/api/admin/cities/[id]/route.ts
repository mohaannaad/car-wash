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
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "لا يمكن حذف المدينة لأنها مرتبطة بأحياء أو طلبات، أوقفها بدلًا من حذفها" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}