// Data & perhitungan tiruan tahap 3 (lisensi Lifetime/Premium + metrik) untuk server tiruan (mock.ts).
// Deterministik (seed tetap). Aturan plan/perpanjangan/metrik meniru kontrak kasir-sakti-service/docs/api.md
// "Lisensi" & "Admin platform — tahap 3" (desain ../docs/2026-11-08-lisensi-design.md §2) agar layar admin bisa
// diuji tanpa server.
import { ADMINS, hex, NOW, refOf, rng } from "./mockData";
import type {
  AdminLicense,
  AdminPayment,
  BillingConfig,
  BusinessDetail,
  Kpi,
  LicenseProduct,
  LicenseStatus,
  Metrics,
  MetricsBucket,
  MetricsInterval,
  PlanCounts,
  PlanId,
  Prices,
} from "./types";

export const DAY = 86_400_000;
const TZ_OFFSET = 7 * 3_600_000;
const GRACE_DAYS = 3;
/** Snapshot harian `metrics_daily` baru ada sejak 90 hari lalu (sebelum fitur → null). */
const SNAPSHOT_DAYS = 90;

// ——— Tanggal (WIB) ———

export const jkt = (ms: number) => new Date(ms + TZ_OFFSET).toISOString().slice(0, 10);
export const dayStart = (d: string) => Date.parse(`${d}T00:00:00+07:00`);
export const addDays = (d: string, n: number) => jkt(dayStart(d) + n * DAY);
const dayDiff = (a: string, b: string) => Math.round((dayStart(a) - dayStart(b)) / DAY);
function addMonths(ms: number, n: number): number {
  const d = new Date(ms);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.getTime();
}
function mondayOf(d: string): string {
  const dow = new Date(dayStart(d) + TZ_OFFSET).getUTCDay();
  return addDays(d, -((dow + 6) % 7));
}
function monthEnd(d: string): string {
  const [y, m] = d.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return addDays(next, -1);
}

// ——— Rekaman ———

export type PaymentRecord = AdminPayment & { prev_period_end: string | null; business_id: string };

export type LicRecord = {
  business_id: string;
  trial_ends_at: string | null;
  lifetime_purchased_at: string | null;
  online_period_end: string | null;
  outlet_quota: number | null;
  override_note: string;
  first_paid_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  tx_this_month: number;
  payments: PaymentRecord[];
};

export type BillingState = {
  subs: Map<string, LicRecord>;
  /** Hari aktif per bisnis: offset hari dari hari ini (0 = hari ini). */
  activity: Map<string, Set<number>>;
  config: BillingConfig;
};

const t = (iso: string | null) => (iso ? Date.parse(iso) : null);
const iso = (ms: number) => new Date(ms).toISOString();

export const ONLINE_FEATURES = ["sync", "staff", "multi_device", "cloud_backup", "remote_monitor", "staff_reports"];
export const MONTHS_OF: Record<Exclude<LicenseProduct, "lifetime">, number> = { online_1m: 1, online_6m: 6, online_12m: 12 };

/** Plan efektif (urutan prioritas desain lisensi §2). */
export function planAt(trialEnds: number | null, lifetime: boolean, onlineEnd: number | null, at: number): PlanId {
  if (onlineEnd !== null && onlineEnd > at) return lifetime ? "lifetime_online" : "online";
  if (trialEnds !== null && trialEnds > at) return "trial";
  const base = Math.max(onlineEnd ?? -Infinity, trialEnds ?? -Infinity);
  if (!lifetime && Number.isFinite(base) && at < base + GRACE_DAYS * DAY) return "grace";
  return lifetime ? "lifetime" : "readonly";
}

export const statusOf = (plan: PlanId): LicenseStatus => (plan === "grace" ? "grace" : plan === "readonly" ? "readonly" : "active");

export function effective(s: LicRecord, at = Date.now()) {
  const trial = t(s.trial_ends_at);
  const online = t(s.online_period_end);
  const lifetime = s.lifetime_purchased_at !== null;
  const plan = planAt(trial, lifetime, online, at);
  const base = Math.max(online ?? -Infinity, trial ?? -Infinity);
  const graceEnds = !lifetime && Number.isFinite(base) ? base + GRACE_DAYS * DAY : null;
  const endsMs =
    plan === "online" || plan === "lifetime_online" ? online : plan === "trial" ? trial : plan === "grace" ? graceEnds : null;
  return {
    plan,
    lifetime,
    graceEnds,
    endsMs,
    daysLeft: endsMs === null ? null : Math.max(0, Math.ceil((endsMs - at) / DAY)),
  };
}

