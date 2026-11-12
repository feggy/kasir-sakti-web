"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { ApiError } from "@/lib/api";
import { MockBanner, passwordChangeUrl, safeNext } from "./AdminShell";
import { Maskot } from "./maskot";
import { btn, errorMessage, Field, focusRing, formatWait, inputClass, Notice, Spinner } from "./ui";

export function LoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  // Hitung mundur saat terkunci.
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= lockedUntil) setLockedUntil(null);
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [lockedUntil]);

  const lockLeft = lockedUntil && now ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || lockedUntil) return;
    setError(null);
    if (!email.trim() || !password) {
      setError("Isi email dan kata sandi.");
      return;
    }
    setBusy(true);
    try {
      const r = await (await adminApi()).login(email.trim(), password);
      // Password sementara → wajib ganti dulu sebelum masuk panel.
      router.replace(r.admin.must_change_password ? passwordChangeUrl(next) : next);
    } catch (err) {
      setBusy(false);
      setPassword("");
      if (err instanceof ApiError && err.code === "INVALID_CREDENTIALS") {
        setError("Email atau kata sandi salah.");
      } else if (err instanceof ApiError && err.status === 429) {
        const wait = err.retryAfter ?? 900;
        setLockedUntil(Date.now() + wait * 1000);
        setError(null);
      } else if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        setError("Periksa format email dan kata sandi.");
      } else {
        setError(errorMessage(err));
      }
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-tint">
      <MockBanner />
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="grid w-full max-w-[880px] overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_24px_60px_-30px_rgb(23_53_42/0.35)] lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Panel merek: hijau Kasir Sakti + maskot melambai. */}
          <div
            className="relative hidden flex-col justify-between gap-8 overflow-hidden bg-brand-press px-8 pt-8 pb-9 text-white lg:flex">
            {/* Pola titik halus — dekorasi saja. */}
            <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative flex items-center gap-2.5">
              <Image src="/ikon.svg" alt="" aria-hidden width={40} height={40} className="rounded-[12px] ring-2 ring-white/30" />
              <span className="leading-tight">
                <span className="block text-[18px] font-extrabold tracking-[-0.02em]">Kasir Sakti</span>
                <span className="block text-[12.5px] text-white/75">Ruang admin</span>
              </span>
            </div>
            <div className="relative">
              <Maskot pose="melambai" size={170} priority className="-ml-2 drop-shadow-[0_18px_24px_rgb(0_0_0/0.25)]" />
              <p className="mt-4 text-[24px] font-extrabold leading-tight tracking-[-0.02em]">Selamat datang kembali.</p>
              <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-white/80">
                Pantau warung yang memakai Kasir Sakti, catat pembayaran Lifetime &amp; Premium, dan jaga aplikasi tetap sehat.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              <Image src="/ikon.svg" alt="" aria-hidden width={36} height={36} className="rounded-[10px]" priority />
              <span className="leading-tight">
                <span className="block text-[17px] font-extrabold tracking-[-0.02em] text-ink">Kasir Sakti</span>
                <span className="block text-[12px] text-muted">Ruang admin</span>
              </span>
            </div>
            <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">Masuk</h1>
            <p className="mt-1 text-[14px] text-muted">Khusus tim Kasir Sakti. Akun dibuat oleh admin lain.</p>

            <form className="mt-5 flex flex-col gap-4" onSubmit={submit} noValidate>
              {lockLeft !== null && lockLeft > 0 && (
                <Notice tone="warning" role="alert" icon={<Lock size={16} aria-hidden />} title="Terkunci sementara">
                  Terlalu banyak percobaan masuk. Coba lagi dalam{" "}
                  <span className="font-semibold tabular-nums">{formatWait(lockLeft)}</span>.
                </Notice>
              )}
              {error && (
                <Notice tone="danger" role="alert">
                  {error}
                </Notice>
              )}
              <Field id="email" label="Email">
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </Field>
              <Field id="password" label="Kata sandi">
                <div className="relative">
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    className={`${inputClass} pr-11`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    aria-pressed={show}
                    className={`absolute top-1/2 right-1 inline-flex h-8 w-9 -translate-y-1/2 items-center justify-center rounded-[8px] text-muted hover:text-ink ${focusRing}`}
                  >
                    {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
                  </button>
                </div>
              </Field>
              <button type="submit" className={`${btn.primary} mt-1 w-full`} disabled={busy || (lockLeft ?? 0) > 0}>
                {busy && <Spinner />}
                {busy ? "Memeriksa…" : "Masuk"}
              </button>
            </form>
            <p className="mt-5 text-center text-[12px] text-muted">Sesi berakhir setelah 2 jam tanpa aktivitas.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
