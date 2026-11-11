import Image, { type StaticImageData } from "next/image";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { rupiah, site } from "@/site";

export function TombolPlayStore({
  teks = `Coba gratis ${site.hariUjiCoba} hari`,
  ukuran = "besar",
  varian = "hijau",
}: {
  teks?: string;
  ukuran?: "kecil" | "besar";
  varian?: "hijau" | "putih";
}) {
  const warna =
    varian === "putih"
      ? "bg-white text-ink hover:bg-brand-soft shadow-[0_8px_24px_-10px_rgba(0,0,0,.45)]"
      : "bg-brand-press text-white hover:bg-brand-deep shadow-[0_10px_24px_-10px_rgba(46,139,98,.7)]";
  return (
    <a
      href={site.playStore}
      target="_blank"
      rel="noopener"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-2xl font-extrabold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand ${warna} ${
        ukuran === "kecil" ? "px-4 py-2.5 text-sm" : "px-6 py-4 text-base"
      }`}
    >
      <IkonGooglePlay className={ukuran === "kecil" ? "size-4" : "size-5"} />
      {teks}
    </a>
  );
}

/** Logo Google Play (satu warna, ikut warna teks) — tombol menuju halaman aplikasi di Play Store. */
export function IkonGooglePlay({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
    </svg>
  );
}

/** Logo WhatsApp (satu warna, ikut warna teks). */
export function IkonWhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/** Gambar maskot 3D (render Blender, prototype/maskot3d). Dekoratif: alt kosong. */
export function Maskot({ src, className = "", priority = false, sizes }: { src: StaticImageData; className?: string; priority?: boolean; sizes: string }) {
  return <Image src={src} alt="" priority={priority} sizes={sizes} className={`pointer-events-none h-auto select-none ${className}`} draggable={false} />;
}

export function Judul({ label, children, sub, terang = false, tengah = false }: { label?: string; children: React.ReactNode; sub?: React.ReactNode; terang?: boolean; tengah?: boolean }) {
  return (
    <div className={tengah ? "mx-auto max-w-2xl text-center" : ""}>
      {label && (
        <p className={`mb-3 inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] uppercase ${terang ? "text-[#9FD8BA]" : "text-brand-deep"}`}>
          <span className={`h-px w-6 ${terang ? "bg-[#9FD8BA]" : "bg-brand"}`} aria-hidden />
          {label}
        </p>
      )}
      <h2 className={`text-[28px] leading-[1.12] font-extrabold tracking-[-0.025em] text-balance sm:text-[40px] ${terang ? "text-white" : ""}`}>{children}</h2>
      {sub && <p className={`mt-4 text-[15px] leading-relaxed sm:text-[17px] ${terang ? "text-[#CFE6D9]" : "text-body"} ${tengah ? "mx-auto max-w-xl" : "max-w-xl"}`}>{sub}</p>}
    </div>
  );
}

/** Status bar Android (jam + sinyal/wifi/baterai). Ukuran dalam cqw → ikut lebar layar perangkat. */
function StatusBar({ tablet = false }: { tablet?: boolean }) {
  const ikon = tablet ? "size-[1.5cqw]" : "size-[3.6cqw]";
  return (
    <div className={`relative flex items-center justify-between bg-white font-sans font-extrabold text-ink ${tablet ? "h-[2.6cqw] px-[2cqw] text-[1.35cqw]" : "h-[8.5cqw] px-[6cqw] text-[3.4cqw]"}`}>
      <span>9.41</span>
      {!tablet && <span className="absolute top-1/2 left-1/2 size-[3.4cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#111a16]" aria-hidden />}
      <span className="flex items-center gap-[0.8cqw]">
        <Signal className={ikon} strokeWidth={3} />
        <Wifi className={ikon} strokeWidth={3} />
        <BatteryFull className={ikon} strokeWidth={2.5} />
      </span>
    </div>
  );
}

/** Garis navigasi gestur Android. */
function NavBar({ tablet = false }: { tablet?: boolean }) {
  return (
    <div className={`flex items-center justify-center bg-white ${tablet ? "h-[2.2cqw]" : "h-[6cqw]"}`}>
      <span className={`rounded-full bg-[#2a332f] ${tablet ? "h-[0.45cqw] w-[11cqw]" : "h-[1.2cqw] w-[30cqw]"}`} />
    </div>
  );
}

