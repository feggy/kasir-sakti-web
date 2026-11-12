import type { Metadata } from "next";
import { GrowthView } from "@/components/admin/GrowthView";

export const metadata: Metadata = { title: "Pertumbuhan merchant" };

export default function Page() {
  return <GrowthView />;
}
