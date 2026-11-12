"use client";

import React, { useId, useState } from "react";
import { ArrowRight, CalendarPlus, CircleSlash, Infinity as InfinityIcon, Receipt, ReceiptText, SlidersHorizontal } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import type {
  AdminLicense,
  AdminPayment,
  BillingConfig,
  ExtendInput,
  LicenseDetail,
  LicensePaymentResult,
  LicenseProduct,
  PaymentMethod,
  Prices,
  RecordPaymentInput,
} from "@/lib/admin/types";
import { ApiError } from "@/lib/api";
import { ConfirmDialog, Modal } from "./ConfirmDialog";
import { jakartaDate } from "./filters";
import { AUDIT_ACTIONS, labelOf, LICENSE_FEATURES, PAYMENT_METHODS, PAYMENT_PROVIDERS, PLAN_LABELS, PRODUCTS } from "./labels";
import { DaysLeft, PlanBadge, UsageMeter } from "./licenseUi";
import { useToast } from "./toast";
import {
  Badge,
  btn,
  cardClass,
  EmptyState,
  ErrorBlock,
  errorMessage,
  Field,
  fieldErrors,
  focusRing,
  formatDate,
  formatDateTime,
  formatRupiah,
  inputClass,
  Notice,
  Section,
  Skeleton,
  Spinner,
  TimeAgo,
  useLoad,
} from "./ui";

// Tab "Lisensi" di detail bisnis (Lifetime/Premium, 2026-11-08): plan & tanggal, pemakaian, riwayat pembayaran, dan
// aksi admin (catat pembayaran per produk, batalkan pembayaran, tambah hari, kuota outlet). Setiap aksi dikonfirmasi
// & diaudit di server. Kontrak: kasir-sakti-service/docs/api.md "Admin platform — tahap 3" › lisensi.

const DAY = 86_400_000;
/** Harga cadangan bila billing-config gagal dimuat (sama dengan bawaan server, desain lisensi §1). */
const FALLBACK_PRICES: Prices = { lifetime: 199_000, online_1m: 49_000, online_6m: 269_000, online_12m: 490_000 };
const MONTHS: Record<Exclude<LicenseProduct, "lifetime">, number> = { online_1m: 1, online_6m: 6, online_12m: 12 };

type Data = { detail: LicenseDetail; config: BillingConfig | null };

function addMonths(ms: number, n: number) {
  const d = new Date(ms);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.getTime();
}
const isoOf = (ms: number) => new Date(ms).toISOString();
const digits = (v: string) => v.replace(/\D/g, "");
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16)
      );

/** Bisa dibatalkan: Lifetime sah kapan saja; Premium hanya pembayaran Premium sah terbaru (server: PAYMENT_NOT_LATEST). */
function voidableIds(payments: AdminPayment[]): Set<string> {
  const ids = new Set<string>();
  let latestOnline: AdminPayment | undefined;
  for (const p of payments) {
    if (p.status !== "recorded") continue;
    if (p.product === "lifetime") ids.add(p.id);
    else if (!latestOnline || p.created_at > latestOnline.created_at) latestOnline = p;
  }
  if (latestOnline) ids.add(latestOnline.id);
  return ids;
}

