import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { CariPanduan } from "@/components/CariPanduan";
import { Footer, Header } from "@/components/kerangka";
import { IkonWhatsApp } from "@/components/ui";
import { artikel, artikelTopik, IkonTopik, populer, ringkas, topik, topikDari } from "@/panduan";
import { ogDasar } from "@/seo";
import { site } from "@/site";

export const metadata: Metadata = {
  title: "Panduan — Kasir Sakti",
  description: "Panduan langkah demi langkah memakai Kasir Sakti: transaksi, QRIS, kasbon, printer struk, stok, karyawan, dan lainnya.",
  alternates: { canonical: "/panduan" },
  openGraph: { ...ogDasar, title: "Panduan — Kasir Sakti", url: "/panduan" },
};

export default function Panduan() {
  const item = artikel.map((a) => {
    const t = topikDari(a).judul;
    return { slug: a.slug, judul: a.judul, topik: t, ringkas: ringkas(a), cari: `${a.judul} ${a.isi} ${t}`.toLowerCase() };
  });
  return (
    <>
      <Header />
      <main>
        <section className="gerigi bg-tint [--gerigi:var(--color-tint)]">
          <div className="mx-auto w-full max-w-4xl px-5 pt-16 pb-20 text-center sm:px-8 lg:pt-20">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-brand-deep uppercase">
              <span className="h-px w-6 bg-brand" aria-hidden />
              Panduan
              <span className="h-px w-6 bg-brand" aria-hidden />
            </p>
            <h1 className="text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance sm:text-[52px]">Ada yang bisa kami bantu?</h1>
            <p className="mx-auto mt-4 max-w-xl text-[17px] text-body">
              {artikel.length} panduan singkat, sama dengan menu Bantuan di aplikasi. Ikuti langkahnya pelan-pelan.
            </p>
            <div className="mx-auto mt-8 max-w-2xl text-left">
              <CariPanduan item={item} />
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex items-center gap-2 text-sm font-extrabold tracking-[0.12em] text-muted uppercase">
            <Flame className="size-4 text-[#d0644b]" aria-hidden /> Paling sering dibaca
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {populer.map((a) => (
              <Link key={a.slug} href={`/panduan/${a.slug}`} className="group rounded-2xl bg-white p-5 ring-1 ring-line transition hover:ring-brand">
                <span className="text-xs font-extrabold text-brand-deep">{topikDari(a).judul}</span>
                <span className="mt-1 flex items-start justify-between gap-3 text-[17px] leading-snug font-extrabold">
                  {a.judul}
                  <ArrowRight className="mt-1 size-4 flex-none text-brand transition group-hover:translate-x-0.5" aria-hidden />
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-body">{ringkas(a, 90)}</span>
              </Link>
            ))}
          </div>

          <h2 className="mt-20 text-[28px] font-extrabold tracking-[-0.02em] sm:text-[34px]">Semua topik</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {topik.map((t) => {
              const daftar = artikelTopik(t.id);
              return (
                <section key={t.id} id={t.id} className="scroll-mt-24 rounded-[24px] bg-tint p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-brand-deep ring-1 ring-line">
                      <IkonTopik topik={t} className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold">{t.judul}</h3>
                      <p className="text-sm text-muted">{daftar.length} panduan</p>
                    </div>
                  </div>
                  <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                    {daftar.map((a) => (
                      <li key={a.slug}>
                        <Link href={`/panduan/${a.slug}`} className="group flex items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-extrabold hover:bg-tint">
                          {a.judul}
                          <ArrowRight className="size-4 flex-none text-brand transition group-hover:translate-x-0.5" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-ink p-7 text-white sm:flex-row sm:items-center sm:p-9">
            <div>
              <h2 className="text-2xl font-extrabold">Masih bingung?</h2>
              <p className="mt-1 text-[15px] text-[#CFE6D9]">Ceritakan kendalamu; sertakan nama toko dan langkah yang sudah dicoba.</p>
            </div>
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Halo tim Kasir Sakti, saya butuh bantuan.")}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-4 font-extrabold text-ink hover:bg-brand-soft"
            >
              <IkonWhatsApp className="size-5 text-[#25d366]" /> Chat WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
