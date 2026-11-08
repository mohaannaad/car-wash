"use client";

import { usePathname } from "next/navigation";
import MaintenanceScreen from "./MaintenanceScreen";

// لوحة الأدمن وبوابة الموظفين يفضلوا شغالين حتى في وضع الصيانة
const ALWAYS_OPEN_PREFIXES = ["/admin", "/staff"];

export default function MaintenanceGate({
  on,
  message,
  children,
}: {
  on: boolean;
  message: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const exempt = ALWAYS_OPEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  if (on && !exempt) return <MaintenanceScreen message={message} />;
  return <>{children}</>;
}
