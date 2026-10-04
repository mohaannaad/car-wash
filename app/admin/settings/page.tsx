"use client";

import { useEffect, useState } from "react";

interface SettingsData {
  companyName: string;
  supportPhone: string;
  supportEmail: string;
  privacyPolicy: string;
  termsConditions: string;
  workStartHour: number;
  workEndHour: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SettingsData, value: string | number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setError("");

    if (Number(settings.workStartHour) >= Number(settings.workEndHour)) {
      setError("ساعة البداية لازم تكون قبل ساعة النهاية");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  if (loading || !settings) {
    return (
      <div className="p-6" dir="rtl">
        <p className="text-text-secondary text-sm">جارٍ التحميل...</p>
      </div>
    );
  }

    return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#101828]">الإعدادات</h1>
        <p className="text-sm text-[#667085] mt-1">البيانات العامة وساعات العمل الخاصة بالموقع</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-text-main text-base font-extrabold mb-1">ساعات العمل</h2>
        <p className="text-text-secondary text-xs mb-4">
          المواعيد المتاحة للحجز في الموقع (العادي والباقات الشهرية) هتتولد تلقائيًا بفاصل ساعة بين كل الفترة دي
        </p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text-main text-xs font-bold">من الساعة</label>
            <select
              value={settings.workStartHour}
              onChange={(e) => handleChange("workStartHour", Number(e.target.value))}
              className="bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
          <span className="text-text-secondary mt-5">إلى</span>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-main text-xs font-bold">الساعة</label>
            <select
              value={settings.workEndHour}
              onChange={(e) => handleChange("workEndHour", Number(e.target.value))}
              className="bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <h2 className="text-text-main text-base font-extrabold mb-4">البيانات الأساسية</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text-main text-xs font-bold">اسم الشركة</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className="bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-main text-xs font-bold">رقم التواصل / واتساب</label>
            <input
              type="text"
              dir="ltr"
              value={settings.supportPhone}
              onChange={(e) => handleChange("supportPhone", e.target.value)}
              placeholder="05XXXXXXXX"
              className="bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none text-right"
            />
          </div>
                   <div className="flex flex-col gap-1.5">
            <label className="text-text-main text-xs font-bold">البريد الإلكتروني للدعم</label>
            <input
              type="email"
              dir="ltr"
              value={settings.supportEmail}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
              className="bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none text-right"
            />
          </div>
        </div>
      </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <h2 className="text-text-main text-base font-extrabold mb-1">الخصوصية والشروط</h2>
        <p className="text-text-secondary text-xs mb-4">النص ده مؤقت حاليًا، تقدر تعدله وقت ما تحب</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text-main text-xs font-bold">سياسة الخصوصية</label>
            <textarea
              value={settings.privacyPolicy}
              onChange={(e) => handleChange("privacyPolicy", e.target.value)}
              rows={4}
              className="bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-main text-xs font-bold">الشروط والأحكام</label>
            <textarea
              value={settings.termsConditions}
              onChange={(e) => handleChange("termsConditions", e.target.value)}
              rows={4}
              className="bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm font-medium mb-3">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_8px_20px_rgba(25,185,198,0.3)] disabled:opacity-60"
      >
        {saving ? "جارٍ الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ التعديلات"}
      </button>
    </div>
  );
}