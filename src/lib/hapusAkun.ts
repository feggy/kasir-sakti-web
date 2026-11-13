// Hapus akun dari web tanpa memasang aplikasi (kontrak: kasir-sakti-service/docs/api.md "Hapus akun pemilik").
//   POST /account/deletion/request { identifier }               → Otp (anti-enumerasi: selalu sukses, bentuk sama)
//   POST /account/deletion/confirm { identifier, code, reason? } → { purge_after }
// Origin situs harus ada di CORS_ORIGINS server. Mode tiruan untuk dev: NEXT_PUBLIC_HAPUS_AKUN_MOCK=1
// (kode benar 123456; 000000 → kedaluwarsa; identifier memuat "batas" → 429; salah 5× → kode hangus).
import { ApiError, postJson } from "@/lib/api";

export type DeletionOtp = { identifier: string; masked_destination: string; expires_in: number; resend_in: number };
export type DeletionScheduled = { purge_after: string };

export const HAPUS_AKUN_MOCK = process.env.NEXT_PUBLIC_HAPUS_AKUN_MOCK === "1";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let mockWrong = 0;

export async function requestDeletion(identifier: string): Promise<DeletionOtp> {
  if (HAPUS_AKUN_MOCK) {
    await sleep(600);
    if (identifier.toLowerCase().includes("batas")) {
      throw new ApiError("Terlalu banyak permintaan.", 429, "RATE_LIMITED", [], 120);
    }
    mockWrong = 0;
    return { identifier, masked_destination: "p***@contoh.id", expires_in: 300, resend_in: 60 };
  }
  return postJson<DeletionOtp>("/account/deletion/request", { identifier });
}

export async function confirmDeletion(identifier: string, code: string, reason?: string): Promise<DeletionScheduled> {
  if (HAPUS_AKUN_MOCK) {
    await sleep(700);
    if (mockWrong >= 5) throw new ApiError("Kode tidak berlaku.", 400, "OTP_EXPIRED");
    if (code === "000000") throw new ApiError("Kode kedaluwarsa.", 400, "OTP_EXPIRED");
    if (code !== "123456") {
      mockWrong += 1;
      if (mockWrong >= 5) throw new ApiError("Terlalu banyak percobaan.", 429, "OTP_TOO_MANY_ATTEMPTS");
      throw new ApiError("Kode salah.", 400, "OTP_INVALID");
    }
    return { purge_after: new Date(Date.now() + 14 * 86_400_000).toISOString() };
  }
  return postJson<DeletionScheduled>("/account/deletion/confirm", reason ? { identifier, code, reason } : { identifier, code });
}

/** Pesan galat ramah; tidak pernah membedakan akun ada/tidak (server pun tidak). */
export function deletionErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "Terjadi kesalahan. Coba lagi sebentar lagi.";
  switch (err.code) {
    case "OTP_INVALID":
      return "Kode salah. Periksa lagi 6 digit di email lalu coba lagi.";
    case "OTP_TOO_MANY_ATTEMPTS":
      return "Terlalu banyak percobaan kode yang salah. Minta kode baru.";
    case "OTP_EXPIRED":
      return "Kode sudah tidak berlaku. Minta kode baru.";
    case "RATE_LIMITED":
      return err.retryAfter
        ? `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil(err.retryAfter / 60)} menit.`
        : "Terlalu banyak permintaan. Coba lagi beberapa menit lagi.";
    case "VALIDATION_ERROR":
      return err.details[0]?.message || "Data belum benar. Periksa lagi isiannya.";
    case "NETWORK_ERROR":
      return "Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.";
    case "TIMEOUT":
      return "Server tidak merespons. Coba lagi sebentar lagi.";
    case "SERVICE_UNAVAILABLE":
      return "Layanan sedang sibuk. Coba lagi beberapa menit lagi.";
    default:
      return "Terjadi kesalahan. Coba lagi sebentar lagi.";
  }
}
