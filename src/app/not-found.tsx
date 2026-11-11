import Link from "next/link";
import { Footer, Header } from "@/components/kerangka";
import { Maskot } from "@/components/ui";
import cari from "@/assets/maskot/cari.webp";

export const metadata = { title: "Halaman tidak ditemukan — Kasir Sakti" };

export default function TidakDitemukan() {
  return (
    <>
      <Header />
      <main className="bg-tint">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:py-28">
          <div>
            <p className="font-mono text-sm text-muted">Galat 404</p>
            <h1 className="mt-2 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance sm:text-[52px]">Halaman ini tidak ketemu.</h1>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-body">
              Mungkin tautannya salah ketik, atau halamannya sudah dipindah. Maskot kami sudah mencarinya ke mana-mana.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="inline-flex items-center rounded-2xl bg-brand-press px-6 py-4 font-extrabold text-white hover:bg-brand-deep">
                Kembali ke beranda
              </Link>
              <Link href="/kontak" className="inline-flex items-center rounded-2xl bg-white px-6 py-4 font-extrabold text-brand-deep ring-1 ring-line hover:ring-brand">
                Hubungi kami
              </Link>
            </div>
          </div>
          <Maskot src={cari} priority sizes="(min-width: 1024px) 520px, 90vw" className="mx-auto w-[90%] max-w-[520px]" />
        </div>
      </main>
      <Footer maskot={false} />
    </>
  );
}
