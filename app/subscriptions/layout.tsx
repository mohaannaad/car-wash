import { SubscriptionProvider } from "../context/SubscriptionContext";

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}