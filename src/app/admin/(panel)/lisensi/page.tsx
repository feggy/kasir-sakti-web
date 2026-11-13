import type { Metadata } from "next";
import { LicenseListView } from "@/components/admin/LicenseListView";

export const metadata: Metadata = { title: "Lisensi" };

export default function Page() {
  return <LicenseListView />;
}
