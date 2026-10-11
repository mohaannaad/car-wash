import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prisma";
import { verifyAdminPassword } from "../../../../../lib/adminPassword";

// تغيير كلمة سر الأدمن من الإعدادات (محمي بكوكي الأدمن من الـ middleware)
export async function POST(request: Request) {
  try {
    const { oldPassword, newPassword, confirmPassword } = await request.json();

    if (
      typeof oldPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !oldPassword ||
      !newPassword
    ) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "كلمة السر الجديدة وتأكيدها غير متطابقين" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "كلمة السر الجديدة لازم تكون 8 أحرف على الأقل" }, { status: 400 });
    }

    if (newPassword === oldPassword) {
      return NextResponse.json({ error: "كلمة السر الجديدة لازم تختلف عن القديمة" }, { status: 400 });
    }

    const oldOk = await verifyAdminPassword(oldPassword);
    if (!oldOk) {
      return NextResponse.json({ error: "كلمة السر القديمة غير صحيحة" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminCredential.upsert({
      where: { id: "admin" },
      update: { passwordHash },
      create: { id: "admin", passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "فشل في تغيير كلمة السر" }, { status: 500 });
  }
}
