# Catatan pekerjaan — kasir-sakti-web

Perbarui di akhir setiap sesi. Cara menjalankan & membuat ulang aset: `README.md`.

## Menunggu reviu pemilik

- **Teks legal** (`/kebijakan-privasi`, `/syarat-ketentuan`, `/hapus-akun`) — ditulis Claude 2026-11-11 dari perilaku
  aplikasi (izin Android, Firebase, Google Sign-In, sinkron saat uji coba/Premium, bcrypt). Keputusan Claude yang
  **wajib disetujui pemilik**: pembayaran tidak dapat dikembalikan (kecuali bayar ganda); batas tanggung jawab =
  pembayaran 12 bulan terakhir; hapus akun ≤14 hari kerja, cadangan ≤30 hari, Lifetime hangus; batas usia 17 tahun;
  "selamanya" = selama aplikasi dioperasikan.
- **Screenshot aplikasi belum direviu pemilik** (aplikasi sendiri belum direviu). Lihat "Screenshot" di bawah.

## Berikutnya

0. **P1 · Tinjau panel admin `/admin` (dibuat 2026-11-12, belum diuji di browser)** — jalankan
   `NEXT_PUBLIC_ADMIN_MOCK=1 npm run dev` → `localhost:3200/admin/login` (email & sandi apa saja, kecuali sandi
   `salah`). Cek: Lisensi (6 plan, filter Paket/Berakhir/Pernah beli), detail bisnis › tab Lisensi (catat Lifetime /
   Premium 1-6-12 bln, batalkan, tambah hari, kuota outlet), Harga & cara bayar (4 harga + pratinjau halaman Paket),
   Ringkasan, Metrik. Lalu uji terhadap server dev: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1`, server
   `ADMIN_ORIGINS=http://localhost:3200` (bawaan `.env` = 3000), admin pertama `go run ./cmd/admin create …`.
1. **P1 · Link Play Store** — semua tombol menuju `play.google.com/...id=id.kasirsakti.app`. Sebelum aplikasi terbit,
   link itu 404. Pilih: buka situs setelah aplikasi terbit, **atau** mode "segera hadir" sementara (tombol → WhatsApp).
2. **P1 · Commit + deploy** — Vercel, DNS `kasirsakti.id`, Search Console + `sitemap.xml`.
3. **P2 · Screenshot ulang setelah reviu aplikasi** — render ulang + `scripts/siapkan_layar.py` (lihat README).

## Screenshot — yang perlu dicek sebelum situs online

Gambar di `src/assets/layar/` adalah layar aplikasi **apa adanya** dari `render_screens_test.dart` (data contoh fiktif).
Saat ditinjau 2026-11-11, isinya:

- **Nama & alamat contoh** fiktif: "Kopi Senja — Kemang", "Jl. Kemang Raya No. 12", kasir "Rani Wulandari", pelanggan
  "Budi Santoso" (juga dipakai di kartu struk WhatsApp `page.tsx`). Pastikan bukan nama orang/usaha nyata yang dikenal.
- **Teks yang kurang cocok untuk promosi**: `hp-berhasil` memuat "Struk tidak dicetak: printer struk belum diatur."
  (kuning); sidebar tablet memuat "Belum diketahui · Offline…". Bila mengganggu: render ulang dengan printer contoh
  terpasang / status lisensi diketahui.
- **Resolusi 1×** (HP 390 px, tablet 1280 px) → agak lembut di layar retina. Produk masih kotak inisial (AM, CL…);
  alat render punya `--dart-define=PHOTOS=/folder` untuk foto produk asli.
- Bila UI aplikasi berubah setelah reviu, screenshot wajib dibuat ulang agar situs tidak menjanjikan tampilan lama.

## Panduan — catatan isi

- Artikel **"Perubahan tidak tersimpan" dilewati**: teksnya di aplikasi masih menyebut "slot booking" (sisa fitur penyewaan
  Sissi). Perbaiki teksnya di `app_id.arb` (`helpRejectedBody`) lalu hapus dari `LEWATI` di `siapkan_panduan.py`.
- Screenshot `guide_paket` **tidak dipakai**: masih memuat harga Lifetime lama Rp199.000.
- 9 artikel belum punya gambar (jenis usaha, QRIS, kasbon, refund, jadwal, gaji, offline, member, paket) — tambah
  render di `render_screens_test.dart` bila perlu.

- **Fitur yang dimatikan di app (`BacklogFlags`) tidak dijual di situs**: Pesanan QR / Pesan & Bayar Mandiri, Dapur /
  tiket & printer dapur / siap diantar. Artikel panduan selfOrderQueue, selfOrderSetup, readyOrders ada di `LEWATI`
  (`siapkan_panduan.py`); tabel Lifetime vs Premium (`page.tsx`, `BANDING`) tidak mencantumkannya. Saat fitur
  dinyalakan: hapus dari `LEWATI`, tambah barisnya di `BANDING`.