const recorded = (s: LicRecord) => s.payments.filter((p) => p.status === "recorded");

export function toAdminLicense(s: LicRecord, b: BusinessDetail): AdminLicense {
  const e = effective(s);
  const outlets = b.outlets.filter((o) => o.status !== "closed").length;
  const last = [...s.payments].sort((a, c) => c.paid_at.localeCompare(a.paid_at))[0] ?? null;
  const hasOnline = e.plan === "trial" || e.plan === "online" || e.plan === "lifetime_online" || e.plan === "grace";
  return {
    business: {
      id: b.id,
      name: b.name,
      type: b.type,
      owner: b.owner ? { name: b.owner.name, email: b.owner.email, phone: b.owner.phone } : null,
    },
    plan: e.plan,
    status: statusOf(e.plan),
    lifetime: e.lifetime,
    lifetime_purchased_at: s.lifetime_purchased_at,
    trial_ends_at: s.trial_ends_at,
    online_period_end: s.online_period_end,
    grace_ends_at: e.graceEnds === null ? null : iso(e.graceEnds),
    ends_at: e.endsMs === null ? null : iso(e.endsMs),
    days_left: e.daysLeft,
    features: hasOnline ? [...ONLINE_FEATURES] : [],
    single_device: e.plan === "lifetime" || e.plan === "readonly",
    outlets: s.outlet_quota ?? 1,
    overrides: { outlet_quota: s.outlet_quota, note: s.override_note },
    usage: { month: jkt(Date.now()).slice(0, 7), tx_this_month: s.tx_this_month, outlets },
    first_paid_at: s.first_paid_at,
    last_payment: last ? publicPayment(last) : null,
    version: s.version,
    updated_at: s.updated_at,
  };
}

export function publicPayment(p: PaymentRecord): AdminPayment {
  const { prev_period_end: _p, business_id: _b, ...rest } = p;
  void _p;
  void _b;
  return rest;
}

// ——— Pembuatan data ———

/** Harga bawaan (desain lisensi §1). */
export const PRICES: Prices = { lifetime: 145_000, lifetime_regular: 199_000, online_1m: 49_000, online_6m: 269_000, online_12m: 490_000 };

export function makeBillingConfig(): BillingConfig {
  return {
    prices: { ...PRICES },
    bank_accounts: [
      { bank: "BCA", number: "8730 123 456", holder: "Yoho Studio" },
      { bank: "Mandiri", number: "131-00-1234567-8", holder: "Yoho Studio" },
    ],
    whatsapp: "+6281122334455",
    instructions:
      "1. Transfer sesuai harga paket ke salah satu rekening di atas.\n2. Kirim bukti transfer + kode pesanan lewat WhatsApp.\n3. Paket aktif paling lambat 1×24 jam setelah pembayaran kami cek — tekan Perbarui di halaman Paket.",
    updated_by: refOf(ADMINS[0]),
    updated_at: iso(NOW - 6 * DAY),
  };
}

