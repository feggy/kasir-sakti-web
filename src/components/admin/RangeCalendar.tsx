"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { focusRing } from "./ui";

// Kalender pemilih rentang ala pemesanan hotel: klik tanggal awal, lalu tanggal akhir; hari di antaranya tersorot
// (juga saat kursor melayang sebelum klik kedua). Tanggal = string YYYY-MM-DD (zona Asia/Jakarta dihitung pemanggil).

const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DAY = 86_400_000;

const toMs = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
const toStr = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const spanDays = (a: string, b: string) => Math.round((toMs(b) - toMs(a)) / DAY) + 1;

const monthTitle = (y: number, m: number) =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, m, 1));
const fullDate = (d: string) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(toMs(d));
export const shortDate = (d: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(toMs(d));

export function RangeCalendar({
  from,
  to,
  max,
  maxDays,
  onChange,
}: {
  /** Rentang saat ini ("" = belum dipilih). `to` kosong dengan `from` terisi = menunggu klik kedua. */
  from: string;
  to: string;
  /** Tanggal terakhir yang boleh dipilih (biasanya hari ini). */
  max: string;
  /** Panjang rentang maksimum (hari), opsional. */
  maxDays?: number;
  onChange: (from: string, to: string) => void;
}) {
  const start = to || from || max; // tampilkan bulan tanggal akhir (rentang terbaru biasanya berakhir di bulan ini)
  const [view, setView] = useState({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 });
  const [hover, setHover] = useState<string | null>(null);
  const pending = !!from && !to;

  const first = Date.UTC(view.y, view.m, 1);
  const lead = (new Date(first).getUTCDay() + 6) % 7; // Senin = 0
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toStr(first + i * DAY)),
  ];
  while (cells.length % 7) cells.push(null);

  const lastOfView = toStr(Date.UTC(view.y, view.m + 1, 0));
  const canNext = lastOfView < max;
  const move = (n: number) => setView((v) => ({ y: v.y + Math.floor((v.m + n) / 12), m: (((v.m + n) % 12) + 12) % 12 }));

  // Ujung rentang yang ditampilkan: saat menunggu klik kedua, ikut posisi kursor.
  const end = pending ? hover : to;
  const [lo, hi] = from && end ? (end < from ? [end, from] : [from, end]) : [from, from];

  const disabled = (d: string) => {
    if (d > max) return true;
    if (pending && maxDays) return spanDays(d < from ? d : from, d < from ? from : d) > maxDays;
    return false;
  };

  const pick = (d: string) => {
    if (!from || to) {
      onChange(d, ""); // klik pertama (atau mulai ulang)
      return;
    }
    onChange(d < from ? d : from, d < from ? from : d);
    setHover(null);
  };

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="Bulan sebelumnya" className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-body hover:bg-tint ${focusRing}`}>
          <ChevronLeft size={17} aria-hidden />
        </button>
        <p className="text-[14px] font-extrabold capitalize text-ink" aria-live="polite">
          {monthTitle(view.y, view.m)}
        </p>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!canNext}
          aria-label="Bulan berikutnya"
          className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-body hover:bg-tint disabled:opacity-30 ${focusRing}`}
        >
          <ChevronRight size={17} aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11.5px] font-medium text-muted">
        {DOW.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHover(null)}>
        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const off = disabled(d);
          const isLo = d === lo && !!from;
          const isHi = d === hi && !!from;
          const inside = !!from && d > lo && d < hi;
          const edge = isLo || isHi;
          const today = d === max;
          // Pita rentang: latar hijau muda menyambung antar-sel; ujung bulat penuh hijau.
          const band = inside ? "bg-brand-soft" : isLo && hi > lo ? "bg-[linear-gradient(90deg,transparent_50%,var(--color-brand-soft)_50%)]" : isHi && hi > lo ? "bg-[linear-gradient(90deg,var(--color-brand-soft)_50%,transparent_50%)]" : "";
          return (
            <span key={d} className={`flex justify-center ${band}`}>
              <button
                type="button"
                disabled={off}
                aria-label={fullDate(d)}
                aria-pressed={edge || inside}
                onClick={() => pick(d)}
                onMouseEnter={() => pending && setHover(d)}
                onFocus={() => pending && setHover(d)}
                className={`relative h-9 w-9 rounded-full text-[13.5px] tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-line-strong ${
                  edge ? "bg-brand-press font-bold text-white" : inside ? "font-semibold text-brand-deep hover:bg-white/70" : "text-ink hover:bg-tint"
                } ${focusRing}`}
              >
                {Number(d.slice(8, 10))}
                {today && !edge && <span aria-hidden className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />}
              </button>
            </span>
          );
        })}
      </div>
      <p className="mt-2 min-h-[18px] text-center text-[12.5px] text-muted" aria-live="polite">
        {!from
          ? "Pilih tanggal awal"
          : pending
            ? `${shortDate(from)} — pilih tanggal akhir`
            : `${shortDate(lo)}${hi !== lo ? ` – ${shortDate(hi)}` : ""} · ${spanDays(lo, hi)} hari`}
      </p>
    </div>
  );
}
