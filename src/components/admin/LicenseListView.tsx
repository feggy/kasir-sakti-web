"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, CreditCard, SearchX, Wallet } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { PLAN_IDS, type AdminLicense, type LicenseFacets, type Paged, type PlanId } from "@/lib/admin/types";
import { SearchBox, useQueryState } from "./filters";
import { ClearFiltersButton, FilterBar, FilterSelect } from "./FilterMenu";
import { labelOf, PLAN_HINTS, PLAN_LABELS, PRODUCTS } from "./labels";
import { DaysLeft, PLAN_COLORS, PlanBadge, UsageMeter } from "./licenseUi";
import {
  btn,
  EmptyState,
  ErrorBlock,
  focusRing,
  formatDate,
  formatRupiah,
  LoadingBar,
  PageHeader,
  Pagination,
  SkeletonList,
  SortTh,
  tdClass,
  thClass,
  useLoad,
} from "./ui";

// Daftar lisensi semua bisnis (Lifetime/Premium, 2026-11-08). Filter di URL; aksi ada di tab Lisensi detail bisnis.
// Kontrak: GET /admin/licenses (kasir-sakti-service/docs/api.md).

const PER_PAGE = 25;
const PLANS: PlanId[] = PLAN_IDS;
/** Warna kartu: lifetime_online ikut Premium. */
const planColor = (p: PlanId) => (p === "lifetime_online" ? PLAN_COLORS.online : PLAN_COLORS[p]);
const SORTS = [
  { value: "ends_at", label: "Berakhir" },
  { value: "last_payment", label: "Bayar terakhir" },
  { value: "created", label: "Terbaru daftar" },
  { value: "name", label: "Nama" },
];
const defaultOrder = (sort: string) => (sort === "ends_at" || sort === "name" ? "asc" : "desc");

export const licenseHref = (businessId: string) => `/admin/bisnis/${encodeURIComponent(businessId)}?tab=lisensi`;

