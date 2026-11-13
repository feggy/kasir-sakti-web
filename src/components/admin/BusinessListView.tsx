"use client";

import React from "react";
import Link from "next/link";
import { Activity, CalendarCheck, ChevronRight, Moon, SearchX, SlidersHorizontal, Store, Trash2, X } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import type { BusinessFacets, BusinessSummary, Paged } from "@/lib/admin/types";
import { jakartaDate, SearchBox, useQueryState } from "./filters";
import { compactRange, FilterBar, FilterPopover, FilterSelect, PanelFooter, useFilterClose } from "./FilterMenu";
import { BUSINESS_TYPES, labelOf, PLAN_LABELS, PROVIDERS } from "./labels";
import { PlanBadge } from "./licenseUi";
import { PLAN_IDS } from "@/lib/admin/types";
import {
  Badge,
  btn,
  EmptyState,
  ErrorBlock,
  focusRing,
  formatDate,
  formatRupiahShort,
  inputClass,
  LoadingBar,
  PageHeader,
  Pagination,
  SkeletonList,
  SortTh,
  tdClass,
  thClass,
  TimeAgo,
  useLoad,
} from "./ui";
import { ChangeChip } from "./MetricsView";
import { OnlinePill } from "./merchantUi";

const PER_PAGE = 20;

const ACTIVE_OPTIONS: { value: "7d" | "30d" | "inactive"; label: string }[] = [
  { value: "7d", label: "Aktif 7 hari" },
  { value: "30d", label: "Aktif 30 hari" },
  { value: "inactive", label: "Tidak aktif" },
];
const FEATURE_OPTIONS: { value: "self_order" | "online_payment"; label: string }[] = [
  { value: "self_order", label: "Pesan QR" },
  { value: "online_payment", label: "Bayar online" },
];
const SORTS: { value: string; label: string }[] = [
  { value: "created", label: "Terbaru daftar" },
  { value: "value", label: "Nilai 30 hari" },
  { value: "growth", label: "Pertumbuhan" },
  { value: "last_active", label: "Aktif terakhir" },
  { value: "devices", label: "Perangkat" },
  { value: "name", label: "Nama" },
];

const defaultOrder = (sort: string) => (sort === "name" ? "asc" : "desc");

const DATE_PRESETS = [
  { label: "7 hari", days: 7 },
  { label: "30 hari", days: 30 },
  { label: "90 hari", days: 90 },
];
const TEST_OPTIONS = [
  { value: "exclude", label: "Tanpa akun uji" },
  { value: "only", label: "Hanya akun uji" },
];

type FilterValues = {
  types: string[];
  active: string;
  planStatus: string[];
  features: string[];
  testFilter: string;
  deletion: string;
  createdFrom: string;
  createdTo: string;
};
type UpdateQuery = (patch: Record<string, string | string[] | null>) => void;

const EMPTY_FILTERS = {
  type: [],
  active: null,
  plan: [],
  feature: [],
  test: null,
  deletion: null,
  created_from: null,
  created_to: null,
};

