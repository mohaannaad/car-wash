"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customer: { name: string; phone: string };
  carType: { name: string };
  service: { name: string };
  plateNumber: string;
  locationText: string;
  locationLat: number;
  locationLng: number;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
};

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  ON_THE_WAY: "في الطريق",
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

const nextStatusMap: Record<string, string | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "ON_THE_WAY",
  ON_THE_WAY: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (id: string, currentStatus: string) => {
    const next = nextStatusMap[currentStatus];
    if (!next) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    await fetch(`/api/staff/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  };

  const activeOrders = orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED");
  const pastOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

  if (loading) {
    return <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>;
  }

  return (
    <div className="p-5 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-text-main text-sm font-bold">الطلبات الحالية ({activeOrders.length})</h2>
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-text-secondary text-sm shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            لا توجد طلبات حالية موكلة لك
          </div>
        ) : (
          activeOrders.map((order) => {
            const next = nextStatusMap[order.status];
            const nextLabel = next ? statusLabels[next] : null;
            return (
              <div key={order.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-text-main text-sm font-bold">{order.customer.name}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
               <div className="flex flex-col gap-1 text-xs text-text-secondary">
  <span>{order.carType.name} · {order.service.name}</span>
  <span dir="ltr" className="text-right">لوحة: {order.plateNumber}</span>
  <a
    href={`https://www.google.com/maps/search/?api=1&query=${order.locationLat}%2C${order.locationLng}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 text-primary font-bold"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
    {order.locationText}
  </a>
                  <span>
                    {new Date(order.scheduledDate).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })} - {order.scheduledTime}
                  </span>
                  <span dir="ltr" className="text-right">{order.customer.phone}</span>
                </div>
                {nextLabel && (
                  <button onClick={() => handleAdvanceStatus(order.id, order.status)} className="w-full py-2.5 rounded-xl font-bold text-white text-sm bg-primary">
                    تحديث الحالة إلى: {nextLabel}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {pastOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-text-main text-sm font-bold">طلبات سابقة ({pastOrders.length})</h2>
          {pastOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(16,24,40,0.05)] opacity-70">
              <span className="text-text-main text-sm font-bold">{order.customer.name}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}