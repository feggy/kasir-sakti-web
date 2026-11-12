"use client";

import { usePathname } from "next/navigation";

/** Tombol WhatsApp mengambang hanya untuk halaman situs — tidak di panel admin (/admin). */
export function WaSitus({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/admin" || path?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
