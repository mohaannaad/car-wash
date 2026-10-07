import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, originalPrice, durationMinutes, isActive, carTypeId } = body;

    // السعر قبل الخصم: undefined = بدون تغيير، فاضي/null = إلغاء الخصم
    let originalValue: number | null | undefined = undefined;
    if (originalPrice !== undefined) {
      originalValue =
        originalPrice === null || originalPrice === "" ? null : Number(originalPrice);

      if (originalValue !== null) {
        const effectivePrice =
          price !== undefined
            ? Number(price)
            : (await prisma.service.findUnique({ where: { id }, select: { price: true } }))?.price ?? 0;

        if (!Number.isFinite(originalValue) || originalValue <= effectivePrice) {
          return NextResponse.json(
            { error: "السعر قبل الخصم لازم يكون أكبر من السعر بعد الخصم" },
            { status: 400 }
          );
        }
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(originalValue !== undefined && { originalPrice: originalValue }),
        ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
        ...(isActive !== undefined && { isActive }),
        ...(carTypeId !== undefined && { carTypeId }),
      },
    });

    return NextResponse.json(service);
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
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}