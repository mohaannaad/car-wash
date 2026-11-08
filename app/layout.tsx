import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { connection } from "next/server";
import { getMaintenance } from "../lib/maintenance";
import MaintenanceGate from "./components/MaintenanceGate";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "غسلة ولمعة | خدمة غسيل السيارات",
  description: "احجز خدمة غسيل سيارتك بسهولة من مكانك، مع باقات وخدمات إضافية متنوعة.",
  metadataBase: new URL("https://washksa.com"),
  openGraph: {
    title: "غسلة ولمعة",
    description: "احجز خدمة غسيل سيارتك بسهولة من مكانك",
    url: "https://washksa.com",
    siteName: "غسلة ولمعة",
    images: [
  {
    url: "/images/og-image.png",
    width: 1200,
    height: 630,
  },
],
    locale: "ar_SA",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const maintenance = await getMaintenance();

  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased`}>
        <MaintenanceGate on={maintenance.on} message={maintenance.message}>
          {children}
        </MaintenanceGate>
      </body>
    </html>
  );
}