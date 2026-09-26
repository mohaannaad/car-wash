"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customer: { name: string; phone: string };
  carType: { name: string };
  service: { name: string };
  locationText: string;
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number;
  status: string;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };
const handleDelete = async (id: string) => {
  if (!confirm("متأكد إنك عايز تحذف الطلب ده نهائيًا؟")) return;
  setOrders((prev) => prev.filter((o) => o.id !== id));
  await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
};

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الطلبات</h1>
        <p className="text-text-secondary text-sm">كل طلبات العملاء وحالتها</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">مفيش طلبات لسه</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">رقم الطلب</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">العميل</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">السيارة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الخدمة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">العنوان</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الموعد</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">السعر</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
<th className="px-6 py-3 text-text-secondary text-xs font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold" dir="ltr">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-text-main text-sm font-bold">{order.customer.name}</span>
                      <span className="text-text-secondary text-xs" dir="ltr">{order.customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{order.carType.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{order.service.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-xs max-w-[200px] truncate" title={order.locationText}>
  {order.locationText}
</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">
                    {new Date(order.scheduledDate).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })} - {order.scheduledTime}
                  </td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{order.totalPrice} ر.س</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer ${statusStyles[order.status]}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
  <button
    onClick={() => handleDelete(order.id)}
    className="text-red-500 text-xs font-bold hover:underline"
  >
    حذف
  </button>
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