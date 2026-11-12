"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Info, MessageCircle, Plus, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import type { BankAccount, BillingConfig, BillingConfigInput, LicenseProduct } from "@/lib/admin/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./toast";
import {
  btn,
  cardClass,
  ErrorBlock,
  errorMessage,
  Field,
  fieldErrors,
  focusRing,
  formatDateTime,
  formatRupiah,
  iconBtn,
  inputClass,
  Notice,
  PageHeader,
  Section,
  Skeleton,
  useLoad,
} from "./ui";

// Harga & cara bayar lisensi (Lifetime + Premium 1/6/12 bulan): harga, rekening, WhatsApp, instruksi — dengan
// pratinjau halaman Paket di aplikasi. PUT mengganti utuh. Harga di sini = yang dilihat pemilik di app, nominal
// bawaan saat mencatat pembayaran & dasar MRR — BUKAN halaman Harga situs (src/app/page.tsx), ubah keduanya bersamaan.

const MAX_ACCOUNTS = 5;
const PRICE_KEYS: LicenseProduct[] = ["lifetime", "online_1m", "online_6m", "online_12m"];
const PRICE_LABELS: Record<LicenseProduct, string> = {
  lifetime: "Lifetime",
  online_1m: "Premium 1 bulan",
  online_6m: "Premium 6 bulan",
  online_12m: "Premium 12 bulan",
};
const digits = (v: string) => v.replace(/\D/g, "");

const backLink = (
  <Link href="/admin/lisensi" className={`mb-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink ${focusRing}`}>
    <ArrowLeft size={15} aria-hidden /> Lisensi
  </Link>
);

function toInput(c: BillingConfig): BillingConfigInput {
  return {
    prices: { ...c.prices },
    bank_accounts: c.bank_accounts.map((a) => ({ ...a })),
    whatsapp: c.whatsapp,
    instructions: c.instructions,
  };
}

const same = (a: BillingConfigInput, b: BillingConfigInput) => JSON.stringify(a) === JSON.stringify(b);

export function BillingConfigView() {
  const { state, reload, setData } = useLoad<BillingConfig>(async (signal) => (await adminApi()).billingConfig(signal), []);
  return (
    <>
      <PageHeader
        title="Harga & cara bayar"
        back={backLink}
        description="Yang dilihat pemilik di halaman Paket aplikasi saat membeli Lifetime atau Premium."
      />
      {state.status === "error" && !state.data && <ErrorBlock error={state.error} onRetry={reload} />}
      {state.status === "loading" && !state.data && <ConfigSkeleton />}
      {state.data && <ConfigForm key={state.data.updated_at ?? "x"} config={state.data} onSaved={setData} />}
    </>
  );
}

function ConfigSkeleton() {
  return (
    <div role="status" aria-label="Memuat pengaturan" className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className={`${cardClass} p-5`}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-2 h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[520px] w-full rounded-[28px]" />
    </div>
  );
}

