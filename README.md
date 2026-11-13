# kasir-sakti-web — situs kasirsakti.id

Landing page aplikasi **Kasir Sakti** (dibuat oleh Yoho Studio). Next.js 16 (App Router) + Tailwind 4, situs
**statis** (semua rute di-prerender), satu bahasa (Indonesia).

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3200 (port 3200; 3100 dipakai situs lain)
npm run lint
npx tsc --noEmit
npm run build      # cek semua rute tetap statis (○)
```

## Halaman

| Rute | Isi | Catatan |
|---|---|---|
| `/` | Landing page | `src/app/page.tsx` (semua bagian dalam satu berkas) |
| `/panduan`, `/panduan/[slug]` | Pusat panduan (25 artikel, cari di peramban) | data dari aplikasi — lihat "Panduan" di bawah |
| `/kontak` | WhatsApp, email, alamat | |
| `/kebijakan-privasi` | Kebijakan privasi | **URL dipakai aplikasi** (`Env.privacyUrl`) — jangan dipindah |
| `/syarat-ketentuan` | Syarat & ketentuan | **URL dipakai aplikasi** (`Env.termsUrl`) — jangan dipindah |
| `/hapus-akun` | Hapus akun (langkah di aplikasi + formulir OTP email lewat `POST /account/deletion/*`) | **URL didaftarkan di Play Console** (Data safety) — jangan dipindah. Origin situs wajib ada di `CORS_ORIGINS` server. Coba tanpa server: `NEXT_PUBLIC_HAPUS_AKUN_MOCK=1 npm run dev` (kode `123456`) |
| 404 | `src/app/not-found.tsx` | maskot pose `cari` |

Juga: `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `icon.svg`, `apple-icon.png`, `public/og.png`.

## Data situs (satu tempat)

`src/site.ts`: nama, pembuat, link Play Store, **nomor WhatsApp**, **email**, **alamat**, **harga** (Lifetime normal &
promo, Premium 1/6/12 bulan), lama uji coba. Ubah di sini → semua halaman ikut. Setelah harga berubah, buat ulang
gambar pratinjau (lihat di bawah) dan perbarui tanggal di `src/app/sitemap.ts`.

Komponen bersama: `src/components/ui.tsx` (tombol Play Store, bingkai HP/tablet Android, struk harga, ikon Google Play &
WhatsApp, maskot), `src/components/kerangka.tsx` (header, footer, tombol WhatsApp mengambang),
`src/components/HalamanLegal.tsx`, `src/seo.ts` (bagian openGraph bersama — wajib disebar bila halaman menulis
`openGraph` sendiri, karena Next tidak menggabung openGraph induk & anak).

## Aset & cara membuat ulang

Semua skrip dijalankan dari root repo `Kasir Sakti/`.

### Maskot 3D (`src/assets/maskot/*.webp`)

Dibangun dari kode di Blender (geometri & warna dari `prototype/brand/maskot.svg`), **satu pose dipakai sekali** di
situs (permintaan pemilik). Pose yang ada: dasar (footer), melambai (hero, og.png), pusing, pegang-hp, offline, laporan,
koin, berpikir, lompat, cari (404).

```bash
brew install --cask blender                                        # sekali
blender -b -P prototype/maskot3d/maskot3d.py -- --pose cari        # → prototype/maskot3d/render/cari.png (+ .blend)
python3 kasir-sakti-web/scripts/siapkan_maskot.py                  # render → webp (alfa bayangan dibersihkan)
```

Pose baru: tambah ke `POSES` di `maskot3d.py` (wajah, arah pupil, lengan, properti). Render pertama ±4 menit
(kompilasi GPU), berikutnya cepat.

### Screenshot aplikasi (`src/assets/layar/*.webp`)

```bash
cd kasir-sakti-app && tool/exclusive.sh flutter test tool/render_screens_test.dart   # → build/shots/
cd .. && python3 kasir-sakti-web/scripts/siapkan_layar.py
```

`siapkan_layar.py` membuang pita "Status paket belum diperiksa" (HP: barisnya dihapus; tablet: dipotong). Status bar &
garis gestur Android ditambahkan oleh bingkai CSS (`Hp`/`Tablet` di `ui.tsx`), bukan bagian gambar.
Berkas `*_2x` di `build/shots` = **font 2×**, bukan resolusi 2× — jangan dipakai.

### Panduan (`src/data/panduan.json`, `public/panduan/*.webp`)

Isi panduan **diambil dari aplikasi** (menu Bantuan): teks `kasir-sakti-app/lib/l10n/arb/app_id.arb` (`help*`), urutan topik
& "paling sering dibaca" dari `lib/features/help/models/help_content.dart`, gambar dari `build/shots`. Jangan edit JSON
manual — ubah teks di aplikasi, lalu:

```bash
python3 kasir-sakti-web/scripts/siapkan_panduan.py
```

Pasangan artikel → screenshot dan artikel yang dilewati diatur di `GAMBAR` / `LEWATI` dalam skrip itu.

### Gambar pratinjau tautan (`public/og.png`, 1200×630)

```bash
bash kasir-sakti-web/scripts/buat_og.sh      # render scripts/og/og.html dengan Chrome headless
```

Harga di `og.html` ditulis langsung (bukan dari `site.ts`) — samakan saat harga berubah.

## Deploy

Situs statis → **Vercel** (build di CI Vercel; jangan build di server produksi). Domain `kasirsakti.id`.
Variabel opsional: `NEXT_PUBLIC_SITE_URL` (bawaan `https://kasirsakti.id`). Setelah online: daftarkan di Google Search
Console + kirim `sitemap.xml`.

Status pekerjaan & keputusan terbuka: `docs/PEKERJAAN.md`.
