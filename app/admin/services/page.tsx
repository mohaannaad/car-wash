"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", price: "", durationMinutes: "" });

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      setServices(await res.json());
    } catch {
      setError("حصل خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price || !form.durationMinutes) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ name: "", description: "", price: "", durationMinutes: "" });
      await loadServices();
    } catch {
      setError("حصل خطأ في الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadServices();
    } catch {
      setError("حصل خطأ في التعديل");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف الخدمة دي؟")) return;
    try {
      await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      await loadServices();
    } catch {
      setError("حصل خطأ في الحذف");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الخدمات</h1>
        <p className="text-text-secondary text-sm">إدارة خدمات الغسيل وأسعارها ومدتها</p>
      </div>

      {/* نموذج الإضافة */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم الخدمة (مثال: غسيل خارجي)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="وصف مختصر للخدمة"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="السعر (ر.س)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            placeholder="المدة (دقيقة)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={submitting || !form.name.trim() || !form.price || !form.durationMinutes}
          className={`self-start px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
            submitting || !form.name.trim() || !form.price || !form.durationMinutes
              ? "bg-disabled cursor-not-allowed"
              : "bg-primary"
          }`}
        >
          {submitting ? "جاري الإضافة..." : "+ إضافة خدمة"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      {/* جدول الخدمات */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">مفيش خدمات مضافة لسه</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الاسم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الوصف</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">السعر</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">المدة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{service.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-xs">{service.description}</td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{service.price} ر.س</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{service.durationMinutes} د</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        service.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                      }`}
                    >
                      {service.isActive ? "مفعّل" : "متوقف"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(service.id)}
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