- Teks panduan dari app masih menyebut dapur/Pesanan QR di 4 artikel (jenis usaha, printer, karyawan, offline) —
  diperbaiki di app (backlog P1 butir 8 `kasir-sakti-app/docs/PEKERJAAN.md`), lalu jalankan ulang skrip.
- **Aturan lisensi (keputusan pemilik 2026-11-11)**: Lifetime = semua yang jalan di 1 perangkat tanpa server (termasuk
  karyawan tanpa batas + PIN, kas & laporan per kasir, absen/jadwal/gaji di HP toko); Premium = semua yang butuh server.
  Sudah diterapkan di `BANDING`, kartu harga, FAQ, Syarat & Ketentuan. Aplikasi belum — backlog P1 "Aturan lisensi
  disederhanakan" di `kasir-sakti-app/docs/PEKERJAAN.md`. **Jangan buka situs sebelum aplikasi sesuai** (situs
  menjanjikan karyawan di Lifetime).

## Backlog

- **Domain admin**: server menganggap admin/dasbor di `app.kasirsakti.id` (`ADMIN_ORIGINS`, `DownloadFallbackURL`
  `/download`), situs di `kasirsakti.id`. Putuskan: proyek Vercel yang sama untuk kedua domain, atau admin di
  `kasirsakti.id/admin` (ubah `ADMIN_ORIGINS` produksi). Halaman `/download` (APK) belum ada di situs ini.
- Font situs hanya 500 & 800; panel admin memakai 600/700 → peramban memakai berat terdekat. Tambah berkas 600/700
  bila tampilan admin terasa terlalu tebal.
- Dasbor pemilik (`/dasbor`), web karyawan (`/karyawan`), undangan (`/undangan`) & persetujuan (`/setujui`) Sissi
  belum di-porting (server punya `/owner/*`, `/staff/*`).
- Video demo pendek (15–30 detik) dari layar asli.
- Testimoni — **hanya** dari pengguna sungguhan.
- Setelah fitur hapus akun di aplikasi jadi (backlog P1 di `kasir-sakti-app/docs/PEKERJAAN.md`): tambah langkah
  "hapus dari aplikasi" di `/hapus-akun`.

## Selesai

- 2026-11-12 — **QRIS otomatis**: halaman `/bayar/selesai` (return_url QRISGate; noindex, robots disallow `/bayar`);
  admin › tab Lisensi menandai pembayaran QRISGate ("QRIS otomatis (QRISGate)", lencana Otomatis, "tanpa admin");
  daftar Lisensi menulis "QRIS otomatis" di bayar terakhir; data tiruan ikut. Panel admin juga diredesain bergaya
  aplikasi (sidebar, kartu berikon, maskot, Ringkasan ala Beranda, kalender rentang tanggal, konfirmasi keluar).

- 2026-11-12 — **Panel admin `/admin`** (Claude Opus 5.5; atas permintaan pemilik "kerjakan web admin dulu"). Disalin
  dari panel admin Sissi (`sissi-pos-landing-page/src/{app,components,lib}/admin`, baca saja) lalu: identitas Kasir
  Sakti (logo, header CSRF `X-Sakti-Admin`, domain `api.kasirsakti.id`, nama APK `kasir-sakti-*`), token warna Kasir
  Sakti (+ token status di `globals.css`), dan **model lisensi baru**: `/admin/lisensi` (`GET /admin/licenses`), tab
  Lisensi di detail bisnis (`LicenseTab.tsx`: catat per produk `lifetime|online_1m|6m|12m`, `LIFETIME_EXISTS`, void
  Lifetime kapan saja / Premium hanya terbaru, tambah hari `trial|online`, kuota outlet), `/admin/lisensi/pengaturan`
  (4 harga, pratinjau halaman Paket), ringkasan/metrik/daftar bisnis memakai 6 plan (`online` tampil "Premium"),
  audit `license.*` (+ `subscription.*` lama tetap dikenali). Data tiruan (`NEXT_PUBLIC_ADMIN_MOCK=1`) ikut model
  lisensi; jenis usaha hanya kuliner/ritel. Klien API `src/lib/api.ts`. Tombol WA mengambang disembunyikan di
  `/admin` (`WaSitus.tsx`); CSP `connect-src` + origin API; `/admin` noindex/no-store; `robots.txt` disallow.
  Verifikasi: `tsc`, `eslint`, `next build` hijau. **Belum** diuji di browser (Chrome tidak bisa membuka dev server
  dari sesi agen) dan belum terhadap server sungguhan.
- 2026-11-11 — Situs dibuat: landing (hero dengan tablet+HP asli, cocok untuk, buku vs Kasir Sakti, fitur bento, tanpa
  internet, laporan, harga + struk harga, cara mulai, FAQ, ajakan akhir), kontak, 3 halaman legal, 404, OG image,
  sitemap/robots/manifest/ikon, tombol WhatsApp mengambang, pusat panduan `/panduan` (25 artikel dari menu Bantuan app). 10 pose maskot 3D (Blender). Kode pos alamat 28292
  (nomor.net + Wikipedia Kec. Payung Sekaki; belum dicek ke Pos Indonesia).
