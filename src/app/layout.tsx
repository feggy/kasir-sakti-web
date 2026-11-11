import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { TombolWaMengambang } from "@/components/kerangka";
import { ogDasar } from "@/seo";
import { site } from "@/site";
import "./globals.css";

const jakarta = localFont({
  src: [
    { path: "../assets/fonts/PlusJakartaSans-500.woff", weight: "500" },
    { path: "../assets/fonts/PlusJakartaSans-800.woff", weight: "800" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

const judul = "Kasir Sakti — Aplikasi kasir warung yang jalan tanpa internet";
const deskripsi =
  "Catat jualan, stok, dan untung harian dari HP. Tetap jalan tanpa internet. Bayar sekali, pakai selamanya. Coba gratis 14 hari.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: judul,
  description: deskripsi,
  openGraph: { ...ogDasar, title: judul, description: deskripsi, url: "/" },
  twitter: { card: "summary_large_image", title: judul, description: deskripsi, images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#f3faf6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans font-medium antialiased">
        {children}
        <TombolWaMengambang />
      </body>
    </html>
  );
}
