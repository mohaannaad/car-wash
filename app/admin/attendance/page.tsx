"use client";

import { useCallback, useEffect, useState } from "react";

type ShiftRow = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  breakMinutes: number;
  minutes: number;
};

type EmployeeRow = {
  id: string;
  name: string;
  onShift: boolean;
  minutes: number;
  days: number;
  tasks: number;
  pointsMonth: number;
  pointsTotal: number;
  shifts: ShiftRow[];
};

type Data = {
  month: string;
  settings: { pointsPerTask: number; pointValue: number };
  employees: EmployeeRow[];
};

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} د`;
  return m === 0 ? `${h} س` : `${h} س ${m} د`;
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG", { day: "numeric", month: "short", timeZone: "Asia/Riyadh" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  });
}

export default function AttendancePage() {
  const [month, setMonth] = useState(() =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" }).slice(0, 7)
  );
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pointsPerTask, setPointsPerTask] = useState("10");
  const [pointValue, setPointValue] = useState("0");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/staff-activity?month=${month}`);
      if (res.ok) {
        const d: Data = await res.json();
        setData(d);
        setPointsPerTask(String(d.settings.pointsPerTask));
        setPointValue(String(d.settings.pointValue));
      }
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/staff-activity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsPerTask: Number(pointsPerTask), pointValue: Number(pointValue) }),
      });
      if (res.ok) {
        alert("تم حفظ إعدادات النقاط");
        await load();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "فشل الحفظ");
      }
    } finally {
      setSaving(false);
    }
  };

  const value = data?.settings.pointValue ?? 0;

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-main text-2xl font-extrabold">الحضور والنقاط</h1>
          <p className="text-text-secondary text-sm">ساعات دوام الموظفين (بعد خصم الاستراحة) ونقاط المهام المنفّذة</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-white rounded-xl px-4 py-2.5 text-sm font-bold text-text-main outline-none shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
        />
      </div>

      {/* إعدادات النقاط */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-4">
        <h2 className="text-text-main text-base font-bold">إعدادات النقاط</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-text-secondary text-xs font-bold">نقاط كل مهمة منفّذة</span>
            <input
              type="number"
              min={0}
              step={1}
              value={pointsPerTask}
              onChange={(e) => setPointsPerTask(e.target.value)}
              className="rounded-xl border border-[#E4E7EC] px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-text-secondary text-xs font-bold">قيمة النقطة الواحدة (ريال)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={pointValue}
              onChange={(e) => setPointValue(e.target.value)}
              className="rounded-xl border border-[#E4E7EC] px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="py-2.5 rounded-xl font-bold text-white text-sm bg-primary disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
        <p className="text-text-secondary text-xs">
          التغيير يسري على المهام اللي بتتنفّذ بعد الحفظ فقط، النقاط القديمة بتفضل زي ما هي. اترك قيمة النقطة 0 لو
          مش عايز تظهر مقابلها بالريال.
        </p>
      </div>

      {/* الموظفين */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : !data || data.employees.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">لا يوجد موظفون</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الموظف</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الآن</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">أيام الحضور</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">ساعات العمل</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">المهام المنفّذة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">نقاط الشهر</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">قيمتها (ر.س)</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">إجمالي النقاط</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">السجل</th>
              </tr>
            </thead>
            <tbody>
              {data.employees.map((emp) => (
                <>
                  <tr key={emp.id} className="border-t border-[#EEF2F3]">
                    <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap">{emp.name}</td>
                    <td className="px-6 py-4">
                      {emp.onShift ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 whitespace-nowrap">
                          على رأس العمل
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">{emp.days}</td>
                    <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap">{fmt(emp.minutes)}</td>
                    <td className="px-6 py-4 text-text-secondary text-sm">{emp.tasks}</td>
                    <td className="px-6 py-4 text-primary text-sm font-bold">{emp.pointsMonth}</td>
                    <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap">
                      {value > 0 ? `${Math.round(emp.pointsMonth * value * 100) / 100} ر.س` : "—"}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">{emp.pointsTotal}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setOpenId(openId === emp.id ? null : emp.id)}
                        className="text-primary text-xs font-bold px-3 py-1.5 rounded-full bg-primary-light whitespace-nowrap"
                      >
                        {openId === emp.id ? "إخفاء" : "عرض الدوامات"}
                      </button>
                    </td>
                  </tr>
                  {openId === emp.id && (
                    <tr key={`${emp.id}-shifts`} className="bg-[#F9FAFB]">
                      <td colSpan={9} className="px-6 py-4">
                        {emp.shifts.length === 0 ? (
                          <span className="text-text-secondary text-xs">لا توجد دوامات في هذا الشهر</span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {emp.shifts.map((s) => (
                              <div
                                key={s.id}
                                className="bg-white rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 text-xs flex-wrap"
                              >
                                <span className="text-text-main font-bold">{fmtDay(s.startedAt)}</span>
                                <span className="text-text-secondary">
                                  من {fmtTime(s.startedAt)} إلى {s.endedAt ? fmtTime(s.endedAt) : "مستمر"}
                                </span>
                                <span className="text-text-secondary">استراحة: {fmt(s.breakMinutes)}</span>
                                <span className="text-text-main font-bold">صافي: {fmt(s.minutes)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}