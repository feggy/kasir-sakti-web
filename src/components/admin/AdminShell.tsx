"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bug,
  ChartLine,
  TrendingUp,
  CreditCard,
  Wallet,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  ShieldAlert,
  Smartphone,
  Store,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { ADMIN_MOCK, adminApi, setPasswordChangeHandler, setUnauthorizedHandler } from "@/lib/admin/api";
import type { MeResult } from "@/lib/admin/types";
import { ApiError } from "@/lib/api";
import { ConfirmDialog } from "./ConfirmDialog";
import { ErrorBlock, focusRing, iconBtn, Spinner } from "./ui";

// Kerangka panel admin: memeriksa sesi (GET /admin/auth/me) sebelum menampilkan halaman,
// mengarahkan ke /admin/login?next=… saat 401, navigasi samping (desktop) / tab atas (HP), dan tombol keluar.

const NAV_GROUPS = [
  {
    label: "",
    items: [
      { href: "/admin", label: "Ringkasan", short: "Ringkasan", icon: LayoutDashboard },
      { href: "/admin/metrik", label: "Metrik", short: "Metrik", icon: ChartLine },
    ],
  },
  {
    label: "Merchant",
    items: [
      { href: "/admin/bisnis", label: "Bisnis", short: "Bisnis", icon: Store },
      { href: "/admin/pertumbuhan", label: "Pertumbuhan", short: "Tumbuh", icon: TrendingUp },
      { href: "/admin/hapus-akun", label: "Hapus akun", short: "Hapus akun", icon: UserRoundX },
    ],
  },
  {
    label: "Pendapatan",
    items: [
      { href: "/admin/lisensi", label: "Lisensi", short: "Lisensi", icon: CreditCard },
      { href: "/admin/lisensi/pengaturan", label: "Harga & cara bayar", short: "Harga", icon: Wallet },
    ],
  },
  {
    label: "Aplikasi",
    items: [
      { href: "/admin/versi", label: "Versi aplikasi", short: "Versi", icon: Smartphone },
      { href: "/admin/apk", label: "APK", short: "APK", icon: Package },
      { href: "/admin/crash", label: "Crash", short: "Crash", icon: Bug },
    ],
  },
  {
    label: "Tim & keamanan",
    items: [
      { href: "/admin/tim", label: "Tim admin", short: "Tim", icon: UsersRound },
      { href: "/admin/audit", label: "Audit", short: "Audit", icon: ScrollText },
      { href: "/admin/keamanan", label: "Keamanan", short: "Keamanan", icon: ShieldAlert },
    ],
  },
];
const NAV = NAV_GROUPS.flatMap((g) => g.items);

export function passwordChangeUrl(next?: string): string {
  const n = safeNext(next);
  return n === "/admin" ? "/admin/ganti-password" : `/admin/ganti-password?next=${encodeURIComponent(n)}`;
}

