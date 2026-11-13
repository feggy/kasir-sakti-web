import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/toast";

// Admin platform (tim Kasir Sakti) — app.kasirsakti.id/admin. Tidak ditautkan dari landing dan tidak diindeks.
// Semua halaman = komponen klien yang memanggil API langsung (cookie sesi milik api.kasirsakti.id).
// Kontrak: kasir-sakti-service/docs/api.md bagian "Admin platform".
export const metadata: Metadata = {
  title: { default: "Admin · Kasir Sakti", template: "%s · Admin Kasir Sakti" },
  description: "Admin platform Kasir Sakti.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
