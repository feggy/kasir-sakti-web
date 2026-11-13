import type { Metadata } from "next";
import { Footer, Header } from "@/components/kerangka";
import { IkonWhatsApp, Maskot } from "@/components/ui";
import { site } from "@/site";
import lompat from "@/assets/maskot/lompat.webp";

// Halaman kembali setelah membayar paket lewat QRIS (return_url QRISGate; kasir-sakti-service docs/api.md
// "Pembayaran paket lewat QRIS"). Status sebenarnya dicek aplikasi — halaman ini hanya mengarahkan pemilik kembali.
export const metadata: Metadata = {
  title: "Pembayaran diproses — Kasir Sakti",
  description: "Kembali ke aplikasi Kasir Sakti untuk melihat paket Anda.",
  robots: { index: false, follow: false },
};

export default function BayarSelesai() {
  return (
    <>
      <Header />
      <main className="bg-tint">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pt-14 pb-24 text-center sm:px-8 lg:pt-20">
          <Maskot src={lompat} sizes="220px" className="h-auto w-[200px]" priority />
          <h1 className="mt-6 text-[32px] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance sm:text-[40px]">
            Terima kasih! Pembayaran sedang diproses.
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-body">
            Kembali ke aplikasi Kasir Sakti — halaman <b className="text-ink">Paket</b> memeriksa pembayaran secara otomatis dan
            paket aktif begitu pembayaran terdeteksi (biasanya kurang dari 1 menit).
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-body">
            Sudah lebih dari 15 menit dan paket belum aktif? Hubungi kami dengan menyebutkan nominal yang Anda bayar.
          </p>
          <a
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Halo Kasir Sakti, saya sudah bayar paket lewat QRIS tapi belum aktif.")}`}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-brand-press px-6 text-[16px] font-extrabold text-white hover:bg-brand-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <IkonWhatsApp className="size-5" /> Hubungi lewat WhatsApp
          </a>
        </div>
      </main>
      <Footer maskot={false} />
    </>
  );
}
