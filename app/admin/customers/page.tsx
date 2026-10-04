"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import * as XLSX from "xlsx";

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}

interface HistoryItem {
  id: string;
  type: "order" | "subscription";
  label: string;
  price: number;
  date: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // حالة مودال الفاتورة
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceCustomer, setInvoiceCustomer] = useState<Customer | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [vatRate, setVatRate] = useState<number>(15);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

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

  const handleExportExcel = () => {
    const rows = filteredCustomers.map((c) => ({
      Name: c.name,
      Phone: c.phone,
      Orders: c.ordersCount,
      "Total Spent (SAR)": c.totalSpent,
      Registered: new Date(c.createdAt).toLocaleDateString("en-GB"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "customers.xlsx");
  };

  const handleOpenInvoiceModal = async (customer: Customer) => {
    setInvoiceCustomer(customer);
    setInvoiceModalOpen(true);
    setSelectedItem(null);
    setHistoryItems([]);
    setLoadingHistory(true);

    try {
      const [historyRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/customers/${customer.id}/history`),
        fetch("/api/admin/settings"),
      ]);

      const historyData = await historyRes.json();
      const combined: HistoryItem[] = [
        ...(historyData.orders || []),
        ...(historyData.subscriptions || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistoryItems(combined);

      const settingsData = await settingsRes.json();
      setVatRate(settingsData.vatRate ?? 15);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء جلب بيانات العميل");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseInvoiceModal = () => {
    setInvoiceModalOpen(false);
    setInvoiceCustomer(null);
    setHistoryItems([]);
    setSelectedItem(null);
  };

  // توليد الفاتورة: بنحول تصميم الـ HTML (invoiceRef) لصورة، وبعدين نحطها جوه PDF
  const handleGenerateInvoice = async () => {
    if (!selectedItem || !invoiceCustomer || !invoiceRef.current) {
      alert("من فضلك اختار الطلب أو الباقة المطلوب إصدار فاتورة لها");
      return;
    }

    setGeneratingInvoice(true);
    try {
      // تأخير بسيط عشان نضمن إن التصميم واللوجو خلصوا تحميل قبل التصوير
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceCustomer.name}-${Date.now()}.pdf`);

      handleCloseInvoiceModal();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إصدار الفاتورة");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const vatAmount = selectedItem ? (selectedItem.price * vatRate) / 100 : 0;
  const totalAmount = selectedItem ? selectedItem.price + vatAmount : 0;

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
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-[#101828] hover:bg-gray-50"
          >
            تحميل Excel
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenInvoiceModal(c)}
                        className="text-[#19B9C6] text-sm font-semibold hover:underline"
                      >
                        فاتورة
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deletingId === c.id}
                        className="text-red-600 text-sm font-semibold hover:underline disabled:opacity-50"
                      >
                        {deletingId === c.id ? "جاري الحذف..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مودال إصدار الفاتورة */}
      {invoiceModalOpen && invoiceCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#101828]">
                إصدار فاتورة - {invoiceCustomer.name}
              </h2>
              <button
                onClick={handleCloseInvoiceModal}
                className="text-[#667085] hover:text-[#101828] text-xl leading-none"
              >
                ×
              </button>
            </div>

            {loadingHistory ? (
              <p className="text-center text-[#667085] py-6">جاري التحميل...</p>
            ) : historyItems.length === 0 ? (
              <p className="text-center text-[#667085] py-6">
                لا يوجد طلبات أو باقات لهذا العميل
              </p>
            ) : (
              <div className="space-y-2 mb-5">
                {historyItems.map((item) => (
                  <label
                    key={`${item.type}-${item.id}`}
                    className={`flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer ${
                      selectedItem?.id === item.id && selectedItem?.type === item.type
                        ? "border-[#19B9C6] bg-[#19B9C6]/5"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="historyItem"
                        checked={
                          selectedItem?.id === item.id && selectedItem?.type === item.type
                        }
                        onChange={() => setSelectedItem(item)}
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#101828]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[#667085]">
                          {new Date(item.date).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#101828] whitespace-nowrap">
                      {item.price} ر.س
                    </span>
                  </label>
                ))}
              </div>
            )}

            {selectedItem && (
              <div className="bg-gray-50 rounded-lg p-4 mb-5 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#667085]">المبلغ</span>
                  <span className="text-[#101828] font-semibold">
                    {selectedItem.price.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">ضريبة القيمة المضافة ({vatRate}%)</span>
                  <span className="text-[#101828] font-semibold">
                    {vatAmount.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                  <span className="text-[#101828] font-bold">الإجمالي</span>
                  <span className="text-[#101828] font-bold">
                    {totalAmount.toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseInvoiceModal}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#101828] hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerateInvoice}
                disabled={!selectedItem || generatingInvoice}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#19B9C6] text-sm font-semibold text-white hover:bg-[#15a3af] disabled:opacity-50"
              >
                {generatingInvoice ? "جاري الإصدار..." : "إصدار الفاتورة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* تصميم الفاتورة المخفي - بيتحول لصورة ثم PDF */}
      {invoiceCustomer && selectedItem && (
        <div
          ref={invoiceRef}
          className="fixed top-0 -left-[9999px] w-[700px] bg-white p-10"
          dir="rtl"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-color.png"
                alt="غسلة ولمعة"
                crossOrigin="anonymous"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-[#101828]">غسلة ولمعة</h1>
                <p className="text-sm text-[#667085]">فاتورة ضريبية</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm text-[#667085]">التاريخ</p>
              <p className="text-sm font-semibold text-[#101828]">
                {new Date().toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-xs text-[#667085] mb-1">اسم العميل</p>
              <p className="text-sm font-semibold text-[#101828]">
                {invoiceCustomer.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#667085] mb-1">رقم الجوال</p>
              <p className="text-sm font-semibold text-[#101828]">
                {invoiceCustomer.phone}
              </p>
            </div>
          </div>

          <table className="w-full text-sm mb-8 border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#19B9C6] text-white text-right">
                <th className="px-4 py-3 font-semibold">البيان</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
                <th className="px-4 py-3 font-semibold">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-4 py-3">{selectedItem.label}</td>
                <td className="px-4 py-3">
                  {new Date(selectedItem.date).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-4 py-3">{selectedItem.price.toFixed(2)} ر.س</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-start">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#667085]">المبلغ قبل الضريبة</span>
                <span className="text-[#101828] font-semibold">
                  {selectedItem.price.toFixed(2)} ر.س
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">
                  ضريبة القيمة المضافة ({vatRate}%)
                </span>
                <span className="text-[#101828] font-semibold">
                  {vatAmount.toFixed(2)} ر.س
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-[#101828] font-bold">الإجمالي شامل الضريبة</span>
                <span className="text-[#101828] font-bold">
                  {totalAmount.toFixed(2)} ر.س
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-[#667085]">
            شكرًا لتعاملكم مع غسلة ولمعة
          </div>
        </div>
      )}
    </div>
  );
}