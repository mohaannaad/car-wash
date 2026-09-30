import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

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
        url: "/images/logo.png",
        width: 800,
        height: 800,
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased`}>
        {children}
      </body>
    </html>
  );
}