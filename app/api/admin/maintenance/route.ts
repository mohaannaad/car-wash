import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getMaintenance } from "../../../../lib/maintenance";

export async function GET() {
  const m = await getMaintenance();
  return NextResponse.json({ enabled: m.on, message: m.message });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const enabled = Boolean(body.enabled);
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 300) : undefined;

    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: {
        maintenanceMode: enabled,
        ...(message !== undefined && { maintenanceMessage: message }),
      },
      create: {
        id: "singleton",
        maintenanceMode: enabled,
        maintenanceMessage: message ?? "",
      },
      select: { maintenanceMode: true, maintenanceMessage: true },
    });

    return NextResponse.json({ enabled: settings.maintenanceMode, message: settings.maintenanceMessage });
  } catch {
    return NextResponse.json({ error: "فشل في تحديث وضع الصيانة" }, { status: 500 });
  }
}
