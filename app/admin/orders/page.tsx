"use client";

import { useEffect, useState } from "react";
import { SPOTS } from "../../../lib/photoSpots";
import { SMS_TYPE_LABELS } from "../../../lib/smsLabels";

type Order = {
  id: string;
  customer: { name: string; phone: string } | null;
  carType: { name: string };
  service: { name: string };
  plateNumber: string;
  extrasSnapshot: { id: string; name: string; price: number }[] | null;
  locationText: string;
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number;
  status: string;
  employeeId: string | null;
  district: { name: string; city: { name: string } } | null;
  createdAt: string;
  paymentMethod?: string | null;
  rejectionReason?: string | null;
  callOutcome?: string | null;
  review?: { rating: number; comment: string | null } | null;
};

type Employee = { id: string; name: string; isActive: boolean };

type Photo = { id: string; stage: string; spot: string; url: string; createdAt: string };
type PhotoInfo = {
  customerCalledAt: string | null;
  completedAt: string | null;
  paymentMethod?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
} | null;

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

const paymentLabels: Record<string, string> = {
  CASH: "كاش",
  TRANSFER: "تحويل",
  CARD: "تحويل بنكي",
};

function formatSentAt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("ar-EG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function PhotosModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [info, setInfo] = useState<PhotoInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/photos?kind=order&id=${order.id}`);
        if (res.ok) {
          const data = await res.json();
          setPhotos(data.photos || []);
          setInfo(data.info || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [order.id]);

  const payment = info?.paymentMethod || order.paymentMethod;
  const rejection = info?.rejectionReason || order.rejectionReason;

  const renderStage = (stage: "BEFORE" | "AFTER", title: string) => {
    const list = photos.filter((p) => p.stage === stage);
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-text-main text-sm font-bold">
          {title} <span className="text-text-secondary font-normal">({list.length}/{SPOTS.length})</span>
        </h3>
        {list.length === 0 ? (
          <div className="text-text-secondary text-xs bg-[#F4F7F8] rounded-xl p-4 text-center">لا توجد صور</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPOTS.map((s) => {
              const p = list.find((x) => x.spot === s.key);
              if (!p) return null;
              return (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={s.label} className="w-full aspect-[4/3] object-cover rounded-xl bg-[#F4F7F8]" />
                  <span className="text-text-main text-xs font-bold">{s.label}</span>
                  <span className="text-text-secondary text-[11px]" dir="ltr" style={{ textAlign: "right" }}>
                    {formatSentAt(p.createdAt)}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-text-main text-lg font-extrabold">
            تفاصيل الطلب <span dir="ltr">#{order.id.slice(-6).toUpperCase()}</span>
          </h2>
          <button onClick={onClose} className="text-text-secondary text-sm font-bold hover:text-red-500">
            إغلاق
          </button>
        </div>

        {rejection && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-red-600 text-sm font-bold">مرفوض من الموظف</span>
            <span className="text-red-500 text-sm leading-6">السبب: {rejection}</span>
            {info?.rejectedAt && (
              <span className="text-red-400 text-xs">{formatSentAt(info.rejectedAt)}</span>
            )}
          </div>
        )}

        {order.review && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-amber-700 text-sm font-bold">
              تقييم العميل: {"★".repeat(order.review.rating)}
              {"☆".repeat(5 - order.review.rating)} ({order.review.rating}/5)
            </span>
            {order.review.comment && (
              <span className="text-amber-700 text-sm leading-6">{order.review.comment}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#F4F7F8] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-text-secondary">اتصال الموظف بالعميل</span>
            <span className="text-text-main font-bold">
              {info?.customerCalledAt ? formatSentAt(info.customerCalledAt) : "—"}
            </span>
          </div>
          <div className="bg-[#F4F7F8] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-text-secondary">وقت الإنهاء</span>
            <span className="text-text-main font-bold">
              {info?.completedAt ? formatSentAt(info.completedAt) : "—"}
            </span>
          </div>
          <div className="bg-[#F4F7F8] rounded-xl p-3 flex flex-col gap-1">
            <span className="text-text-secondary">طريقة الدفع</span>
            <span className="text-text-main font-bold">{payment ? paymentLabels[payment] || payment : "—"}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : (
          <>
            {renderStage("BEFORE", "قبل التنفيذ")}
            {renderStage("AFTER", "بعد التنفيذ")}
          </>
        )}
      </div>
    </div>
  );
}

type SmsLogRow = {
  id: string;
  type: string;
  phone: string;
  status: string;
  error: string | null;
  createdAt: string;
};

// سجل رسائل SMS الخاصة بطلب + إعادة الإرسال يدوياً
function SmsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [logs, setLogs] = useState<SmsLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/sms-logs?orderId=${order.id}`);
      if (res.ok) setLogs(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const resend = async (log: SmsLogRow) => {
    if (!confirm("إعادة إرسال هذه الرسالة للعميل؟")) return;
    setBusyId(log.id);
    try {
      const res = await fetch(`/api/admin/sms-logs/${log.id}/resend`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "تعذر إعادة الإرسال");
      }
    } finally {
      setBusyId(null);
      await load();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-text-main text-lg font-extrabold">
            رسائل الطلب <span dir="ltr">#{order.id.slice(-6).toUpperCase()}</span>
          </h2>
          <button onClick={onClose} className="text-text-secondary text-sm font-bold hover:text-red-500">
            إغلاق
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-text-secondary text-sm bg-[#F4F7F8] rounded-xl">
            لا توجد رسائل مرسلة لهذا الطلب بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right border-b border-[#EEF2F3]">
                  <th className="px-3 py-2 text-text-secondary text-xs font-bold whitespace-nowrap">نوع الرسالة</th>
                  <th className="px-3 py-2 text-text-secondary text-xs font-bold whitespace-nowrap">رقم الجوال</th>
                  <th className="px-3 py-2 text-text-secondary text-xs font-bold whitespace-nowrap">وقت الإرسال</th>
                  <th className="px-3 py-2 text-text-secondary text-xs font-bold whitespace-nowrap">الحالة</th>
                  <th className="px-3 py-2 text-text-secondary text-xs font-bold whitespace-nowrap">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-[#EEF2F3]">
                    <td className="px-3 py-3 text-text-main text-sm font-bold whitespace-nowrap">
                      {SMS_TYPE_LABELS[log.type] ?? log.type}
                    </td>
                    <td className="px-3 py-3 text-text-secondary text-xs whitespace-nowrap" dir="ltr">{log.phone}</td>
                    <td className="px-3 py-3 text-text-secondary text-xs whitespace-nowrap">{formatSentAt(log.createdAt)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        title={log.error ?? undefined}
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          log.status === "SENT" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                        }`}
                      >
                        {log.status === "SENT" ? "تم الإرسال" : "فشل الإرسال"}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button
                        onClick={() => resend(log)}
                        disabled={busyId === log.id}
                        className="text-primary text-xs font-bold px-3 py-1.5 rounded-full bg-primary-light disabled:opacity-50"
                      >
                        {busyId === log.id ? "جارٍ الإرسال..." : "إعادة إرسال"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// "16:30" -> "04:30 م" (نفس صيغة وقت الحجز)
function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "م" : "ص";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}

function RescheduleModal({
  order,
  onClose,
  onDone,
}: {
  order: Order;
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!date || !time) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_reschedule", date, time: to12h(time) }),
      });
      if (!res.ok) {
        alert("تعذر اعتماد الموعد الجديد، حاول مرة أخرى");
        return;
      }
      onDone();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-text-main text-lg font-extrabold">
          اعتماد موعد جديد <span dir="ltr">#{order.id.slice(-6).toUpperCase()}</span>
        </h2>
        <p className="text-text-secondary text-xs leading-6">
          بعد الاعتماد يبقى الطلب بنفس الرقم وتُرسل رسالة تغيير الموعد للعميل تلقائيًا.
        </p>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-text-main">
          التاريخ الجديد
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-[#E4E7EC] rounded-xl p-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-text-main">
          الوقت الجديد
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border border-[#E4E7EC] rounded-xl p-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={submit}
            disabled={busy || !date || !time}
            className={`py-2.5 rounded-xl font-bold text-white text-sm ${
              busy || !date || !time ? "bg-disabled cursor-not-allowed" : "bg-primary"
            }`}
          >
            {busy ? "جارٍ الاعتماد..." : "اعتماد وإرسال الرسالة"}
          </button>
          <button onClick={onClose} className="py-2.5 rounded-xl font-bold text-text-main text-sm bg-[#F4F7F8]">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [photosOrder, setPhotosOrder] = useState<Order | null>(null);
  const [rescheduleOrder, setRescheduleOrder] = useState<Order | null>(null);
  const [smsOrder, setSmsOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await fetch("/api/admin/employees");
      setEmployees(await res.json());
    } catch {
      // تجاهل
    }
  };

  const markAllViewed = async () => {
    await fetch("/api/admin/orders/mark-viewed", { method: "POST" });
  };

  useEffect(() => {
    loadOrders();
    loadEmployees();
    markAllViewed();
    const interval = setInterval(() => {
      loadOrders();
      markAllViewed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  // اعتماد/رفض طلبات المندوب (تغيير موعد / إلغاء)
  const requestAction = async (id: string, action: "approve_cancel" | "dismiss_request", question: string) => {
    if (!confirm(question)) return;
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) alert("تعذر تنفيذ الإجراء، حاول مرة أخرى");
    await loadOrders();
  };

  const handleEmployeeChange = async (id: string, employeeId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, employeeId } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف الطلب نهائيًا؟")) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
  };

  const handlePaymentChange = async (order: Order, newMethod: string) => {
    if (newMethod === order.paymentMethod) return;

    const oldLabel = order.paymentMethod ? paymentLabels[order.paymentMethod] : "غير محددة";
    const newLabel = paymentLabels[newMethod];
    const serial = order.id.slice(-6).toUpperCase();

    if (!confirm(`هل أنت متأكد من تغيير طريقة الدفع للطلب #${serial} من "${oldLabel}" إلى "${newLabel}"؟`)) {
      return;
    }

    const previous = order.paymentMethod ?? null;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, paymentMethod: newMethod } : o)));

    const res = await fetch(`/api/admin/orders/${order.id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod: newMethod }),
    });

    if (!res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, paymentMethod: previous } : o)));
      alert("تعذر تغيير طريقة الدفع، حاول مرة أخرى");
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (!normalizedQuery) return true;
    const serial = order.id.slice(-6).toLowerCase();
    const phone = (order.customer?.phone ?? "").toLowerCase();
    return serial.includes(normalizedQuery) || phone.includes(normalizedQuery);
  });

  const hasDetails = (o: Order) =>
    o.status === "ON_THE_WAY" ||
    o.status === "IN_PROGRESS" ||
    o.status === "COMPLETED" ||
    (o.status === "CANCELLED" && !!o.rejectionReason);

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الطلبات</h1>
        <p className="text-text-secondary text-sm">كل طلبات العملاء وحالتها، وتتحدث تلقائيًا كل 10 ثوانٍ</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم الطلب (السيريال) أو رقم جوال العميل"
          className="flex-1 text-sm outline-none placeholder:text-[#98A2B3]"
          dir="ltr"
          style={{ textAlign: "right" }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-text-secondary text-xs font-bold hover:text-red-500">
            مسح
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">
            {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد نتائج مطابقة للبحث"}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">رقم الطلب</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">تاريخ الإرسال</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">العميل</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">السيارة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">رقم اللوحة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الخدمة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الخدمات الإضافية</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">المنطقة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">العنوان</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الموعد</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">السعر</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الدفع</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الموظف المسؤول</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">التقييم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">التفاصيل</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap" dir="ltr">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-text-secondary text-xs whitespace-nowrap" dir="ltr">{formatSentAt(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-text-main text-sm font-bold">{order.customer?.name ?? "عميل محذوف"}</span>
                      <span className="text-text-secondary text-xs" dir="ltr">{order.customer?.phone ?? ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm whitespace-nowrap">{order.carType.name}</td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap" dir="ltr">{order.plateNumber}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm whitespace-nowrap">{order.service.name}</td>
                  <td className="px-6 py-4">
                    {order.extrasSnapshot && order.extrasSnapshot.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {order.extrasSnapshot.map((extra) => (
                          <span key={extra.id} className="text-text-secondary text-xs whitespace-nowrap">
                            {extra.name} <span className="text-text-main font-bold">({extra.price} ر.س)</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-text-secondary text-xs">لا توجد</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-xs whitespace-nowrap">
                    {order.district ? `${order.district.city.name} - ${order.district.name}` : "غير محدد"}
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-xs max-w-[200px] truncate" title={order.locationText}>
                    {order.locationText}
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm whitespace-nowrap">
                    {new Date(order.scheduledDate).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })} - {order.scheduledTime}
                  </td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap">{order.totalPrice} ر.س</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status === "COMPLETED" ? (
                      <select
                        value={order.paymentMethod || ""}
                        onChange={(e) => handlePaymentChange(order, e.target.value)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer bg-emerald-50 text-emerald-600"
                      >
                        {!order.paymentMethod && (
                          <option value="" disabled>غير محددة</option>
                        )}
                        {Object.entries(paymentLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-text-secondary text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.employeeId || ""}
                      onChange={(e) => handleEmployeeChange(order.id, e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer bg-[#F4F7F8] text-text-main"
                    >
                      <option value="">بدون تحديد</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </td>
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
                    {order.status === "PENDING" && order.callOutcome === "RESCHEDULE_REQUEST" && (
                      <div className="mt-2 max-w-[230px] bg-amber-50 rounded-xl p-2.5 flex flex-col gap-2">
                        <span className="text-amber-700 text-[11px] font-bold">العميل طلب تغيير الموعد</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setRescheduleOrder(order)}
                            className="flex-1 bg-primary text-white text-[11px] font-bold py-1.5 rounded-lg"
                          >
                            تحديد موعد جديد
                          </button>
                          <button
                            onClick={() => requestAction(order.id, "dismiss_request", "إرجاع الطلب للمندوب بدون تغيير؟")}
                            className="bg-white text-text-secondary text-[11px] font-bold px-2 py-1.5 rounded-lg"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    )}
                    {order.status === "PENDING" && order.callOutcome === "CANCEL_REQUEST" && (
                      <div className="mt-2 max-w-[230px] bg-red-50 rounded-xl p-2.5 flex flex-col gap-2">
                        <span className="text-red-600 text-[11px] font-bold">العميل طلب إلغاء الحجز</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              requestAction(order.id, "approve_cancel", "اعتماد الإلغاء؟ ستُرسل رسالة الإلغاء للعميل.")
                            }
                            className="flex-1 bg-red-500 text-white text-[11px] font-bold py-1.5 rounded-lg"
                          >
                            اعتماد الإلغاء
                          </button>
                          <button
                            onClick={() => requestAction(order.id, "dismiss_request", "إرجاع الطلب للمندوب بدون إلغاء؟")}
                            className="bg-white text-text-secondary text-[11px] font-bold px-2 py-1.5 rounded-lg"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    )}
                    {order.status === "PENDING" && order.callOutcome === "NO_ANSWER" && (
                      <div className="mt-2 max-w-[230px] text-[11px] text-amber-600 font-bold">
                        العميل لم يرد على المندوب
                      </div>
                    )}
                    {order.status === "CANCELLED" && order.rejectionReason && (
                      <div className="mt-1.5 max-w-[220px] text-[11px] text-red-500 leading-5">
                        <span className="font-bold">مرفوض من الموظف:</span> {order.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.review ? (
                      <span
                        className="text-amber-600 text-xs font-bold"
                        title={order.review.comment ?? undefined}
                      >
                        ★ {order.review.rating}/5
                      </span>
                    ) : (
                      <span className="text-text-secondary text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {hasDetails(order) ? (
                      <button
                        onClick={() => setPhotosOrder(order)}
                        className="text-primary text-xs font-bold px-3 py-1.5 rounded-full bg-primary-light whitespace-nowrap"
                      >
                        عرض التفاصيل
                      </button>
                    ) : (
                      <span className="text-text-secondary text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSmsOrder(order)}
                        className="text-primary text-xs font-bold hover:underline whitespace-nowrap"
                      >
                        الرسائل
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="text-red-500 text-xs font-bold hover:underline whitespace-nowrap">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {photosOrder && <PhotosModal order={photosOrder} onClose={() => setPhotosOrder(null)} />}
      {smsOrder && <SmsModal order={smsOrder} onClose={() => setSmsOrder(null)} />}
      {rescheduleOrder && (
        <RescheduleModal
          order={rescheduleOrder}
          onClose={() => setRescheduleOrder(null)}
          onDone={loadOrders}
        />
      )}
    </div>
  );
}