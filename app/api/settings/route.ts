import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
    return NextResponse.json({
      workStartHour: settings.workStartHour,
      workEndHour: settings.workEndHour,
      companyName: settings.companyName,
      supportPhone: settings.supportPhone,
      supportEmail: settings.supportEmail,
      privacyPolicy: settings.privacyPolicy,
      termsConditions: settings.termsConditions,
    });
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الإعدادات" }, { status: 500 });
  }
}