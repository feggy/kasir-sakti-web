import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Footer, Header } from "@/components/kerangka";
import { IkonWhatsApp, Tablet } from "@/components/ui";
import { artikel, artikelTopik, IsiArtikel, IkonTopik, ringkas, topikDari } from "@/panduan";
import { ogDasar } from "@/seo";
import { site } from "@/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return artikel.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = artikel.find((x) => x.slug === slug);
  if (!a) return {};
  const judul = `${a.judul} — Panduan Kasir Sakti`;
  return {
    title: judul,
    description: ringkas(a, 155),
    alternates: { canonical: `/panduan/${a.slug}` },
    openGraph: { ...ogDasar, title: judul, description: ringkas(a, 155), url: `/panduan/${a.slug}` },
  };
}

export default async function ArtikelPanduan({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = artikel.find((x) => x.slug === slug);
  if (!a) notFound();
  const t = topikDari(a);
  const i = artikel.indexOf(a);
  const sebelum = artikel[i - 1];
  const sesudah = artikel[i + 1];
  const lain = artikelTopik(t.id).filter((x) => x.slug !== a.slug);

  return (
    <>
      <Header />
      <main className="bg-tint">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pt-10 pb-24 sm:px-8 lg:grid-cols-[1fr_300px] lg:pt-14">
          <article>
            <nav aria-label="Lokasi halaman" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <Link href="/panduan" className="hover:text-ink">Panduan</Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href={`/panduan#${t.id}`} className="hover:text-ink">{t.judul}</Link>
            </nav>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-brand-deep ring-1 ring-line">
              <IkonTopik topik={t} className="size-4" /> {t.judul}
            </div>
            <h1 className="mt-4 text-[32px] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance sm:text-[44px]">{a.judul}</h1>

            <div className="mt-8 rounded-[28px] bg-white p-6 ring-1 ring-line sm:p-9">
              <IsiArtikel isi={a.isi} />
            </div>

            {a.gambar && (
              <figure className="mt-6">
                <Tablet
                  src={{ src: a.gambar.src, width: a.gambar.w, height: a.gambar.h }}
                  alt={`Tampilan aplikasi: ${a.judul}`}
                  sizes="(min-width: 1024px) 760px, 92vw"
                />
                <figcaption className="mt-3 text-center text-sm text-muted">Tampilan di tablet. Di HP, menunya sama dengan susunan yang lebih ringkas.</figcaption>
              </figure>
            )}

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {sebelum ? (
                <Link href={`/panduan/${sebelum.slug}`} className="group rounded-2xl bg-white p-5 ring-1 ring-line hover:ring-brand">
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" aria-hidden /> Sebelumnya
                  </span>
                  <span className="mt-1 block font-extrabold">{sebelum.judul}</span>
                </Link>
              ) : (
                <span />
              )}
              {sesudah && (
                <Link href={`/panduan/${sesudah.slug}`} className="group rounded-2xl bg-white p-5 text-right ring-1 ring-line hover:ring-brand">
                  <span className="flex items-center justify-end gap-1.5 text-sm text-muted">
                    Berikutnya <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-1 block font-extrabold">{sesudah.judul}</span>
                </Link>
              )}
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {lain.length > 0 && (
              <div className="rounded-[24px] bg-white p-6 ring-1 ring-line">
                <h2 className="text-sm font-extrabold tracking-[0.12em] text-muted uppercase">Lainnya di {t.judul}</h2>
                <ul className="mt-4 space-y-3">
                  {lain.map((x) => (
                    <li key={x.slug}>
                      <Link href={`/panduan/${x.slug}`} className="text-[15px] font-extrabold text-brand-deep hover:underline">
                        {x.judul}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-[24px] bg-ink p-6 text-white">
              <h2 className="text-lg font-extrabold">Masih bingung?</h2>
              <p className="mt-1 text-sm text-[#CFE6D9]">Tanya langsung, sertakan nama toko dan langkah yang sudah dicoba.</p>
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Halo tim Kasir Sakti, saya butuh bantuan soal "${a.judul}".`)}`}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-ink hover:bg-brand-soft"
              >
                <IkonWhatsApp className="size-4 text-[#25d366]" /> Chat WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
