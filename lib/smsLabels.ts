// lib/smsLabels.ts — أسماء أنواع الرسائل (آمن للاستخدام في الواجهة)
export const SMS_TYPE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMED: "تأكيد الحجز",
  ON_THE_WAY: "المندوب في الطريق",
  RESCHEDULED: "تغيير الموعد",
  CANCELLED: "إلغاء الحجز",
  NO_ANSWER: "عدم الرد على المندوب",
  COMPLETED: "اكتمال الغسيل",
  SUB_ACTIVATED: "تفعيل اشتراك",
  WASH_CONFIRMED: "تأكيد غسلة اشتراك",
  WASH_ON_THE_WAY: "غسلة اشتراك: في الطريق",
  WASH_COMPLETED: "اكتمال غسلة اشتراك",
  WASH_CANCELLED: "إلغاء غسلة اشتراك",
  ADMIN_ALERT: "تنبيه للأدمن",
};
