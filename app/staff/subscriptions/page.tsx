"use client";

import { useEffect, useState } from "react";

type WashTask = {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  packageName: string;
  customer: { name: string; phone: string };
  locationText: string | null;
  plateNumber: string | null;
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

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${monthNames[d.getMonth()]}`;
}

export default function StaffSubscriptionTasksPage() {
  const [tasks, setTasks] = useState<WashTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/staff/subscription-washes");
      if (res.ok) setTasks(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (id: string, currentStatus: string) => {
    const next = nextStatusMap[currentStatus];
    if (!next) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));
    await fetch(`/api/staff/subscription-washes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  };

  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const pastTasks = tasks.filter((t) => t.status === "COMPLETED" || t.status === "CANCELLED");

  if (loading) {
    return <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>;
  }

  return (
    <div className="p-5 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-text-main text-sm font-bold">مهام الباقات الحالية ({activeTasks.length})</h2>
        {activeTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-text-secondary text-sm shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            لا توجد مهام باقات شهرية موكلة لك حاليًا
          </div>
        ) : (
          activeTasks.map((task) => {
            const next = nextStatusMap[task.status];
            const nextLabel = next ? statusLabels[next] : null;
            return (
              <div key={task.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-text-main text-sm font-bold">باقة: {task.packageName}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-text-secondary">
                  <span>العميل: {task.customer.name}</span>
                  {task.plateNumber && <span dir="ltr" className="text-right">لوحة: {task.plateNumber}</span>}
                  {task.locationText && <span>{task.locationText}</span>}
                  <span>{formatDate(task.scheduledDate)} - {task.scheduledTime}</span>
                  <span dir="ltr" className="text-right">{task.customer.phone}</span>
                </div>
                {nextLabel && (
                  <button onClick={() => handleAdvanceStatus(task.id, task.status)} className="w-full py-2.5 rounded-xl font-bold text-white text-sm bg-primary">
                    تحديث الحالة إلى: {nextLabel}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {pastTasks.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-text-main text-sm font-bold">مهام سابقة ({pastTasks.length})</h2>
          {pastTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(16,24,40,0.05)] opacity-70">
              <span className="text-text-main text-sm font-bold">{task.customer.name} - {task.packageName}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[task.status]}`}>
                {statusLabels[task.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}