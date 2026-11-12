import type { Metadata } from "next";
import { BillingConfigView } from "@/components/admin/BillingConfigView";

export const metadata: Metadata = { title: "Harga & cara bayar" };

export default function Page() {
  return <BillingConfigView />;
}
