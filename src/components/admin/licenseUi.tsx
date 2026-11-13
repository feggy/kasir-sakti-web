"use client";

import React from "react";
import type { AdminLicense, PlanId } from "@/lib/admin/types";
import { labelOf, PLAN_LABELS } from "./labels";
import { Badge, formatDate } from "./ui";

// Potongan UI lisensi yang dipakai daftar, detail bisnis, metrik, dan ringkasan.

/** Warna plan (urutan tetap; dapat dibedakan pembaca buta warna): Premium, Lifetime, Uji coba, Tenggang, Baca-saja. */
export const PLAN_COLORS = {
  online: "#257552",
  lifetime: "#c08a1e",
  trial: "#3f7fbf",
  grace: "#a1344e",
  readonly: "#97a29e",
} as const;

/** Urutan plan di grafik & ringkasan (5 kelompok hitungan; `lifetime_online` ikut `online`). */
export const PLAN_SERIES: { id: keyof typeof PLAN_COLORS; label: string }[] = [
  { id: "online", label: "Premium" },
  { id: "lifetime", label: "Lifetime" },
  { id: "trial", label: "Uji coba" },
  { id: "grace", label: "Tenggang" },
  { id: "readonly", label: "Baca-saja" },
];

const PLAN_TONE: Record<PlanId, "success" | "brand" | "danger" | "neutral" | "warning"> = {
  online: "success",
  lifetime_online: "success",
  trial: "brand",
  grace: "danger",
  lifetime: "warning",
  readonly: "neutral",
};

export function PlanBadge({ plan }: { plan: PlanId }) {
  return <Badge tone={PLAN_TONE[plan] ?? "neutral"}>{labelOf(PLAN_LABELS, plan)}</Badge>;
}

/**
 * Sisa hari berwarna: ≤ 3 merah, ≤ 7 kuning, selebihnya netral; masa tenggang selalu merah.
 * Lifetime tanpa Premium & baca-saja tidak punya batas waktu → "—" (Lifetime: "selamanya").
 */
export function DaysLeft({
  s,
  compact = false,
}: {
  s: Pick<AdminLicense, "plan" | "days_left" | "ends_at">;
  compact?: boolean;
}) {
  if (s.plan === "lifetime") return <span className="text-[13px] text-muted">selamanya</span>;
  if (s.plan === "readonly" || s.days_left === null || !s.ends_at) {
    return <span className="text-[13px] text-muted">—</span>;
  }
  const d = s.days_left;
  const tone =
    s.plan === "grace" || d <= 3 ? "bg-danger-tint text-danger" : d <= 7 ? "bg-warning-tint text-warning" : "bg-tint text-body";
  const text = d === 0 ? "hari ini" : `${d} hari`;
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span className={`inline-flex items-baseline gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[12.5px] font-semibold tabular-nums ${tone}`}>
        {s.plan === "grace" ? `tenggang · ${text}` : d === 0 ? "berakhir hari ini" : `${text} lagi`}
      </span>
      {!compact && <span className="text-[12px] text-muted">{formatDate(s.ends_at)}</span>}
    </span>
  );
}

/** Pemakaian bulan ini (informasi; tidak ada batas transaksi sejak lisensi 2026-11-08). */
export function UsageMeter({ s, wide = false }: { s: AdminLicense; wide?: boolean }) {
  return (
    <span className="text-[13px] text-body">
      <strong className="font-semibold tabular-nums text-ink">{s.usage.tx_this_month.toLocaleString("id-ID")}</strong> transaksi
      {wide && (
        <span className="text-muted">
          {" "}
          · {s.usage.outlets.toLocaleString("id-ID")} dari {s.outlets.toLocaleString("id-ID")} outlet
        </span>
      )}
    </span>
  );
}
