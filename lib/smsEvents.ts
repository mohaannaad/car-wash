// lib/smsEvents.ts
// رسائل SMS الخاصة بأحداث التطبيق. كلها آمنة: لو فشل الإرسال ما يتأثرش الحجز.
import { prisma } from "./prisma";
import { sendSms } from "./sms";

export type SmsEvent = "received" | "confirmed" | "on_the_way" | "completed" | "cancelled";

const BRAND = "غسلة ولمعة";

// التاريخ متخزن كـ UTC منتصف الليل، فنقراه بـ UTC عشان ما يتغيرش اليوم
function fmtDate(d: Date | string): string {
  const x = new Date(d);
  const dd = String(x.getUTCDate()).padStart(2, "0");
  const mm = String(x.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

// نصوص قصيرة (أقل من 70 حرف تقريباً) عشان تفضل رسالة واحدة بالعربي
function bodyFor(event: SmsEvent, date: Date | string, time: string): string {
  const when = `${fmtDate(date)} الساعة ${time}`.trim();
  switch (event) {
    case "received":
      return `${BRAND}: استلمنا حجزك يوم ${when}. هنتصل بك للتأكيد`;
    case "confirmed":
      return `${BRAND}: تم تأكيد موعدك يوم ${when}`;
    case "on_the_way":
      return `${BRAND}: فريقنا في الطريق إليك الآن`;
    case "completed":
      return `${BRAND}: تمت غسلة سيارتك. شكراً لثقتك بنا`;
    case "cancelled":
      return `${BRAND}: نعتذر، تعذر تنفيذ طلبك. تواصل معنا لإعادة الجدولة`;
  }
}

const EVENT_BY_STATUS: Record<string, SmsEvent | undefined> = {
  CONFIRMED: "confirmed",
  ON_THE_WAY: "on_the_way",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export function eventForStatus(status: string): SmsEvent | undefined {
  return EVENT_BY_STATUS[status];
}

async function safe(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    console.error("[sms] failed:", e);
  }
}

// رسالة للعميل بخصوص طلب
export function notifyOrder(orderId: string, event: SmsEvent) {
  return safe(async () => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order?.customer?.phone) return;
    const res = await sendSms(
      order.customer.phone,
      bodyFor(event, order.scheduledDate, order.scheduledTime),
      undefined,
      "transactional"
    );
    if (!res.ok) console.error("[sms] order", event, res.status, res.error ?? res.data);
  });
}

// رسالة للعميل بخصوص غسلة اشتراك
export function notifyWash(washId: string, event: SmsEvent) {
  return safe(async () => {
    const wash = await prisma.subscriptionWash.findUnique({
      where: { id: washId },
      include: { subscription: { include: { customer: true } } },
    });
    const phone = wash?.subscription?.customer?.phone;
    if (!wash || !phone) return;
    const res = await sendSms(
      phone,
      bodyFor(event, wash.scheduledDate, wash.scheduledTime),
      undefined,
      "transactional"
    );
    if (!res.ok) console.error("[sms] wash", event, res.status, res.error ?? res.data);
  });
}

// حجز جديد: رسالة للعميل + تنبيه للأدمن (لو ADMIN_ALERT_PHONE موجود)
export function notifyOrderCreated(orderId: string) {
  return safe(async () => {
    await notifyOrder(orderId, "received");
    const adminPhone = process.env.ADMIN_ALERT_PHONE;
    if (!adminPhone) return;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) return;
    await sendSms(
      adminPhone,
      `طلب جديد من ${order.customer?.name ?? "عميل"} يوم ${fmtDate(order.scheduledDate)} الساعة ${order.scheduledTime}`,
      undefined,
      "transactional"
    );
  });
}

// اشتراك جديد: رسالة للعميل + تنبيه للأدمن
export function notifySubscriptionCreated(subscriptionId: string) {
  return safe(async () => {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { customer: true, package: true },
    });
    if (!sub) return;
    if (sub.customer?.phone) {
      await sendSms(
        sub.customer.phone,
        `${BRAND}: تم تفعيل اشتراكك الشهري (${sub.package.washCount} غسلات). شكراً لك`,
        undefined,
        "transactional"
      );
    }
    const adminPhone = process.env.ADMIN_ALERT_PHONE;
    if (adminPhone) {
      await sendSms(
        adminPhone,
        `اشتراك جديد من ${sub.customer?.name ?? "عميل"} - ${sub.package.name}`,
        undefined,
        "transactional"
      );
    }
  });
}