export function LicenseTab({ businessId, businessName }: { businessId: string; businessName: string }) {
  const { state, reload, setData } = useLoad<Data>(async (signal) => {
    const api = await adminApi();
    const [detail, config] = await Promise.all([
      api.license(businessId, signal),
      api.billingConfig(signal).catch(() => null), // harga bawaan; jangan gagalkan tab
    ]);
    return { detail, config };
  }, [businessId]);
  const [dialog, setDialog] = useState<null | "pay" | "extend" | "override" | { void: AdminPayment }>(null);

  if (!state.data) {
    return state.status === "error" ? <ErrorBlock error={state.error} onRetry={reload} /> : <TabSkeleton />;
  }
  const { detail, config } = state.data;
  const s = detail.license;
  const prices = config?.prices ?? FALLBACK_PRICES;
  const voidable = voidableIds(detail.payments);
  const onLicense = (lic: AdminLicense, payment?: AdminPayment) => {
    const payments = payment ? [payment, ...detail.payments.filter((p) => p.id !== payment.id)] : detail.payments;
    payments.sort((a, b) => b.paid_at.localeCompare(a.paid_at));
    setData({ ...state.data!, detail: { ...detail, license: lic, payments } });
    reload(); // audit & angka turunan dari server
  };

  return (
    <div className="flex flex-col gap-5">
      <StatusCard s={s} onPay={() => setDialog("pay")} onExtend={() => setDialog("extend")} onOverride={() => setDialog("override")} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Pemakaian bulan ini" description={monthLabel(s.usage.month)}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Transaksi</p>
              <UsageMeter s={s} />
              <p className="mt-1.5 text-[12.5px] text-muted">Informasi saja — tidak ada batas transaksi di paket mana pun.</p>
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Outlet aktif</p>
              <p className="text-[14px] text-body">
                <strong className={`tabular-nums ${s.usage.outlets > s.outlets ? "text-danger" : "text-ink"}`}>{s.usage.outlets}</strong> dari
                kuota {s.outlets}
                {s.overrides.outlet_quota !== null && <span className="text-muted"> (khusus)</span>}
                {s.usage.outlets > s.outlets && (
                  <span className="ml-1.5">
                    <Badge tone="danger">melebihi kuota</Badge>
                  </span>
                )}
              </p>
              {s.usage.outlets > s.outlets && (
                <p className="mt-1.5 text-[12.5px] text-muted">Outlet tertua tetap aktif, lainnya baca-saja di aplikasi (data tidak dihapus).</p>
              )}
            </div>
          </div>
        </Section>

        <Section
          title="Kuota outlet"
          actions={
            <button type="button" className={`${btn.ghost} min-h-8 px-2.5 text-[13px]`} onClick={() => setDialog("override")}>
              <SlidersHorizontal size={15} aria-hidden /> Ubah
            </button>
          }
        >
          <dl className="flex flex-col divide-y divide-line text-[14px]">
            <Row label="Kuota outlet">{s.overrides.outlet_quota ?? <span className="text-muted">Bawaan (1)</span>}</Row>
            <Row label="Catatan">
              <span className={s.overrides.note ? "text-left" : "text-muted"}>{s.overrides.note || "—"}</span>
            </Row>
          </dl>
          <p className="mt-3 text-[12.5px] text-muted">Kuota tidak bergantung paket. Pemilik meminta tambahan lewat WhatsApp.</p>
        </Section>
      </div>

      <PaymentsSection payments={detail.payments} voidable={voidable} onPay={() => setDialog("pay")} onVoid={(p) => setDialog({ void: p })} />

      <Section title="Riwayat tindakan" description="20 tindakan lisensi terbaru oleh admin." bodyClass="">
        {detail.audit.length === 0 ? (
          <p className="px-5 py-5 text-[14px] text-muted">Belum ada tindakan admin untuk lisensi ini.</p>
        ) : (
          <ol className="divide-y divide-line">
            {detail.audit.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-2.5 text-[14px] sm:px-5">
                <span className="font-semibold text-ink">{labelOf(AUDIT_ACTIONS, e.action)}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-body">{auditText(e.detail)}</span>
                <span className="text-[13px] text-muted">
                  {e.admin?.name ?? "sistem"} · <TimeAgo value={e.created_at} />
                </span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <RecordPaymentDialog
        open={dialog === "pay"}
        s={s}
        businessId={businessId}
        businessName={businessName}
        prices={prices}
        onClose={() => setDialog(null)}
        onDone={(r) => {
          setDialog(null);
          onLicense(r.license, r.payment);
        }}
      />
      <ExtendDialog
        open={dialog === "extend"}
        s={s}
        businessId={businessId}
        businessName={businessName}
        onClose={() => setDialog(null)}
        onDone={() => {
          setDialog(null);
          reload();
        }}
      />
      <OverridesDialog
        open={dialog === "override"}
        s={s}
        businessId={businessId}
        onClose={() => setDialog(null)}
        onDone={() => {
          setDialog(null);
          reload();
        }}
      />
      <VoidDialog
        payment={dialog && typeof dialog === "object" ? dialog.void : null}
        businessId={businessId}
        onClose={() => setDialog(null)}
        onDone={(r) => {
          setDialog(null);
          onLicense(r.license, r.payment);
        }}
      />
    </div>
  );
}

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, m - 1, 1));
}

