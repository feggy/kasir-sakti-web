import Link from "next/link";
import Image from "next/image";
import { IkonWhatsApp, Maskot, TombolPlayStore } from "@/components/ui";
import { site } from "@/site";
import dasar from "@/assets/maskot/dasar.webp";

const wadah = "mx-auto w-full max-w-6xl px-5 sm:px-8";

/* ------------------------------------------------------------------ header */

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur-md">
      <div className={`${wadah} flex h-[72px] items-center justify-between`}>
        <Link href="/" aria-label="Kasir Sakti — ke atas" className="-ml-2">
          {/* Logo ringkas: sayap + "Kasir / Sakti" dua baris (sumber: prototype/generator/logo_sayap.py). */}
          <Image src="/logo.svg" alt="Kasir Sakti" width={318} height={100} priority className="h-8 w-auto sm:h-9" />
        </Link>
        <nav className="flex items-center gap-7 text-[15px] text-body">
          <Link href="/#fitur" className="hidden hover:text-ink md:inline">Fitur</Link>
          <Link href="/#laporan" className="hidden hover:text-ink md:inline">Laporan</Link>
          <Link href="/#harga" className="hidden hover:text-ink md:inline">Harga</Link>
          <Link href="/panduan" className="hidden hover:text-ink md:inline">Panduan</Link>
          <Link href="/kontak" className="hidden hover:text-ink md:inline">Kontak</Link>
          <TombolPlayStore teks="Unduh" ukuran="kecil" />
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ footer */

/** [maskot] = maskot mengintip di tepi atas; matikan di halaman yang sudah punya maskot besar di dekat footer (404). */
export function Footer({ maskot = true }: { maskot?: boolean } = {}) {
  const kolom = [
    { judul: "Produk", tautan: [["Fitur", "/#fitur"], ["Laporan", "/#laporan"], ["Harga", "/#harga"], ["Tanya jawab", "/#tanya"]] },
    {
      judul: "Bantuan",
      tautan: [["Panduan", "/panduan"], ["Kontak", "/kontak"], ["Unduh di Play Store", site.playStore], ...(site.whatsapp ? [["Chat WhatsApp", `https://wa.me/${site.whatsapp}`]] : [])],
    },
    { judul: "Legal", tautan: [["Syarat & Ketentuan", "/syarat-ketentuan"], ["Kebijakan Privasi", "/kebijakan-privasi"], ["Hapus Akun", "/hapus-akun"]] },
  ];
  return (
    <footer className="gerigi-atas relative bg-ink text-[#CFE6D9] [--gerigi:var(--color-ink)]">
      {/* maskot mengintip dari balik tepi footer */}
      {maskot && <Maskot src={dasar} sizes="120px" className="absolute -top-[96px] right-8 w-[120px] sm:right-16" />}
      <div className={`${wadah} grid gap-12 pt-16 pb-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]`}>
        <div>
          <Image src="/logo-putih.svg" alt="Kasir Sakti" width={700} height={100} className="h-6 w-auto" />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed">
            Aplikasi kasir untuk warung, kedai, dan toko kecil. Jalan tanpa internet, bayar sekali pakai selamanya.
          </p>
          <div className="mt-6">
            <TombolPlayStore varian="putih" ukuran="kecil" />
          </div>
        </div>
        {kolom.map((k) => (
          <div key={k.judul}>
            <h3 className="text-sm font-extrabold tracking-[0.12em] text-white uppercase">{k.judul}</h3>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {k.tautan.map(([teks, href]) => (
                <li key={teks}>
                  <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} className="hover:text-white">
                    {teks}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className={`${wadah} flex flex-col gap-2 py-6 text-sm sm:flex-row sm:items-center sm:justify-between`}>
          <p>
            © {new Date().getFullYear()} Kasir Sakti · {site.pembuat}
          </p>
          <p className="text-[#9FB8AA]">Dibuat di Indonesia untuk UMKM.</p>
        </div>
      </div>
    </footer>
  );
}

/** Tombol WhatsApp mengambang (bulat) di pojok kanan bawah, di semua halaman. */
export function TombolWaMengambang() {
  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Halo Kasir Sakti, saya mau tanya tentang aplikasinya.")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Tanya via WhatsApp"
      title="Tanya via WhatsApp"
      className="fixed right-4 bottom-4 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_12px_28px_-8px_rgba(0,0,0,.35)] ring-4 ring-white/70 transition hover:bg-[#1ebe5b] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#25d366] sm:right-6 sm:bottom-6"
    >
      <IkonWhatsApp className="size-7" />
    </a>
  );
}
