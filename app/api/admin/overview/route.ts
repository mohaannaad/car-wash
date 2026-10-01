import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const monthStart = startOfMonth(now);
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [
      ordersToday,
      ordersYesterday,
      monthOrders,
      lastMonthOrders,
      activeSubscriptions,
      newSubscriptionsThisWeek,
      ordersInProgress,
      recentOrdersRaw,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
      prisma.order.findMany({ where: { createdAt: { gte: monthStart } }, select: { totalPrice: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } }, select: { totalPrice: true } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({
        where: { status: "ACTIVE", createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.order.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
      prisma.order.findMany({
        include: { customer: true, service: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const ordersChangePercent = ordersYesterday === 0 ? null : Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100);
    const revenueChangePercent = lastMonthRevenue === 0 ? null : Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      customer: o.customer.name,
      service: o.service.name,
      status: o.status,
      price: o.totalPrice,
    }));

    return NextResponse.json({
      ordersToday,
      ordersChangePercent,
      monthRevenue,
      revenueChangePercent,
      activeSubscriptions,
      newSubscriptionsThisWeek,
      ordersInProgress,
      recentOrders,
    });
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الإحصائيات" }, { status: 500 });
  }
}