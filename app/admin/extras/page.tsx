"use client";

import { useEffect, useState } from "react";

type Extra = {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
};

export default function ExtrasAdminPage() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", price: "" });

  const loadExtras = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/extras");
      setExtras(await res.json());
    } catch {
      setError("حصل خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExtras();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ name: "", description: "", price: "" });
      await loadExtras();
    } catch {
      setError("حصل خطأ في الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/extras/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadExtras();
    } catch {
      setError("حصل خطأ في التعديل");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف الخدمة الإضافية دي؟")) return;
    try {
      await fetch(`/api/admin/extras/${id}`, { method: "DELETE" });
      await loadExtras();
    } catch {
      setError("حصل خطأ في الحذف");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الخدمات الإضافية</h1>
        <p className="text-text-secondary text-sm">إدارة الخدمات الإضافية اللي تظهر للعميل أثناء الحجز</p>
      </div>

      {/* نموذج الإضافة */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم الخدمة (مثال: تعطير السيارة)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="وصف مختصر"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="السعر (ر.س)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={submitting || !form.name.trim() || !form.price}
          className={`self-start px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
            submitting || !form.name.trim() || !form.price ? "bg-disabled cursor-not-allowed" : "bg-primary"
          }`}
        >
          {submitting ? "جاري الإضافة..." : "+ إضافة خدمة إضافية"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      {/* جدول الخدمات الإضافية */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
        ) : extras.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">مفيش خدمات إضافية مضافة لسه</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الاسم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الوصف</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">السعر</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {extras.map((extra) => (
                <tr key={extra.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{extra.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-xs">{extra.description}</td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{extra.price} ر.س</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(extra.id, extra.isActive)}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        extra.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                      }`}
                    >
                      {extra.isActive ? "مفعّل" : "متوقف"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(extra.id)} className="text-red-500 text-xs font-bold hover:underline">
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