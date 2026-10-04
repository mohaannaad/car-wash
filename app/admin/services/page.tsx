"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServicesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/car-types");
  }, [router]);

  return (
    <div className="p-8 text-center text-text-secondary text-sm">
      جاري التحويل لصفحة أنواع السيارات والخدمات...
    </div>
  );
}