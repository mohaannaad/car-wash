const stats = [
  {
    label: "طلبات اليوم",
    value: "12",
    change: "+8% عن أمس",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    label: "إجمالي الإيرادات (الشهر)",
    value: "6,240 ر.س",
    change: "+14% عن الشهر اللي فات",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "اشتراكات نشطة",
    value: "34",
    change: "+3 اشتراكات جديدة",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 6.6L21 10l-5 4.3L17.4 21 12 17.6 6.6 21 8 14.3 3 10l6.6-1.4z" />
      </svg>
    ),
  },
  {
    label: "طلبات قيد التنفيذ",
    value: "5",
    change: "محتاجة متابعة",
    positive: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

const recentOrders = [
  { id: "#348219", customer: "أحمد محمود", service: "غسيل كامل", status: "قيد التنفيذ", price: "120 ر.س" },
  { id: "#348218", customer: "سارة عبدالله", service: "غسيل خارجي", status: "مؤكد", price: "50 ر.س" },
  { id: "#348217", customer: "محمد علي", service: "غسيل داخلي", status: "تم التنفيذ", price: "80 ر.س" },
  { id: "#348216", customer: "نور حسن", service: "غسيل كامل", status: "تم التنفيذ", price: "120 ر.س" },
];

const statusStyles: Record<string, string> = {
  "قيد التنفيذ": "bg-amber-50 text-amber-600",
  "مؤكد": "bg-primary-light text-primary",
  "تم التنفيذ": "bg-emerald-50 text-emerald-600",
};

export default function AdminOverviewPage() {
  return (
    <div className="p-8 flex flex-col gap-7">
      {/* العنوان */}
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">نظرة عامة</h1>
        <p className="text-text-secondary text-sm">ملخص سريع على أداء المشروع اليوم</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center">
              {stat.icon}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-secondary text-xs font-medium">{stat.label}</span>
              <span className="text-text-main text-2xl font-extrabold">{stat.value}</span>
            </div>
            <span className={`text-xs font-bold ${stat.positive ? "text-emerald-600" : "text-amber-600"}`}>
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* جدول آخر الطلبات */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#EEF2F3]">
          <span className="text-text-main text-base font-extrabold">آخر الطلبات</span>
          <span className="text-primary text-sm font-bold cursor-pointer">عرض الكل</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-right">
              <th className="px-6 py-3 text-text-secondary text-xs font-bold">رقم الطلب</th>
              <th className="px-6 py-3 text-text-secondary text-xs font-bold">العميل</th>
              <th className="px-6 py-3 text-text-secondary text-xs font-bold">الخدمة</th>
              <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
              <th className="px-6 py-3 text-text-secondary text-xs font-bold">السعر</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-t border-[#EEF2F3]">
                <td className="px-6 py-4 text-text-main text-sm font-bold" dir="ltr">{order.id}</td>
                <td className="px-6 py-4 text-text-main text-sm">{order.customer}</td>
                <td className="px-6 py-4 text-text-secondary text-sm">{order.service}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-main text-sm font-bold">{order.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ملحوظة إنها بيانات تجريبية */}
      <p className="text-text-secondary text-xs text-center">
        * البيانات المعروضة تجريبية حاليًا لحد ما يتم ربط لوحة التحكم بقاعدة البيانات
      </p>
    </div>
  );
}