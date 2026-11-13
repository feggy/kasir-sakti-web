import type { Metadata } from "next";
import { PaymentAlertsView } from "@/components/admin/PaymentAlertsView";

export const metadata: Metadata = { title: "Peringatan pembayaran" };

export default function Page() {
  return <PaymentAlertsView />;
}