function activeFilterCount(v: FilterValues) {
  return (
    v.types.length + v.planStatus.length + v.features.length + (v.active ? 1 : 0) + (v.testFilter ? 1 : 0) + (v.deletion ? 1 : 0) +
    (v.createdFrom || v.createdTo ? 1 : 0)
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line px-4 py-3 last-of-type:border-b-0">
      <legend className="float-left mb-2 w-full text-[12.5px] font-semibold text-body">{label}</legend>
      <div className="clear-both flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function FilterPill({
  label,
  count,
  on,
  onClick,
}: {
  label: string;
  count?: number | null;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-[13px] transition-colors ${
        on
          ? "border-brand/50 bg-brand-soft font-semibold text-brand-deep"
          : "border-line bg-white text-ink hover:border-line-strong"
      } ${focusRing}`}
    >
      {label}
      {count !== undefined && count !== null && <span className="text-[12px] font-normal tabular-nums text-muted">{count.toLocaleString("id-ID")}</span>}
    </button>
  );
}

function BusinessFilterButton({
  values: v,
  facets,
  onChange,
}: {
  values: FilterValues;
  facets: BusinessFacets | null;
  onChange: UpdateQuery;
}) {
  const count = activeFilterCount(v);
  return (
    <FilterPopover
      label="Filter"
      value=""
      active={count > 0}
      popup="dialog"
      width={420}
      trigger={
        <>
          <SlidersHorizontal size={15} aria-hidden />
          <span className="font-semibold">Filter</span>
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-press px-1 text-[12px] font-semibold tabular-nums text-white">
              {count}
            </span>
          )}
        </>
      }
    >
      <BusinessFilterPanel values={v} facets={facets} onChange={onChange} count={count} />
    </FilterPopover>
  );
}

function BusinessFilterPanel({
  values: v,
  facets,
  onChange,
  count,
}: {
  values: FilterValues;
  facets: BusinessFacets | null;
  onChange: UpdateQuery;
  count: number;
}) {
  const close = useFilterClose();
  const today = jakartaDate(0);
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  const dateInput = `${inputClass} min-h-9 px-2 text-[13px] tabular-nums`;
  return (
    <>
      <FilterGroup label="Jenis">
        {Object.entries(BUSINESS_TYPES).map(([value, label]) => (
          <FilterPill key={value} label={label} count={facets?.type?.[value]} on={v.types.includes(value)} onClick={() => onChange({ type: toggle(v.types, value) })} />
        ))}
      </FilterGroup>
      <FilterGroup label="Aktivitas">
        {ACTIVE_OPTIONS.map((o) => (
          <FilterPill key={o.value} label={o.label} count={facets?.active?.[o.value]} on={v.active === o.value} onClick={() => onChange({ active: v.active === o.value ? null : o.value })} />
        ))}
      </FilterGroup>
      <FilterGroup label="Paket">
        {PLAN_IDS.map((value) => (
          <FilterPill key={value} label={labelOf(PLAN_LABELS, value)} count={facets?.plan?.[value]} on={v.planStatus.includes(value)} onClick={() => onChange({ plan: toggle(v.planStatus, value) })} />
        ))}
      </FilterGroup>
      <FilterGroup label="Fitur">
        {FEATURE_OPTIONS.map((o) => (
          <FilterPill key={o.value} label={o.label} count={facets?.feature?.[o.value]} on={v.features.includes(o.value)} onClick={() => onChange({ feature: toggle(v.features, o.value) })} />
        ))}
      </FilterGroup>
      <FilterGroup label="Akun uji">
        {TEST_OPTIONS.map((o) => (
          <FilterPill key={o.value} label={o.label} on={v.testFilter === o.value} onClick={() => onChange({ test: v.testFilter === o.value ? null : o.value })} />
        ))}
      </FilterGroup>
      <FilterGroup label="Hapus akun">
        <FilterPill label="Terjadwal" count={facets?.deletion?.scheduled} on={v.deletion === "scheduled"} onClick={() => onChange({ deletion: v.deletion ? null : "scheduled" })} />
      </FilterGroup>
      <FilterGroup label="Terdaftar">
        {DATE_PRESETS.map((p) => {
          const from = jakartaDate(p.days - 1);
          const on = v.createdFrom === from && !v.createdTo;
          return <FilterPill key={p.days} label={p.label} on={on} onClick={() => onChange({ created_from: on ? null : from, created_to: null })} />;
        })}
        <div className="mt-1 grid w-full grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-[12px] text-muted">
            Dari
            <input type="date" className={dateInput} value={v.createdFrom} max={v.createdTo || today} onChange={(e) => onChange({ created_from: e.target.value || null })} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-muted">
            Sampai
            <input type="date" className={dateInput} value={v.createdTo} min={v.createdFrom || undefined} max={today} onChange={(e) => onChange({ created_to: e.target.value || null })} />
          </label>
        </div>
      </FilterGroup>
      <div className="sticky bottom-0 bg-white">
        <PanelFooter resetDisabled={count === 0} onReset={() => onChange(EMPTY_FILTERS)}>
          <button type="button" onClick={() => close(true)} className={`${btn.primary} min-h-8 rounded-[8px] px-3 text-[13px]`}>
            Selesai
          </button>
        </PanelFooter>
      </div>
    </>
  );
}

function ActiveFilterChips({ values: v, onChange }: { values: FilterValues; onChange: UpdateQuery }) {
  const chips: { key: string; label: string; clear: Record<string, string | string[] | null> }[] = [
    ...v.types.map((t) => ({ key: `type-${t}`, label: `Jenis: ${labelOf(BUSINESS_TYPES, t)}`, clear: { type: v.types.filter((x) => x !== t) } })),
    ...(v.active ? [{ key: "active", label: `Aktivitas: ${ACTIVE_OPTIONS.find((o) => o.value === v.active)?.label ?? v.active}`, clear: { active: null } }] : []),
    ...v.planStatus.map((t) => ({ key: `plan-${t}`, label: `Paket: ${labelOf(PLAN_LABELS, t)}`, clear: { plan: v.planStatus.filter((x) => x !== t) } })),
    ...v.features.map((t) => ({ key: `feature-${t}`, label: `Fitur: ${FEATURE_OPTIONS.find((o) => o.value === t)?.label ?? t}`, clear: { feature: v.features.filter((x) => x !== t) } })),
    ...(v.testFilter ? [{ key: "test", label: TEST_OPTIONS.find((o) => o.value === v.testFilter)?.label ?? v.testFilter, clear: { test: null } }] : []),
    ...(v.deletion ? [{ key: "deletion", label: "Hapus akun: Terjadwal", clear: { deletion: null } }] : []),
    ...(v.createdFrom || v.createdTo ? [{ key: "created", label: `Terdaftar: ${compactRange(v.createdFrom, v.createdTo)}`, clear: { created_from: null, created_to: null } }] : []),
  ];
  if (chips.length === 0) return null;
  return (
    <div className="-mt-1 mb-3 flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onChange(c.clear)}
          aria-label={`Lepas filter ${c.label}`}
          className={`inline-flex min-h-7 items-center gap-1 rounded-full bg-brand-soft pl-2.5 pr-1.5 text-[12.5px] font-medium text-brand-deep hover:bg-brand-soft/70 ${focusRing}`}
        >
          {c.label}
          <X size={13} aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(EMPTY_FILTERS)}
        className={`ml-1 text-[12.5px] font-semibold text-body underline-offset-2 hover:underline ${focusRing}`}
      >
        Hapus semua
      </button>
    </div>
  );
}

export function BusinessListView() {
  const qs = useQueryState();
  const q = qs.get("q");
  const types = qs.list("type");
  const active = qs.get("active");
  const features = qs.list("feature");
  const createdFrom = qs.get("created_from");
  const createdTo = qs.get("created_to");
  const deletion = qs.get("deletion");
  const planStatus = qs.list("plan");
  const testFilter = qs.get("test");
  const sort = qs.get("sort") || "created";
  const order = (qs.get("order") || defaultOrder(sort)) as "asc" | "desc";
  const page = Math.max(1, Number(qs.get("page")) || 1);

  const { state, reload } = useLoad<Paged<BusinessSummary, BusinessFacets>>(
    async (signal) =>
      (await adminApi()).businesses(
        {
          q: q || undefined,
          type: types,
          active: active || undefined,
          feature: features,
          created_from: createdFrom || undefined,
          created_to: createdTo || undefined,
          deletion: deletion || undefined,
          plan: planStatus,
          test: testFilter || undefined,
          sort: sort === "created" ? undefined : sort,
          order: qs.get("order") || undefined,
          page,
          per_page: PER_PAGE,
        },
        signal
      ),
    [q, types.join(","), active, features.join(","), createdFrom, createdTo, deletion, planStatus.join(","), testFilter, sort, order, page]
  );
  const facets = state.data?.facets ?? null;

  const onSort = (field: string) => {
    const nextOrder = field === sort ? (order === "asc" ? "desc" : "asc") : defaultOrder(field);
    qs.update({
      sort: field === "created" ? null : field,
      order: nextOrder === defaultOrder(field) ? null : nextOrder,
    });
  };

  const hasFilters = !!(types.length || active || features.length || createdFrom || createdTo || deletion || planStatus.length || testFilter);
  const filtered = hasFilters || !!q;
  const clearAll = () => qs.clear(["sort", "order"]);
  const sortLabel = SORTS.find((s) => s.value === sort)?.label ?? sort;

  return (
    <>
      <PageHeader
        title="Bisnis"
        description="Semua warung & toko pengguna Kasir Sakti. Saring, urutkan, lalu buka untuk melihat perangkat, karyawan, dan fitur."
      />

      {/* Ringkasan — sekaligus pintasan filter (angka dihitung dengan pencarian saja, seperti facets). */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <QuickTile
          label="Aktif 7 hari"
          value={facets?.active?.["7d"]}
          hint="membuka aplikasi minggu ini"
          icon={<Activity size={16} aria-hidden />}
          on={active === "7d"}
          onClick={() => qs.update({ active: active === "7d" ? null : "7d" })}
        />
        <QuickTile
          label="Aktif 30 hari"
          value={facets?.active?.["30d"]}
          hint="setidaknya sekali sebulan"
          icon={<CalendarCheck size={16} aria-hidden />}
          on={active === "30d"}
          onClick={() => qs.update({ active: active === "30d" ? null : "30d" })}
        />
        <QuickTile
          label="Tidak aktif"
          value={facets?.active?.inactive}
          hint="lebih dari 30 hari"
          icon={<Moon size={16} aria-hidden />}
          tone="warning"
          on={active === "inactive"}
          onClick={() => qs.update({ active: active === "inactive" ? null : "inactive" })}
        />
        <QuickTile
          label="Hapus akun terjadwal"
          value={facets?.deletion?.scheduled}
          hint="dihapus permanen nanti"
          icon={<Trash2 size={16} aria-hidden />}
          tone="danger"
          on={deletion === "scheduled"}
          onClick={() => qs.update({ deletion: deletion === "scheduled" ? null : "scheduled" })}
        />
      </div>


      <FilterBar
        search={
          <SearchBox
            id="biz-q"
            label="Cari bisnis menurut nama, pemilik, email, HP, atau ID"
            className="w-full sm:w-[300px] 2xl:w-[360px]"
            value={q}
            onSearch={(v) => qs.update({ q: v }, "replace")}
            placeholder="Cari bisnis, pemilik, atau HP…"
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
        <BusinessFilterButton
          values={{ types, active, planStatus, features, testFilter, deletion, createdFrom, createdTo }}
          facets={facets}
          onChange={qs.update}
        />
        {/* Urutan — HP (di layar lebar lewat header tabel) */}
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
      </FilterBar>
      <ActiveFilterChips
        values={{ types, active, planStatus, features, testFilter, deletion, createdFrom, createdTo }}
        onChange={qs.update}
      />

      {state.status === "error" && <ErrorBlock error={state.error} onRetry={reload} />}
      {state.status === "loading" && !state.data && <SkeletonList rows={10} label="Memuat bisnis" />}
      {state.data && (
        <>
          <LoadingBar active={state.status === "loading"} />
          <div
            className={`rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] transition-opacity ${state.status === "loading" ? "opacity-60" : ""}`}
            aria-busy={state.status === "loading"}
          >
            {state.data.items.length === 0 ? (
              filtered ? (
                <EmptyState
                  icon={<SearchX size={22} aria-hidden />}
                  title="Tidak ada bisnis yang cocok"
                  action={
                    <button type="button" className={btn.secondary} onClick={clearAll}>
                      Hapus semua filter
                    </button>
                  }
                >
                  {q ? `Tidak ada hasil untuk “${q}” dengan filter ini.` : "Coba longgarkan filter atau ganti rentang tanggal."}
                </EmptyState>
              ) : (
                <EmptyState icon={<Store size={22} aria-hidden />} title="Belum ada bisnis">
                  Bisnis muncul di sini setelah pemilik mendaftar lewat aplikasi Kasir Sakti.
                </EmptyState>
              )
            ) : (
              <BusinessTable items={state.data.items} sort={sort} order={order} onSort={onSort} />
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

/** Kartu angka yang juga tombol filter (aria-pressed), pola kartu ringkas di halaman Stok aplikasi. */
function QuickTile({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  on,
  onClick,
}: {
  label: string;
  value: number | undefined;
  hint: string;
  icon: React.ReactNode;
  tone?: "neutral" | "warning" | "danger";
  on: boolean;
  onClick: () => void;
}) {
  const tile = { neutral: "bg-brand-soft text-brand-deep", warning: "bg-warning-tint text-warning", danger: "bg-danger-tint text-danger" }[tone];
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex min-w-0 items-center gap-3 rounded-[18px] border bg-white px-3 py-3 text-left shadow-[0_1px_2px_rgb(23_53_42/0.04)] transition-colors sm:px-4 ${
        on ? "border-brand shadow-[inset_0_0_0_1px_var(--color-brand)]" : "border-line hover:border-line-strong"
      } ${focusRing}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tile}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[20px] font-extrabold leading-tight tabular-nums text-ink">
          {value === undefined ? "–" : value.toLocaleString("id-ID")}
        </span>
        <span className="block truncate text-[13px] font-medium text-body">{label}</span>
        <span className="hidden truncate text-[12px] text-muted sm:block">{hint}</span>
      </span>
    </button>
  );
}

/** Ubin inisial usaha (seperti kotak inisial toko "WS" di aplikasi); warna per jenis usaha. */
export function BizTile({ name, type, size = 36 }: { name: string; type: string; size?: number }) {
  const initials =
    name
      .split(/\s+/)
      .filter((w) => /[A-Za-z0-9]/.test(w))
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?";
  const tone = type === "retail" ? "bg-gold-soft text-gold-deep" : "bg-brand-soft text-brand-deep";
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-[10px] text-[12.5px] font-extrabold ${tone}`}
    >
      {initials}
    </span>
  );
}

