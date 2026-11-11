"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

type Item = { slug: string; judul: string; topik: string; ringkas: string; cari: string };

/** Kotak cari panduan (di peramban saja, tanpa server). Semua kata harus cocok, seperti pencarian di aplikasi. */
export function CariPanduan({ item }: { item: Item[] }) {
  const [q, setQ] = useState("");
  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!kata.length) return null;
    return item.filter((a) => kata.every((k) => a.cari.includes(k)));
  }, [q, item]);

  return (
    <div className="relative">
      <label className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_18px_40px_-24px_rgba(23,53,42,.5)] ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
        <Search className="size-5 flex-none text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari panduan, misalnya “printer” atau “kasbon”…"
          className="w-full bg-transparent text-[16px] outline-none placeholder:text-muted"
          aria-label="Cari panduan"
        />
      </label>
      {hasil && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-[60vh] overflow-auto rounded-2xl bg-white p-2 shadow-[0_24px_50px_-20px_rgba(23,53,42,.45)] ring-1 ring-line">
          {hasil.length === 0 ? (
            <p className="px-4 py-5 text-[15px] text-body">Tidak ada panduan yang cocok. Coba kata lain atau tanya kami lewat WhatsApp.</p>
          ) : (
            hasil.map((a) => (
              <Link key={a.slug} href={`/panduan/${a.slug}`} className="group flex items-start justify-between gap-4 rounded-xl px-4 py-3 hover:bg-tint">
                <span>
                  <span className="block font-extrabold">{a.judul}</span>
                  <span className="mt-0.5 block text-sm text-muted">{a.topik}</span>
                </span>
                <ArrowRight className="mt-1 size-4 flex-none text-brand opacity-0 transition group-hover:opacity-100" aria-hidden />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
