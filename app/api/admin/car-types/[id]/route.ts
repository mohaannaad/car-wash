import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// PATCH: يعدّل نوع سيارة موجود
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, imageUrl, isActive } = body;

    const carType = await prisma.carType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(carType);
  } catch (error) {
    return NextResponse.json({ error: "فشل في التعديل" }, { status: 500 });
  }
}

// DELETE: يحذف نوع سيارة
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.carType.delete({ where: { id } });
    return NextResponse.json({ success: true });
 } catch (error: any) {
  console.log("=== DELETE CAR TYPE ERROR ===");
  console.log("Error code:", error.code);
  console.log("Error message:", error.message);
  console.log("==============================");

  if (error.code === "P2025") {
      return NextResponse.json({ error: "نوع السيارة ده مش موجود أصلًا، جرّب تحدّث الصفحة" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "مينفعش تحذف النوع ده لأنه مرتبط بطلبات موجودة في الداتابيز، استخدم زرار الإيقاف بدل الحذف" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "فشل في الحذف، حاول تاني" }, { status: 500 });
  }
}