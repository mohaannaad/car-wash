"use client";

import { useEffect, useState } from "react";

type RecentOrder = {
  id: string;
  customer: string;
  service: string;
  status: string;
  price: number;
};

type OverviewData = {
  ordersToday: number;
  ordersChangePercent: number | null;
  monthRevenue: number;
  revenueChangePercent: number | null;
  activeSubscriptions: number;
  newSubscriptionsThisWeek: number;
  ordersInProgress: number;
  recentOrders: RecentOrder[];
};

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  ON_THE_WAY: "الفريق في الطريق",
  IN_PROGRESS: "جاري التنفيذ",
  COMPLETED: "تم التنفيذ",
  CANCELLED: "ملغي",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-[#F4F7F8] text-text-secondary",
  CONFIRMED: "bg-primary-light text-primary",
  ON_THE_WAY: "bg-amber-50 text-amber-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  COMPLETED: "bg-emerald-50 text-emerald-600",
  CANCELLED: "bg-red-50 text-red-500",
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>;
  }

  const stats = [
    {
      label: "طلبات اليوم",
      value: String(data.ordersToday),
      change:
        data.ordersChangePercent === null
          ? "لا توجد بيانات كافية للمقارنة"
          : `${data.ordersChangePercent >= 0 ? "+" : ""}${data.ordersChangePercent}% عن أمس`,
      positive: data.ordersChangePercent === null || data.ordersChangePercent >= 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      ),
    },
    {
      label: "إجمالي الإيرادات (الشهر)",
      value: `${data.monthRevenue.toLocaleString("ar-EG")} ر.س`,
      change:
        data.revenueChangePercent === null
          ? "لا توجد بيانات كافية للمقارنة"
          : `${data.revenueChangePercent >= 0 ? "+" : ""}${data.revenueChangePercent}% عن الشهر الماضي`,
      positive: data.revenueChangePercent === null || data.revenueChangePercent >= 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "اشتراكات نشطة",
      value: String(data.activeSubscriptions),
      change: `+${data.newSubscriptionsThisWeek} اشتراكات هذا الأسبوع`,
      positive: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 6.6L21 10l-5 4.3L17.4 21 12 17.6 6.6 21 8 14.3 3 10l6.6-1.4z" />
        </svg>
      ),
    },
    {
      label: "طلبات قيد التنفيذ",
      value: String(data.ordersInProgress),
      change: data.ordersInProgress > 0 ? "تحتاج إلى متابعة" : "لا توجد طلبات معلّقة",
      positive: data.ordersInProgress === 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">نظرة عامة</h1>
        <p className="text-text-secondary text-sm">ملخص حي على أداء المشروع، يتحدث تلقائيًا كل 15 ثانية</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center">{stat.icon}</div>
            <div className="flex flex-col gap-1">
              <span className="text-text-secondary text-xs font-medium">{stat.label}</span>
              <span className="text-text-main text-2xl font-extrabold">{stat.value}</span>
            </div>
            <span className={`text-xs font-bold ${stat.positive ? "text-emerald-600" : "text-amber-600"}`}>{stat.change}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#EEF2F3]">
          <span className="text-text-main text-base font-extrabold">آخر الطلبات</span>
          <a href="/admin/orders" className="text-primary text-sm font-bold">عرض الكل</a>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">لا توجد طلبات بعد</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">رقم الطلب</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">العميل</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الخدمة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">السعر</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold" dir="ltr">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-text-main text-sm">{order.customer}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{order.service}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{order.price} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}