function auditText(d: Record<string, unknown> | null): string {
  if (!d) return "";
  const parts: string[] = [];
  if (typeof d.product === "string") parts.push(labelOf(PRODUCTS, d.product));
  if (typeof d.amount === "number") parts.push(formatRupiah(d.amount));
  if (typeof d.days === "number") parts.push(`+${d.days} hari`);
  if (d.target === "trial") parts.push("uji coba");
  if (d.target === "online" || d.target === "period") parts.push("periode Premium");
  if (typeof d.reason === "string" && d.reason) parts.push(`“${d.reason}”`);
  if (typeof d.note === "string" && d.note) parts.push(`“${d.note}”`);
  return parts.join(" · ");
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div role="status" aria-label="Memuat lisensi" className="flex flex-col gap-5">
      <div className={`${cardClass} p-5`}>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-8 w-64" />
        <Skeleton className="mt-4 h-10 w-full max-w-[420px]" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className={`${cardClass} p-5`}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-3 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ——— Kartu status ———

function headline(s: AdminLicense): { title: string; sub: string } {
  const end = formatDate(s.ends_at);
  switch (s.plan) {
    case "lifetime_online":
      return { title: `Lifetime + Premium sampai ${end}`, sub: "Setelah Premium habis kembali ke Lifetime (tanpa tenggang, tidak pernah baca-saja)." };
    case "online":
      return { title: `Premium aktif sampai ${end}`, sub: "Belum membeli Lifetime — setelah habis ada tenggang 3 hari, lalu baca-saja." };
    case "trial":
      return { title: `Uji coba sampai ${end}`, sub: s.first_paid_at ? "Pernah membayar sebelumnya" : "Belum pernah membayar" };
    case "grace":
      return { title: `Masa tenggang sampai ${end}`, sub: "Semua fitur masih jalan. Setelah itu baca-saja — data tetap aman." };
    case "lifetime":
      return { title: "Lifetime", sub: "Semua fitur di 1 perangkat tanpa server. Premium tidak aktif." };
    default:
      return { title: "Baca-saja", sub: "Tanpa paket aktif: pemilik hanya bisa melihat & mengekspor data." };
  }
}

function StatusCard({
  s,
  onPay,
  onExtend,
  onOverride,
}: {
  s: AdminLicense;
  onPay: () => void;
  onExtend: () => void;
  onOverride: () => void;
}) {
  const h = headline(s);
  return (
    <section className={`${cardClass} overflow-hidden`} aria-label="Status lisensi">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PlanBadge plan={s.plan} />
            {s.lifetime && s.plan !== "lifetime" && (
              <Badge tone="warning">
                <InfinityIcon size={13} aria-hidden /> Lifetime
              </Badge>
            )}
            {s.plan !== "readonly" && s.plan !== "lifetime" && <DaysLeft s={s} compact />}
            {s.single_device && <Badge tone="neutral">1 perangkat</Badge>}
          </div>
          <h2 className="mt-2 text-[20px] font-bold leading-snug text-ink">{h.title}</h2>
          <p className="mt-0.5 text-[14px] text-body">{h.sub}</p>
          <p className="mt-2 text-[13px] text-muted">
            Fitur server:{" "}
            {s.features.length === 0 ? (
              <span>tidak ada (hanya fitur di perangkat)</span>
            ) : (
              s.features
                .filter((f) => f !== "staff_reports")
                .map((f) => labelOf(LICENSE_FEATURES, f))
                .join(", ")
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:w-auto sm:min-w-[200px]">
          <button type="button" className={btn.primary} onClick={onPay}>
            <Receipt size={16} aria-hidden /> Catat pembayaran
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={`${btn.secondary} px-3`} onClick={onExtend}>
              <CalendarPlus size={16} aria-hidden /> Tambah hari
            </button>
            <button type="button" className={`${btn.secondary} px-3`} onClick={onOverride}>
              <SlidersHorizontal size={16} aria-hidden /> Outlet
            </button>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line bg-tint/50 px-4 py-3 text-[13px] sm:grid-cols-5 sm:px-5">
        {[
          ["Uji coba berakhir", formatDate(s.trial_ends_at)],
          ["Lifetime dibeli", formatDate(s.lifetime_purchased_at)],
          ["Premium berakhir", formatDate(s.online_period_end)],
          ["Tenggang berakhir", formatDate(s.grace_ends_at)],
          ["Bayar pertama", formatDate(s.first_paid_at)],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-muted">{k}</dt>
            <dd className="font-semibold tabular-nums text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ——— Riwayat pembayaran ———

function PaymentsSection({
  payments,
  voidable,
  onPay,
  onVoid,
}: {
  payments: AdminPayment[];
  voidable: Set<string>;
  onPay: () => void;
  onVoid: (p: AdminPayment) => void;
}) {
  const recorded = payments.filter((p) => p.status === "recorded");
  const total = recorded.reduce((a, p) => a + p.amount, 0);
  return (
    <Section
      title="Riwayat pembayaran"
      description={payments.length ? `${recorded.length} pembayaran sah · total ${formatRupiah(total)}` : undefined}
      bodyClass=""
    >
      {payments.length === 0 ? (
        <EmptyState
          icon={<ReceiptText size={22} aria-hidden />}
          title="Belum ada pembayaran"
          action={
            <button type="button" className={btn.secondary} onClick={onPay}>
              <Receipt size={16} aria-hidden /> Catat pembayaran pertama
            </button>
          }
        >
          Pembayaran QRIS dari aplikasi tercatat otomatis. Bila pemilik mentransfer manual dan mengirim bukti + kode
          pesanan, catat di sini — paket langsung aktif.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line">
          {payments.map((p) => {
            const isVoid = p.status === "void";
            return (
              <li
                key={p.id}
                className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3 text-[14px] sm:grid-cols-[110px_minmax(0,1fr)_96px_112px] sm:items-center sm:px-5 ${isVoid ? "bg-tint/40" : ""}`}
              >
                <div className="min-w-0">
                  <p className={`font-semibold tabular-nums ${isVoid ? "text-muted line-through" : "text-ink"}`}>{formatRupiah(p.amount)}</p>
                  <p className="text-[12.5px] text-muted">{formatDate(p.paid_at)}</p>
                </div>
                <div className="col-span-2 row-start-2 min-w-0 text-[13px] sm:col-span-1 sm:col-start-2 sm:row-start-1">
                  <p className="text-body">
                    <strong className="font-semibold text-ink">{labelOf(PRODUCTS, p.product)}</strong>
                    {p.period_start && p.period_end ? ` · ${formatDate(p.period_start)} – ${formatDate(p.period_end)}` : ""}
                  </p>
                  <p className="text-muted">
                    {p.provider === "qrisgate" ? labelOf(PAYMENT_PROVIDERS, p.provider) : labelOf(PAYMENT_METHODS, p.method)}
                    {p.provider_ref ? ` · ref ${p.provider_ref}` : ""}
                    {p.recorded_by ? ` · dicatat ${p.recorded_by.name}` : p.provider === "qrisgate" ? " · tanpa admin" : ""}
                  </p>
                  {p.note && <p className="mt-0.5 text-body">“{p.note}”</p>}
                  {isVoid && (
                    <p className="mt-0.5 text-danger">
                      Dibatalkan{p.voided_by ? ` oleh ${p.voided_by.name}` : ""}
                      {p.voided_at ? `, ${formatDateTime(p.voided_at)}` : ""}: {p.void_reason || "—"}
                    </p>
                  )}
                </div>
                <div className="hidden flex-col items-start gap-1 sm:flex">
                  {isVoid ? <Badge tone="danger">Dibatalkan</Badge> : <Badge tone="success">Sah</Badge>}
                  {p.provider === "qrisgate" && <Badge tone="brand">Otomatis</Badge>}
                </div>
                <div className="col-start-2 row-start-1 flex justify-end sm:col-start-4">
                  {voidable.has(p.id) ? (
                    <button
                      type="button"
                      onClick={() => onVoid(p)}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-semibold text-danger hover:bg-danger-tint ${focusRing}`}
                    >
                      <CircleSlash size={15} aria-hidden /> Batalkan
                    </button>
                  ) : isVoid ? (
                    <span className="sm:hidden">
                      <Badge tone="danger">Dibatalkan</Badge>
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {payments.length > 0 && (
        <p className="border-t border-line px-4 py-2.5 text-[12px] text-muted sm:px-5">
          Lifetime bisa dibatalkan kapan saja. Premium hanya pembayaran Premium sah terbaru — batalkan berurutan agar tanggal tetap konsisten.
        </p>
      )}
    </Section>
  );
}

// ——— Bagian formulir ———

function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
  disabled,
}: {
  name: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label
            key={o.value}
            className={`relative flex min-h-10 cursor-pointer flex-col items-center justify-center rounded-[10px] border px-2 py-1.5 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
              on ? "border-brand bg-brand-soft text-brand-deep" : "border-line bg-white text-ink hover:border-line-strong"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input type="radio" name={name} value={o.value} checked={on} disabled={disabled} onChange={() => onChange(o.value)} className="sr-only" />
            <span className="text-[13.5px] font-semibold leading-tight">{o.label}</span>
            {o.hint && <span className={`text-[12px] leading-tight tabular-nums ${on ? "text-brand-deep/80" : "text-muted"}`}>{o.hint}</span>}
          </label>
        );
      })}
    </div>
  );
}

function MoneyInput({ id, value, onChange, invalid, describedBy }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; describedBy?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] font-semibold text-muted">Rp</span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className={`${inputClass} pl-9 font-semibold tabular-nums`}
        value={value ? Number(value).toLocaleString("id-ID") : ""}
        onChange={(e) => onChange(digits(e.target.value).replace(/^0+(?=\d)/, "").slice(0, 9))}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
    </div>
  );
}

function Preview({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "success" }) {
  return (
    <div className={`rounded-[12px] border px-3.5 py-3 text-[14px] leading-relaxed ${tone === "success" ? "border-success/25 bg-success-tint text-success" : "border-line bg-tint text-body"}`}>
      {children}
    </div>
  );
}

// ——— Catat pembayaran ———

type PayForm = {
  product: LicenseProduct;
  amount: string;
  method: PaymentMethod;
  paidAt: string;
  ref: string;
  note: string;
};

function RecordPaymentDialog({
  open,
  s,
  businessId,
  businessName,
  prices,
  onClose,
  onDone,
}: {
  open: boolean;
  s: AdminLicense;
  businessId: string;
  businessName: string;
  prices: Prices;
  onClose: () => void;
  onDone: (r: LicensePaymentResult) => void;
}) {
  return open ? <RecordPaymentForm {...{ s, businessId, businessName, prices, onClose, onDone }} /> : null;
}

/** Akhir Premium setelah pembayaran: mulai = max(sekarang, akhir Premium sekarang), + 1/6/12 bulan (rumus server). */
function onlineEndAfter(s: AdminLicense, product: Exclude<LicenseProduct, "lifetime">, now: number) {
  const ope = s.online_period_end ? Date.parse(s.online_period_end) : 0;
  const start = Math.max(now, ope);
  return { start, end: addMonths(start, MONTHS[product]), extends: ope > now };
}

function RecordPaymentForm({
  s,
  businessId,
  businessName,
  prices,
  onClose,
  onDone,
}: {
  s: AdminLicense;
  businessId: string;
  businessName: string;
  prices: Prices;
  onClose: () => void;
  onDone: (r: LicensePaymentResult) => void;
}) {
  const toast = useToast();
  const uid = useId();
  // ID dibuat sekali saat dialog dibuka → kirim ulang (klik ganda/jaringan putus) tetap idempoten.
  const [paymentId] = useState(newId);
  const [now] = useState(() => Date.now());
  const today = jakartaDate(0);
  const tomorrow = jakartaDate(-1);
  // Bawaan: Lifetime bila belum punya; selain itu Premium 12 bulan (durasi bawaan halaman Paket di app).
  const initial: LicenseProduct = s.lifetime ? "online_12m" : "lifetime";
  const [form, setForm] = useState<PayForm>({
    product: initial,
    amount: String(prices[initial]),
    method: "transfer",
    paidAt: today,
    ref: "",
    note: "",
  });
  const [amountTouched, setAmountTouched] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const price = prices[form.product];
  const set = (patch: Partial<PayForm>) => {
    setErrors({});
    setError(null);
    setForm((f) => {
      const next = { ...f, ...patch };
      // Nominal otomatis mengikuti harga produk sampai admin mengubahnya sendiri.
      if (patch.product && !amountTouched) next.amount = String(prices[patch.product]);
      return next;
    });
  };

  const isLifetime = form.product === "lifetime";
  const online = isLifetime ? null : onlineEndAfter(s, form.product as Exclude<LicenseProduct, "lifetime">, now);
  const amount = Number(form.amount || 0);
  const diff = amount - price;
  const lifetimeBlocked = isLifetime && s.lifetime;

  const validate = () => {
    const e: Record<string, string> = {};
    if (lifetimeBlocked) e.product = "Bisnis ini sudah punya Lifetime.";
    if (form.amount === "") e.amount = "Isi nominal (boleh 0 untuk gratis).";
    if (!form.paidAt) e.paid_at = "Isi tanggal uang diterima.";
    else if (form.paidAt > tomorrow) e.paid_at = "Tidak boleh lebih dari besok.";
    if (form.note.length > 500) e.note = "Maksimal 500 karakter.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const result = isLifetime
    ? "Lifetime aktif selamanya"
    : `Premium aktif sampai ${formatDate(isoOf(online!.end))}`;

  async function submit() {
    setBusy(true);
    setError(null);
    const body: RecordPaymentInput = {
      id: paymentId,
      product: form.product,
      amount,
      method: form.method,
      paid_at: form.paidAt,
      provider_ref: form.ref.trim() || null,
      note: form.note.trim(),
    };
    try {
      const r = await (await adminApi()).recordPayment(businessId, body);
      toast.success(
        `Pembayaran ${formatRupiah(amount)} dicatat. ${businessName}: ${
          isLifetime ? "Lifetime aktif" : `Premium aktif sampai ${formatDate(r.license.online_period_end)}`
        }.`
      );
      onDone(r);
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) {
        setErrors(fe);
        setStep("form");
      }
      const code = err instanceof ApiError ? err.code : "";
      setError(
        code === "PAYMENT_EXISTS"
          ? "Pembayaran ini (atau nomor referensinya) sudah tercatat. Periksa riwayat pembayaran."
          : code === "LIFETIME_EXISTS"
            ? "Bisnis ini sudah punya Lifetime. Pilih Premium, atau batalkan Lifetime lama bila salah catat."
            : errorMessage(err)
      );
    } finally {
      setBusy(false);
    }
  }

  const fid = (k: string) => `${uid}-${k}`;
  const desc = (k: string) => (errors[k] ? `${fid(k)}-error` : undefined);

  return (
    <Modal
      open
      title={step === "form" ? "Catat pembayaran" : "Periksa sebelum mencatat"}
      description={step === "form" ? `${businessName} · ${labelOf(PLAN_LABELS, s.plan)}` : undefined}
      icon={<Receipt size={20} aria-hidden className="text-brand-deep" />}
      dismissible={!busy}
      onClose={onClose}
      footer={
        step === "form" ? (
          <>
            <button type="button" className={btn.secondary} onClick={onClose}>
              Batal
            </button>
            <button type="button" className={btn.primary} disabled={lifetimeBlocked} onClick={() => validate() && setStep("review")}>
              Lanjut periksa <ArrowRight size={16} aria-hidden />
            </button>
          </>
        ) : (
          <>
            <button type="button" className={btn.secondary} onClick={() => setStep("form")} disabled={busy}>
              Ubah
            </button>
            <button type="button" className={btn.primary} onClick={submit} disabled={busy}>
              {busy && <Spinner />}
              Catat {formatRupiah(amount)}
            </button>
          </>
        )
      }
    >
      {error && (
        <div className="mb-3">
          <Notice tone="danger" role="alert">
            {error}
          </Notice>
        </div>
      )}
      {step === "form" ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 flex justify-between text-[13px] font-semibold text-ink">
              Produk <span className="font-medium text-muted">Lifetime sekali bayar · Premium per periode</span>
            </p>
            <Segmented<LicenseProduct>
              name="Produk"
              value={form.product}
              onChange={(v) => set({ product: v })}
              options={[
                { value: "lifetime", label: "Lifetime", hint: s.lifetime ? "sudah punya" : formatRupiah(prices.lifetime) },
                { value: "online_1m", label: "1 bulan", hint: formatRupiah(prices.online_1m) },
                { value: "online_6m", label: "6 bulan", hint: formatRupiah(prices.online_6m) },
                { value: "online_12m", label: "12 bulan", hint: formatRupiah(prices.online_12m) },
              ]}
            />
            {lifetimeBlocked && <p className="mt-1.5 text-[13px] text-danger">Bisnis ini sudah punya Lifetime (sejak {formatDate(s.lifetime_purchased_at)}).</p>}
            {!isLifetime && online && (
              <p className="mt-1.5 text-[12.5px] text-muted">
                Mulai {formatDate(isoOf(online.start))} — {online.extends ? "menyambung Premium sekarang, tanpa hari hilang" : "hari ini"}.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id={fid("amount")}
              label="Nominal diterima"
              error={errors.amount}
              hint={
                diff === 0 ? (
                  "Sesuai harga produk."
                ) : (
                  <>
                    {diff < 0 ? `Diskon ${formatRupiah(-diff)}` : `Lebih ${formatRupiah(diff)}`} dari harga.{" "}
                    <button
                      type="button"
                      className={`font-semibold text-brand-deep underline underline-offset-2 ${focusRing}`}
                      onClick={() => {
                        setAmountTouched(false);
                        set({ amount: String(price) });
                      }}
                    >
                      Pakai harga
                    </button>
                  </>
                )
              }
            >
              <MoneyInput
                id={fid("amount")}
                value={form.amount}
                invalid={!!errors.amount}
                describedBy={desc("amount")}
                onChange={(v) => {
                  setAmountTouched(true);
                  set({ amount: v });
                }}
              />
            </Field>
            <Field id={fid("paid_at")} label="Tanggal uang diterima" error={errors.paid_at}>
              <input
                id={fid("paid_at")}
                type="date"
                className={`${inputClass} tabular-nums`}
                value={form.paidAt}
                max={tomorrow}
                onChange={(e) => set({ paidAt: e.target.value })}
                aria-invalid={!!errors.paid_at || undefined}
                aria-describedby={desc("paid_at")}
              />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink">Metode</p>
            <Segmented<PaymentMethod>
              name="Metode pembayaran"
              value={form.method}
              onChange={(v) => set({ method: v })}
              options={[
                { value: "transfer", label: "Transfer" },
                { value: "qris", label: "QRIS" },
                { value: "cash", label: "Tunai" },
                { value: "other", label: "Lainnya" },
              ]}
            />
          </div>

          <Field
            id={fid("ref")}
            label="Kode pesanan / no. referensi (opsional)"
            error={errors.provider_ref}
            hint="Kode dari WhatsApp pemilik (mis. KS-1A2B3C4D-LIFETIME) atau nomor mutasi bank — mencegah pencatatan ganda."
          >
            <input
              id={fid("ref")}
              className={inputClass}
              value={form.ref}
              maxLength={120}
              autoComplete="off"
              onChange={(e) => set({ ref: e.target.value })}
              aria-invalid={!!errors.provider_ref || undefined}
            />
          </Field>
          <Field id={fid("note")} label="Catatan internal (opsional)" error={errors.note} hint={`${form.note.length}/500 · tidak terlihat oleh pemilik`}>
            <textarea
              id={fid("note")}
              rows={2}
              className={`${inputClass} py-2`}
              value={form.note}
              maxLength={500}
              onChange={(e) => set({ note: e.target.value })}
            />
          </Field>

          {!lifetimeBlocked && (
            <Preview>
              Setelah dicatat: <strong className="text-ink">{result}</strong>
              {!isLifetime && s.online_period_end && online?.extends ? <> (sebelumnya {formatDate(s.online_period_end)})</> : null}.
            </Preview>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <dl className="divide-y divide-line rounded-[12px] border border-line px-3.5 text-[14px]">
            {[
              ["Bisnis", businessName],
              ["Produk", labelOf(PRODUCTS, form.product)],
              ["Nominal", formatRupiah(amount) + (diff !== 0 ? ` (harga ${formatRupiah(price)})` : "")],
              ...(online ? [["Periode", `${formatDate(isoOf(online.start))} – ${formatDate(isoOf(online.end))}`]] : []),
              ["Metode", labelOf(PAYMENT_METHODS, form.method)],
              ["Diterima", formatDate(`${form.paidAt}T12:00:00+07:00`)],
              ...(form.ref.trim() ? [["Referensi", form.ref.trim()]] : []),
              ...(form.note.trim() ? [["Catatan", form.note.trim()]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-2">
                <dt className="shrink-0 text-muted">{k}</dt>
                <dd className="min-w-0 break-words text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <Preview tone="success">
            <strong>{businessName}</strong>: {result}. Pemilik menerima notifikasi dan melihatnya di halaman Paket setelah
            menekan Perbarui. Bisa dibatalkan bila salah catat.
          </Preview>
        </div>
      )}
    </Modal>
  );
}

// ——— Batalkan pembayaran ———

function VoidDialog({
  payment,
  businessId,
  onClose,
  onDone,
}: {
  payment: AdminPayment | null;
  businessId: string;
  onClose: () => void;
  onDone: (r: LicensePaymentResult) => void;
}) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shownFor, setShownFor] = useState<string | null>(null);
  if ((payment?.id ?? null) !== shownFor) {
    setShownFor(payment?.id ?? null);
    setReason("");
    setError(null);
  }
  const isLifetime = payment?.product === "lifetime";

  async function confirm() {
    if (!payment) return;
    setBusy(true);
    setError(null);
    try {
      const r = await (await adminApi()).voidPayment(businessId, payment.id, reason.trim());
      toast.success(
        `Pembayaran ${formatRupiah(payment.amount)} dibatalkan. ${isLifetime ? (r.license.lifetime ? "Lifetime tetap dari pembayaran lain." : "Lifetime dicabut.") : "Periode Premium dikembalikan."}`
      );
      onDone(r);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "PAYMENT_NOT_LATEST"
          ? "Ada pembayaran Premium yang lebih baru. Batalkan yang terbaru dulu (berurutan)."
          : errorMessage(err)
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog
      open={!!payment}
      title="Batalkan pembayaran ini?"
      confirmLabel="Batalkan pembayaran"
      cancelLabel="Jangan"
      tone="danger"
      busy={busy}
      confirmDisabled={reason.trim().length === 0}
      onConfirm={confirm}
      onClose={onClose}
    >
      {payment && (
        <div className="flex flex-col gap-3">
          <p>
            <strong className="text-ink">{formatRupiah(payment.amount)}</strong> · {labelOf(PRODUCTS, payment.product)}
            {payment.period_start && payment.period_end ? ` · ${formatDate(payment.period_start)} – ${formatDate(payment.period_end)}` : ""}
          </p>
          <p>
            {isLifetime
              ? "Lifetime dicabut (kecuali ada pembayaran Lifetime sah lain). Bila Premium juga tidak aktif, bisnis bisa langsung baca-saja."
              : "Periode Premium dikembalikan seperti sebelum pembayaran ini. Bila jatuh di masa lalu, bisnis bisa langsung masuk masa tenggang, Lifetime, atau baca-saja."}{" "}
            Catatan pembayaran tetap disimpan (status “dibatalkan”).
          </p>
          {error && (
            <Notice tone="danger" role="alert">
              {error}
            </Notice>
          )}
          <div>
            <label htmlFor="void-reason" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Alasan (wajib)
            </label>
            <textarea
              id="void-reason"
              rows={2}
              maxLength={300}
              className={`${inputClass} py-2`}
              placeholder="Mis. salah bisnis, transfer belum masuk"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      )}
    </ConfirmDialog>
  );
}

// ——— Tambah hari ———

function ExtendDialog({
  open,
  s,
  businessId,
  businessName,
  onClose,
  onDone,
}: {
  open: boolean;
  s: AdminLicense;
  businessId: string;
  businessName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  return open ? <ExtendForm {...{ s, businessId, businessName, onClose, onDone }} /> : null;
}

function ExtendForm({
  s,
  businessId,
  businessName,
  onClose,
  onDone,
}: {
  s: AdminLicense;
  businessId: string;
  businessName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const toast = useToast();
  const [now] = useState(() => Date.now());
  // Sama dengan server: `online` bila plan online|lifetime_online, atau tenggang setelah periode Premium; selain itu uji coba.
  const autoTarget: "trial" | "online" =
    s.plan === "online" || s.plan === "lifetime_online" || (s.plan === "grace" && !!s.online_period_end) ? "online" : "trial";
  const [days, setDays] = useState("7");
  const [target, setTarget] = useState<ExtendInput["target"]>("auto");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const n = Number(days || 0);
  const eff = target === "auto" ? autoTarget : target;
  const baseIso = eff === "trial" ? s.trial_ends_at : s.online_period_end;
  const base = Math.max(baseIso ? Date.parse(baseIso) : 0, now);
  const valid = n >= 1 && n <= 366 && note.trim().length > 0;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await (await adminApi()).extendLicense(businessId, { days: n, target, note: note.trim() });
      toast.success(`${businessName}: +${n} hari ${eff === "trial" ? "uji coba" : "Premium"} sampai ${formatDate(isoOf(base + n * DAY))}.`);
      onDone();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      title="Tambah hari"
      description="Hadiah, kompensasi gangguan, atau perpanjangan uji coba — tanpa pembayaran."
      icon={<CalendarPlus size={20} aria-hidden className="text-brand-deep" />}
      dismissible={!busy}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={busy}>
            Batal
          </button>
          <button type="button" className={btn.primary} onClick={submit} disabled={busy || !valid}>
            {busy && <Spinner />}
            Tambah {n > 0 ? `${n} hari` : "hari"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <Notice tone="danger" role="alert">
            {error}
          </Notice>
        )}
        <Field id="ext-days" label="Jumlah hari" error={errors.days} hint="1–366 hari">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-24">
              <input
                id="ext-days"
                inputMode="numeric"
                className={`${inputClass} font-semibold tabular-nums`}
                value={days}
                onChange={(e) => setDays(digits(e.target.value).slice(0, 3))}
                aria-invalid={!!errors.days || undefined}
              />
            </div>
            {[3, 7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(String(d))}
                className={`min-h-9 rounded-full border px-3 text-[13px] font-semibold tabular-nums ${
                  n === d ? "border-brand bg-brand-soft text-brand-deep" : "border-line text-body hover:border-line-strong"
                } ${focusRing}`}
              >
                {d} hari
              </button>
            ))}
          </div>
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Tambahkan ke</p>
          <Segmented<ExtendInput["target"]>
            name="Tambahkan ke"
            value={target}
            onChange={setTarget}
            options={[
              { value: "auto", label: "Otomatis", hint: autoTarget === "trial" ? "→ uji coba" : "→ Premium" },
              { value: "trial", label: "Uji coba" },
              { value: "online", label: "Premium" },
            ]}
          />
          <p className="mt-1.5 text-[12.5px] text-muted">
            {eff === "trial"
              ? s.plan === "readonly" || s.plan === "lifetime"
                ? "Uji coba ulang: semua fitur (termasuk server) aktif lagi mulai hari ini."
                : "Memperpanjang akhir uji coba."
              : "Memperpanjang periode Premium tanpa mencatat pembayaran."}
          </p>
        </div>
        <Field id="ext-note" label="Alasan (wajib)" error={errors.note} hint={`${note.length}/300 · tercatat di audit`}>
          <textarea
            id="ext-note"
            rows={2}
            maxLength={300}
            className={`${inputClass} py-2`}
            placeholder="Mis. kompensasi server gangguan 2 hari"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        {n >= 1 && n <= 366 && (
          <Preview>
            {eff === "trial" ? "Uji coba" : "Premium"} berakhir{" "}
            {baseIso && Date.parse(baseIso) > now ? <span className="line-through decoration-muted/60">{formatDate(baseIso)}</span> : "hari ini"} →{" "}
            <strong className="text-ink">{formatDate(isoOf(base + n * DAY))}</strong>
          </Preview>
        )}
      </div>
    </Modal>
  );
}


// ——— Kuota outlet ———

function OverridesDialog({
  open,
  s,
  businessId,
  onClose,
  onDone,
}: {
  open: boolean;
  s: AdminLicense;
  businessId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  return open ? <OverridesForm {...{ s, businessId, onClose, onDone }} /> : null;
}

function OverridesForm({ s, businessId, onClose, onDone }: { s: AdminLicense; businessId: string; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [outlets, setOutlets] = useState(s.overrides.outlet_quota === null ? "" : String(s.overrides.outlet_quota));
  const [note, setNote] = useState(s.overrides.note);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const body = { outlet_quota: outlets ? Number(outlets) : null, note: note.trim() };
  const dirty = body.outlet_quota !== s.overrides.outlet_quota || body.note !== s.overrides.note;
  const localErr: Record<string, string> = {};
  if (body.outlet_quota !== null && (body.outlet_quota < 1 || body.outlet_quota > 100)) localErr.outlet_quota = "1–100, atau kosongkan untuk bawaan.";
  if (body.note.length > 300) localErr.note = "Maksimal 300 karakter.";
  const shown = { ...localErr, ...errors };
  const describe = (v: number | null) => (v === null ? "bawaan (1)" : v.toLocaleString("id-ID"));

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await (await adminApi()).saveOverrides(businessId, body);
      toast.success("Kuota outlet disimpan. Aplikasi menerima perubahan saat memeriksa lisensi berikutnya.");
      onDone();
    } catch (err) {
      setConfirm(false);
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (confirm) {
    return (
      <ConfirmDialog open title="Simpan kuota outlet?" confirmLabel="Simpan" busy={busy} onConfirm={save} onClose={() => setConfirm(false)}>
        <p>
          Kuota outlet: <span className="text-muted">{describe(s.overrides.outlet_quota)}</span> →{" "}
          <strong className="text-ink">{describe(body.outlet_quota)}</strong>
        </p>
        {body.outlet_quota !== null && body.outlet_quota < s.usage.outlets && (
          <p className="mt-2 text-[13px] text-warning">
            Lebih kecil dari outlet yang dipakai ({s.usage.outlets}) — outlet tertua tetap aktif, lainnya jadi baca-saja.
          </p>
        )}
        <p className="mt-2 text-[13px] text-muted">Dicatat di audit.</p>
      </ConfirmDialog>
    );
  }

  return (
    <Modal
      open
      title="Kuota outlet"
      description="Kosongkan untuk kembali ke bawaan (1 outlet). Kuota tidak bergantung paket."
      icon={<SlidersHorizontal size={20} aria-hidden className="text-brand-deep" />}
      dismissible={!busy}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose}>
            Batal
          </button>
          <button type="button" className={btn.primary} disabled={!dirty || Object.keys(localErr).length > 0} onClick={() => setConfirm(true)}>
            Lanjut
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <Notice tone="danger" role="alert">
            {error}
          </Notice>
        )}
        <Field id="ov-outlets" label="Kuota outlet" error={shown.outlet_quota} hint={`Bawaan 1 · terpakai ${s.usage.outlets}`}>
          <input
            id="ov-outlets"
            inputMode="numeric"
            placeholder="Bawaan (1)"
            className={`${inputClass} tabular-nums sm:max-w-[200px]`}
            value={outlets}
            onChange={(e) => setOutlets(digits(e.target.value).slice(0, 3))}
            aria-invalid={!!shown.outlet_quota || undefined}
          />
        </Field>
        <Field id="ov-note" label="Catatan" error={shown.note} hint={`${note.length}/300`}>
          <textarea
            id="ov-note"
            rows={2}
            maxLength={300}
            className={`${inputClass} py-2`}
            placeholder="Mis. pemilik minta 3 outlet lewat WhatsApp"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
