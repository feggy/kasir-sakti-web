"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleCheck, Loader2, MailCheck, TriangleAlert } from "lucide-react";
import { confirmDeletion, deletionErrorMessage, HAPUS_AKUN_MOCK, requestDeletion } from "@/lib/hapusAkun";

// Formulir hapus akun dari web (OTP ke email akun). Anti-enumerasi: tampilan setelah "Kirim kode" SAMA untuk akun yang
// ada maupun tidak — jangan tampilkan masked_destination atau apa pun yang hanya ada bila akun ditemukan.

type Langkah = { tahap: "isi" } | { tahap: "kode"; identifier: string } | { tahap: "selesai"; purgeAfter: string };

const MAKS_ALASAN = 300;

const inputCls =
  "mt-1.5 block min-h-12 w-full rounded-2xl border border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-soft)] focus:outline-none aria-[invalid=true]:border-danger";
const tombolUtama =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand";
const tombolTeks =
  "rounded-lg text-[14px] font-bold text-brand-deep underline underline-offset-3 disabled:cursor-not-allowed disabled:text-muted disabled:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function tanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(iso));
}

function useHitungMundur(): [number, (detik: number) => void] {
  const [sisa, setSisa] = useState(0);
  useEffect(() => {
    if (sisa <= 0) return;
    const t = setTimeout(() => setSisa((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sisa]);
  return [sisa, setSisa];
}

export function FormHapusAkun() {
  const [langkah, setLangkah] = useState<Langkah>({ tahap: "isi" });
  const [identifier, setIdentifier] = useState("");
  const [kode, setKode] = useState("");
  const [alasan, setAlasan] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [kirimUlang, setKirimUlang] = useHitungMundur();
  const judulRef = useRef<HTMLHeadingElement>(null);
  const id = useId();

  // Pindah tahap → fokus ke judul tahap agar pembaca layar mengikuti.
  useEffect(() => {
    if (langkah.tahap !== "isi") judulRef.current?.focus();
  }, [langkah.tahap]);

  async function kirimKode(target: string, ulang: boolean) {
    setSibuk(true);
    setGalat(null);
    setInfo(null);
    try {
      const otp = await requestDeletion(target);
      setKirimUlang(otp.resend_in > 0 ? otp.resend_in : 60);
      if (ulang) setInfo("Kode baru dikirim (bila data itu terdaftar). Kode lama tidak berlaku lagi.");
      setKode("");
      setLangkah({ tahap: "kode", identifier: target });
    } catch (err) {
      setGalat(deletionErrorMessage(err));
    } finally {
      setSibuk(false);
    }
  }

  async function konfirmasi(target: string) {
    setSibuk(true);
    setGalat(null);
    setInfo(null);
    try {
      const r = await confirmDeletion(target, kode, alasan.trim() || undefined);
      setLangkah({ tahap: "selesai", purgeAfter: r.purge_after });
    } catch (err) {
      setGalat(deletionErrorMessage(err));
    } finally {
      setSibuk(false);
    }
  }

  const kotak = "not-prose rounded-[24px] bg-tint p-5 ring-1 ring-line sm:p-6";
  const pesanGalat = galat && (
    <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl bg-danger-tint px-4 py-3 text-[14.5px] leading-relaxed text-danger">
      <TriangleAlert className="mt-0.5 size-4 flex-none" aria-hidden /> {galat}
    </p>
  );

  if (langkah.tahap === "selesai") {
    return (
      <div className={kotak} aria-live="polite">
        <h3 ref={judulRef} tabIndex={-1} className="flex items-center gap-2 text-[19px] font-extrabold text-ink outline-none">
          <CircleCheck className="size-6 flex-none text-brand-deep" aria-hidden /> Penghapusan akun dijadwalkan
        </h3>
        <p className="mt-3 text-[15.5px] leading-relaxed text-body">
          Akun beserta seluruh data usahanya akan dihapus permanen pada <b className="text-ink">{tanggal(langkah.purgeAfter)}</b>. Semua
          perangkat yang memakai akun ini sudah dikeluarkan, dan kami mengirim email konfirmasi ke email akun.
        </p>
        <p className="mt-3 text-[15.5px] leading-relaxed text-body">
          <b className="text-ink">Berubah pikiran?</b> Masuk lagi ke aplikasi Kasir Sakti dengan akun pemilik sebelum tanggal itu —
          penghapusan otomatis dibatalkan.
        </p>
      </div>
    );
  }

  if (langkah.tahap === "kode") {
    const target = langkah.identifier;
    const kodeLengkap = /^\d{6}$/.test(kode);
    return (
      <form
        className={kotak}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (kodeLengkap && setuju && !sibuk) void konfirmasi(target);
        }}
      >
        <h3 ref={judulRef} tabIndex={-1} className="flex items-center gap-2 text-[19px] font-extrabold text-ink outline-none">
          <MailCheck className="size-6 flex-none text-brand-deep" aria-hidden /> Masukkan kode dari email
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-body">
          Bila <b className="break-all text-ink">{target}</b> terdaftar sebagai akun pemilik, kami sudah mengirim kode 6 digit ke
          <b className="text-ink"> email akun</b>. Kode berlaku 5 menit. Tidak ada email? Periksa folder spam, atau pastikan email/No. HP
          yang kamu isi benar.
        </p>
        {info && (
          <p role="status" className="mt-3 text-[14px] text-brand-deep">
            {info}
          </p>
        )}

        <label htmlFor={`${id}-kode`} className="mt-5 block text-[14.5px] font-bold text-ink">
          Kode 6 digit
        </label>
        <input
          id={`${id}-kode`}
          className={`${inputCls} max-w-[220px] font-mono text-[22px] tracking-[0.3em]`}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={kode}
          onChange={(e) => setKode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={galat ? true : undefined}
          required
        />

        <label htmlFor={`${id}-alasan`} className="mt-5 block text-[14.5px] font-bold text-ink">
          Alasan menghapus <span className="font-medium text-muted">(opsional)</span>
        </label>
        <textarea
          id={`${id}-alasan`}
          className={`${inputCls} min-h-[88px] py-3`}
          maxLength={MAKS_ALASAN}
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          placeholder="Masukanmu membantu kami memperbaiki Kasir Sakti"
        />
        <p className="mt-1 text-right text-[12.5px] text-muted">
          {alasan.length}/{MAKS_ALASAN}
        </p>

        <label className="mt-3 flex items-start gap-3 rounded-2xl bg-white p-4 text-[14.5px] leading-relaxed text-body ring-1 ring-line">
          <input
            type="checkbox"
            className="mt-1 size-4 flex-none accent-[var(--color-danger)]"
            checked={setuju}
            onChange={(e) => setSetuju(e.target.checked)}
          />
          <span>
            Saya mengerti akun dan <b className="text-ink">seluruh data usaha</b> di server akan dihapus permanen 14 hari setelah ini, dan
            <b className="text-ink"> paket Lifetime serta sisa masa Premium hangus</b> tanpa pengembalian dana.
          </span>
        </label>

        {pesanGalat}

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" className={`${tombolUtama} bg-danger hover:bg-[#912018]`} disabled={!kodeLengkap || !setuju || sibuk}>
            {sibuk && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Hapus akun saya
          </button>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <button type="button" className={tombolTeks} disabled={kirimUlang > 0 || sibuk} onClick={() => void kirimKode(target, true)}>
              {kirimUlang > 0 ? `Kirim ulang kode (${kirimUlang} dtk)` : "Kirim ulang kode"}
            </button>
            <button
              type="button"
              className={tombolTeks}
              disabled={sibuk}
              onClick={() => {
                setGalat(null);
                setInfo(null);
                setLangkah({ tahap: "isi" });
              }}
            >
              Ganti email / No. HP
            </button>
          </div>
        </div>
      </form>
    );
  }

  const isian = identifier.trim();
  return (
    <form
      className={kotak}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (isian && !sibuk) void kirimKode(isian, false);
      }}
    >
      {HAPUS_AKUN_MOCK && (
        <p className="mb-4 rounded-xl bg-gold-soft px-3 py-2 text-[13px] text-gold-deep">
          Mode tiruan: tidak ada yang dikirim ke server. Kode benar <b>123456</b>, <b>000000</b> = kedaluwarsa, isian memuat
          &ldquo;batas&rdquo; = terlalu banyak permintaan.
        </p>
      )}
      <label htmlFor={`${id}-identifier`} className="block text-[14.5px] font-bold text-ink">
        Email atau No. HP akun pemilik
      </label>
      <input
        id={`${id}-identifier`}
        className={inputCls}
        type="text"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={254}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="nama@email.com atau 08xx"
        aria-invalid={galat ? true : undefined}
        required
      />
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Kode konfirmasi selalu dikirim ke email akun, juga bila kamu mengisi No. HP.</p>
      {pesanGalat}
      <button type="submit" className={`${tombolUtama} mt-5 bg-brand-press hover:bg-brand-deep`} disabled={!isian || sibuk}>
        {sibuk && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Kirim kode konfirmasi
      </button>
    </form>
  );
}