export function FeatureBadges({ b }: { b: Pick<BusinessSummary, "features"> }) {
  const f = b.features;
  const provider = PROVIDERS.find((p) => p.value === f.provider)?.label ?? f.provider;
  return (
    <span className="flex flex-wrap gap-1">
      {f.self_order ? <Badge tone="brand">Pesan QR</Badge> : null}
      {f.online_payment ? <Badge tone="success">Bayar online{provider ? ` · ${provider}` : ""}</Badge> : null}
      {!f.self_order && !f.online_payment && <span className="text-[13px] text-muted">—</span>}
    </span>
  );
}

function BusinessTable({
  items,
  sort,
  order,
  onSort,
}: {
  items: BusinessSummary[];
  sort: string;
  order: "asc" | "desc";
  onSort: (f: string) => void;
}) {
  const sortProps = { sort, order, onSort };
  return (
    <>
      {/* Tabel — layar lebar */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-[14px]">
          <thead>
            <tr>
              <SortTh label="Bisnis" field="name" {...sortProps} />
              <th scope="col" className={`${thClass} hidden 2xl:table-cell`}>
                Pemilik
              </th>
              <SortTh label="Nilai 30 hari" field="value" align="right" {...sortProps} />
              <SortTh label="Pertumbuhan" field="growth" align="right" {...sortProps} />
              <SortTh label="Perangkat" field="devices" align="right" {...sortProps} />
              <SortTh label="Aktif terakhir" field="last_active" {...sortProps} />
              <SortTh label="Terdaftar" field="created" {...sortProps} className="hidden 2xl:table-cell" />
              <th scope="col" className={`${thClass} hidden 2xl:table-cell`}>
                Fitur
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((b) => (
              <tr key={b.id} className="group relative hover:bg-tint/60">
                <td className={`${tdClass} max-w-[320px]`}>
                  <div className="flex items-start gap-3">
                  <BizTile name={b.name} type={b.type} />
                  <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/bisnis/${encodeURIComponent(b.id)}`}
                    className={`block truncate font-semibold text-ink after:absolute after:inset-0 group-hover:text-brand-deep ${focusRing}`}
                  >
                    {b.name}
                  </Link>
                  <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
                    {b.license && <PlanBadge plan={b.license.plan} />}
                    <span className="min-w-0 truncate">
                      {labelOf(BUSINESS_TYPES, b.type)}
                      {b.category ? ` · ${b.category}` : ""}
                      {/* Kolom Pemilik hanya tampil di 2xl — di layar lebih kecil namanya ikut di sini. */}
                      {b.owner && <span className="2xl:hidden"> · {b.owner.name}</span>}
                    </span>
                  </p>
                  {b.deletion && (
                    <span className="mt-1 inline-block">
                      <Badge tone="danger">Dihapus {formatDate(b.deletion.purge_after)}</Badge>
                    </span>
                  )}
                  {b.is_test && (
                    <span className="mt-1 inline-block">
                      <Badge tone="warning">Akun uji</Badge>
                    </span>
                  )}
                  </div>
                  </div>
                </td>
                <td className={`${tdClass} hidden max-w-[240px] 2xl:table-cell`}>
                  {b.owner ? (
                    <>
                      <p className="truncate text-ink">{b.owner.name}</p>
                      <p className="truncate text-[13px] text-muted">{b.owner.email}</p>
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                  {b.sales ? formatRupiahShort(b.sales.value_30d) : "—"}
                  {b.sales && (
                    <span className="block text-[12px] text-muted">{b.sales.count_30d.toLocaleString("id-ID")} transaksi</span>
                  )}
                </td>
                <td className={`${tdClass} whitespace-nowrap text-right`}>
                  {b.sales && b.sales.change_pct !== null ? <ChangeChip diff={b.sales.change_pct} unit="%" vs="" invert={false} /> : "—"}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>
                  {b.devices_count}
                  <span className="block text-[12px] text-muted">{b.outlets_count} outlet</span>
                </td>
                <td className={`${tdClass} whitespace-nowrap text-body`}>
                  <ActivityDot at={b.last_active_at} />
                  {b.sales?.online && (
                    <span className="mt-1 block">
                      <OnlinePill>Sedang aktif</OnlinePill>
                    </span>
                  )}
                </td>
                <td className={`${tdClass} hidden whitespace-nowrap text-body 2xl:table-cell`}>{formatDate(b.created_at)}</td>
                <td className={`${tdClass} hidden 2xl:table-cell`}>
                  <FeatureBadges b={b} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Daftar — HP */}
      <ul className="divide-y divide-line md:hidden">
        {items.map((b) => (
          <li key={b.id}>
            <Link href={`/admin/bisnis/${encodeURIComponent(b.id)}`} className={`flex items-center gap-3 px-4 py-3 active:bg-tint ${focusRing}`}>
              <BizTile name={b.name} type={b.type} size={40} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5">
                  <span className="min-w-0 truncate text-[15px] font-semibold text-ink">{b.name}</span>
                  {b.license && <PlanBadge plan={b.license.plan} />}
                </p>
                <p className="flex items-center gap-1 truncate text-[13px] text-muted">
                  {labelOf(BUSINESS_TYPES, b.type)}
                  {b.sales ? ` · ${formatRupiahShort(b.sales.value_30d)}` : ""} · <ActivityDot at={b.last_active_at} />
                </p>
                {(b.features.self_order || b.features.online_payment || b.deletion) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <FeatureBadges b={b} />
                    {b.deletion && <Badge tone="danger">Dihapus {formatDate(b.deletion.purge_after)}</Badge>}
                  </div>
                )}
              </div>
              <ChevronRight size={18} aria-hidden className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Titik status aktivitas: hijau ≤ 7 hari, kuning ≤ 30 hari, abu-abu lainnya. */
export function ActivityDot({ at }: { at: string | null }) {
  const [now] = React.useState(() => Date.now());
  const age = at ? now - Date.parse(at) : Infinity;
  const color = age <= 7 * 86_400_000 ? "bg-success" : age <= 30 * 86_400_000 ? "bg-[#e0a43a]" : "bg-line-strong";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
      <TimeAgo value={at} />
    </span>
  );
}