export function makeBillingState(businesses: BusinessDetail[]): BillingState {
  const r = rng(2026);
  const subs = new Map<string, LicRecord>();
  const activity = new Map<string, Set<number>>();
  const dom = Number(jkt(NOW).slice(8, 10));
  let voidAdded = false;

  businesses.forEach((b, i) => {
    const created = Date.parse(b.created_at);
    const today = jkt(NOW);
    const createdOff = dayDiff(today, jkt(created));
    const lastOff = b.last_active_at ? dayDiff(today, jkt(Date.parse(b.last_active_at))) : null;
    const engaged = lastOff !== null && lastOff <= 30;
    const trialEnds = created + 14 * DAY;

    const payments: PaymentRecord[] = [];
    let online: number | null = null;
    let lifetimeAt: number | null = null;
    let n = 0;
    const pid = () => `p${String(i).padStart(3, "0")}${String(n).padStart(4, "0")}-5a6b-4c7d-8e9f-${hex(i * 97 + n, 12)}`;
    const push = (product: LicenseProduct, paid: number, start: number | null, end: number | null, prev: number | null) => {
      const discount = r() < 0.08;
      const auto = paid > NOW - 20 * DAY && r() < 0.6;
      payments.push({
        id: pid(),
        business_id: b.id,
        product,
        period_start: start === null ? null : iso(start),
        period_end: end === null ? null : iso(end),
        prev_period_end: prev === null ? null : iso(prev),
        amount: discount ? Math.round(PRICES[product] * 0.8) : PRICES[product],
        // Pembayaran baru (20 hari terakhir) sebagian lewat QRIS otomatis (QRISGate, tanpa admin).
        ...(auto ? { method: "qris", provider: "qrisgate" } : { method: r() < 0.7 ? "transfer" : r() < 0.7 ? "qris" : "cash", provider: "manual" }),
        paid_at: iso(paid),
        provider_ref: auto ? `trx_${hex(i * 7 + n, 24)}` : r() < 0.6 ? `KS-${hex(i * 13 + n, 8).toUpperCase()}-${product.toUpperCase()}` : null,
        note: discount ? "Diskon komunitas UMKM" : n === 0 && r() < 0.3 ? "Bukti transfer via WA" : "",
        status: "recorded",
        void_reason: "",
        recorded_by: auto ? null : refOf(ADMINS[n % 3 === 2 ? 1 : 0]),
        voided_by: null,
        voided_at: null,
        created_at: iso(Math.min(NOW, paid + 2 * 3_600_000)),
      });
      n++;
    };

    // Pembeli: bisnis aktif lebih mungkin membayar. Sebagian beli Lifetime, sebagian Premium berulang, sebagian keduanya.
    const payer = engaged && r() < 0.62;
    if (payer) {
      let paid = trialEnds + (r() * 7 - 4) * DAY;
      if (paid > NOW) paid = r() < 0.4 ? NOW - r() * 3 * DAY : Infinity;
      const kind = r();
      if (paid <= NOW && kind < 0.45) {
        lifetimeAt = paid;
        push("lifetime", paid, null, null, null);
        paid = kind < 0.15 ? paid + r() * 40 * DAY : Infinity; // sebagian kemudian menambah Premium
      }
      const product: Exclude<LicenseProduct, "lifetime"> = r() < 0.16 ? "online_12m" : r() < 0.2 ? "online_6m" : "online_1m";
      while (paid <= NOW) {
        const start: number = Math.max(paid, online ?? 0);
        const end = addMonths(start, MONTHS_OF[product]);
        push(product, paid, start, end, online);
        online = Math.max(online ?? 0, end);
        if (r() < 0.09) break; // berhenti berlangganan
        if (end > NOW - 3 * DAY && end <= NOW) break; // belum memperpanjang → masa tenggang
        paid = end - (r() * 4 - 1) * DAY;
      }
      if (!voidAdded && payments.filter((p) => p.product !== "lifetime").length > 2) {
        voidAdded = true;
        const p = payments[payments.length - 2];
        payments.push({
          ...p,
          id: `p${String(i).padStart(3, "0")}9999-5a6b-4c7d-8e9f-${hex(i * 31, 12)}`,
          provider_ref: null,
          note: "",
          status: "void",
          void_reason: "Tercatat dua kali (bukti transfer sama)",
          voided_by: refOf(ADMINS[1]),
          voided_at: iso(Date.parse(p.created_at) + 3_600_000),
          created_at: iso(Date.parse(p.created_at) + 600_000),
        });
      }
    }
    const firstPaid = payments.find((p) => p.status === "recorded")?.paid_at ?? null;
    const lastRecorded = [...payments].reverse().find((p) => p.status === "recorded");
    const multiOutlet = b.outlets_count > 1;
    const sales = b.stats?.sales_30d ?? 0;
    subs.set(b.id, {
      business_id: b.id,
      trial_ends_at: iso(trialEnds),
      lifetime_purchased_at: lifetimeAt === null ? null : iso(lifetimeAt),
      online_period_end: online === null ? null : iso(online),
      outlet_quota: multiOutlet ? b.outlets_count : null,
      override_note: multiOutlet ? "Pemilik minta tambahan outlet lewat WhatsApp" : "",
      first_paid_at: firstPaid,
      version: 1 + payments.length,
      created_at: b.created_at,
      updated_at: lastRecorded?.created_at ?? b.created_at,
      tx_this_month: Math.round(((payer ? sales : sales / 6) * dom) / 30),
      payments,
    });

    // Hari aktif: pembayar lebih rajin; berhenti setelah hari aktif terakhir.
    const days = new Set<number>();
    const eRate = payer ? 0.7 + r() * 0.25 : 0.3 + r() * 0.45;
    const until = lastOff ?? Math.max(0, createdOff - 2);
    for (let off = createdOff; off >= until; off--) {
      const weekendDip = new Date(dayStart(addDays(today, -off)) + TZ_OFFSET).getUTCDay() === 0 ? 0.7 : 1;
      if (off === createdOff || off === lastOff || r() < eRate * weekendDip) days.add(off);
    }
    activity.set(b.id, days);
  });

  return { subs, activity, config: makeBillingConfig() };
}

