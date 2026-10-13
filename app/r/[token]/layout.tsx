import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تقييم الخدمة | غسلة ولمعة",
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