export function LicenseListView() {
  const qs = useQueryState();
  const q = qs.get("q");
  const plan = qs.list("plan");
  const expiring = qs.get("expiring");
  const product = qs.get("product");
  const sort = qs.get("sort") || "ends_at";
  const order = (qs.get("order") || defaultOrder(sort)) as "asc" | "desc";
  const page = Math.max(1, Number(qs.get("page")) || 1);

  const { state, reload } = useLoad<Paged<AdminLicense, LicenseFacets>>(
    async (signal) =>
      (await adminApi()).licenses(
        {
          q: q || undefined,
          plan,
          expiring: expiring || undefined,
          product: product || undefined,
          sort: sort === "ends_at" ? undefined : sort,
          order: qs.get("order") || undefined,
          page,
          per_page: PER_PAGE,
        },
        signal
      ),
    [q, plan.join(","), expiring, product, sort, order, page]
  );
  const facets = state.data?.facets ?? null;

  const onSort = (field: string) => {
    const next = field === sort ? (order === "asc" ? "desc" : "asc") : defaultOrder(field);
    qs.update({ sort: field === "ends_at" ? null : field, order: next === defaultOrder(field) ? null : next });
  };
  const hasFilters = !!(plan.length || expiring || product);
  const clearAll = () => qs.clear(["sort", "order"]);
  const togglePlan = (p: PlanId) => qs.update({ plan: plan.length === 1 && plan[0] === p ? null : [p] });
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? sort;

  return (
    <>
      <PageHeader
        title="Lisensi"
        description="Paket semua bisnis (Lifetime & Premium). Buka bisnis untuk mencatat pembayaran, menambah hari, atau mengatur kuota outlet."
        actions={
          <Link href="/admin/lisensi/pengaturan" className={btn.secondary}>
            <Wallet size={16} aria-hidden /> Harga & cara bayar
          </Link>
        }
      />

      {/* Ringkasan plan — sekaligus pintasan filter */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 2xl:grid-cols-6">
        {PLANS.map((s) => {
          const on = plan.length === 1 && plan[0] === s;
          const count = facets?.plan?.[s];
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => togglePlan(s)}
              className={`flex min-w-0 items-start gap-2.5 rounded-[18px] border bg-white px-3 py-3 text-left transition-colors sm:px-4 ${
                on ? "border-brand shadow-[inset_0_0_0_1px_var(--color-brand)]" : "border-line hover:border-line-strong"
              } ${focusRing}`}
            >
              <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: planColor(s) }} />
              <span className="min-w-0">
                <span className="block text-[13px] text-muted">{labelOf(PLAN_LABELS, s)}</span>
                <span className="block text-[22px] font-bold leading-tight tabular-nums text-ink">
                  {count === undefined ? "–" : count.toLocaleString("id-ID")}
                </span>
                <span className="block text-[12px] leading-snug text-muted">{PLAN_HINTS[s]}</span>
              </span>
            </button>
          );
        })}
      </div>

      <FilterBar
        search={
          <SearchBox
            id="sub-q"
            label="Cari lisensi menurut nama bisnis, email atau HP pemilik, atau ID bisnis"
            className="w-full sm:w-[280px]"
            value={q}
            onSearch={(v) => qs.update({ q: v }, "replace")}
            placeholder="Cari bisnis, email, HP…"
          />
        }
        trailing={
          state.data && (
            <p className="text-[13px] text-muted" aria-live="polite">
              <strong className="font-semibold tabular-nums text-ink">{state.data.meta.total.toLocaleString("id-ID")}</strong> bisnis
            </p>
          )
        }
      >
        <FilterSelect
          label="Paket"
          multiple
          options={PLANS.map((s) => ({ value: s, label: labelOf(PLAN_LABELS, s), count: facets?.plan?.[s] }))}
          selected={plan}
          onChange={(n) => qs.update({ plan: n })}
        />
        <FilterSelect
          label="Berakhir"
          options={[
            { value: "7d", label: "≤ 7 hari lagi", count: facets?.expiring_7d },
            { value: "30d", label: "≤ 30 hari lagi" },
          ]}
          selected={expiring ? [expiring] : []}
          onChange={(n) => qs.update({ expiring: n[0] ?? null })}
        />
        <FilterSelect
          label="Pernah beli"
          options={[
            { value: "lifetime", label: "Lifetime" },
            { value: "online", label: "Premium" },
          ]}
          selected={product ? [product] : []}
          onChange={(n) => qs.update({ product: n[0] ?? null })}
        />
        <div className="shrink-0 md:hidden">
          <FilterSelect
            label="Urut"
            required
            highlight={false}
            options={SORTS}
            selected={[sort]}
            summary={`${sortLabel} ${order === "asc" ? "↑" : "↓"}`}
            onChange={(n) => onSort(n[0])}
          />
        </div>
        {hasFilters && <ClearFiltersButton onClick={clearAll} />}
      </FilterBar>

      {state.status === "error" && <ErrorBlock error={state.error} onRetry={reload} />}
      {state.status === "loading" && !state.data && <SkeletonList rows={10} label="Memuat lisensi" />}
      {state.data && (
        <>
          <LoadingBar active={state.status === "loading"} />
          <div
            className={`rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] transition-opacity ${state.status === "loading" ? "opacity-60" : ""}`}
            aria-busy={state.status === "loading"}
          >
            {state.data.items.length === 0 ? (
              hasFilters || q ? (
                <EmptyState
                  icon={<SearchX size={22} aria-hidden />}
                  title="Tidak ada lisensi yang cocok"
                  action={
                    <button type="button" className={btn.secondary} onClick={clearAll}>
                      Hapus semua filter
                    </button>
                  }
                >
                  {q ? `Tidak ada hasil untuk “${q}” dengan filter ini.` : "Coba longgarkan filter."}
                </EmptyState>
              ) : (
                <EmptyState icon={<CreditCard size={22} aria-hidden />} title="Belum ada bisnis">
                  Setiap bisnis baru otomatis mendapat uji coba 14 hari (semua fitur).
                </EmptyState>
              )
            ) : (
              <LicenseTable items={state.data.items} sort={sort} order={order} onSort={onSort} />
            )}
            <div className="border-t border-line px-4 py-2 sm:px-5">
              <Pagination
                page={state.data.meta.page}
                perPage={state.data.meta.per_page}
                total={state.data.meta.total}
                onPage={(p) => qs.update({ page: p > 1 ? String(p) : null })}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function LastPayment({ s }: { s: AdminLicense }) {
  const p = s.last_payment;
  if (!p) return <span className="text-[13px] text-muted">Belum pernah</span>;
  return (
    <span className="block text-[13px]">
      <span className={`font-semibold tabular-nums ${p.status === "void" ? "text-muted line-through" : "text-ink"}`}>
        {formatRupiah(p.amount)}
      </span>
      <span className="block text-[12px] text-muted">
        {formatDate(p.paid_at)} · {labelOf(PRODUCTS, p.product)}
        {p.provider !== "manual" ? " · QRIS otomatis" : ""}
      </span>
    </span>
  );
}

function LicenseTable({
  items,
  sort,
  order,
  onSort,
}: {
  items: AdminLicense[];
  sort: string;
  order: "asc" | "desc";
  onSort: (f: string) => void;
}) {
  const sp = { sort, order, onSort };
  return (
    <>
      <table className="hidden w-full text-[14px] md:table">
        <thead>
          <tr>
            <SortTh label="Bisnis" field="name" {...sp} />
            <th scope="col" className={thClass}>Paket</th>
            <SortTh label="Berakhir" field="ends_at" {...sp} />
            <th scope="col" className={`${thClass} hidden lg:table-cell`}>Transaksi bulan ini</th>
            <SortTh label="Bayar terakhir" field="last_payment" {...sp} />
            <th scope="col" className={`${thClass} w-8`}>
              <span className="sr-only">Buka</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((s) => (
            <tr key={s.business.id} className="group relative hover:bg-tint/50">
              <td className={`${tdClass} max-w-[280px] py-2.5`}>
                <Link
                  href={licenseHref(s.business.id)}
                  className={`block truncate font-semibold text-ink after:absolute after:inset-0 group-hover:text-brand-deep ${focusRing}`}
                >
                  {s.business.name}
                </Link>
                <span className="block truncate text-[12.5px] text-muted">{s.business.owner?.email ?? "—"}</span>
              </td>
              <td className={tdClass}>
                <span className="flex flex-col items-start gap-0.5">
                  <PlanBadge plan={s.plan} />
                  {s.single_device && <span className="text-[12px] text-muted">1 perangkat</span>}
                </span>
              </td>
              <td className={tdClass}>
                <DaysLeft s={s} />
              </td>
              <td className={`${tdClass} hidden lg:table-cell`}>
                <UsageMeter s={s} />
              </td>
              <td className={tdClass}>
                <LastPayment s={s} />
              </td>
              <td className={`${tdClass} text-muted`}>
                <ChevronRight size={16} aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {items.map((s) => (
          <li key={s.business.id}>
            <Link href={licenseHref(s.business.id)} className={`flex items-start gap-3 px-4 py-3 ${focusRing}`}>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="min-w-0 truncate font-semibold text-ink">{s.business.name}</span>
                  <PlanBadge plan={s.plan} />
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] text-muted">{s.business.owner?.email ?? "—"}</span>
                <span className="mt-1.5 block">
                  <UsageMeter s={s} />
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1 text-right">
                <DaysLeft s={s} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