// ——— Metrik ———

type MetricsInput = { from?: string; to?: string; interval?: string };
export type MetricsError = { field: string; message: string };

const LIMITS: Record<MetricsInterval, number> = { day: 92, week: 53 * 7, month: 36 * 31 };

function pct(value: number | null, previous: number | null): number | null {
  if (value === null || previous === null || previous === 0) return null;
  return Math.round(((value - previous) / previous) * 1000) / 10;
}
const kpi = (value: number | null, previous: number | null): Kpi => ({ value, previous, change_pct: pct(value, previous) });

export function computeMetrics(
  businesses: BusinessDetail[],
  st: BillingState,
  q: MetricsInput
): Metrics | MetricsError {
  const today = jkt(Date.now());
  const interval = (q.interval || "day") as MetricsInterval;
  if (!["day", "week", "month"].includes(interval)) return { field: "interval", message: "day, week, atau month." };
  const to = q.to || today;
  const from = q.from || addDays(to, -29);
  if (from > to) return { field: "from", message: "Tanggal awal setelah tanggal akhir." };
  const len = dayDiff(to, from) + 1;
  if (len > LIMITS[interval]) return { field: "to", message: "Rentang terlalu panjang untuk interval ini." };

  const offOf = (d: string) => dayDiff(today, d);
  const isActive = (id: string, d: string) => st.activity.get(id)?.has(offOf(d)) ?? false;
  const endOf = (d: string) => Math.min(dayStart(d) + DAY - 1, Date.now());
  const recordedPays = [...st.subs.values()].flatMap((s) => s.payments.filter((p) => p.status === "recorded"));

  const planOfAt = (s: LicRecord, at: number): PlanId => {
    let online: number | null = null;
    let lifetime = false;
    for (const p of s.payments) {
      if (p.status !== "recorded" || Date.parse(p.paid_at) > at) continue;
      if (p.product === "lifetime") lifetime = true;
      else if (p.period_end) online = Math.max(online ?? 0, Date.parse(p.period_end));
    }
    return planAt(t(s.trial_ends_at), lifetime, online, at);
  };
  const countsAt = (at: number) => {
    const c = { trial: 0, online: 0, lifetime: 0, grace: 0, readonly: 0 };
    for (const b of businesses) {
      if (Date.parse(b.created_at) > at) continue;
      const s = st.subs.get(b.id);
      if (s) c[bucketPlan(planOfAt(s, at))]++;
    }
    return c;
  };
  /** Pembayar Premium = pembayaran Premium sah yang periodenya mencakup `at`. */
  const onlinePayingAt = (at: number) => {
    let n = 0;
    for (const s of st.subs.values()) {
      if (s.payments.some((p) => p.status === "recorded" && p.product !== "lifetime" && Date.parse(p.paid_at) <= at && p.period_start && p.period_end && Date.parse(p.period_start) <= at && Date.parse(p.period_end) > at)) n++;
    }
    return n;
  };
  const days = (a: string, b: string) => {
    const out: string[] = [];
    for (let d = a; d <= b; d = addDays(d, 1)) out.push(d);
    return out;
  };
  const activeIn = (a: string, b: string) => {
    const ds = days(a, b);
    return businesses.filter((x) => ds.some((d) => isActive(x.id, d))).length;
  };
  const signupsIn = (a: string, b: string) =>
    businesses.filter((x) => {
      const d = jkt(Date.parse(x.created_at));
      return d >= a && d <= b;
    }).length;
  const revenueIn = (a: string, b: string) => {
    const lo = dayStart(a);
    const hi = dayStart(b) + DAY;
    const ps = recordedPays.filter((p) => Date.parse(p.paid_at) >= lo && Date.parse(p.paid_at) < hi);
    return { amount: ps.reduce((s, p) => s + p.amount, 0), count: ps.length };
  };
  const mrrAt = (at: number) => {
    let sum = 0;
    for (const s of st.subs.values()) {
      const p = s.payments.find(
        (x) =>
          x.status === "recorded" && x.product !== "lifetime" && Date.parse(x.paid_at) <= at &&
          !!x.period_start && !!x.period_end && Date.parse(x.period_start) <= at && Date.parse(x.period_end) > at
      );
      if (!p || p.product === "lifetime") continue;
      sum += p.amount / MONTHS_OF[p.product]; // Lifetime tidak masuk MRR
    }
    return Math.round(sum);
  };
  const dauAvg = (a: string, b: string) => {
    const ds = days(a, b);
    const total = ds.reduce((acc, d) => acc + businesses.filter((x) => isActive(x.id, d)).length, 0);
    return Math.round((total / ds.length) * 10) / 10;
  };
  const conversionIn = (a: string, b: string) => {
    const lo = dayStart(a);
    const hi = dayStart(b) + DAY;
    let ended = 0;
    let converted = 0;
    for (const s of st.subs.values()) {
      const te = t(s.trial_ends_at);
      if (te === null || te < lo || te >= hi || te > Date.now()) continue;
      ended++;
      if (s.payments.some((p) => p.status === "recorded" && Date.parse(p.paid_at) <= te + 14 * DAY)) converted++;
    }
    return { ended, converted, rate: ended ? Math.round((converted / ended) * 100) / 100 : null };
  };

  const prevTo = addDays(from, -1);
  const prevFrom = addDays(from, -len);

  // Seri per ember.
  const bucketOf = (d: string) => (interval === "day" ? d : interval === "week" ? mondayOf(d) : `${d.slice(0, 8)}01`);
  const bucketEnd = (start: string) => (interval === "day" ? start : interval === "week" ? addDays(start, 6) : monthEnd(start));
  const snapshotFrom = addDays(today, -(SNAPSHOT_DAYS - 1));
  const series: MetricsBucket[] = [];
  for (let start = bucketOf(from); start <= to; start = addDays(bucketEnd(start), 1)) {
    const end = bucketEnd(start);
    const a = start < from ? from : start;
    const b = end > to ? to : end;
    const rev = revenueIn(a, b);
    const snap = b >= snapshotFrom ? countsAt(endOf(b)) : null;
    series.push({
      bucket: start,
      partial: start < from || end > to || end > today,
      signups: signupsIn(a, b),
      active: activeIn(a, b),
      revenue: rev.amount,
      payments: rev.count,
      trial: snap?.trial ?? null,
      online: snap?.online ?? null,
      lifetime: snap?.lifetime ?? null,
      grace: snap?.grace ?? null,
      readonly: snap?.readonly ?? null,
    });
  }

  // Kohort minggu daftar.
  const cohortFrom = interval === "day" ? (from < addDays(to, -83) ? from : addDays(to, -83)) : from;
  const weeks = new Map<string, string[]>();
  for (const b of businesses) {
    const d = jkt(Date.parse(b.created_at));
    if (d < cohortFrom || d > to) continue;
    const w = mondayOf(d);
    weeks.set(w, [...(weeks.get(w) ?? []), b.id]);
  }
  const cohorts = [...weeks.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([week, ids]) => ({
      week,
      size: ids.length,
      retention: Array.from({ length: 9 }, (_, k) => {
        const ws = addDays(week, k * 7);
        if (ws > today) return null;
        const we = addDays(ws, 6) > today ? today : addDays(ws, 6);
        const ds = days(ws, we);
        const n = ids.filter((id) => ds.some((d) => isActive(id, d))).length;
        return Math.round((n / ids.length) * 100) / 100;
      }),
    }));

  // Pendapatan 12 bulan terakhir.
  const firstPay = new Map<string, string>();
  for (const s of st.subs.values()) {
    const f = s.payments.filter((p) => p.status === "recorded").sort((a, b) => a.paid_at.localeCompare(b.paid_at))[0];
    if (f) firstPay.set(s.business_id, f.id);
  }
  const revenue_monthly = Array.from({ length: 12 }, (_, k) => {
    const [y, m] = to.split("-").map(Number);
    const idx = y * 12 + (m - 1) - (11 - k);
    const month = `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, "0")}`;
    const ps = recordedPays.filter((p) => jkt(Date.parse(p.paid_at)).startsWith(month));
    const fresh = ps.filter((p) => firstPay.get(p.business_id) === p.id).length;
    return { month, amount: ps.reduce((s, p) => s + p.amount, 0), payments: ps.length, new: fresh, renewals: ps.length - fresh };
  });

  const nowCounts = currentPlans(businesses, st);
  const conv = conversionIn(from, to);
  const convPrev = conversionIn(prevFrom, prevTo);
  const revNow = revenueIn(from, to).amount;
  const revPrev = revenueIn(prevFrom, prevTo).amount;
  const dau = businesses.filter((x) => isActive(x.id, to)).length;
  const mau = activeIn(addDays(to, -29), to);

  return {
    range: { from, to, interval, tz: "Asia/Jakarta" },
    generated_at: new Date().toISOString(),
    cached: false,
    kpis: {
      signups: kpi(signupsIn(from, to), signupsIn(prevFrom, prevTo)),
      active_businesses: kpi(activeIn(from, to), activeIn(prevFrom, prevTo)),
      dau_avg: kpi(dauAvg(from, to), dauAvg(prevFrom, prevTo)),
      online_paying: kpi(onlinePayingAt(endOf(to)), onlinePayingAt(endOf(prevTo))),
      revenue: kpi(revNow, revPrev),
      mrr_estimate: kpi(mrrAt(endOf(to)), mrrAt(endOf(prevTo))),
      trial_conversion: kpi(conv.rate, convPrev.rate),
    },
    series,
    activity: {
      dau,
      wau: activeIn(addDays(to, -6), to),
      mau,
      stickiness: mau ? Math.round((dau / mau) * 100) / 100 : 0,
      as_of: to,
    },
    plans: nowCounts,
    cohorts,
    revenue_monthly,
    conversion: { trials_ended: conv.ended, converted: conv.converted, rate: conv.rate, window_days: 14 },
    business_types: ["culinary", "retail"].map((type) => {
      const list = businesses.filter((b) => b.type === type);
      return {
        type,
        total: list.length,
        active: list.filter((b) => [...(st.activity.get(b.id) ?? [])].some((o) => o <= 29)).length,
        online: list.filter((b) => {
          const s = st.subs.get(b.id);
          const p = s && effective(s).plan;
          return p === "online" || p === "lifetime_online";
        }).length,
      };
    }),
  };
}

export function currentPlans(businesses: BusinessDetail[], st: BillingState): PlanCounts {
  const c: PlanCounts = { trial: 0, online: 0, lifetime: 0, grace: 0, readonly: 0, expiring_7d: 0 };
  for (const b of businesses) {
    const s = st.subs.get(b.id);
    if (!s) continue;
    const e = effective(s);
    c[bucketPlan(e.plan)]++;
    if (e.plan !== "lifetime" && e.plan !== "readonly" && e.endsMs !== null && e.endsMs - Date.now() <= 7 * DAY) c.expiring_7d++;
  }
  return c;
}

export function revenueThisMonth(st: BillingState): number {
  const month = jkt(Date.now()).slice(0, 7);
  let sum = 0;
  for (const s of st.subs.values())
    for (const p of s.payments) if (p.status === "recorded" && jkt(Date.parse(p.paid_at)).startsWith(month)) sum += p.amount;
  return sum;
}

/** Kelompok hitungan: `lifetime_online` ikut Premium (`online`). */
export function bucketPlan(p: PlanId): Exclude<PlanId, "lifetime_online"> {
  return p === "lifetime_online" ? "online" : p;
}

export { recorded as recordedPayments, addMonths };
