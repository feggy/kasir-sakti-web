"use client";

import Link from "next/link";
import { Activity, MonitorSmartphone, ReceiptText, UsersRound } from "lucide-react";
import React, { useState } from "react";
import { adminApi } from "@/lib/admin/api";
import { peakLabel, type MerchantInsights, type MerchantRange } from "@/lib/admin/merchant";
import { TimeChart, type ChartRow } from "./charts";
import { BUSINESS_TYPES, labelOf } from "./labels";
import { bucketLabels, ChangeChip } from "./MetricsView";
import { AtRiskSummary } from "./GrowthView";
import { SegmentedControl } from "./merchantUi";
import { Maskot } from "./maskot";
import {
  ErrorBlock,
  focusRing,
  formatRupiah,
  formatRupiahShort,
  Section,
  Skeleton,
  tdClass,
  thClass,
  useLoad,
} from "./ui";

const RANGES: { value: MerchantRange; label: string }[] = [
  { value: "30d", label: "30 hari" },
  { value: "12w", label: "12 minggu" },
  { value: "12m", label: "12 bulan" },
];

const RANGE_NOTE: Record<MerchantRange, string> = {
  "30d": "30 hari terakhir, per hari",
  "12w": "12 minggu terakhir, per minggu",
  "12m": "12 bulan terakhir, per bulan",
};

/**
 * Informasi merchant di Ringkasan. `attention` = kartu di samping kartu hero (mis. "Perlu perhatian"), `side` = kartu
 * di samping grafik (mis. Lisensi) — keduanya dari data Ringkasan sendiri agar bagian ini tetap mandiri.
 */
