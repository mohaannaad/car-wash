import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, washCount, serviceLabel, price, originalPrice, badge, features } = body;

    if (!name || !washCount || !price || !originalPrice) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const pkg = await prisma.package.create({
      data: {
        name: name.trim(),
        washCount: Number(washCount),
        serviceLabel: serviceLabel?.trim() || "",
        price: Number(price),
        originalPrice: Number(originalPrice),
        badge: badge?.trim() || null,
        features: Array.isArray(features) ? features : [],
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في الإضافة" }, { status: 500 });
  }
}