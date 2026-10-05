import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const store = await cookies();
  if (!store.get("admin_session")?.value) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const id = searchParams.get("id") ?? "";
  if ((kind !== "order" && kind !== "wash") || !id) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const photos = await prisma.taskPhoto.findMany({
    where: kind === "order" ? { orderId: id } : { washId: id },
    select: { id: true, stage: true, spot: true, url: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const info =
    kind === "order"
      ? await prisma.order.findUnique({
          where: { id },
          select: { customerCalledAt: true, completedAt: true, paymentMethod: true },
        })
      : await prisma.subscriptionWash.findUnique({
          where: { id },
          select: { customerCalledAt: true, completedAt: true },
        });

  return NextResponse.json({ photos, info });
}