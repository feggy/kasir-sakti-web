"use client";

import { useState } from "react";
import { adminApi } from "@/lib/admin/api";
import { peakLabel, type BusinessPerformance } from "@/lib/admin/merchant";
import type { BusinessDetail } from "@/lib/admin/types";
import { TimeChart, type ChartRow } from "./charts";
import { DateFilter, FilterBar, FilterSelect, type DatePreset } from "./FilterMenu";
import { jakartaDate, useQueryState } from "./filters";
import { bucketLabels, Change, ChangeChip } from "./MetricsView";
import { OnlinePill, PaymentMethodList, SalesHeatmap, SegmentedControl, TopProductsList, type HeatMetric } from "./merchantUi";
import {
  ErrorBlock,
  formatRupiah,
  formatRupiahShort,
  Section,
  Skeleton,
  StatCard,
  tdClass,
  thClass,
  TimeAgo,
  useLoad,
} from "./ui";

// Pilihan cepat (N hari s.d. hari ini) + "Rentang khusus…" untuk tanggal bebas (mis. kemarin saja, 1–366 hari).
const PRESETS: DatePreset[] = [
  { label: "Hari ini", days: 1 },
  { label: "7 hari terakhir", days: 7 },
  { label: "30 hari terakhir", days: 30 },
  { label: "90 hari terakhir", days: 90 },
];
const DEFAULT_DAYS = 30;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function BusinessPerformanceTab({ b }: { b: BusinessDetail }) {
  const qs = useQueryState();
  // URL: ?dari=YYYY-MM-DD[&sampai=YYYY-MM-DD]; kosong = 30 hari terakhir. `?periode=N` lama tetap dibaca.
  const legacy = Number(qs.get("periode"));
  const dari = DATE_RE.test(qs.get("dari"))
    ? qs.get("dari")
    : jakartaDate((legacy >= 1 && legacy <= 366 ? legacy : DEFAULT_DAYS) - 1);
  const sampai = DATE_RE.test(qs.get("sampai")) && qs.get("sampai") < jakartaDate(0) ? qs.get("sampai") : "";
  const outletParam = qs.get("outlet");
  const outletId = b.outlets.some((o) => o.id === outletParam) ? outletParam : "";
  const { state, reload } = useLoad<BusinessPerformance>(
    async (signal) =>
      (await adminApi()).businessPerformance(b.id, { from: dari, to: sampai || undefined, outlet_id: outletId || undefined }, signal),
    [b.id, dari, sampai, outletId]
  );

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        trailing={
          state.data && state.data.activity.devices_online > 0 ? (
            <OnlinePill>Sedang aktif · {state.data.activity.devices_online} perangkat</OnlinePill>
          ) : undefined
        }
      >
        <DateFilter
          label="Periode"
          from={dari}
          to={sampai}
          presets={PRESETS}
          maxDays={366}
          onChange={(from, to) => {
            const isDefault = !from || (!to && from === jakartaDate(DEFAULT_DAYS - 1));
            const end = to && to < jakartaDate(0) ? to : null;
            qs.update({ periode: null, dari: isDefault ? null : from, sampai: isDefault ? null : end });
          }}
        />
        {b.outlets.length > 1 && (
          <FilterSelect
            label="Outlet"
            options={b.outlets.map((o) => ({ value: o.id, label: o.name }))}
            selected={outletId ? [outletId] : []}
            onChange={(n) => qs.update({ outlet: n[0] ?? null })}
          />
        )}
      </FilterBar>
      {state.status === "error" && !state.data && <ErrorBlock error={state.error} onRetry={reload} />}
      {state.status === "loading" && !state.data && <PerformanceSkeleton />}
      {state.data && <PerformanceBody p={state.data} />}
    </div>
  );
}

