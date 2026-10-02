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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadExtras = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/extras");
      setExtras(await res.json());
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
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
      setError("حدث خطأ أثناء الإضافة");
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
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const startEdit = (extra: Extra) => {
    setEditingId(extra.id);
    setEditForm({ name: extra.name, description: extra.description, price: String(extra.price) });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editForm.name.trim() || !editForm.price) return;
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/extras/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      await loadExtras();
    } catch {
      setError("حدث خطأ أثناء حفظ التعديل");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف الخدمة الإضافية؟")) return;
    try {
      await fetch(`/api/admin/extras/${id}`, { method: "DELETE" });
      await loadExtras();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الخدمات الإضافية</h1>
        <p className="text-text-secondary text-sm">إدارة الخدمات الإضافية التي تظهر للعميل أثناء الحجز.</p>
      </div>

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
          {submitting ? "جارٍ الإضافة..." : "+ إضافة خدمة إضافية"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : extras.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">لا توجد خدمات إضافية مضافة بعد</div>
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
              {extras.map((extra) =>
                editingId === extra.id ? (
                  <tr key={extra.id} className="border-t border-[#EEF2F3] bg-primary-light/30">
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3] w-full"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3] w-full"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3] w-20"
                      />
                    </td>
                    <td className="px-6 py-3 text-text-secondary text-xs">—</td>
                    <td className="px-6 py-3 flex items-center gap-3">
                      <button
                        onClick={() => saveEdit(extra.id)}
                        disabled={savingEdit}
                        className="text-emerald-600 text-xs font-bold hover:underline disabled:opacity-50"
                      >
                        حفظ
                      </button>
                      <button onClick={cancelEdit} className="text-text-secondary text-xs font-bold hover:underline">
                        إلغاء
                      </button>
                    </td>
                  </tr>
                ) : (
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
                    <td className="px-6 py-4 flex items-center gap-3">
                      <button onClick={() => startEdit(extra)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        تعديل
                      </button>
                      <button onClick={() => handleDelete(extra.id)} className="text-red-500 text-xs font-bold hover:underline">
                        حذف
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}