export function MerchantOverview({ attention, side }: { attention?: React.ReactNode; side?: React.ReactNode } = {}) {
  const [range, setRange] = useState<MerchantRange>("30d");
  const { state, reload } = useLoad<MerchantInsights>(
    async (signal) => (await adminApi()).merchantInsights(range, signal),
    [range]
  );

  // Berdiri sendiri: gagal memuat di sini tidak boleh menjatuhkan ringkasan rilis di bawahnya.
  if (state.status === "error" && !state.data) return <ErrorBlock error={state.error} onRetry={reload} />;
  if (!state.data) return <MerchantSkeleton />;
  const { today, trend, top_growing } = state.data;
  const multiYear = trend.points[0]?.bucket.slice(0, 4) !== trend.points[trend.points.length - 1]?.bucket.slice(0, 4);
  const rows: ChartRow[] = trend.points.map((p) => ({
    ...bucketLabels(p.bucket, trend.interval, multiYear),
    key: p.bucket,
    partial: p.partial,
    values: [p.value],
    notes: [`${p.count.toLocaleString("id-ID")} transaksi`],
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Kartu hero: hijau merek + maskot, seperti kartu sapaan di Beranda aplikasi. */}
        <section aria-label="Hari ini" className="relative overflow-hidden rounded-[22px] bg-brand-press text-white shadow-[0_18px_40px_-24px_rgb(37_117_82/0.9)]">
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-white/75">Nilai transaksi semua warung hari ini</p>
                <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular-nums sm:text-[40px]">
                  {formatRupiahShort(today.sales_value)}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-white/80">
                  {today.value_change_pct === null ? (
                    "kemarin jam ini Rp0"
                  ) : (
                    <span className="rounded-[8px] bg-white px-1.5 py-0.5">
                      <ChangeChip diff={today.value_change_pct} unit="%" vs="" invert={false} />
                    </span>
                  )}
                  {today.value_change_pct !== null && <span>vs kemarin jam ini</span>}
                </p>
              </div>
              <Maskot pose="laporan" size={112} className="-mt-1 -mr-2 hidden shrink-0 drop-shadow-[0_14px_18px_rgb(0_0_0/0.25)] sm:block" />
            </div>
            <MiniBars points={trend.points} interval={trend.interval} />
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { icon: ReceiptText, k: "Transaksi", v: today.sales_count.toLocaleString("id-ID"), h: `rata-rata ${formatRupiah(today.average_sale)}` },
                {
                  icon: Activity,
                  k: "Bisnis aktif",
                  v: today.businesses_active.toLocaleString("id-ID"),
                  h: `dari ${today.businesses_total.toLocaleString("id-ID")} bisnis`,
                  href: "/admin/bisnis",
                },
                { icon: UsersRound, k: "Pengguna aktif", v: today.users_active.toLocaleString("id-ID"), h: "pemilik & karyawan" },
                {
                  icon: MonitorSmartphone,
                  k: "Sedang aktif",
                  v: `${today.businesses_online.toLocaleString("id-ID")} bisnis`,
                  h: `${today.devices_online.toLocaleString("id-ID")} perangkat · ${today.online_window_minutes} mnt`,
                },
              ].map(({ icon: Icon, k, v, h, href }) => {
                const body = (
                  <>
                    <dt className="flex items-center gap-1.5 text-[12px] font-medium text-white/75">
                      <Icon size={14} aria-hidden /> {k}
                    </dt>
                    <dd className="mt-1 text-[19px] font-extrabold leading-tight tabular-nums">{v}</dd>
                    <dd className="text-[11.5px] leading-snug text-white/70">{h}</dd>
                  </>
                );
                const cls = "min-w-0 rounded-[14px] bg-white/10 px-3 py-2.5 ring-1 ring-white/15";
                return href ? (
                  <Link key={k} href={href} className={`${cls} block hover:bg-white/15 ${focusRing}`}>
                    {body}
                  </Link>
                ) : (
                  <div key={k} className={cls}>
                    {body}
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
        {attention}
      </div>

      <div className={`grid grid-cols-1 items-start gap-5 ${side ? "xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" : ""}`}>
      <Section
        title="Nilai transaksi semua merchant"
        description={
          <>
            Total {formatRupiahShort(trend.total.value)} · {RANGE_NOTE[trend.range]}
            {trend.total.change_pct !== null && (
              <>
                {" · "}
                <ChangeChip diff={trend.total.change_pct} unit="%" vs="vs periode sebelumnya" invert={false} />
              </>
            )}
          </>
        }
        actions={<SegmentedControl label="Rentang grafik" options={RANGES} value={range} onChange={setRange} />}
      >
        <TimeChart
          rows={rows}
          series={[{ id: "value", label: "Nilai transaksi", color: "#2e8b62" }]}
          kind="line"
          format={formatRupiah}
          axisFormat={formatRupiahShort}
          height={200}
          label={`Grafik nilai transaksi semua merchant ${RANGE_NOTE[trend.range]}`}
        />
      </Section>
      {side}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <Section title="Merchant bertumbuh tercepat" description="Nilai 30 hari terakhir dibanding 30 hari sebelumnya." bodyClass="p-0">
          {top_growing.length === 0 ? (
            <p className="px-5 py-6 text-center text-[14px] text-muted">
              Belum ada merchant dengan nilai sebelumnya minimal Rp100.000 yang bertumbuh.
            </p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Bisnis</th>
                    <th scope="col" className={`${thClass} text-right`}>Nilai</th>
                    <th scope="col" className={`${thClass} text-right`}>Pertumbuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {top_growing.map((b) => (
                    <tr key={b.id}>
                      <td className={`${tdClass} min-w-0`}>
                        <Link
                          href={`/admin/bisnis/${b.id}?tab=performa`}
                          className={`font-semibold text-ink hover:underline ${focusRing}`}
                        >
                          {b.name}
                        </Link>
                        <p className="text-[12px] text-muted">
                          {labelOf(BUSINESS_TYPES, b.type)} · jam ramai {peakLabel(b.peak)}
                        </p>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{formatRupiahShort(b.value)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right`}>
                        {b.change_pct === null ? "—" : <ChangeChip diff={b.change_pct} unit="%" vs="" invert={false} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
        <AtRiskSummary />
      </div>
    </div>
  );
}

const MINI_LABEL: Record<"day" | "week" | "month", string> = { day: "hari", week: "minggu", month: "bulan" };

/**
 * Batang mini di kartu hero: nilai transaksi per ember dari tren yang sama dengan grafik di bawahnya (maks 14
 * terakhir); ember terakhir disorot putih seperti "Penjualan per jam" di Beranda aplikasi. Mengisi ruang tengah kartu.
 */
function MiniBars({ points, interval }: { points: MerchantInsights["trend"]["points"]; interval: "day" | "week" | "month" }) {
  const pts = points.slice(-14);
  if (pts.length < 2) return <div className="flex-1" />;
  const max = Math.max(1, ...pts.map((p) => p.value));
  const unit = MINI_LABEL[interval];
  return (
    <figure className="flex min-h-[96px] flex-1 flex-col">
      <figcaption className="mb-2 flex items-baseline justify-between gap-2 text-[12px] text-white/70">
        <span>
          Nilai per {unit}, {pts.length} {unit} terakhir
        </span>
        <span className="tabular-nums">puncak {formatRupiahShort(max)}</span>
      </figcaption>
      <div
        role="img"
        aria-label={`Nilai transaksi per ${unit}: ${pts.map((p) => formatRupiahShort(p.value)).join(", ")}`}
        className="flex flex-1 items-end gap-1.5"
      >
        {pts.map((p, i) => {
          const last = i === pts.length - 1;
          return (
            <span
              key={p.bucket}
              title={`${p.bucket} · ${formatRupiah(p.value)}${p.partial ? " (berjalan)" : ""}`}
              className={`min-w-0 flex-1 rounded-t-[6px] rounded-b-[3px] ${last ? "bg-white" : "bg-white/25"}`}
              style={{ height: `${Math.max(6, (p.value / max) * 100)}%` }}
            />
          );
        })}
      </div>
    </figure>
  );
}

function MerchantSkeleton() {
  return (
    <div role="status" aria-label="Memuat informasi merchant" className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] px-4 py-3.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2.5 h-6 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
