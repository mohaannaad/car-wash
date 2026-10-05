"use client";

import { useEffect, useState } from "react";
import TaskActions, { CallIconButton, paymentLabels } from "./_components/TaskActions";

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
  customerCalledAt: string | null;
  paymentMethod: string | null;
  when: "past" | "today" | "upcoming";
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

const isDone = (status: string) => status === "COMPLETED" || status === "CANCELLED";

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"today" | "upcoming">("today");

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

  const handleChanged = async () => {
    await loadOrders();
    window.dispatchEvent(new Event("staff-data-changed"));
  };

  const todayActive = orders.filter((o) => !isDone(o.status) && o.when !== "upcoming");
  const upcoming = orders.filter((o) => !isDone(o.status) && o.when === "upcoming");
  const doneToday = orders.filter((o) => isDone(o.status) && o.when === "today");

  const renderCard = (order: Order, locked: boolean) => (
    <div
      key={order.id}
      className={`bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)] ${
        locked ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!locked && <CallIconButton phone={order.customer.phone} />}
          <span className="text-text-main text-sm font-bold truncate">{order.customer.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {order.when === "past" && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">متأخر</span>
          )}
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>
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

      <TaskActions
        kind="order"
        id={order.id}
        status={order.status}
        customerCalledAt={order.customerCalledAt}
        phone={order.customer.phone}
        when={order.when}
        scheduledDate={order.scheduledDate}
        onChanged={handleChanged}
      />
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>;
  }

  return (
    <div className="p-5 flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-1 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
        <button
          onClick={() => setTab("today")}
          className={`py-2 rounded-lg text-sm font-bold transition-colors ${
            tab === "today" ? "bg-primary text-white" : "text-text-secondary"
          }`}
        >
          اليوم ({todayActive.length})
        </button>
        <button
          onClick={() => setTab("upcoming")}
          className={`py-2 rounded-lg text-sm font-bold transition-colors ${
            tab === "upcoming" ? "bg-primary text-white" : "text-text-secondary"
          }`}
        >
          القادمة ({upcoming.length})
        </button>
      </div>

      {tab === "today" ? (
        <>
          <div className="flex flex-col gap-3">
            {todayActive.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-text-secondary text-sm shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
                لا توجد طلبات لليوم
              </div>
            ) : (
              todayActive.map((order) => renderCard(order, false))
            )}
          </div>

          {doneToday.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-text-main text-sm font-bold">تم تنفيذها اليوم ({doneToday.length})</h2>
              {doneToday.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(16,24,40,0.05)] opacity-70"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-main text-sm font-bold">{order.customer.name}</span>
                    {order.paymentMethod && (
                      <span className="text-text-secondary text-[11px]">
                        الدفع: {paymentLabels[order.paymentMethod]}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-text-secondary text-sm shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
              لا توجد طلبات في الأيام القادمة
            </div>
          ) : (
            upcoming.map((order) => renderCard(order, true))
          )}
        </div>
      )}
    </div>
  );
}