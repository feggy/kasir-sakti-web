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

- Video demo pendek (15–30 detik) dari layar asli.
- Testimoni — **hanya** dari pengguna sungguhan.
- Setelah fitur hapus akun di aplikasi jadi (backlog P1 di `kasir-sakti-app/docs/PEKERJAAN.md`): tambah langkah
  "hapus dari aplikasi" di `/hapus-akun`.

## Selesai

- 2026-11-11 — Situs dibuat: landing (hero dengan tablet+HP asli, cocok untuk, buku vs Kasir Sakti, fitur bento, tanpa
  internet, laporan, harga + struk harga, cara mulai, FAQ, ajakan akhir), kontak, 3 halaman legal, 404, OG image,
  sitemap/robots/manifest/ikon, tombol WhatsApp mengambang, pusat panduan `/panduan` (25 artikel dari menu Bantuan app). 10 pose maskot 3D (Blender). Kode pos alamat 28292
  (nomor.net + Wikipedia Kec. Payung Sekaki; belum dicek ke Pos Indonesia).
