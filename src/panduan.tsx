import { createElement } from "react";
import { ChefHat, Contact, Package, Printer, RefreshCw, Rocket, ShoppingBag, UserCog, Users, Wallet, type LucideIcon } from "lucide-react";
import data from "@/data/panduan.json";

/** Data dibuat oleh scripts/siapkan_panduan.py dari teks Bantuan di aplikasi — jangan diedit manual. */
export type Topik = { id: string; judul: string; ikon: string };
export type Artikel = { slug: string; topik: string; judul: string; isi: string; gambar?: { src: string; w: number; h: number } };

export const topik = data.topik as Topik[];
export const artikel = data.artikel as Artikel[];
export const populer = data.populer.map((s) => artikel.find((a) => a.slug === s)!).filter(Boolean);

const IKON: Record<string, LucideIcon> = {
  rocket: Rocket,
  shoppingBag: ShoppingBag,
  chefHat: ChefHat,
  printer: Printer,
  wallet: Wallet,
  users: Users,
  refreshCw: RefreshCw,
  package: Package,
  contact: Contact,
  userCog: UserCog,
};

/** Ikon topik (nama ikon Lucide dari aplikasi). createElement: komponen dipilih dari peta, bukan dibuat saat render. */
export function IkonTopik({ topik, className }: { topik: Topik; className?: string }) {
  return createElement(IKON[topik.ikon] ?? Rocket, { className, "aria-hidden": true });
}
export const topikDari = (a: Artikel) => topik.find((t) => t.id === a.topik)!;
export const artikelTopik = (id: string) => artikel.filter((a) => a.topik === id);

/** Ringkasan satu baris untuk kartu/daftar (tanpa nomor langkah). */
export const ringkas = (a: Artikel, n = 120) => {
  const t = a.isi.replace(/^\d+\.\s*/gm, "").replace(/\n/g, " ");
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t;
};

/** Pemisah jalur menu "Pengaturan › Struk": tanda › diberi warna agar jalur mudah diikuti. */
function Jalur({ teks }: { teks: string }) {
  return (
    <>
      {teks.split(" › ").map((b, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1 font-extrabold text-brand" aria-label="lalu">›</span>}
          {b}
        </span>
      ))}
    </>
  );
}

/** Isi artikel: baris "1. …" jadi langkah bernomor, baris lain jadi paragraf. */
export function IsiArtikel({ isi }: { isi: string }) {
  const baris = isi.split("\n").filter(Boolean);
  const blok: ({ jenis: "p"; teks: string } | { jenis: "ol"; item: string[] })[] = [];
  for (const b of baris) {
    const m = b.match(/^\d+\.\s*(.*)$/);
    if (m) {
      const akhir = blok.at(-1);
      if (akhir?.jenis === "ol") akhir.item.push(m[1]);
      else blok.push({ jenis: "ol", item: [m[1]] });
    } else blok.push({ jenis: "p", teks: b });
  }
  return (
    <div className="space-y-5 text-[16px] leading-relaxed text-body">
      {blok.map((k, i) =>
        k.jenis === "p" ? (
          <p key={i}>
            <Jalur teks={k.teks} />
          </p>
        ) : (
          <ol key={i} className="space-y-4">
            {k.item.map((t, j) => (
              <li key={j} className="flex gap-4">
                <span className="inline-flex size-8 flex-none items-center justify-center rounded-full bg-brand-press text-sm font-extrabold text-white">{j + 1}</span>
                <span className="pt-1">
                  <Jalur teks={t} />
                </span>
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
