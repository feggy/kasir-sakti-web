"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BellRing, CheckCheck, CircleCheck, Info } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import type { PaymentAlert, PaymentAlertStatus } from "@/lib/admin/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { useQueryState } from "./filters";
import { PAYMENT_ALERT_KINDS } from "./labels";
import { licenseHref } from "./LicenseListView";
import { useToast } from "./toast";
import {
  Badge,
  btn,
  cardClass,
  EmptyState,
  errorMessage,
  ErrorBlock,
  focusRing,
  formatDateTime,
  formatRupiah,
  LoadingBar,
  Notice,
  PageHeader,
  SkeletonList,
  Tabs,
  TimeAgo,
  useLoad,
} from "./ui";

// Peringatan pembayaran paket (GET /admin/license-payment-alerts?status=open|all, terbaru dulu, maks 100).
// Peringatan muncul saat pembayaran otomatis (QRIS) tidak bisa diproses sendiri oleh server — admin menindak lalu
// menandai selesai (POST …/{id}/resolve, idempoten). Menandai selesai TIDAK mengubah lisensi apa pun.

const PROVIDER_NAMES: Record<string, string> = { borderpay: "BorderPay", qrisgate: "QRISGate", manual: "Manual" };

function kindOf(kind: string) {
  return PAYMENT_ALERT_KINDS[kind] ?? { label: kind, hint: "Jenis peringatan baru — periksa detail dan log server." };
}

function kindTone(kind: string): "danger" | "warning" {
  return kind === "amount_mismatch" || kind === "lifetime_exists" || kind === "gateway_credit" ? "danger" : "warning";
}