function PerformanceBody({ p }: { p: BusinessPerformance }) {
  const [metric, setMetric] = useState<HeatMetric>("count");
  const { kpis, activity } = p;
  const days = p.range.days;
  const multiYear = p.weekly[0]?.week.slice(0, 4) !== p.weekly[p.weekly.length - 1]?.week.slice(0, 4);
  const rows: ChartRow[] = p.weekly.map((w) => ({
    ...bucketLabels(w.week, "week", multiYear),
    key: w.week,
    partial: w.partial,
    values: [w.value],
    notes: [`${w.count.toLocaleString("id-ID")} transaksi`],
  }));
  const multiOutlet = p.outlets.length > 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
        <StatCard label="Nilai transaksi" value={formatRupiahShort(kpis.value.value)} hint={<Change k={kpis.value} days={days} short />} />
        <StatCard label="Jumlah transaksi" value={kpis.count.value} hint={<Change k={kpis.count} days={days} short />} />
        <StatCard label="Rata-rata per transaksi" value={formatRupiah(kpis.average.value)} hint={<Change k={kpis.average} days={days} short />} />
        <StatCard
          label="Pengguna aktif hari ini"
          value={`${activity.users_active_today} dari ${activity.users_total}`}
          hint="pemilik dan karyawan"
        />
        <StatCard
          label="Hari aktif"
          value={`${activity.active_days} dari ${days}`}
          hint={
            <>
              sinkron <TimeAgo value={activity.last_synced_at} />
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Section
            title="Jam ramai"
            description="Per hari dan jam pada periode ini, zona Asia/Jakarta."
            actions={
              p.heatmap.length > 0 ? (
                <SegmentedControl
                  label="Ukuran jam ramai"
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { value: "count", label: "Jumlah" },
                    { value: "value", label: "Nilai" },
                  ]}
                />
              ) : undefined
            }
          >
            <SalesHeatmap cells={p.heatmap} peak={p.peak} metric={metric} emptyNote="Belum ada transaksi pada periode ini." />
          </Section>

          <Section title="Pertumbuhan nilai transaksi" description="Per minggu, 12 minggu terakhir." className={multiOutlet ? "" : "flex-1"}>
            <TimeChart
              rows={rows}
              series={[{ id: "value", label: "Nilai transaksi", color: "#2e8b62" }]}
              kind="line"
              format={formatRupiah}
              axisFormat={formatRupiahShort}
              height={multiOutlet ? 150 : 300}
              label="Grafik nilai transaksi per minggu, 12 minggu terakhir"
            />
          </Section>

          {multiOutlet && (
            <Section title="Per outlet" description={p.range.to === jakartaDate(0) ? `Dibanding ${days === 1 ? "kemarin" : `${days} hari sebelumnya`} sampai jam yang sama.` : `Dibanding ${days} hari sebelumnya.`} bodyClass="p-0" className="flex-1">
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[460px] text-[14px]">
                  <thead>
                    <tr>
                      <th scope="col" className={thClass}>Outlet</th>
                      <th scope="col" className={`${thClass} text-right`}>Nilai</th>
                      <th scope="col" className={`${thClass} text-right`}>Pertumbuhan</th>
                      <th scope="col" className={thClass}>Jam ramai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {p.outlets.map((o) => (
                      <tr key={o.id}>
                        <td className={`${tdClass} font-semibold text-ink`}>{o.name}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatRupiahShort(o.value)}</td>
                        <td className={`${tdClass} text-right`}>
                          {o.change_pct === null ? "—" : <ChangeChip diff={o.change_pct} unit="%" vs="" invert={false} />}
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{peakLabel(o.peak)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Section title="Metode bayar" description="Uang bersih pada periode ini.">
            <PaymentMethodList items={p.payment_methods} />
          </Section>
          <Section
            title="Produk terlaris"
            description="Jumlah terjual dan nilai, sebelum diskon transaksi, pajak, dan refund sebagian."
            bodyClass="px-4 py-1.5 sm:px-5"
            className="flex-1"
          >
            <TopProductsList items={p.top_products} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div role="status" aria-label="Memuat performa" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] px-4 py-3.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2.5 h-6 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
