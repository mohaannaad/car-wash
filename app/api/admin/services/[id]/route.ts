import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, durationMinutes, isActive } = body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
        ...(isActive !== undefined && { isActive }),
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