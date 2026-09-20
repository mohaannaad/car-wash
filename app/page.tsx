import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden">
      {/* صورة الخلفية */}
      <Image
        src="/images/hero-bg.png"
        alt="خدمة غسيل السيارات"
        fill
        priority
        className="object-cover -z-20"
      />

      {/* طبقة تعتيم فوق الصورة عشان النص يبان واضح */}
      <div className="absolute inset-0 bg-black/50 -z-10" />

      {/* اللوجو */}
      <div className="flex flex-col items-center mt-28 px-6">
        
        <Image
  src="/images/logo.png"
  alt="غسلة ولمعة"
  width={220}
  height={220}
  priority
  className="h-auto w-auto max-w-[220px]"
/>
      </div>

      {/* النصوص + الزرار في أسفل الصفحة */}
     {/* العنوان والوصف - في نص الصفحة */}
<div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
  <h1 className="text-white text-2xl font-bold">
    خدمة غسيل السيارات
  </h1>
  <p className="text-white/90 text-base">
    بكل سهوله من مكانك
  </p>
</div>

{/* الزرار - يفضل في الأسفل */}
<div className="w-full px-6 pb-10">
  <Link
    href="/booking"
    className="w-full max-w-sm mx-auto block bg-primary text-white font-bold text-center py-4 rounded-full"
  >
    ابدأ الطلب
  </Link>
</div>
    </main>
  );
}