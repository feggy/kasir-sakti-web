"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BellRing,
  Bug,
  CalendarClock,
  ChartLine,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Hourglass,
  MonitorSmartphone,
  ScrollText,
  TrendingUp,
  Smartphone,
  UserRoundX,
  Wallet,
} from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import type { AuditEntry, Summary } from "@/lib/admin/types";
import { useAdminSession } from "./AdminShell";
import { Maskot } from "./maskot";
import { AUDIT_ACTIONS, labelOf, TARGET_TYPES } from "./labels";
import { MerchantOverview } from "./MerchantOverview";
import { GroupHeading } from "./merchantUi";
import { PLAN_COLORS, PLAN_SERIES } from "./licenseUi";
import {
  Badge,
  btn,
  ErrorBlock,
  focusRing,
  formatBytes,
  formatDateTime,
  formatRelative,
  formatRupiah,
  formatRupiahShort,
  PageHeader,
  Section,
  Skeleton,
  StatCard,
  useLoad,
} from "./ui";

type Data = { summary: Summary; audit: AuditEntry[] };

/** Sapaan menurut jam WIB, seperti Beranda aplikasi ("Selamat pagi, Bu Sri"). */
function greeting(now = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(now));
  return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam";
}
const todayLabel = () =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date());

export function SummaryView() {
  const { admin } = useAdminSession();
  const { state, reload } = useLoad<Data>(async (signal) => {
    const api = await adminApi();
    const [summary, audit] = await Promise.all([api.summary(signal), api.auditPage({ limit: 5 }, signal)]);
    return { summary, audit: audit.items };
  }, []);
  const [now] = useState(() => ({ hello: greeting(), date: todayLabel() }));
  const first = admin.name.split(/\s+/)[0] || admin.name;

  return (
    <>
      <PageHeader
        title={`${now.hello}, ${first}`}
        description={`${now.date} · keadaan semua warung, lisensi, dan aplikasi Kasir Sakti.`}
        actions={
          <>
            <Link href="/admin/pertumbuhan" className={btn.secondary}>
              <TrendingUp size={16} aria-hidden /> Pertumbuhan
            </Link>
            <Link href="/admin/metrik" className={btn.secondary}>
              <ChartLine size={16} aria-hidden /> Metrik
            </Link>
            <Link href="/admin/lisensi" className={btn.primary}>
              <CreditCard size={16} aria-hidden /> Buka Lisensi
            </Link>
          </>
        }
      />
      {!!state.data?.summary.open_payment_alerts && <PaymentAlertsBanner count={state.data.summary.open_payment_alerts} />}
      <div className="mb-8">
        <MerchantOverview
          attention={
            state.data ? (
              <AttentionCard summary={state.data.summary} />
            ) : state.status === "error" ? (
              <ErrorBlock error={state.error} onRetry={reload} />
            ) : (
              <Skeleton className="h-full min-h-[220px] w-full rounded-[22px]" />
            )
          }
          side={state.data?.summary.licenses ? <LicensesCard summary={state.data.summary} /> : undefined}
        />
      </div>
      {state.status === "loading" && !state.data && <SummarySkeleton />}
      {state.data && <SummaryBody data={state.data} />}
    </>
  );
}

