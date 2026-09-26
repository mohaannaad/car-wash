import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminToken } from "../../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "من فضلك اكتب الإيميل والباسورد" }, { status: 400 });
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "الإيميل أو الباسورد غلط" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH as string);
    if (!isValid) {
      return NextResponse.json({ error: "الإيميل أو الباسورد غلط" }, { status: 401 });
    }

    const token = await createAdminToken(email);

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "حصل خطأ، حاول تاني" }, { status: 500 });
  }
}