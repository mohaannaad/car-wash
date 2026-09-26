"use client";

import { useEffect, useState } from "react";

type Subscription = {
  id: string;
  customer: { name: string; phone: string };
  package: { name: string; price: number };
  dayLabel: string;
  time: string;
  status: string;
  washesTotal: number;
  washesCompleted: number;
};

const statusLabels: Record<string, string> = {
  ACTIVE: "نشط",
  CANCELLED: "ملغي",
  EXPIRED: "منتهي",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600",
  CANCELLED: "bg-red-50 text-red-500",
  EXPIRED: "bg-[#F4F7F8] text-text-secondary",
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions");
      setSubscriptions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الاشتراكات</h1>
        <p className="text-text-secondary text-sm">كل الاشتراكات الشهرية ومواعيدها</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">مفيش اشتراكات لسه</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">العميل</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الباقة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الموعد الأسبوعي</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الغسلات المنفذة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-text-main text-sm font-bold">{sub.customer.name}</span>
                      <span className="text-text-secondary text-xs" dir="ltr">{sub.customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-text-main text-sm font-bold">{sub.package.name}</span>
                      <span className="text-text-secondary text-xs">{sub.package.price} ر.س</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{sub.dayLabel} - {sub.time}</td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{sub.washesCompleted} / {sub.washesTotal}</td>
                  <td className="px-6 py-4">
                    <select
                      value={sub.status}
                      onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer ${statusStyles[sub.status]}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}