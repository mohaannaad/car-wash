"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customer: { name: string; phone: string };
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
};

type Employee = { id: string; name: string; isActive: boolean };

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (!normalizedQuery) return true;
    const serial = order.id.slice(-6).toLowerCase();
    const phone = order.customer.phone.toLowerCase();
    return serial.includes(normalizedQuery) || phone.includes(normalizedQuery);
  });

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
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الموظف المسؤول</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الحالة</th>
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
                      <span className="text-text-main text-sm font-bold">{order.customer.name}</span>
                      <span className="text-text-secondary text-xs" dir="ltr">{order.customer.phone}</span>
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
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(order.id)} className="text-red-500 text-xs font-bold hover:underline whitespace-nowrap">
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