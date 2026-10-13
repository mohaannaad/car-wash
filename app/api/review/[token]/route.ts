import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { SPOTS } from "../../../../lib/photoSpots";

// صفحة عامة للعميل: بيانات الطلب + صور بعد الغسيل + التقييم (محمية بالتوكن الخاص بالطلب)

async function findOrder(token: string) {
  if (!token || token.length < 16) return null;
  const order = await prisma.order.findUnique({
    where: { reviewToken: token },
    include: {
      carType: true,
      employee: { select: { name: true } },
      review: true,
      photos: { where: { stage: "AFTER" }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!order || order.status !== "COMPLETED") return null;
  return order;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const order = await findOrder(token);
  if (!order) return NextResponse.json({ error: "الرابط غير صحيح" }, { status: 404 });

  const photos = SPOTS.flatMap((s) => {
    const p = order.photos.find((x) => x.spot === s.key);
    return p ? [{ id: p.id, url: p.url, label: s.label }] : [];
  });

  return NextResponse.json({
    code: `#${order.id.slice(-6).toUpperCase()}`,
    date: (order.completedAt ?? order.scheduledDate).toISOString(),
    carType: order.carType.name,
    employeeName: order.employee?.name ?? null,
    photos,
    review: order.review
      ? { rating: order.review.rating, comment: order.review.comment }
      : null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const order = await findOrder(token);
    if (!order) return NextResponse.json({ error: "الرابط غير صحيح" }, { status: 404 });

    if (order.review) {
      return NextResponse.json({ error: "تم إرسال التقييم لهذا الطلب من قبل" }, { status: 409 });
    }

    const body = await request.json();
    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "اختر تقييمًا من 1 إلى 5 نجوم" }, { status: 400 });
    }
    const comment =
      typeof body?.comment === "string" && body.comment.trim()
        ? body.comment.trim().slice(0, 500)
        : null;

    try {
      await prisma.review.create({
        data: { orderId: order.id, employeeId: order.employeeId, rating, comment },
      });
    } catch {
      // orderId فريد: لو اتبعت مرتين في نفس اللحظة
      return NextResponse.json({ error: "تم إرسال التقييم لهذا الطلب من قبل" }, { status: 409 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذر إرسال التقييم" }, { status: 500 });
  }
}
