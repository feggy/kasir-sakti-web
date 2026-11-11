/** Data bersama situs. Harga sumbernya docs/2026-11-08-lisensi-design.md + promo pemilik (2026-11-11). */
export const site = {
  nama: "Kasir Sakti",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasirsakti.id",
  pembuat: "Yoho Studio",
  playStore: "https://play.google.com/store/apps/details?id=id.kasirsakti.app",
  /** Nomor WhatsApp bantuan (format 62…, tanpa +). Kosong = tautan WhatsApp disembunyikan. */
  whatsapp: "6285167952246",
  email: "yoho.pku@gmail.com",
  /** Kode pos 28292: nomor.net (Labuh Baru Timur, kode wilayah 14.71.11.1002) & Wikipedia Kec. Payung Sekaki. */
  alamat: ["Jl. Tiung No. 18", "Kel. Labuh Baru Timur, Kec. Payung Sekaki", "Kota Pekanbaru, Riau 28292"],
  hargaLifetimeNormal: 199_000,
  hargaLifetime: 145_000,
  hargaPremium: { "1 bulan": 49_000, "6 bulan": 269_000, "12 bulan": 490_000 },
  hariUjiCoba: 14,
} as const;

export const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");
