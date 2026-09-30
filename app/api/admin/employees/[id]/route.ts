import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, role, isActive, password } = body;

    const data: Record<string, unknown> = {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(role !== undefined && { role: role.trim() }),
      ...(isActive !== undefined && { isActive }),
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const employee = await prisma.employee.update({ where: { id }, data });
    const { password: _pw, ...safeEmployee } = employee;
    return NextResponse.json(safeEmployee);
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
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}