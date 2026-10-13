"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ReviewData = {
  code: string;
  date: string;
  carType: string;
  employeeName: string | null;
  photos: { id: string; url: string; label: string }[];
  review: { rating: number; comment: string | null } | null;
};

function Stars({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2" dir="ltr" role="radiogroup" aria-label="التقييم">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          aria-label={`${n} من 5`}
          aria-checked={value === n}
          role="radio"
          className={`transition-transform ${readOnly ? "" : "active:scale-90"}`}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill={n <= value ? "#F5B301" : "none"} stroke={n <= value ? "#F5B301" : "#C4C4C4"} strokeWidth="1.6" strokeLinejoin="round">
            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ReviewData | null>(null);
  const [state, setState] = useState<"loading" | "notfound" | "ready">("loading");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/review/${token}`);
        if (!res.ok) {
          setState("notfound");
          return;
        }
        const d: ReviewData = await res.json();
        setData(d);
        if (d.review) setDone(true);
        setState("ready");
      } catch {
        setState("notfound");
      }
    })();
  }, [token]);

  const submit = async () => {
    if (rating < 1) {
      setError("اختر عدد النجوم أولًا");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/review/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok || res.status === 409) {
        setDone(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "تعذر إرسال التقييم، حاول مرة أخرى");
      }
    } catch {
      setError("تعذر الاتصال بالإنترنت، حاول مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  const header = (
    <header className="bg-gradient-to-b from-primary to-primary-dark px-6 pt-8 pb-14 flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.png" alt="غسلة ولمعة" className="h-20 w-auto object-contain" />
    </header>
  );

  if (state === "loading") {
    return (
      <main className="min-h-dvh bg-bg-page">
        {header}
        <p className="text-center text-text-secondary text-sm mt-10">جاري التحميل...</p>
      </main>
    );
  }

  if (state === "notfound" || !data) {
    return (
      <main className="min-h-dvh bg-bg-page">
        {header}
        <div className="-mt-8 mx-5 bg-white rounded-2xl p-8 text-center shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
          <h1 className="text-text-main text-lg font-extrabold">الرابط غير متاح</h1>
          <p className="text-text-secondary text-sm mt-2 leading-6">
            تأكد من الرابط المرسل في الرسالة، أو تواصل معنا.
          </p>
        </div>
      </main>
    );
  }

  const dateText = new Date(data.date).toLocaleDateString("ar-SA", {
    timeZone: "Asia/Riyadh",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const finalRating = data.review?.rating ?? rating;

  return (
    <main className="min-h-dvh bg-bg-page pb-10">
      {header}

      <div className="-mt-8 mx-5 flex flex-col gap-4 max-w-xl sm:mx-auto">
        <section className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-3">
          <h1 className="text-text-main text-lg font-extrabold">تم الانتهاء من غسيل سيارتك</h1>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#F4F7F8] rounded-xl p-3 flex flex-col gap-1">
              <dt className="text-text-secondary text-xs">رقم الطلب</dt>
              <dd className="text-text-main font-bold" dir="ltr" style={{ textAlign: "right" }}>{data.code}</dd>
            </div>
            <div className="bg-[#F4F7F8] rounded-xl p-3 flex flex-col gap-1">
              <dt className="text-text-secondary text-xs">تاريخ التنفيذ</dt>
              <dd className="text-text-main font-bold">{dateText}</dd>
            </div>
            <div className="bg-[#F4F7F8] rounded-xl p-3 flex flex-col gap-1">
              <dt className="text-text-secondary text-xs">نوع السيارة</dt>
              <dd className="text-text-main font-bold">{data.carType}</dd>
            </div>
            <div className="bg-[#F4F7F8] rounded-xl p-3 flex flex-col gap-1">
              <dt className="text-text-secondary text-xs">الموظف</dt>
              <dd className="text-text-main font-bold">{data.employeeName ?? "—"}</dd>
            </div>
          </dl>
        </section>

        {data.photos.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-3">
            <h2 className="text-text-main text-base font-extrabold">صور سيارتك بعد الغسيل</h2>
            <div className="grid grid-cols-2 gap-3">
              {data.photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.label} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-xl bg-[#F4F7F8]" />
                  <span className="text-text-secondary text-xs font-bold">{p.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-4">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <Stars value={finalRating} readOnly />
              <h2 className="text-text-main text-base font-extrabold">شكرًا لتقييمك</h2>
              <p className="text-text-secondary text-sm leading-6">
                رأيك يساعدنا نقدّم لك خدمة أفضل. يسعدنا خدمتك مجددًا.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-text-main text-base font-extrabold text-center">
                كيف تقيّم أداء {data.employeeName ? data.employeeName : "الموظف"}؟
              </h2>
              <Stars value={rating} onChange={setRating} />
              <label className="flex flex-col gap-1.5 text-xs font-bold text-text-main">
                ملاحظات (اختياري)
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="اكتب ملاحظاتك هنا..."
                  className="w-full rounded-xl border border-[#E4E7EC] p-3 text-sm font-normal outline-none focus:border-primary resize-none"
                />
              </label>
              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
              <button
                onClick={submit}
                disabled={busy || rating < 1}
                className={`w-full py-4 rounded-2xl font-bold text-white ${
                  busy || rating < 1 ? "bg-disabled cursor-not-allowed" : "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
                }`}
              >
                {busy ? "جارٍ الإرسال..." : "إرسال التقييم"}
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