/** Hal yang perlu ditindak hari ini — pola kartu "Perlu perhatian" di Beranda aplikasi. */
function AttentionCard({ summary }: { summary: Summary }) {
  const items: { icon: React.ReactNode; title: string; hint: string; href: string; tone: "warning" | "danger" }[] = [];
  const lic = summary.licenses;
  const alerts = summary.open_payment_alerts ?? 0;
  if (alerts > 0)
    items.push({ icon: <BellRing size={16} aria-hidden />, title: `${alerts} peringatan pembayaran terbuka`, hint: "QRIS otomatis gagal diproses — cek & tandai selesai", href: "/admin/lisensi/peringatan", tone: "danger" });
  if (lic && lic.expiring_7d > 0)
    items.push({ icon: <CalendarClock size={16} aria-hidden />, title: `${lic.expiring_7d} lisensi berakhir ≤ 7 hari`, hint: "Uji coba & Premium — hubungi sebelum habis", href: "/admin/lisensi?expiring=7d", tone: "warning" });
  if (lic && lic.grace > 0)
    items.push({ icon: <Hourglass size={16} aria-hidden />, title: `${lic.grace} bisnis dalam masa tenggang`, hint: "Setelah itu jadi baca-saja", href: "/admin/lisensi?plan=grace", tone: "danger" });
  const c = summary.crashes_24h;
  if (c && c.new_groups > 0)
    items.push({ icon: <Bug size={16} aria-hidden />, title: `${c.new_groups} crash baru (24 jam)`, hint: `${c.events} kejadian · ${c.groups} grup`, href: "/admin/crash", tone: "danger" });
  const d = summary.deletions;
  if (d && d.due_7d > 0)
    items.push({ icon: <UserRoundX size={16} aria-hidden />, title: `${d.due_7d} akun dihapus ≤ 7 hari`, hint: `${d.scheduled} terjadwal`, href: "/admin/hapus-akun", tone: "warning" });
  const below = summary.devices_below_min_build;
  if (below !== undefined && below > 0)
    items.push({ icon: <Smartphone size={16} aria-hidden />, title: `${below} perangkat di bawah build minimum`, hint: "Tidak bisa sinkron sampai diperbarui", href: "/admin/versi", tone: "warning" });

  return (
    <Section title="Perlu perhatian" description={items.length ? `${items.length} hal untuk ditindak` : undefined} bodyClass="px-2 pb-2 pt-1">
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <Maskot pose="dasar" size={84} />
          <p className="mt-1 text-[14px] font-extrabold text-ink">Semua aman</p>
          <p className="text-[13px] text-muted">Tidak ada peringatan pembayaran, lisensi hampir habis, crash baru, atau hapus akun mendesak.</p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {items.map((x) => (
            <li key={x.title}>
              <Link href={x.href} className={`group flex items-center gap-3 rounded-[14px] px-3 py-2.5 hover:bg-tint ${focusRing}`}>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${x.tone === "danger" ? "bg-danger-tint text-danger" : "bg-warning-tint text-warning"}`}
                >
                  {x.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">{x.title}</span>
                  <span className="block truncate text-[12.5px] text-muted">{x.hint}</span>
                </span>
                <ChevronRight size={16} aria-hidden className="shrink-0 text-muted group-hover:text-ink" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/** Kartu mencolok di atas Ringkasan bila ada peringatan pembayaran paket yang belum ditindak. */
function PaymentAlertsBanner({ count }: { count: number }) {
  return (
    <Link
      href="/admin/lisensi/peringatan"
      className={`group mb-5 flex items-center gap-3 rounded-[18px] border border-danger/25 bg-danger-tint px-4 py-3.5 transition-colors hover:border-danger/50 sm:px-5 ${focusRing}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-danger">
        <BellRing size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold text-danger">
          {count.toLocaleString("id-ID")} peringatan pembayaran paket terbuka
        </span>
        <span className="block text-[13px] text-body">
          Pembayaran QRIS otomatis yang tidak bisa diproses server — mungkin ada pemilik yang sudah bayar tetapi paketnya belum aktif.
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-[13px] font-semibold text-danger sm:inline-flex">
        Lihat <ArrowRight size={14} aria-hidden />
      </span>
      <ChevronRight size={16} aria-hidden className="shrink-0 text-danger sm:hidden" />
    </Link>
  );
}

function SummarySkeleton() {
  return (
    <div role="status" aria-label="Memuat ringkasan" className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] px-4 py-3.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2.5 h-6 w-12" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] p-5">
            <Skeleton className="h-4 w-32" />
            {[0, 1, 2, 3].map((k) => (
              <Skeleton key={k} className="mt-4 h-3.5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 text-[14px]">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-ink">{children}</dd>
    </div>
  );
}

const linkClass = `inline-flex items-center gap-1 text-[13px] font-semibold text-brand-deep hover:underline ${focusRing}`;

function SummaryBody({ data }: { data: Data }) {
  const { summary, audit } = data;
  const v = summary.app_version;
  const r = summary.latest_release;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <GroupHeading title="Aplikasi" href="/admin/versi" linkLabel="Versi & rilis" />
        <div className="-mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
          <StatCard
            label="Bisnis aktif"
            value={summary.businesses_active_7d}
            hint={summary.businesses_active_30d !== undefined ? `7 hari · ${summary.businesses_active_30d} dalam 30 hari` : "7 hari terakhir"}
            icon={<Activity size={14} aria-hidden />}
            href="/admin/bisnis?active=7d"
          />
          <StatCard
            label="Perangkat aktif"
            value={summary.devices_active_7d}
            hint="7 hari terakhir"
            icon={<MonitorSmartphone size={14} aria-hidden />}
          />
          {summary.crashes_24h && (
            <StatCard
              label="Crash 24 jam"
              value={summary.crashes_24h.events}
              tone={summary.crashes_24h.new_groups > 0 ? "danger" : "neutral"}
              icon={<Bug size={14} aria-hidden />}
              href="/admin/crash"
              hint={
                summary.crashes_24h.events === 0
                  ? "Aplikasi sehat"
                  : `${summary.crashes_24h.groups} grup${summary.crashes_24h.new_groups ? ` · ${summary.crashes_24h.new_groups} baru` : ""}${
                      summary.crash_groups_open !== undefined ? ` · ${summary.crash_groups_open} terbuka` : ""
                    }`
              }
            />
          )}
          {summary.deletions && (
            <StatCard
              label="Hapus akun terjadwal"
              value={summary.deletions.scheduled}
              tone={summary.deletions.due_7d > 0 ? "warning" : "neutral"}
              icon={<UserRoundX size={14} aria-hidden />}
              href="/admin/hapus-akun"
              hint={summary.deletions.due_7d > 0 ? `${summary.deletions.due_7d} dihapus ≤ 7 hari` : "Tidak ada yang mendesak"}
            />
          )}
          {summary.devices_below_min_build !== undefined && (
            <StatCard
              label="Di bawah build minimum"
              value={summary.devices_below_min_build}
              tone={summary.devices_below_min_build > 0 ? "warning" : "success"}
              icon={<Smartphone size={14} aria-hidden />}
              href="/admin/versi"
              hint="Perangkat aktif 30 hari"
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <Section
            title="Versi aktif (Android)"
            actions={
              <Link href="/admin/versi" className={linkClass}>
                Ubah <ArrowRight size={14} aria-hidden />
              </Link>
            }
          >
            <dl className="divide-y divide-line">
              <Row label="Versi terbaru">
                {v.latest_version} <span className="text-muted">(build {v.latest_build})</span>
              </Row>
              <Row label="Build minimum">{v.min_build}</Row>
              <Row label="Sumber">
                {v.source === "db" ? <Badge tone="success">Database</Badge> : <Badge tone="warning">Env server</Badge>}
              </Row>
              <Row label="Diubah">
                {v.updated_at ? `${formatDateTime(v.updated_at)}${v.updated_by ? ` · ${v.updated_by.name}` : ""}` : "—"}
              </Row>
            </dl>
          </Section>

          <Section
            title="APK terbaru"
            actions={
              <Link href="/admin/apk" className={linkClass}>
                Kelola <ArrowRight size={14} aria-hidden />
              </Link>
            }
          >
            {r ? (
              <dl className="divide-y divide-line">
                <Row label="Versi">
                  {r.version} <span className="text-muted">(build {r.build}, {r.abi})</span>
                </Row>
                <Row label="Ukuran">{formatBytes(r.size_bytes)}</Row>
                <Row label="Dirilis">{formatDateTime(r.released_at)}</Row>
                <Row label="Berkas">
                  <a href={r.url} className={`${linkClass} max-w-full`} target="_blank" rel="noopener noreferrer">
                    <span className="truncate">{r.file}</span>
                    <ExternalLink size={13} aria-hidden className="shrink-0" />
                  </a>
                </Row>
              </dl>
            ) : (
              <p className="py-6 text-center text-[14px] text-muted">Belum ada APK yang diterbitkan.</p>
            )}
            {r && v.latest_build !== r.build && (
              <p className="mt-2 rounded-[10px] bg-warning-tint px-3 py-2 text-[13px] text-warning">
                Build terbaru di pengaturan versi ({v.latest_build}) berbeda dengan APK terbaru ({r.build}).
              </p>
            )}
          </Section>

        <Section
          title="Aktivitas terakhir"
          bodyClass=""
          className="lg:col-span-2 xl:col-span-1"
          actions={
            <Link href="/admin/audit" className={linkClass}>
              Semua <ArrowRight size={14} aria-hidden />
            </Link>
          }
        >
          {audit.length === 0 ? (
            <p className="px-5 py-6 text-center text-[14px] text-muted">Belum ada aktivitas.</p>
          ) : (
            <ul className="divide-y divide-line">
              {audit.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-[14px] sm:px-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-tint text-body">
                    <ScrollText size={16} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2">
                    <span className="shrink-0 font-medium text-ink">{labelOf(AUDIT_ACTIONS, e.action)}</span>
                    <span className="min-w-0 truncate text-[12.5px] text-muted">
                      {labelOf(TARGET_TYPES, e.target_type)}{" "}
                      <span className="font-mono text-body">{e.target_id.length > 24 ? `${e.target_id.slice(0, 8)}…` : e.target_id}</span>
                    </span>
                  </p>
                  <span className="text-[12.5px] text-muted">
                    {e.admin?.name ?? "CLI"} · <time dateTime={e.created_at} title={formatDateTime(e.created_at)}>{formatRelative(e.created_at)}</time>
                  </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        </div>
      </div>
    </div>
  );
}

function LicensesCard({ summary }: { summary: Summary }) {
  const p = summary.licenses!;
  const total = PLAN_SERIES.reduce((n, x) => n + p[x.id], 0);
  const max = Math.max(1, ...PLAN_SERIES.map((x) => p[x.id]));
  const href = (id: string) => `/admin/lisensi?plan=${id === "online" ? "online,lifetime_online" : id}`;
  return (
    <Section
      title="Lisensi"
      description={`${total.toLocaleString("id-ID")} bisnis`}
      actions={
        <Link href="/admin/lisensi" className={linkClass}>
          Kelola <ArrowRight size={14} aria-hidden />
        </Link>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Link href="/admin/metrik" className={`rounded-[14px] bg-brand-soft px-3 py-2.5 hover:bg-brand-soft/70 ${focusRing}`}>
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-brand-deep">
            <Wallet size={14} aria-hidden /> Pendapatan bulan ini
          </p>
          <p className="mt-0.5 text-[20px] font-extrabold leading-tight tabular-nums text-ink" title={summary.revenue_this_month !== undefined ? formatRupiah(summary.revenue_this_month) : undefined}>
            {summary.revenue_this_month !== undefined ? formatRupiahShort(summary.revenue_this_month) : "—"}
          </p>
        </Link>
        <Link href="/admin/lisensi?expiring=7d" className={`rounded-[14px] px-3 py-2.5 ${p.expiring_7d > 0 ? "bg-warning-tint" : "bg-tint"} ${focusRing}`}>
          <p className={`flex items-center gap-1.5 text-[12px] font-medium ${p.expiring_7d > 0 ? "text-warning" : "text-body"}`}>
            <CalendarClock size={14} aria-hidden /> Berakhir ≤ 7 hari
          </p>
          <p className={`mt-0.5 text-[20px] font-extrabold leading-tight tabular-nums ${p.expiring_7d > 0 ? "text-warning" : "text-ink"}`}>{p.expiring_7d}</p>
        </Link>
      </div>
      <ul className="flex flex-col gap-2.5" aria-label="Sebaran paket">
        {PLAN_SERIES.map((x) => (
          <li key={x.id}>
            <Link href={href(x.id)} className={`group block rounded-[8px] ${focusRing}`}>
              <span className="flex items-baseline justify-between gap-2 text-[13.5px]">
                <span className="flex items-center gap-2 font-medium text-ink group-hover:text-brand-deep">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-[3px]" style={{ background: PLAN_COLORS[x.id] }} />
                  {x.label}
                </span>
                <span className="tabular-nums text-body">
                  <strong className="font-semibold text-ink">{p[x.id].toLocaleString("id-ID")}</strong>
                  <span className="ml-1.5 text-[12px] text-muted">{total ? Math.round((p[x.id] / total) * 100) : 0}%</span>
                </span>
              </span>
              <span className="mt-1 block h-2 overflow-hidden rounded-full bg-tint">
                <span className="block h-full rounded-full" style={{ width: `${(p[x.id] / max) * 100}%`, background: PLAN_COLORS[x.id] }} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] text-muted">Premium termasuk Lifetime + Premium. Lifetime = tanpa Premium aktif.</p>
    </Section>
  );
}
