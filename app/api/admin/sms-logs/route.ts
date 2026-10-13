import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// سجل رسائل SMS (الأحدث أولاً). ?orderId= لعرض رسائل طلب معيّن
export async function GET(req: Request) {
  try {
    const orderId = new URL(req.url).searchParams.get("orderId");
    const logs = await prisma.smsLog.findMany({
      where: orderId ? { orderId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        orderId: true,
        washId: true,
        type: true,
        phone: true,
        status: true,
        error: true,
        createdAt: true,
      },
    });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: "فشل في جلب الرسائل" }, { status: 500 });
  }
}
