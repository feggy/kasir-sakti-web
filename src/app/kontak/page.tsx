import type { Metadata } from "next";
import { ogDasar } from "@/seo";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { IkonWhatsApp } from "@/components/ui";
import { Footer, Header } from "@/components/kerangka";
import { site } from "@/site";

export const metadata: Metadata = {
  title: "Kontak — Kasir Sakti",
  description: "Hubungi Kasir Sakti lewat WhatsApp atau email, atau kunjungi kami di Pekanbaru.",
  alternates: { canonical: "/kontak" },
  openGraph: { ...ogDasar, title: "Kontak — Kasir Sakti", description: "Hubungi Kasir Sakti lewat WhatsApp atau email, atau kunjungi kami di Pekanbaru.", url: "/kontak" },
};

/** Tampilan nomor 62… → 0… dengan pemisah, mis. 0800-0000-0000. */
function nomorTampil(n: string) {
  const lokal = n.startsWith("62") ? "0" + n.slice(2) : n;
  return lokal.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}

export default function Kontak() {
  const peta = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.alamat.join(", "))}`;
  const kanal = [
    {
      ikon: IkonWhatsApp,
      judul: "WhatsApp",
      isi: nomorTampil(site.whatsapp),
      catatan: "Cara tercepat untuk bantuan, pembayaran paket, dan pertanyaan seputar aplikasi.",
      aksi: "Chat sekarang",
      href: `https://wa.me/${site.whatsapp}`,
      utama: true,
    },
    {
      ikon: Mail,
      judul: "Email",
      isi: site.email,
      catatan: "Untuk kerja sama, permintaan data pribadi, atau pertanyaan yang butuh lampiran.",
      aksi: "Kirim email",
      href: `mailto:${site.email}`,
      utama: false,
    },
  ];
  return (
    <>
      <Header />
      <main className="bg-tint">
        <div className="mx-auto w-full max-w-6xl px-5 pt-14 pb-24 sm:px-8 lg:pt-20">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-brand-deep uppercase">
            <span className="h-px w-6 bg-brand" aria-hidden />
            Kontak
          </p>
          <h1 className="max-w-2xl text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance sm:text-[52px]">Ada pertanyaan? Kami siap bantu.</h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-body">
            Mau tanya soal fitur, butuh bantuan memasang printer, atau ingin membayar paket — hubungi kami lewat salah satu jalur di bawah.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {kanal.map(({ ikon: Ikon, judul, isi, catatan, aksi, href, utama }) => (
              <a
                key={judul}
                href={href}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                className={`group flex flex-col rounded-[28px] p-7 transition sm:p-9 ${utama ? "bg-brand-press text-white hover:bg-brand-deep" : "bg-white ring-1 ring-line hover:ring-brand"}`}
              >
                <span className={`inline-flex size-12 items-center justify-center rounded-2xl ${utama ? "bg-white/15 text-white" : "bg-brand-soft text-brand-deep"}`}>
                  <Ikon className="size-6" />
                </span>
                <h2 className={`mt-6 text-sm font-extrabold tracking-[0.12em] uppercase ${utama ? "text-[#CFE6D9]" : "text-muted"}`}>{judul}</h2>
                <p className="mt-1 text-2xl font-extrabold tracking-[-0.01em] break-all sm:text-[28px]">{isi}</p>
                <p className={`mt-3 text-[15px] leading-relaxed ${utama ? "text-[#e3f4ea]" : "text-body"}`}>{catatan}</p>
                <span className={`mt-8 inline-flex items-center gap-1.5 text-[15px] font-extrabold ${utama ? "text-white" : "text-brand-deep"}`}>
                  {aksi}
                  <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-5 grid gap-6 rounded-[28px] bg-white p-7 ring-1 ring-line sm:p-9 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-deep">
              <MapPin className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-extrabold tracking-[0.12em] text-muted uppercase">Alamat</h2>
              <address className="mt-1 text-lg leading-snug font-extrabold not-italic sm:text-xl">
                {site.alamat.map((baris) => (
                  <span key={baris} className="block">
                    {baris}
                  </span>
                ))}
              </address>
              <p className="mt-2 text-sm text-muted">Mohon hubungi lewat WhatsApp dulu sebelum berkunjung.</p>
            </div>
            <a
              href={peta}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 self-start rounded-xl bg-tint px-4 py-2.5 text-[15px] font-extrabold text-brand-deep ring-1 ring-line hover:ring-brand md:self-center"
            >
              Buka di Google Maps <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
