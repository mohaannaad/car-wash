// lib/smsEvents.ts
// رسائل SMS الخاصة بأحداث التطبيق. كلها آمنة: لو فشل الإرسال ما يتأثرش الحجز.
// كل رسالة بتتسجل في جدول SmsLog (للمتابعة وإعادة الإرسال من الداشبورد).
import { prisma } from "./prisma";
import { sendSms } from "./sms";
import { randomBytes } from "crypto";

const BRAND = "غسلة ولمعة";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.washksa.com";

export type OrderSmsType =
  | "BOOKING_CONFIRMED"
  | "ON_THE_WAY"
  | "RESCHEDULED"
  | "CANCELLED"
  | "NO_ANSWER"
  | "COMPLETED";

// ---------- مساعدات ----------

// التاريخ متخزن كـ UTC منتصف الليل، فنقراه بـ UTC عشان ما يتغيرش اليوم
function fmtDate(d: Date | string): string {
  const x = new Date(d);
  const dd = String(x.getUTCDate()).padStart(2, "0");
  const mm = String(x.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${x.getUTCFullYear()}`;
}

function fmtShort(d: Date | string): string {
  return fmtDate(d).slice(0, 5);
}

// نفس رقم الطلب اللي بيظهر في الداشبورد
export function orderCode(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

async function safe(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    console.error("[sms] failed:", e);
  }
}

type LogInput = {
  orderId?: string;
  washId?: string;
  type: string;
  phone: string;
  text: string;
};

// يبعت الرسالة ويسجّلها (تم الإرسال / فشل الإرسال)
async function sendLogged(i: LogInput) {
  const res = await sendSms(i.phone, i.text);
  const accepted = (res.data as { accepted?: number } | null)?.accepted;
  const ok = res.ok && (accepted === undefined || accepted > 0);
  const err = ok ? null : String(res.error ?? JSON.stringify(res.data)).slice(0, 500);
  try {
    await prisma.smsLog.create({
      data: {
        orderId: i.orderId,
        washId: i.washId,
        type: i.type,
        phone: i.phone,
        body: i.text,
        status: ok ? "SENT" : "FAILED",
        error: err,
      },
    });
  } catch (e) {
    console.error("[sms] log failed:", e);
  }
  if (!ok) console.error("[sms]", i.type, res.status, err);
  return { ok, error: err };
}

// إعادة إرسال رسالة سابقة يدوياً (من الداشبورد)
export async function resendSms(logId: string) {
  const log = await prisma.smsLog.findUnique({ where: { id: logId } });
  if (!log) return { ok: false, error: "الرسالة غير موجودة" };
  return sendLogged({
    orderId: log.orderId ?? undefined,
    washId: log.washId ?? undefined,
    type: log.type,
    phone: log.phone,
    text: log.body,
  });
}

// ---------- نصوص رسائل الطلبات (بنص الأونر) ----------

function orderText(
  type: OrderSmsType,
  o: { id: string; scheduledDate: Date; scheduledTime: string },
  extra: { reviewUrl?: string; supportPhone?: string } = {}
): string {
  const id = orderCode(o.id);
  switch (type) {
    case "BOOKING_CONFIRMED":
      return [
        `${BRAND} 🚗`,
        "",
        "عزيزي العميل، تم تأكيد حجز غسيل سيارتك بنجاح.",
        "",
        `رقم الطلب: ${id}`,
        `التاريخ: ${fmtDate(o.scheduledDate)}`,
        `الوقت: ${o.scheduledTime}`,
        "",
        `شكراً لاختيارك ${BRAND}.`,
      ].join("\n");
    case "ON_THE_WAY":
      return [
        `${BRAND} 🚗`,
        "",
        "عزيزي العميل، بناءً على اتصال مندوبنا وموافقتك على الزيارة، فإن فريق الغسيل في طريقه إليك.",
        "",
        `رقم الطلب: ${id}`,
        `وقت الوصول المتوقع: ${o.scheduledTime}`,
        "",
        `شكراً لتعاونك واختيارك ${BRAND}.`,
      ].join("\n");
    case "RESCHEDULED":
      return [
        `${BRAND} 🚗`,
        "",
        "عزيزي العميل، بناءً على طلبك، تم تغيير موعد غسيل سيارتك بنجاح.",
        "",
        `رقم الطلب: ${id}`,
        `التاريخ الجديد: ${fmtDate(o.scheduledDate)}`,
        `الوقت: ${o.scheduledTime}`,
        "",
        `شكراً لاختيارك ${BRAND}.`,
      ].join("\n");
    case "CANCELLED":
      return [
        BRAND,
        "",
        "عزيزي العميل، بناءً على طلبك، تم إلغاء حجز غسيل سيارتك.",
        "",
        `رقم الطلب: ${id}`,
        "",
        "يسعدنا خدمتك مجدداً في أي وقت.",
      ].join("\n");
    case "NO_ANSWER":
      return [
        `${BRAND} 🚗`,
        "",
        "عزيزي العميل، حاول مندوبنا التواصل معك لتأكيد موعد غسيل سيارتك.",
        "",
        `رقم الطلب: ${id}`,
        "",
        extra.supportPhone
          ? `يرجى التواصل معنا لتأكيد الزيارة أو تغيير موعدها على الرقم: ${extra.supportPhone}`
          : "يرجى التواصل معنا لتأكيد الزيارة أو تغيير موعدها.",
      ].join("\n");
    case "COMPLETED":
      return [
        `${BRAND} ✨`,
        "",
        "عزيزي العميل، تم الانتهاء من غسيل سيارتك بنجاح.",
        "",
        `رقم الطلب: ${id}`,
        "",
        "يمكنك مشاهدة صور سيارتك بعد الغسيل وتقييم أداء الموظف عبر الرابط التالي:",
        "",
        extra.reviewUrl ?? "",
        "",
        "شكراً لثقتك بنا.",
      ].join("\n");
  }
}

// رابط خاص بالطلب لعرض الصور والتقييم
async function ensureReviewToken(orderId: string): Promise<string> {
  const o = await prisma.order.findUnique({ where: { id: orderId }, select: { reviewToken: true } });
  if (o?.reviewToken) return o.reviewToken;
  const token = randomBytes(16).toString("hex");
  await prisma.order.update({ where: { id: orderId }, data: { reviewToken: token } });
  return token;
}

// رسالة للعميل بخصوص طلب
export function notifyOrder(orderId: string, type: OrderSmsType) {
  return safe(async () => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order?.customer?.phone) return;

    const extra: { reviewUrl?: string; supportPhone?: string } = {};
    if (type === "COMPLETED") {
      extra.reviewUrl = `${SITE_URL}/r/${await ensureReviewToken(orderId)}`;
    }
    if (type === "NO_ANSWER") {
      const st = await prisma.settings.findUnique({ where: { id: "singleton" } });
      if (st?.supportPhone) extra.supportPhone = st.supportPhone;
    }

    await sendLogged({
      orderId,
      type,
      phone: order.customer.phone,
      text: orderText(type, order, extra),
    });
  });
}

// حجز جديد: تأكيد الحجز للعميل (مرة واحدة) + تنبيه للأدمن (لو ADMIN_ALERT_PHONE موجود)
export function notifyOrderCreated(orderId: string) {
  return safe(async () => {
    await notifyOrder(orderId, "BOOKING_CONFIRMED");
    const adminPhone = process.env.ADMIN_ALERT_PHONE;
    if (!adminPhone) return;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) return;
    await sendLogged({
      orderId,
      type: "ADMIN_ALERT",
      phone: adminPhone,
      text: `طلب جديد ${orderCode(order.id)} من ${order.customer?.name ?? "عميل"} يوم ${fmtShort(order.scheduledDate)} الساعة ${order.scheduledTime}`,
    });
  });
}

// ---------- الاشتراكات الشهرية ----------

export type WashEvent = "confirmed" | "on_the_way" | "completed" | "cancelled";

const WASH_EVENT_BY_STATUS: Record<string, WashEvent | undefined> = {
  CONFIRMED: "confirmed",
  ON_THE_WAY: "on_the_way",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export function eventForStatus(status: string): WashEvent | undefined {
  return WASH_EVENT_BY_STATUS[status];
}

const WASH_TYPE: Record<WashEvent, string> = {
  confirmed: "WASH_CONFIRMED",
  on_the_way: "WASH_ON_THE_WAY",
  completed: "WASH_COMPLETED",
  cancelled: "WASH_CANCELLED",
};

function fmtSlot(date: Date | string, time: string): string {
  return `${fmtShort(date)} ${time}`.trim();
}

function washBody(event: WashEvent, date: Date | string, time: string): string {
  switch (event) {
    case "confirmed":
      return `${BRAND}: تم تأكيد موعدك يوم ${fmtSlot(date, time)}`;
    case "on_the_way":
      return `${BRAND}: فريقنا في الطريق إليك الآن`;
    case "completed":
      return `${BRAND}: تمت غسلة سيارتك. شكراً لثقتك بنا`;
    case "cancelled":
      return `${BRAND}: نعتذر، تعذر تنفيذ الغسلة. تواصل معنا لإعادة الجدولة`;
  }
}

// الغسلات الباقية في الاشتراك (لسه ما اكتملتش ولا اتلغت)
async function remainingWashes(subscriptionId: string) {
  const list = await prisma.subscriptionWash.findMany({
    where: { subscriptionId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    orderBy: { scheduledDate: "asc" },
    select: { scheduledDate: true, scheduledTime: true },
  });
  return list.map((w) => fmtSlot(w.scheduledDate, w.scheduledTime));
}

// رسالة للعميل بخصوص غسلة اشتراك
export function notifyWash(washId: string, event: WashEvent) {
  return safe(async () => {
    const wash = await prisma.subscriptionWash.findUnique({
      where: { id: washId },
      include: { subscription: { include: { customer: true } } },
    });
    if (!wash) return;
    const phone = wash.subscription?.customer?.phone;

    let text = washBody(event, wash.scheduledDate, wash.scheduledTime);
    let remaining: string[] = [];
    if (event === "completed") {
      remaining = await remainingWashes(wash.subscriptionId);
      text =
        remaining.length > 0
          ? `${BRAND}: تمت غسلة سيارتك. باقي غسلاتك: ${remaining.join("، ")}`
          : `${BRAND}: تمت غسلة سيارتك، وكانت آخر غسلة في اشتراكك. شكراً لثقتك بنا`;
    }

    if (phone) {
      await sendLogged({ washId, type: WASH_TYPE[event], phone, text });
    }

    const adminPhone = process.env.ADMIN_ALERT_PHONE;
    if (event === "completed" && adminPhone) {
      const name = wash.subscription?.customer?.name ?? "عميل";
      await sendLogged({
        washId,
        type: "ADMIN_ALERT",
        phone: adminPhone,
        text:
          remaining.length > 0
            ? `اكتملت غسلة اشتراك ${name}. الباقي: ${remaining.join("، ")}`
            : `اكتملت آخر غسلة في اشتراك ${name}`,
      });
    }
  });
}

// اشتراك جديد: رسالة للعميل بمواعيد الغسلات + تنبيه للأدمن
export function notifySubscriptionCreated(subscriptionId: string) {
  return safe(async () => {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: true,
        package: true,
        washes: { orderBy: { scheduledDate: "asc" } },
      },
    });
    if (!sub) return;
    const slots = sub.washes.map((w) => fmtSlot(w.scheduledDate, w.scheduledTime));
    if (sub.customer?.phone) {
      await sendLogged({
        type: "SUB_ACTIVATED",
        phone: sub.customer.phone,
        text: `${BRAND}: تم تفعيل اشتراكك الشهري. مواعيد الغسلات: ${slots.join("، ")}`,
      });
    }
    const adminPhone = process.env.ADMIN_ALERT_PHONE;
    if (adminPhone) {
      await sendLogged({
        type: "ADMIN_ALERT",
        phone: adminPhone,
        text: `اشتراك جديد من ${sub.customer?.name ?? "عميل"} - ${sub.package.name}. المواعيد: ${slots.join("، ")}`,
      });
    }
  });
}
