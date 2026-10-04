import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الإعدادات" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { companyName, supportPhone, supportEmail, privacyPolicy, termsConditions, workStartHour, workEndHour } = body;

    if (
      workStartHour !== undefined &&
      workEndHour !== undefined &&
      Number(workStartHour) >= Number(workEndHour)
    ) {
      return NextResponse.json({ error: "ساعة البداية لازم تكون قبل ساعة النهاية" }, { status: 400 });
    }

    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {
        ...(companyName !== undefined && { companyName }),
        ...(supportPhone !== undefined && { supportPhone }),
        ...(supportEmail !== undefined && { supportEmail }),
        ...(privacyPolicy !== undefined && { privacyPolicy }),
        ...(termsConditions !== undefined && { termsConditions }),
        ...(workStartHour !== undefined && { workStartHour: Number(workStartHour) }),
        ...(workEndHour !== undefined && { workEndHour: Number(workEndHour) }),
      },
      create: {
        id: "singleton",
        companyName,
        supportPhone,
        supportEmail,
        privacyPolicy,
        termsConditions,
        workStartHour: workStartHour !== undefined ? Number(workStartHour) : undefined,
        workEndHour: workEndHour !== undefined ? Number(workEndHour) : undefined,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "فشل في حفظ الإعدادات" }, { status: 500 });
  }
}