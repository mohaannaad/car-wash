import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// يتأكد من كلمة سر الأدمن:
// - لو الأدمن غيّرها من الداشبورد: نقارن بالنسخة المشفّرة في الداتابيز
// - غير كده: نقارن بـ ADMIN_PASSWORD من إعدادات Vercel
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (typeof password !== "string" || password.length === 0) return false;

  try {
    const cred = await prisma.adminCredential.findUnique({ where: { id: "admin" } });
    if (cred) return await bcrypt.compare(password, cred.passwordHash);
  } catch {
    // الجدول لسه متعملش (قبل الـ migration): نرجع لباسورد الإعدادات
  }

  const envPassword = process.env.ADMIN_PASSWORD ?? "";
  return envPassword.length > 0 && safeEqual(password, envPassword);
}
