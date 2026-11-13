import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

// Halaman yang butuh sesi admin. Suspense: halaman memakai useSearchParams/useParams (dirender di klien).
// AdminShell baru merender halaman setelah sesi diperiksa di browser; data dasbor dimuat di klien.
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-tint" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