/** `next` hanya boleh path relatif di bawah /admin (mencegah open redirect). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("\\")) return "/admin";
  if (next === "/admin/login" || next.startsWith("/admin/login?") || next.startsWith("/admin/login/")) return "/admin";
  return next;
}

export function loginUrl(next?: string): string {
  const n = safeNext(next);
  return n === "/admin" ? "/admin/login" : `/admin/login?next=${encodeURIComponent(n)}`;
}

const SessionContext = createContext<MeResult | null>(null);

export function useAdminSession(): MeResult {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useAdminSession di luar AdminShell");
  return s;
}

function currentPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function MockBanner() {
  if (!ADMIN_MOCK) return null;
  return (
    <div className="bg-warning-tint px-4 py-1.5 text-center text-[12px] font-semibold text-warning">
      Mode tiruan (NEXT_PUBLIC_ADMIN_MOCK=1) — data contoh, tidak terhubung ke server.
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<MeResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [askLogout, setAskLogout] = useState(false);

  const toLogin = useCallback(() => {
    router.replace(loginUrl(currentPath()));
  }, [router]);

  const toPasswordChange = useCallback(() => {
    router.replace(passwordChangeUrl(currentPath()));
  }, [router]);

  useEffect(() => {
    setUnauthorizedHandler(toLogin);
    setPasswordChangeHandler(toPasswordChange);
    return () => {
      setUnauthorizedHandler(null);
      setPasswordChangeHandler(null);
    };
  }, [toLogin, toPasswordChange]);

  useEffect(() => {
    const ctrl = new AbortController();
    adminApi()
      .then((api) => api.me(ctrl.signal))
      .then((me) => {
        // Login dengan password sementara → wajib ganti dulu (server menolak rute lain dengan 403).
        if (me.admin.must_change_password) {
          toPasswordChange();
          return;
        }
        setSession(me);
        setError(null);
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) toLogin();
        else if (err instanceof ApiError && err.code === "PASSWORD_CHANGE_REQUIRED") toPasswordChange();
        else setError(err);
      });
    return () => ctrl.abort();
  }, [attempt, toLogin, toPasswordChange]);

  async function logout() {
    setLoggingOut(true);
    try {
      await (await adminApi()).logout();
    } catch {
      // Tetap keluar dari tampilan; sesi server habis sendiri.
    }
    router.replace("/admin/login");
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col bg-tint">
        <MockBanner />
        <div className="flex flex-1 items-center justify-center p-4">
          {error ? (
            <div className="w-full max-w-[420px]">
              <ErrorBlock
                error={error}
                onRetry={() => {
                  setError(null);
                  setAttempt((a) => a + 1);
                }}
              />
            </div>
          ) : (
            <p role="status" className="flex flex-col items-center gap-3 text-[14px] text-muted">
              <BrandTile size={48} />
              <span className="flex items-center gap-2">
                <Spinner /> Memeriksa sesi…
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Menu aktif = awalan terpanjang yang cocok (mis. /admin/lisensi/pengaturan tidak ikut menyalakan Lisensi).
  const match = NAV.map((n) => n.href)
    .filter((h) => (h === "/admin" ? pathname === "/admin" : pathname === h || pathname.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];
  const isActive = (href: string) => href === match;
  const { admin } = session;

  return (
    <SessionContext.Provider value={session}>
      <div className="flex min-h-dvh flex-col bg-white text-ink">
        <div className="flex flex-1">
          {/* Navigasi samping — desktop (pola sidebar aplikasi Kasir Sakti) */}
          <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-white lg:flex">
            <Link href="/admin" className={`mx-3 mt-4 mb-3 flex items-center gap-2.5 rounded-[12px] px-2 py-1.5 ${focusRing}`}>
              <BrandTile size={38} />
              <span className="min-w-0 leading-tight">
                <span className="block text-[17px] font-extrabold tracking-[-0.02em] text-ink">Kasir Sakti</span>
                <span className="block text-[12px] font-medium text-muted">Ruang admin</span>
              </span>
            </Link>
            <nav aria-label="Menu admin" className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
              {NAV_GROUPS.map((g) => (
                <div key={g.label || "utama"}>
                  {g.label && <p className="px-3 pt-1 pb-1.5 text-[12px] font-medium text-muted">{g.label}</p>}
                  <div className="flex flex-col gap-0.5">
                    {g.items.map(({ href, label, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-10 items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium transition-colors ${
                            active
                              ? "bg-brand-press font-semibold text-white shadow-[0_4px_12px_-6px_rgb(37_117_82/0.7)]"
                              : "text-body hover:bg-tint hover:text-ink"
                          } ${focusRing}`}
                        >
                          <Icon size={18} aria-hidden strokeWidth={active ? 2.25 : 1.9} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="p-3">
              <div
                className={`flex items-center gap-1 rounded-[14px] border p-1.5 ${pathname === "/admin/akun" ? "border-brand/40 bg-brand-soft" : "border-line bg-white"}`}
              >
                <Link
                  href="/admin/akun"
                  aria-current={pathname === "/admin/akun" ? "page" : undefined}
                  title="Akun saya"
                  className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] px-1.5 py-1 hover:bg-tint ${focusRing}`}
                >
                  <Avatar name={admin.name} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{admin.name}</span>
                    <span className="block truncate text-[12px] text-muted">Admin · akun saya</span>
                  </span>
                </Link>
                <button type="button" className={iconBtn} onClick={() => setAskLogout(true)} disabled={loggingOut} aria-label="Keluar" title="Keluar">
                  {loggingOut ? <Spinner /> : <LogOut size={17} aria-hidden />}
                </button>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <MockBanner />
            {/* Kepala + menu chip — HP & tablet */}
            <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur lg:hidden">
              <div className="flex h-14 items-center gap-2.5 px-4">
                <Link href="/admin" className={`flex min-w-0 flex-1 items-center gap-2 rounded-[10px] ${focusRing}`}>
                  <BrandTile size={30} />
                  <span className="truncate text-[15px] font-extrabold tracking-[-0.02em]">Kasir Sakti</span>
                  <span className="rounded-[6px] bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand-deep">Admin</span>
                </Link>
                <Link href="/admin/akun" className={`rounded-full ${focusRing}`} aria-label={`Akun saya (${admin.email})`}>
                  <Avatar name={admin.name} />
                </Link>
                <button type="button" className={iconBtn} onClick={() => setAskLogout(true)} disabled={loggingOut} aria-label={`Keluar (${admin.email})`}>
                  {loggingOut ? <Spinner /> : <LogOut size={18} aria-hidden />}
                </button>
              </div>
              <nav aria-label="Menu admin" className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none]">
                {NAV.map(({ href, short, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      ref={active ? (el) => el?.scrollIntoView({ block: "nearest", inline: "nearest" }) : undefined}
                      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 text-[13.5px] font-medium ${
                        active ? "bg-brand-press font-semibold text-white" : "bg-tint text-body"
                      } ${focusRing}`}
                    >
                      <Icon size={15} aria-hidden />
                      {short}
                    </Link>
                  );
                })}
              </nav>
            </header>

            <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
            <LogoutDialog open={askLogout} busy={loggingOut} email={admin.email} onConfirm={logout} onClose={() => setAskLogout(false)} />
          </div>
        </div>
      </div>
    </SessionContext.Provider>
  );
}

/** Ubin ikon aplikasi (maskot di kotak hijau) — sama dengan ikon app & favicon situs. */
export function BrandTile({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/ikon.svg"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className="shrink-0 rounded-[10px] shadow-[0_4px_10px_-4px_rgb(37_117_82/0.6)]"
      style={{ width: size, height: size }}
    />
  );
}

/** Konfirmasi sebelum keluar (tombol keluar mudah tersentuh di HP & di samping akun). */
export function LogoutDialog({
  open,
  busy,
  email,
  onConfirm,
  onClose,
}: {
  open: boolean;
  busy: boolean;
  email: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ConfirmDialog open={open} title="Keluar dari ruang admin?" confirmLabel="Keluar" cancelLabel="Tetap di sini" busy={busy} onConfirm={onConfirm} onClose={onClose}>
      Anda masuk sebagai <strong className="text-ink">{email}</strong>. Perubahan yang belum disimpan di halaman ini akan hilang.
    </ConfirmDialog>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-bold text-brand-deep"
    >
      {initials || "?"}
    </span>
  );
}