/** Bingkai tablet Android (lanskap) berisi screenshot aplikasi asli. */
export function Tablet({ src, alt, className = "", sizes, priority = false }: { src: StaticImageData; alt: string; className?: string; sizes: string; priority?: boolean }) {
  return (
    <div className={`@container ${className}`}>
      <div className="relative rounded-[3.2cqw] bg-[#141c18] p-[1.6cqw] shadow-[0_40px_70px_-30px_rgba(23,53,42,.55),inset_0_0_0_1px_rgba(255,255,255,.08)]">
        <span className="absolute top-[0.55cqw] left-1/2 size-[0.55cqw] -translate-x-1/2 rounded-full bg-[#2b3631]" aria-hidden />
        <div className="@container overflow-hidden rounded-[1.4cqw] bg-white">
          <StatusBar tablet />
          <Image src={src} alt={alt} sizes={sizes} priority={priority} className="block h-auto w-full" />
          <NavBar tablet />
        </div>
      </div>
    </div>
  );
}

/** Bingkai HP Android berisi screenshot aplikasi asli (status bar + kamera punch-hole + garis gestur). */
export function Hp({ src, alt, className = "", sizes, priority = false }: { src: StaticImageData; alt: string; className?: string; sizes: string; priority?: boolean }) {
  return (
    <div className={`@container ${className}`}>
      <div className="relative rounded-[13cqw] bg-[#141c18] p-[2.6cqw] shadow-[0_34px_50px_-24px_rgba(23,53,42,.65),inset_0_0_0_1px_rgba(255,255,255,.1)]">
        {/* tombol daya & volume */}
        <span className="absolute top-[22%] -right-[0.9cqw] h-[9%] w-[1.2cqw] rounded-r bg-[#26302b]" aria-hidden />
        <span className="absolute top-[34%] -right-[0.9cqw] h-[15%] w-[1.2cqw] rounded-r bg-[#26302b]" aria-hidden />
        <div className="@container overflow-hidden rounded-[10.5cqw] bg-white">
          <StatusBar />
          <Image src={src} alt={alt} sizes={sizes} priority={priority} className="block h-auto w-full" />
          <NavBar />
        </div>
      </div>
    </div>
  );
}

/** Harga Lifetime ditulis seperti struk — ciri Kasir Sakti (maskotnya kertas struk). */
export function StrukHarga({ className = "" }: { className?: string }) {
  const hemat = site.hargaLifetimeNormal - site.hargaLifetime;
  return (
    <div className={`relative [--gerigi:#fff] ${className}`}>
      <div className="gerigi rounded-t-2xl bg-white px-5 pt-4 pb-4 shadow-[0_18px_40px_-24px_rgba(23,53,42,.45)] ring-1 ring-line">
        <div className="flex items-center justify-between text-[11px] font-extrabold tracking-[0.12em] text-muted uppercase">
          <span>Kasir Sakti · Lifetime</span>
          <span className="rounded bg-gold-soft px-1.5 py-0.5 tracking-normal text-gold-deep normal-case">Promo</span>
        </div>
        <dl className="mt-3 space-y-1.5 font-mono text-[13px] text-body">
          <div className="flex items-baseline gap-2">
            <dt>Harga normal</dt>
            <span className="flex-1 border-b border-dotted border-[#c9d9cf]" aria-hidden />
            <dd className="line-through">{rupiah(site.hargaLifetimeNormal)}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt>Potongan promo</dt>
            <span className="flex-1 border-b border-dotted border-[#c9d9cf]" aria-hidden />
            <dd className="text-brand-deep">−{rupiah(hemat)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-end justify-between gap-4 border-t border-dashed border-[#c9d9cf] pt-3">
          <span className="text-[13px] leading-tight whitespace-nowrap text-body">Total sekali bayar</span>
          <b className="text-[30px] leading-none font-extrabold tracking-[-0.02em] whitespace-nowrap">{rupiah(site.hargaLifetime)}</b>
        </div>
      </div>
    </div>
  );
}
