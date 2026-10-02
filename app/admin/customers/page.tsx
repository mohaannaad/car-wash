"use client";

import { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = search.trim();
    if (!q) return customers;
    return customers.filter((c) => c.phone.includes(q) || c.name.includes(q));
  }, [customers, search]);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف العميل "${name}"؟\n\nطلباته واشتراكاته السابقة ستبقى محفوظة في سجل الطلبات ولن تتأثر.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      alert("حدث خطأ أثناء حذف العميل");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف جميع العملاء؟\n\nطلباتهم واشتراكاتهم السابقة ستبقى محفوظة في سجل الطلبات ولن تتأثر، لكن لن يكون بالإمكان التراجع عن حذف بيانات العملاء."
    );
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/customers/bulk-delete", {
        method: "POST",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setCustomers([]);
    } catch (error) {
      alert("حدث خطأ أثناء حذف العملاء");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Customers List", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Name", "Phone", "Orders", "Total Spent (SAR)", "Registered"]],
      body: filteredCustomers.map((c) => [
        c.name,
        c.phone,
        c.ordersCount.toString(),
        c.totalSpent.toString(),
        new Date(c.createdAt).toLocaleDateString("en-GB"),
      ]),
    });

    doc.save("customers.pdf");
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">العملاء</h1>
          <p className="text-sm text-[#667085] mt-1">
            قاعدة بيانات العملاء اللي طلبوا من الموقع
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-[#101828] hover:bg-gray-50"
          >
            تحميل PDF
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting || customers.length === 0}
            className="px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            {bulkDeleting ? "جاري الحذف..." : "حذف الكل"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الجوال..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#19B9C6]"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-[#667085] text-right">
              <th className="px-4 py-3 font-semibold">الاسم</th>
              <th className="px-4 py-3 font-semibold">رقم الجوال</th>
              <th className="px-4 py-3 font-semibold">عدد الطلبات</th>
              <th className="px-4 py-3 font-semibold">إجمالي المصروفات</th>
              <th className="px-4 py-3 font-semibold">تاريخ التسجيل</th>
              <th className="px-4 py-3 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#667085]">
                  جاري التحميل...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#667085]">
                  لا يوجد عملاء
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-[#101828]">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-[#667085]" dir="ltr">
                    {c.phone}
                  </td>
                  <td className="px-4 py-3 text-[#667085]">{c.ordersCount}</td>
                  <td className="px-4 py-3 text-[#667085]">
                    {c.totalSpent} ر.س
                  </td>
                  <td className="px-4 py-3 text-[#667085]">
                    {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deletingId === c.id}
                      className="text-red-600 text-sm font-semibold hover:underline disabled:opacity-50"
                    >
                      {deletingId === c.id ? "جاري الحذف..." : "حذف"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}