function ConfigForm({ config, onSaved }: { config: BillingConfig; onSaved: (c: BillingConfig) => void }) {
  const toast = useToast();
  const initial = toInput(config);
  const [form, setForm] = useState<BillingConfigInput>(initial);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const dirty = !same(form, initial);

  const set = (patch: Partial<BillingConfigInput>) => {
    setErrors({});
    setError(null);
    setForm((f) => ({ ...f, ...patch }));
  };
  const setAccount = (i: number, patch: Partial<BankAccount>) =>
    set({ bank_accounts: form.bank_accounts.map((a, k) => (k === i ? { ...a, ...patch } : a)) });

  const validate = () => {
    const e: Record<string, string> = {};
    form.bank_accounts.forEach((a, i) => {
      if (!a.bank.trim()) e[`bank_accounts[${i}].bank`] = "Isi nama bank.";
      if (!/^[\d\s-]{5,30}$/.test(a.number.trim())) e[`bank_accounts[${i}].number`] = "5–30 digit (boleh spasi atau -).";
      if (!a.holder.trim()) e[`bank_accounts[${i}].holder`] = "Isi nama pemilik rekening.";
    });
    if (form.whatsapp && !/^\+[1-9]\d{7,14}$/.test(form.whatsapp)) e.whatsapp = "Format internasional, mis. +6281234567890.";
    const p = form.prices;
    for (const k of PRICE_KEYS) if (p[k] > 100_000_000) e[`prices.${k}`] = "Maksimal Rp100.000.000.";
    if (p.online_6m > p.online_1m * 6) e["prices.online_6m"] = "Lebih mahal dari 6× harga 1 bulan — periksa lagi.";
    if (p.online_12m > p.online_1m * 12) e["prices.online_12m"] = "Lebih mahal dari 12× harga 1 bulan — periksa lagi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function save() {
    setBusy(true);
    setError(null);
    const body: BillingConfigInput = {
      ...form,
      bank_accounts: form.bank_accounts.map((a) => ({ bank: a.bank.trim(), number: a.number.trim(), holder: a.holder.trim() })),
      instructions: form.instructions.replace(/\s+$/, ""),
    };
    try {
      const saved = await (await adminApi()).saveBillingConfig(body);
      toast.success("Harga & cara bayar disimpan. Aplikasi menampilkannya saat memeriksa lisensi berikutnya (halaman Paket › Perbarui).");
      setConfirm(false);
      onSaved(saved);
    } catch (err) {
      setConfirm(false);
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const changes: string[] = [];
  for (const k of PRICE_KEYS) {
    if (form.prices[k] !== initial.prices[k]) changes.push(`Harga ${PRICE_LABELS[k]} ${formatRupiah(initial.prices[k])} → ${formatRupiah(form.prices[k])}`);
  }
  if (JSON.stringify(form.bank_accounts) !== JSON.stringify(initial.bank_accounts)) changes.push(`Rekening (${form.bank_accounts.length})`);
  if (form.whatsapp !== initial.whatsapp) changes.push(`WhatsApp ${form.whatsapp || "dikosongkan"}`);
  if (form.instructions !== initial.instructions) changes.push("Teks instruksi");
  const priceChanged = PRICE_KEYS.some((k) => form.prices[k] !== initial.prices[k]);
  const setPrice = (k: LicenseProduct, v: number) => set({ prices: { ...form.prices, [k]: v } });

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-5">
        {error && (
          <Notice tone="danger" role="alert">
            {error}
          </Notice>
        )}

        <Section title="Harga" description="Nominal bawaan saat mencatat pembayaran & dasar MRR (Lifetime tidak masuk MRR).">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PRICE_KEYS.map((k) => {
              const months = k === "online_6m" ? 6 : k === "online_12m" ? 12 : 0;
              return (
                <Field
                  key={k}
                  id={`bc-${k}`}
                  label={PRICE_LABELS[k]}
                  error={errors[`prices.${k}`]}
                  hint={
                    k === "lifetime"
                      ? "Sekali bayar"
                      : months > 0 && form.prices[k] > 0
                        ? `Setara ${formatRupiah(Math.round(form.prices[k] / months))}/bulan`
                        : "Per bulan"
                  }
                >
                  <Money id={`bc-${k}`} value={form.prices[k]} onChange={(v) => setPrice(k, v)} invalid={!!errors[`prices.${k}`]} />
                </Field>
              );
            })}
          </div>
          {priceChanged && (
            <div className="mt-3">
              <Notice tone="warning" icon={<Info size={16} aria-hidden />}>
                Halaman Harga di situs <strong>tidak ikut berubah</strong> — itu janji ke pelanggan. Ubah keduanya bersamaan.
              </Notice>
            </div>
          )}
        </Section>

        <Section
          title="Rekening tujuan"
          description={`Maksimal ${MAX_ACCOUNTS}. Urutan di sini = urutan di aplikasi.`}
          bodyClass="p-0"
        >
          {form.bank_accounts.length === 0 && <p className="px-5 py-4 text-[14px] text-muted">Belum ada rekening. Pemilik hanya melihat instruksi & WhatsApp.</p>}
          <ul className="divide-y divide-line">
            {form.bank_accounts.map((a, i) => (
              <li key={i} className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1.3fr)_auto] sm:items-start sm:px-5">
                <Field id={`bc-bank-${i}`} label="Bank" error={errors[`bank_accounts[${i}].bank`]}>
                  <input
                    id={`bc-bank-${i}`}
                    className={inputClass}
                    value={a.bank}
                    maxLength={40}
                    placeholder="BCA"
                    onChange={(e) => setAccount(i, { bank: e.target.value })}
                    aria-invalid={!!errors[`bank_accounts[${i}].bank`] || undefined}
                  />
                </Field>
                <Field id={`bc-num-${i}`} label="Nomor rekening" error={errors[`bank_accounts[${i}].number`]}>
                  <input
                    id={`bc-num-${i}`}
                    className={`${inputClass} tabular-nums`}
                    inputMode="numeric"
                    value={a.number}
                    maxLength={30}
                    placeholder="1234 567 890"
                    onChange={(e) => setAccount(i, { number: e.target.value.replace(/[^\d\s-]/g, "") })}
                    aria-invalid={!!errors[`bank_accounts[${i}].number`] || undefined}
                  />
                </Field>
                <Field id={`bc-holder-${i}`} label="Atas nama" error={errors[`bank_accounts[${i}].holder`]}>
                  <input
                    id={`bc-holder-${i}`}
                    className={inputClass}
                    value={a.holder}
                    maxLength={80}
                    placeholder="Yoho Studio …"
                    onChange={(e) => setAccount(i, { holder: e.target.value })}
                    aria-invalid={!!errors[`bank_accounts[${i}].holder`] || undefined}
                  />
                </Field>
                <button
                  type="button"
                  className={`${iconBtn} justify-self-end text-danger hover:bg-danger-tint hover:text-danger sm:mt-[26px]`}
                  aria-label={`Hapus rekening ${a.bank || i + 1}`}
                  title="Hapus rekening"
                  onClick={() => set({ bank_accounts: form.bank_accounts.filter((_, k) => k !== i) })}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-4 py-3 sm:px-5">
            <button
              type="button"
              className={`${btn.secondary} min-h-9`}
              disabled={form.bank_accounts.length >= MAX_ACCOUNTS}
              onClick={() => set({ bank_accounts: [...form.bank_accounts, { bank: "", number: "", holder: "" }] })}
            >
              <Plus size={16} aria-hidden /> Tambah rekening
            </button>
          </div>
        </Section>

        <Section title="Kontak & instruksi">
          <div className="flex flex-col gap-4">
            <Field id="bc-wa" label="WhatsApp untuk kirim bukti" error={errors.whatsapp} hint="Format internasional. Kosongkan untuk menyembunyikan tombol WhatsApp.">
              <input
                id="bc-wa"
                className={`${inputClass} tabular-nums`}
                inputMode="tel"
                placeholder="+6281234567890"
                value={form.whatsapp}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  set({ whatsapp: v === "" ? "" : `+${digits(v.startsWith("0") ? `62${v.slice(1)}` : v)}`.slice(0, 16) });
                }}
                aria-invalid={!!errors.whatsapp || undefined}
              />
            </Field>
            <Field id="bc-ins" label="Instruksi pembayaran" error={errors.instructions} hint={`${form.instructions.length}/2000 · teks polos, baris baru boleh`}>
              <textarea
                id="bc-ins"
                rows={6}
                maxLength={2000}
                className={`${inputClass} py-2 leading-relaxed`}
                value={form.instructions}
                onChange={(e) => set({ instructions: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t border-line bg-tint/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-[14px] sm:border sm:bg-white sm:px-4">
          <p className="text-[12.5px] text-muted">
            {config.updated_at ? `Terakhir diubah ${formatDateTime(config.updated_at)}${config.updated_by ? ` oleh ${config.updated_by.name}` : ""}` : "Belum pernah diubah"}
          </p>
          <div className="flex gap-2">
            <button type="button" className={`${btn.secondary} flex-1 sm:flex-none`} disabled={!dirty || busy} onClick={() => setForm(initial)}>
              Batalkan perubahan
            </button>
            <button type="button" className={`${btn.primary} flex-1 sm:flex-none`} disabled={!dirty || busy} onClick={() => validate() && setConfirm(true)}>
              Simpan
            </button>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-6" aria-label="Pratinjau di aplikasi">
        <p className="mb-2 text-[12px] font-semibold text-muted">Pratinjau di aplikasi (pemilik)</p>
        <AppPreview form={form} />
      </aside>

      <ConfirmDialog open={confirm} title="Simpan harga & cara bayar?" confirmLabel="Simpan" busy={busy} onConfirm={save} onClose={() => setConfirm(false)}>
        <ul className="list-disc space-y-0.5 pl-5">
          {changes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="mt-2 text-[13px] text-muted">Semua pemilik melihat perubahan ini. Dicatat di audit.</p>
      </ConfirmDialog>
    </div>
  );
}

function Money({ id, value, onChange, invalid }: { id: string; value: number; onChange: (v: number) => void; invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] font-semibold text-muted">Rp</span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className={`${inputClass} pl-9 font-semibold tabular-nums`}
        value={value.toLocaleString("id-ID")}
        onChange={(e) => onChange(Number(digits(e.target.value).slice(0, 9) || 0))}
        aria-invalid={invalid || undefined}
      />
    </div>
  );
}

/** Tiruan halaman Paket di aplikasi — memberi gambaran nyata apa yang dibaca pemilik. */
function AppPreview({ form }: { form: BillingConfigInput }) {
  const p = form.prices;
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[28px] border-[6px] border-ink bg-ink shadow-[0_18px_40px_-16px_rgba(16,24,40,0.35)]">
      <div aria-hidden className="mx-auto my-1.5 h-1.5 w-16 rounded-full bg-white/25" />
      <div className="max-h-[620px] overflow-y-auto rounded-[22px] bg-tint px-4 pt-4 pb-5 text-ink [scrollbar-width:thin]">
        <p className="text-[12px] font-semibold text-muted">Pengaturan › Paket</p>
        <p className="mt-1 text-[18px] font-bold leading-tight">Pilih paket</p>

        <div className="relative mt-3 rounded-[14px] border-2 border-brand bg-white p-3">
          <span className="absolute -top-2.5 right-3 rounded-full bg-brand-press px-2 py-0.5 text-[10.5px] font-semibold text-white">Rekomendasi</span>
          <p className="text-[12px] font-semibold text-muted">Lifetime</p>
          <p className="text-[18px] font-bold tabular-nums">{formatRupiah(p.lifetime)}</p>
          <p className="text-[11.5px] text-body">Sekali bayar · 1 HP, bisa gantian karyawan pakai PIN</p>
        </div>
        <div className="mt-2 rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] p-3">
          <p className="text-[12px] font-semibold text-muted">Premium</p>
          <div className="mt-1 grid grid-cols-3 gap-1.5">
            {(["online_1m", "online_6m", "online_12m"] as const).map((k) => {
              const months = k === "online_1m" ? 1 : k === "online_6m" ? 6 : 12;
              const save = p.online_1m * months - p[k];
              return (
                <div key={k} className={`rounded-[10px] p-1.5 ${k === "online_12m" ? "bg-brand-soft" : "bg-tint"}`}>
                  <p className="text-[11px] text-muted">{months} bulan</p>
                  <p className="text-[13px] font-bold tabular-nums">{formatRupiah(p[k])}</p>
                  {months > 1 && save > 0 && p[k] > 0 && <p className="text-[10.5px] font-semibold text-success">hemat {formatRupiah(save)}</p>}
                </div>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11.5px] text-body">Banyak HP, karyawan pakai HP sendiri, cadangan otomatis</p>
        </div>

        {form.bank_accounts.length > 0 && (
          <>
            <p className="mt-4 mb-1.5 text-[12px] font-semibold text-muted">Transfer ke</p>
            <ul className="flex flex-col gap-2">
              {form.bank_accounts.map((a, i) => (
                <li key={i} className="flex items-center gap-2 rounded-[18px] border border-line bg-white shadow-[0_1px_2px_rgb(23_53_42/0.04)] px-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-muted">{a.bank || "Bank"}</span>
                    <span className="block truncate text-[15px] font-bold tabular-nums tracking-wide">{a.number || "—"}</span>
                    <span className="block truncate text-[12px] text-body">a.n. {a.holder || "—"}</span>
                  </span>
                  <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
                    <Copy size={14} />
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {form.instructions.trim() && (
          <>
            <p className="mt-4 mb-1.5 text-[12px] font-semibold text-muted">Cara bayar</p>
            <p className="whitespace-pre-line break-words rounded-[14px] bg-white px-3 py-2.5 text-[13px] leading-relaxed text-body">{form.instructions.trim()}</p>
          </>
        )}

        {form.whatsapp && (
          <span className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-press text-[14px] font-semibold text-white">
            <MessageCircle size={17} aria-hidden /> Kirim bukti via WhatsApp
          </span>
        )}
        {!form.whatsapp && form.bank_accounts.length === 0 && !form.instructions.trim() && (
          <p className="mt-4 rounded-[14px] bg-white px-3 py-3 text-center text-[13px] text-muted">Belum ada informasi cara bayar.</p>
        )}
      </div>
    </div>
  );
}