export function PaymentAlertsView() {
  const qs = useQueryState();
  const status: PaymentAlertStatus = qs.get("status") === "all" ? "all" : "open";
  const toast = useToast();
  const [ask, setAsk] = useState<PaymentAlert | null>(null);
  const [busy, setBusy] = useState(false);

  const { state, reload, setData } = useLoad<PaymentAlert[]>(
    async (signal) => (await adminApi()).paymentAlerts(status, signal),
    [status]
  );

  async function resolve(a: PaymentAlert) {
    setBusy(true);
    try {
      await (await adminApi()).resolvePaymentAlert(a.id);
      const now = new Date().toISOString();
      if (state.data) {
        setData(
          status === "open" ? state.data.filter((x) => x.id !== a.id) : state.data.map((x) => (x.id === a.id ? { ...x, resolved_at: x.resolved_at ?? now } : x))
        );
      }
      toast.success("Peringatan ditandai selesai.");
      setAsk(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Peringatan pembayaran"
        description="Pembayaran paket lewat QRIS otomatis yang tidak bisa diproses sendiri oleh server. Tindak satu per satu, lalu tandai selesai."
        actions={
          <Link href="/admin/lisensi" className={btn.secondary}>
            Buka Lisensi
          </Link>
        }
      />

      <div className="mb-4">
        <Notice tone="info" icon={<Info size={16} aria-hidden />}>
          Menandai selesai hanya menutup peringatan — <strong>tidak</strong> mengaktifkan paket atau mengembalikan dana. Catat pembayaran
          manual di tab <strong>Lisensi</strong> bisnis bila perlu.
        </Notice>
      </div>

      <Tabs<PaymentAlertStatus>
        label="Status"
        active={status}
        onChange={(s) => qs.update({ status: s === "open" ? null : s })}
        tabs={[
          { id: "open", label: "Terbuka", count: status === "open" ? state.data?.length : undefined },
          { id: "all", label: "Semua" },
        ]}
      />

      {state.status === "error" && <ErrorBlock error={state.error} onRetry={reload} />}
      {state.status === "loading" && !state.data && <SkeletonList rows={4} label="Memuat peringatan" />}
      {state.data && (
        <>
          <LoadingBar active={state.status === "loading"} />
          {state.data.length === 0 ? (
            <div className={cardClass}>
              <EmptyState
                icon={<CircleCheck size={22} aria-hidden />}
                mascot="dasar"
                title={status === "open" ? "Tidak ada peringatan terbuka" : "Belum ada peringatan"}
                action={
                  status === "open" ? (
                    <button type="button" className={btn.secondary} onClick={() => qs.update({ status: "all" })}>
                      Lihat riwayat
                    </button>
                  ) : undefined
                }
              >
                Semua pembayaran otomatis terproses dengan baik.
              </EmptyState>
            </div>
          ) : (
            <ul className={`flex flex-col gap-3 transition-opacity ${state.status === "loading" ? "opacity-60" : ""}`} aria-busy={state.status === "loading"}>
              {state.data.map((a) => (
                <AlertCard key={a.id} a={a} onResolve={() => setAsk(a)} />
              ))}
            </ul>
          )}
          {state.data.length >= 100 && <p className="mt-3 text-[13px] text-muted">Menampilkan 100 peringatan terbaru.</p>}
        </>
      )}

      <ConfirmDialog
        open={ask !== null}
        title="Tandai peringatan selesai?"
        confirmLabel="Tandai selesai"
        busy={busy}
        onClose={() => setAsk(null)}
        onConfirm={() => ask && void resolve(ask)}
      >
        {ask && (
          <p>
            <strong className="text-ink">{kindOf(ask.kind).label}</strong>
            {ask.business_name ? ` · ${ask.business_name}` : ""}
            {ask.amount !== null ? ` · ${formatRupiah(ask.amount)}` : ""}. Pastikan sudah ditindak (dicatat manual, dana
            dikembalikan, atau memang tidak perlu tindakan). Paket bisnis tidak berubah.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}

function AlertCard({ a, onResolve }: { a: PaymentAlert; onResolve: () => void }) {
  const k = kindOf(a.kind);
  const tone = kindTone(a.kind);
  const resolved = a.resolved_at !== null;
  return (
    <li className={`${cardClass} flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5 ${resolved ? "opacity-75" : ""}`}>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
          resolved ? "bg-success-tint text-success" : tone === "danger" ? "bg-danger-tint text-danger" : "bg-warning-tint text-warning"
        }`}
      >
        {resolved ? <CheckCheck size={18} aria-hidden /> : <BellRing size={18} aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-extrabold text-ink">{k.label}</span>
          <Badge tone="neutral">{PROVIDER_NAMES[a.provider] ?? a.provider}</Badge>
          {resolved ? <Badge tone="success">Selesai {formatDateTime(a.resolved_at)}</Badge> : <Badge tone={tone}>Terbuka</Badge>}
        </p>
        <p className="mt-0.5 text-[13px] text-muted">
          <TimeAgo value={a.created_at} />
          {a.amount !== null && (
            <>
              {" · "}
              <span className="font-semibold tabular-nums text-ink">{formatRupiah(a.amount)}</span>
            </>
          )}
          {" · "}
          {a.business_id ? (
            <Link href={licenseHref(a.business_id)} className={`font-semibold text-brand-deep hover:underline ${focusRing}`}>
              {a.business_name || "Buka bisnis"}
            </Link>
          ) : (
            <span>Bisnis tidak diketahui</span>
          )}
        </p>
        {a.detail && <p className="mt-2 text-[14px] text-body">{a.detail}</p>}
        <p className="mt-2 rounded-[10px] bg-tint px-3 py-2 text-[13px] leading-relaxed text-body">
          <strong className="font-semibold text-ink">Tindakan: </strong>
          {k.hint}
        </p>
        {(a.reference || a.checkout_id) && (
          <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted">
            {a.reference && (
              <div className="flex gap-1.5">
                <dt>Referensi</dt>
                <dd className="font-mono text-body">{a.reference}</dd>
              </div>
            )}
            {a.checkout_id && (
              <div className="flex gap-1.5">
                <dt>Checkout</dt>
                <dd className="font-mono text-body">{a.checkout_id}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
      {!resolved && (
        <button type="button" className={`${btn.secondary} shrink-0 self-start`} onClick={onResolve}>
          <CheckCheck size={16} aria-hidden /> Tandai selesai
        </button>
      )}
    </li>
  );
}
