import type { Metadata } from "next";
import Image from "next/image";
import {
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Coffee,
  Croissant,
  CupSoda,
  Shirt,
  ShoppingBasket,
  Store,
  Wrench,
  CloudOff,
  Download,
  HandCoins,
  LayoutGrid,
  Minus,
  Package,
  Pointer,
  Wallet,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Smartphone,
  TabletSmartphone,
  TicketPercent,
  UserPlus,
  Utensils,
  WifiOff,
  X,
} from "lucide-react";
import { Footer, Header } from "@/components/kerangka";
import { Hp, IkonWhatsApp, Judul, Maskot, StrukHarga, Tablet, TombolPlayStore } from "@/components/ui";
import { rupiah, site } from "@/site";
import melambai from "@/assets/maskot/melambai.webp";
import pusing from "@/assets/maskot/pusing.webp";
import pegangHp from "@/assets/maskot/pegang-hp.webp";
import offline from "@/assets/maskot/offline.webp";
import laporan from "@/assets/maskot/laporan.webp";
import koin from "@/assets/maskot/koin.webp";
import berpikir from "@/assets/maskot/berpikir.webp";
import lompat from "@/assets/maskot/lompat.webp";
import tabletKasir from "@/assets/layar/tablet-kasir.webp";
import tabletLaporan from "@/assets/layar/tablet-laporan.webp";
import hpKasir from "@/assets/layar/hp-kasir.webp";
import hpBerhasil from "@/assets/layar/hp-berhasil.webp";
import hpLaporan from "@/assets/layar/hp-laporan.webp";
import hpMeja from "@/assets/layar/hp-meja.webp";
import hpPerhatian from "@/assets/layar/hp-perhatian.webp";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const wadah = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export default function Beranda() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CocokUntuk />
        <Masalah />
        <Fitur />
        <TanpaInternet />
        <Laporan />
        <Harga />
        <CaraMulai />
        <TanyaJawab />
        <AjakanAkhir />
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ 1 · hero */

function Hero() {
  const jaminan = [
    { ikon: WifiOff, teks: "Jalan tanpa internet" },
    { ikon: TabletSmartphone, teks: "HP & tablet Android" },
    { ikon: ShieldCheck, teks: `Gratis ${site.hariUjiCoba} hari` },
  ];
  return (
    <section className="gerigi relative overflow-x-clip bg-tint [--gerigi:var(--color-tint)]">
      {/* pola titik halus seperti kertas struk */}
      <div className="absolute inset-0 bg-[radial-gradient(#cfe6d9_1px,transparent_1px)] [background-size:22px_22px] opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
      <div className={`${wadah} relative grid items-center gap-12 pt-10 pb-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:pt-16 lg:pb-28`}>
        <div className="animate-muncul">
          <h1 className="text-[40px] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance sm:text-[56px] lg:text-[64px]">
            Kasir warung yang tetap jalan <span className="relative whitespace-nowrap text-brand">tanpa internet.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-body sm:text-lg">
            Catat jualan, stok, dan untung harian langsung dari HP atau tablet. Bayar sekali, tanpa biaya bulanan.
          </p>

          <div className="mt-8 grid max-w-xl gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <StrukHarga className="max-w-sm" />
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <TombolPlayStore />
            <a href="#harga" className="text-[15px] text-brand-deep underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
              Bandingkan paket
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-body">
            {jaminan.map(({ ikon: Ikon, teks }) => (
              <li key={teks} className="inline-flex items-center gap-2">
                <Ikon className="size-4 text-brand" aria-hidden /> {teks}
              </li>
            ))}
          </ul>
        </div>

        {/* komposisi: tablet kasir + HP struk berhasil + maskot di depan */}
        <div className="relative mx-auto w-full max-w-[640px] pb-10 lg:pb-0">
          <Tablet src={tabletKasir} alt="Layar kasir Kasir Sakti di tablet: menu, pesanan, dan tombol bayar" sizes="(min-width: 1024px) 600px, 92vw" priority className="ml-auto w-[94%] lg:w-full lg:translate-x-6" />
          <Hp src={hpBerhasil} alt="Layar pembayaran berhasil di HP dengan pratinjau struk" sizes="(min-width: 1024px) 190px, 30vw" priority className="absolute -right-1 -bottom-2 w-[30%] sm:-right-3 lg:-right-10 lg:-bottom-12" />
          <Maskot src={melambai} priority sizes="(min-width: 1024px) 300px, 44vw" className="absolute -bottom-10 -left-4 w-[36%] drop-shadow-[0_18px_18px_rgba(23,53,42,.18)] sm:-left-8 lg:-bottom-24 lg:-left-20" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 1b · cocok untuk */

function CocokUntuk() {
  const usaha = [
    { ikon: Utensils, nama: "Warung makan", contoh: "Nasi, bakso, mie ayam" },
    { ikon: Coffee, nama: "Kedai kopi & kafe", contoh: "Kopi susu, teh, camilan" },
    { ikon: Store, nama: "Toko kelontong", contoh: "Sembako & kebutuhan harian" },
    { ikon: ShoppingBasket, nama: "Minimarket kecil", contoh: "Ratusan barang & barcode" },
    { ikon: Croissant, nama: "Toko kue & roti", contoh: "Jualan harian & pesanan" },
    { ikon: CupSoda, nama: "Minuman & jajanan", contoh: "Es teh, jus, gorengan" },
    { ikon: Shirt, nama: "Toko pakaian", contoh: "Ukuran & warna per barang" },
    { ikon: Wrench, nama: "Usaha jasa", contoh: "Laundry, servis, cukur" },
  ];
  return (
    <section className={`${wadah} pt-24 lg:pt-28`}>
      <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
        <Judul label="Cocok untuk">Dibuat untuk usaha kecil di sekitar kita.</Judul>
        <p className="max-w-xs text-[15px] text-body md:text-right">Makanan, minuman, atau toko barang — satu aplikasi untuk semuanya.</p>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {usaha.map(({ ikon: Ikon, nama, contoh }) => (
          <li key={nama} className="group flex items-center gap-3.5 rounded-2xl bg-white p-4 ring-1 ring-line transition hover:ring-brand sm:p-5">
            <span className="inline-flex size-11 flex-none items-center justify-center rounded-xl bg-brand-soft text-brand-deep transition group-hover:bg-brand-press group-hover:text-white sm:size-12">
              <Ikon className="size-5 sm:size-6" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block leading-tight font-extrabold">{nama}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-muted">{contoh}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ 2 · masalah: buku vs kasir sakti */

function Masalah() {
  const buku = [
    "Kembalian salah hitung waktu warung sedang ramai.",
    "Stok habis baru ketahuan saat pembeli sudah menunggu.",
    "Tutup warung, uang di laci tidak cocok dengan catatan.",
    "Untung bulan ini? Hanya bisa dikira-kira.",
  ];
  const sakti = [
    "Total dan kembalian dihitung otomatis.",
    "Stok berkurang sendiri, ada pengingat saat menipis.",
    "Tutup kas per shift: laci dicocokkan dengan transaksi.",
    "Untung harian langsung terlihat di laporan.",
  ];
  return (
    <section className={`${wadah} pt-28 pb-20 lg:pt-36 lg:pb-28`}>
      <Judul label="Kenal rasanya?" tengah sub="Buku tulis dan kalkulator sudah berjasa. Tapi saat warung makin ramai, catatan manual mulai kewalahan.">
        Masih catat jualan di buku tulis?
      </Judul>
      <div className="mt-24 grid gap-5 lg:grid-cols-2">
        <div className="relative rounded-[28px] bg-[#fbf3ef] p-6 pt-8 ring-1 ring-[#f3dfd6] sm:p-9">
          <Maskot src={pusing} sizes="120px" className="absolute -top-[80px] right-4 w-[100px] sm:-top-[96px] sm:right-8 sm:w-[120px]" />
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-[#d0644b] ring-1 ring-[#f3dfd6]">
              <BookOpen className="size-5" aria-hidden />
            </span>
            <h3 className="text-lg font-extrabold">Pakai buku catatan</h3>
          </div>
          <ul className="mt-6 space-y-3.5">
            {buku.map((s) => (
              <li key={s} className="flex gap-3 text-[15px] leading-snug text-body">
                <X className="mt-0.5 size-5 flex-none text-[#d0644b]" aria-hidden /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] bg-brand-press p-6 pt-8 text-white sm:p-9">
          <div className="flex items-center gap-3">
            <Image src="/ikon.svg" alt="" width={40} height={40} className="size-10 rounded-xl" />
            <h3 className="text-lg font-extrabold">Pakai Kasir Sakti</h3>
          </div>
          <ul className="mt-6 space-y-3.5">
            {sakti.map((s) => (
              <li key={s} className="flex gap-3 text-[15px] leading-snug text-[#e3f4ea]">
                <Check className="mt-0.5 size-5 flex-none text-gold" aria-hidden /> {s}
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-white/15 pt-5 text-[15px] font-extrabold">Hitung-hitungan biar Kasir Sakti yang kerjakan. Kamu fokus melayani pembeli.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3 · fitur (bento + layar asli) */

function KartuLayar({ ikon: Ikon, judul, isi, layar, alt, className = "" }: { ikon: typeof ScanLine; judul: string; isi: string; layar: typeof hpKasir; alt: string; className?: string }) {
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-line ${className}`}>
      <div className="p-6 sm:p-7">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
          <Ikon className="size-5" aria-hidden />
        </span>
        <h3 className="mt-4 text-lg font-extrabold">{judul}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-body">{isi}</p>
      </div>
      <div className="relative mt-auto h-[300px] overflow-hidden bg-gradient-to-b from-white to-tint [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
        <Hp src={layar} alt={alt} sizes="240px" className="absolute top-3 left-1/2 w-[220px] -translate-x-1/2 transition duration-500 group-hover:-translate-y-2" />
      </div>
    </div>
  );
}

function Fitur() {
  const kecil = [
    { ikon: HandCoins, judul: "Kasbon pelanggan", isi: "Utang pelanggan tercatat, lengkap dengan sisa yang belum dibayar." },
    { ikon: TicketPercent, judul: "Diskon & voucher", isi: "Diskon per item atau per transaksi, plus voucher pelanggan setia." },
    { ikon: Utensils, judul: "Catatan pesanan", isi: "“Less ice, extra shot” — catatan per item ikut tercetak di struk." },
    { ikon: Clock, judul: "Buka & tutup shift", isi: "Uang di laci dicocokkan dengan transaksi setiap ganti shift." },
  ];
  return (
    <section id="fitur" className="scroll-mt-20 bg-tint py-24 lg:py-32">
      <div className={wadah}>
        <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <Judul label="Fitur" sub="Dibuat untuk warung, kedai kopi, dan toko kecil. Menunya sedikit, tombolnya besar, langsung paham.">
            Semua yang warung butuhkan, di satu HP.
          </Judul>
          <Maskot src={pegangHp} sizes="(min-width: 640px) 260px, 56vw" className="mx-auto w-[56%] max-w-[260px] sm:mr-0 sm:w-[260px]" />
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-ink text-white md:col-span-2 lg:row-span-2">
            <div className="p-7 sm:p-9">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#9FD8BA]">
                <ScanLine className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-2xl font-extrabold">Kasir cepat, sekali ketuk</h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#CFE6D9]">
                Ketuk menu untuk menambah pesanan. Bayar tunai, QRIS, atau transfer — kembalian dihitung otomatis.
              </p>
            </div>
            <div className="flex items-start justify-center gap-[5%] px-7 pb-9 sm:px-9">
              <Hp src={hpKasir} alt="Layar kasir Kasir Sakti di HP: menu dan total pesanan" sizes="260px" className="w-[44%] max-w-[240px]" />
              <Hp src={hpBerhasil} alt="Layar pembayaran berhasil dengan pratinjau struk" sizes="260px" className="mt-[12%] w-[44%] max-w-[240px]" />
            </div>
            {/* alur transaksi: mengisi dasar kartu yang memanjang dua baris */}
            <div className="mt-auto border-t border-white/10 bg-white/[.04] px-7 py-7 sm:px-9">
              <ol className="grid gap-5 sm:grid-cols-3">
                {[
                  { ikon: Pointer, judul: "Ketuk menu", isi: "Masuk keranjang" },
                  { ikon: Wallet, judul: "Bayar", isi: "Kembalian otomatis" },
                  { ikon: ReceiptText, judul: "Struk keluar", isi: "Cetak atau WhatsApp" },
                ].map(({ ikon: Ikon, judul, isi }, i) => (
                  <li key={judul} className="flex gap-3">
                    <span className="relative inline-flex size-10 flex-none items-center justify-center rounded-xl bg-white/10 text-[#9FD8BA]">
                      <Ikon className="size-5" aria-hidden />
                      <span className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-extrabold text-[#4a3608]">{i + 1}</span>
                    </span>
                    <span>
                      <span className="block font-extrabold whitespace-nowrap">{judul}</span>
                      <span className="block text-sm leading-snug text-[#CFE6D9]">{isi}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 text-[#9FB8AA]">Terima pembayaran:</span>
                {["Tunai", "QRIS", "Transfer", "Kasbon"].map((m) => (
                  <span key={m} className="rounded-full bg-white/10 px-3 py-1 font-extrabold text-white ring-1 ring-white/15">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <KartuLayar ikon={Package} judul="Stok & pengingat" isi="Stok berkurang setiap ada penjualan. Ada pengingat saat barang menipis." layar={hpPerhatian} alt="Layar Beranda dengan peringatan stok menipis" />
          <KartuLayar ikon={Utensils} judul="Meja & open bill" isi="Pesanan per meja, bayar belakangan. Pas untuk warung makan." layar={hpMeja} alt="Layar daftar meja" />
          <div className="grid gap-5 sm:grid-cols-2 md:col-span-2">
            {kecil.map(({ ikon: Ikon, judul, isi }) => (
              <div key={judul} className="rounded-[24px] bg-white p-6 ring-1 ring-line">
                <Ikon className="size-6 text-brand" aria-hidden />
                <h3 className="mt-3 font-extrabold">{judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-body">{isi}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid items-center gap-8 overflow-hidden rounded-[28px] bg-white p-7 ring-1 ring-line sm:p-9 md:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
              <ReceiptText className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-2xl font-extrabold">Struk dicetak, atau langsung ke WhatsApp</h3>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-body">
              Sambungkan printer struk Bluetooth untuk struk kertas. Pembeli yang tidak butuh kertas? Kirim struknya ke WhatsApp mereka dengan sekali
              ketuk.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2 text-sm">
              {["Printer Bluetooth", "Kirim ke WhatsApp", "Pesan di struk", "Cetak ulang"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3 py-1.5 text-brand-deep ring-1 ring-line">
                  <Check className="size-3.5" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* visual: struk kertas + pesan WhatsApp (data sama dengan screenshot aplikasi) */}
          <div className="relative mx-auto h-[300px] w-full max-w-[440px]" aria-hidden>
            <div className="absolute top-2 left-0 w-[58%] -rotate-3 [--gerigi:#fff]">
              <div className="gerigi bg-white px-4 pt-4 pb-3 font-mono text-[11px] leading-[1.55] text-ink shadow-[0_18px_34px_-18px_rgba(23,53,42,.5)] ring-1 ring-line">
                <p className="text-center font-bold">Kopi Senja - Kemang</p>
                <p className="text-center text-muted">Terima kasih sudah mampir!</p>
                <p className="my-1.5 border-t border-dashed border-[#c9d9cf]" />
                <p className="text-center text-[15px] font-bold">Antrean 1</p>
                <p className="my-1.5 border-t border-dashed border-[#c9d9cf]" />
                <p className="flex justify-between"><span>2 Es Kopi Susu</span><span>60.000</span></p>
                <p className="flex justify-between"><span>1 Americano</span><span>22.000</span></p>
                <p className="flex justify-between"><span>1 Kantong kertas</span><span>2.000</span></p>
                <p className="my-1.5 border-t border-dashed border-[#c9d9cf]" />
                <p className="flex justify-between font-bold"><span>Total</span><span>87.400</span></p>
                <p className="flex justify-between text-muted"><span>Kembalian</span><span>52.600</span></p>
              </div>
            </div>
            <div className="absolute right-0 bottom-3 w-[62%] rounded-[22px] bg-[#e9f4ee] p-3 shadow-[0_20px_40px_-20px_rgba(23,53,42,.55)] ring-1 ring-line">
              <div className="flex items-center gap-2 px-1 pb-2">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#25d366] text-white">
                  <IkonWhatsApp className="size-4" />
                </span>
                <span className="text-xs font-extrabold text-ink">Budi Santoso</span>
              </div>
              <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-[#d9fdd3] px-3 py-2.5 text-[12.5px] leading-snug text-ink">
                <p className="font-extrabold">Struk Kopi Senja - Kemang</p>
                <p className="mt-0.5">INV-261111-001 · Antrean 1</p>
                <p className="mt-0.5">Total <b>Rp87.400</b> · Lunas</p>
                <p className="mt-1 text-right text-[10.5px] text-muted">09.33 ✓✓</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 4 · tanpa internet */

function TanpaInternet() {
  const poin = [
    { ikon: CloudOff, judul: "Tidak butuh kuota", teks: "Semua transaksi tersimpan di HP. Sinyal hilang, kasir tetap jalan." },
    { ikon: Download, judul: "Cadangan ke file", teks: "Data bisa dicadangkan ke file di HP kapan saja, lalu dipulihkan di HP baru." },
    { ikon: UserPlus, judul: "Online cukup sekali", teks: "Internet hanya perlu saat daftar dan masuk pertama kali." },
  ];
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(159,216,186,.14)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
      <div className={`${wadah} relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]`}>
        <div>
          <Judul label="Tanpa internet" terang sub="Banyak warung ada di tempat yang sinyalnya naik-turun. Karena itu Kasir Sakti dibuat untuk bekerja penuh tanpa internet.">
            Sinyal hilang? Tetap jualan.
          </Judul>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {poin.map(({ ikon: Ikon, judul, teks }) => (
              <div key={judul} className="rounded-2xl bg-white/[.06] p-5 ring-1 ring-white/10">
                <Ikon className="size-6 text-gold" aria-hidden />
                <h3 className="mt-3 font-extrabold">{judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#CFE6D9]">{teks}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-x-[12%] bottom-[6%] h-[40%] rounded-full bg-brand/40 blur-3xl" aria-hidden />
          <Maskot src={offline} sizes="(min-width: 1024px) 360px, 70vw" className="relative mx-auto w-[70%] max-w-[360px]" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 5 · laporan */

function Laporan() {
  const poin = [
    { ikon: BarChart3, judul: "Penjualan & laba", isi: "Omzet, laba bersih, dan rata-rata per transaksi — harian sampai bulanan." },
    { ikon: LayoutGrid, judul: "Produk terlaris", isi: "Tahu menu yang paling laku dan yang jarang dibeli." },
    { ikon: Smartphone, judul: "Per kasir & ekspor CSV", isi: "Lihat penjualan tiap kasir, lalu unduh laporan untuk Excel atau Google Sheets." },
  ];
  return (
    <section id="laporan" className="scroll-mt-20 overflow-x-clip py-24 lg:py-32">
      <div className={wadah}>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <Judul label="Laporan" sub="Buka aplikasi, lihat angkanya. Tidak perlu lagi menjumlahkan buku di akhir bulan.">
            Tahu untung setiap hari, bukan kira-kira.
          </Judul>
        </div>
        <div className="relative mt-14">
          <Tablet src={tabletLaporan} alt="Layar Laporan di tablet: penjualan, transaksi, laba bersih, piutang kasbon, grafik penjualan harian" sizes="(min-width: 1024px) 820px, 92vw" className="mx-auto w-full max-w-[860px]" />
          <Hp src={hpLaporan} alt="Layar Laporan di HP" sizes="(min-width: 1024px) 220px, 28vw" className="absolute -right-1 -bottom-10 w-[27%] max-w-[230px] sm:right-2 lg:right-4" />
          <Maskot src={laporan} sizes="(min-width: 1024px) 340px, 40vw" className="absolute -bottom-12 -left-3 w-[40%] max-w-[340px] drop-shadow-[0_14px_16px_rgba(23,53,42,.18)] lg:-left-6" />
        </div>
        <div className="mt-24 grid gap-4 sm:grid-cols-3">
          {poin.map(({ ikon: Ikon, judul, isi }) => (
            <div key={judul} className="flex gap-4">
              <span className="inline-flex size-11 flex-none items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                <Ikon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-extrabold">{judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-body">{isi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 6 · harga */

function Harga() {
  const lifetime = ["Semua fitur jualan, stok & laporan", "Tetap jalan tanpa internet", "Karyawan berapa pun, gantian pakai PIN", "Dipakai di 1 HP, bisa pindah HP", "Data tersimpan di HP itu saja", "Tanpa biaya bulanan"];
  const premium = ["Dipakai di beberapa HP sekaligus", "Karyawan masuk & absen dari HP sendiri", "Data tersimpan otomatis", "Cek penjualan & dapat pemberitahuan dari rumah"];
  const durasi = Object.entries(site.hargaPremium) as [string, number][];
  const perBulan = site.hargaPremium["1 bulan"];
  return (
    <section id="harga" className="scroll-mt-20 bg-tint py-24 lg:py-32">
      <div className={wadah}>
        <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <Judul label="Harga" sub={`Coba ${site.hariUjiCoba} hari gratis dengan semua fitur, termasuk Premium. Cocok, baru bayar.`}>
            Bayar sekali, pakai selamanya.
          </Judul>
          <Maskot src={koin} sizes="(min-width: 640px) 300px, 64vw" className="mx-auto w-[64%] max-w-[300px] sm:mr-0 sm:w-[300px]" />
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative flex flex-col rounded-[32px] bg-white p-6 ring-2 ring-brand sm:p-9">
            <span className="absolute -top-3.5 left-7 rounded-full bg-gold px-3.5 py-1 text-xs font-extrabold text-[#4a3608]">Paling dipilih · harga promo</span>
            <div className="grid gap-6 md:grid-cols-[1fr_1.15fr] md:items-start">
              <div>
                <h3 className="text-2xl font-extrabold">Lifetime</h3>
                <p className="mt-1 text-[15px] text-body">Untuk warung yang cukup satu HP kasir.</p>
              </div>
              <StrukHarga />
            </div>
            <ul className="mt-8 grid gap-x-6 gap-y-3 border-t border-line pt-7 sm:grid-cols-2">
              {lifetime.map((t) => (
                <li key={t} className="flex gap-2.5 text-[15px] text-body">
                  <Check className="mt-0.5 size-5 flex-none text-brand" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8 [&>a]:w-full">
              <TombolPlayStore />
            </div>
          </div>

          <div className="rounded-[32px] bg-white/60 p-6 ring-1 ring-line sm:p-9">
            <h3 className="text-2xl font-extrabold">
              Premium <span className="align-middle text-sm font-medium text-muted">· tambahan, opsional</span>
            </h3>
            <p className="mt-1 text-[15px] text-body">Untuk toko yang kasirnya lebih dari satu HP, atau ingin cek toko dari rumah.</p>
            <ul className="mt-6 space-y-3">
              {premium.map((t) => (
                <li key={t} className="flex gap-2.5 text-[15px] text-body">
                  <Check className="mt-0.5 size-5 flex-none text-brand" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <table className="mt-7 w-full text-[15px]">
              <tbody className="divide-y divide-line">
                {durasi.map(([lama, harga]) => {
                  const bulan = parseInt(lama);
                  const hemat = perBulan * bulan - harga;
                  return (
                    <tr key={lama}>
                      <td className="py-2.5 text-body">{lama}</td>
                      <td className="py-2.5 text-right">
                        {hemat > 0 && <span className="mr-2 rounded bg-brand-soft px-1.5 py-0.5 text-xs text-brand-deep">hemat {rupiah(hemat)}</span>}
                        <b className="font-extrabold">{rupiah(harga)}</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-5 text-sm text-muted">Bisa ditambahkan kapan saja, termasuk oleh pemilik Lifetime.</p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">Pembayaran lewat transfer dari halaman Paket di aplikasi, dikonfirmasi via WhatsApp.</p>

        <PerbandinganPaket />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 6b · perbandingan Lifetime vs Premium */

// Sumber: kasir-sakti-app lib/features/license (OnlineFeature: sync, staff, multi_device, cloud_backup,
// remote_monitor, staff_reports) + docs/2026-11-08-lisensi-design.md §1b: Lifetime = semua yang jalan di 1 perangkat
// tanpa server (termasuk karyawan + PIN, kas & laporan per kasir); Premium = semua yang butuh server.
// Pesanan QR & Dapur/tiket dapur TIDAK dicantumkan: dimatikan di app (BacklogFlags) — jangan dijual sebelum dinyalakan.
// Notifikasi pemilik dipicu dari data sync (service push/triggers.go) → praktis Premium.
type Sel = boolean | string;
const BANDING: { grup: string; baris: [string, Sel, Sel, string?][] }[] = [
  {
    grup: "Jualan sehari-hari",
    baris: [
      ["Kasir, meja & bayar belakangan (open bill)", true, true],
      ["Bayar tunai, QRIS, transfer & kasbon", true, true],
      ["Diskon, voucher & catatan pesanan", true, true],
      ["Struk dicetak atau dikirim ke WhatsApp", true, true],
      ["Produk, varian & stok barang", true, true],
      ["Laporan penjualan & untung", true, true],
      ["Tetap jalan walau tidak ada internet", true, true],
    ],
  },
  {
    grup: "Karyawan",
    baris: [
      ["Tambah karyawan, berapa pun", true, true],
      ["Karyawan gantian jaga kasir pakai PIN", true, true],
      ["Hitung uang laci & laporan per kasir", true, true],
      ["Absen, jadwal & slip gaji di HP toko", true, true],
      ["Karyawan masuk & absen dari HP-nya sendiri", false, true],
    ],
  },
  {
    grup: "HP & data",
    baris: [
      ["Bisa dipakai di", "1 HP/tablet", "Beberapa HP sekaligus"],
      ["Data tersimpan di", "HP itu saja", "HP + online"],
      ["Simpan cadangan data", "Manual, ke file", "Otomatis"],
      ["Kalau HP rusak/hilang", "Pulihkan dari file cadangan", "Masuk di HP baru, data kembali"],
    ],
  },
  {
    grup: "Pantau dari jauh",
    baris: [
      ["Cek penjualan dari rumah", false, true],
      ["Pemberitahuan ke HP pemilik (uang laci kurang, stok mau habis, ringkasan harian)", false, true],
    ],
  },
];

function SelPaket({ v }: { v: Sel }) {
  if (v === true) return <Check className="mx-auto size-5 text-brand" aria-label="Ya" />;
  if (v === false) return <Minus className="mx-auto size-5 text-[#b9c7bf]" aria-label="Tidak" />;
  return <span className="text-[13px] leading-snug font-extrabold text-ink sm:text-sm">{v}</span>;
}

function PerbandinganPaket() {
  return (
    <div className="mt-16">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <h3 className="text-[26px] leading-tight font-extrabold tracking-[-0.02em] sm:text-[32px]">Lifetime atau Premium?</h3>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-body">
            Gampangnya begini. <b className="text-ink">Lifetime</b>: semua dikerjakan di <b className="text-ink">satu HP</b> — jualan, stok,
            laporan, sampai karyawan gantian jaga kasir pakai PIN. Datanya tersimpan di HP itu saja. <b className="text-ink">Premium</b>: tokomu
            tersambung internet, jadi bisa dipakai di <b className="text-ink">beberapa HP sekaligus</b>, data tersimpan otomatis, dan kamu bisa
            cek toko dari rumah.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
            <p className="text-sm font-extrabold text-brand-deep">Cukup Lifetime bila…</p>
            <ul className="mt-2 space-y-1.5 text-sm text-body">
              <li>• kasirnya satu HP atau tablet</li>
              <li>• karyawan bergantian di HP yang sama</li>
              <li>• tidak perlu cek penjualan dari rumah</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-brand-press p-5 text-white">
            <p className="text-sm font-extrabold text-[#e3f4ea]">Tambah Premium bila…</p>
            <ul className="mt-2 space-y-1.5 text-sm text-[#e3f4ea]">
              <li>• kasirnya lebih dari satu HP/tablet</li>
              <li>• karyawan ingin masuk & absen dari HP sendiri</li>
              <li>• ingin cek toko dari rumah</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[28px] bg-white ring-1 ring-line">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col />
            <col className="w-[27%] sm:w-[22%]" />
            <col className="w-[27%] sm:w-[22%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-tint">
              <th className="px-4 py-4 text-sm font-extrabold text-muted sm:px-6">Fitur</th>
              <th className="px-2 py-4 text-center">
                <span className="block text-[15px] font-extrabold">Lifetime</span>
                <span className="block text-xs font-medium text-muted">{rupiah(site.hargaLifetime)} sekali</span>
              </th>
              <th className="px-2 py-4 text-center">
                <span className="block text-[15px] font-extrabold text-brand-deep">Premium</span>
                <span className="block text-xs font-medium text-muted">mulai {rupiah(site.hargaPremium["1 bulan"])}/bln</span>
              </th>
            </tr>
          </thead>
          {BANDING.map((g) => (
            <tbody key={g.grup}>
              <tr>
                <th colSpan={3} className="bg-white px-4 pt-6 pb-2 text-xs font-extrabold tracking-[0.12em] text-brand-deep uppercase sm:px-6">
                  {g.grup}
                </th>
              </tr>
              {g.baris.map(([nama, l, p, catatan]) => (
                <tr key={nama} className="border-t border-line/70">
                  <td className="px-4 py-3 text-[14px] text-body sm:px-6 sm:text-[15px]">
                    {nama}
                    {catatan && <span className="ml-1.5 text-xs text-muted">({catatan})</span>}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <SelPaket v={l} />
                  </td>
                  <td className="bg-brand-soft/40 px-2 py-3 text-center">
                    <SelPaket v={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Selama {site.hariUjiCoba} hari pertama, semua fitur di atas bisa dicoba gratis. Sudah punya Lifetime lalu butuh fitur Premium? Tinggal
        tambah langganan — Lifetime tetap milikmu. Daftar dan masuk pertama kali butuh internet.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ 7 · cara mulai */

function CaraMulai() {
  const langkah = [
    { judul: "Unduh dari Play Store", isi: "Gratis dan ringan. Bisa di HP maupun tablet Android." },
    { judul: "Daftar & isi nama toko", isi: "Cukup sekali di awal, butuh internet sebentar." },
    { judul: "Masukkan menu, langsung jualan", isi: "Transaksi pertama bisa dicatat hari ini juga." },
  ];
  return (
    <section className={`${wadah} py-24 lg:py-32`}>
      <Judul label="Cara mulai" tengah>
        Mulai jualan dalam 3 langkah.
      </Judul>
      <ol className="relative mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
        <span className="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-[#bcdccb] sm:block" aria-hidden />
        {langkah.map((l, i) => (
          <li key={l.judul} className="relative text-center">
            <span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-press text-xl font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(46,139,98,.8)] ring-8 ring-white">
              {i + 1}
            </span>
            <h3 className="mt-5 text-lg font-extrabold">{l.judul}</h3>
            <p className="mx-auto mt-1.5 max-w-[260px] text-[15px] text-body">{l.isi}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ 8 · tanya jawab */

const tanya = [
  { t: "Benar bisa dipakai tanpa internet?", j: "Ya. Semua fitur kasir, stok, dan laporan jalan tanpa internet. Internet hanya dibutuhkan saat daftar dan masuk pertama kali, serta untuk fitur Premium." },
  {
    t: "Apa bedanya Lifetime dan Premium?",
    j: "Lifetime: semua dikerjakan di satu HP, termasuk karyawan gantian jaga kasir pakai PIN. Datanya tersimpan di HP itu saja. Premium: toko tersambung internet, jadi bisa dipakai di beberapa HP sekaligus, data tersimpan otomatis, karyawan bisa masuk dari HP sendiri, dan kamu bisa cek penjualan dari rumah. Perbandingan lengkapnya ada di bagian Harga.",
  },
  {
    t: "Kalau punya karyawan, cukup Lifetime?",
    j: "Cukup, selama kasirnya satu HP. Tambah karyawan berapa pun; mereka gantian buka kasir dengan PIN masing-masing, dan uang laci serta penjualan tercatat per kasir. Premium baru perlu kalau kasirnya lebih dari satu HP, atau karyawan ingin masuk dan absen dari HP-nya sendiri.",
  },
  { t: "Kalau HP rusak atau hilang, datanya bagaimana?", j: "Pemilik Lifetime bisa mencadangkan data ke file di HP kapan saja; simpan salinannya di tempat aman, lalu pulihkan di HP baru. Dengan Premium, data tercadang otomatis ke cloud." },
  { t: "Bisa dipakai di dua HP sekaligus?", j: "Lifetime dipakai di satu HP, dan bisa dipindah ke HP baru kapan saja. Ingin dipakai di beberapa HP sekaligus? Tambahkan Premium." },
  { t: "Bisa cetak struk?", j: "Bisa. Struk bisa dicetak ke printer struk, atau dikirim langsung ke WhatsApp pembeli." },
  { t: "Bagaimana cara membayar?", j: "Dari halaman Paket di aplikasi: pilih paket, transfer sesuai instruksi, lalu konfirmasi lewat WhatsApp. Paket aktif setelah pembayaran dicatat." },
  { t: `Sampai kapan harga ${rupiah(site.hargaLifetime)}?`, j: "Harga promo berlaku untuk waktu terbatas. Yang sudah membeli Lifetime tidak dikenai biaya lagi untuk fitur yang termasuk dalam Lifetime." },
];

function TanyaJawab() {
  return (
    <section id="tanya" className="scroll-mt-20 bg-tint py-24 lg:py-32">
      <div className={`${wadah} grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Judul label="Tanya jawab" sub="Belum menemukan jawabannya? Tanyakan langsung, kami balas secepatnya.">
            Yang sering ditanyakan.
          </Judul>
          {site.whatsapp && (
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-brand-deep ring-1 ring-line hover:ring-brand">
              <IkonWhatsApp className="size-4" /> Tanya via WhatsApp
            </a>
          )}
          <Maskot src={berpikir} sizes="(min-width: 1024px) 280px, 46vw" className="mt-8 w-[46%] max-w-[280px] lg:w-[280px]" />
        </div>
        <div className="space-y-3">
          {tanya.map(({ t, j }) => (
            <details key={t} className="group rounded-2xl bg-white px-5 ring-1 ring-line open:ring-brand/40 sm:px-6">
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-[16px] font-extrabold">
                {t}
                <span className="inline-flex size-8 flex-none items-center justify-center rounded-full bg-tint text-brand-deep transition group-open:rotate-180 group-open:bg-brand-press group-open:text-white">
                  <ChevronDown className="size-4" aria-hidden />
                </span>
              </summary>
              <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-body">{j}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 9 · ajakan akhir */

function AjakanAkhir() {
  return (
    <section className="px-5 py-24 sm:px-8 lg:py-28">
      <div className="relative mx-auto grid max-w-6xl items-center overflow-hidden rounded-[36px] bg-brand-press px-6 pt-12 text-white sm:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:pt-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
        <div className="relative lg:py-16">
          <h2 className="text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">Warung lebih rapi, mulai hari ini.</h2>
          <p className="mt-4 max-w-md text-[17px] text-[#e3f4ea]">
            Coba {site.hariUjiCoba} hari gratis. Kalau cocok, cukup bayar sekali {rupiah(site.hargaLifetime)} — pakai selamanya.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TombolPlayStore varian="putih" />
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Halo Kasir Sakti, saya mau tanya tentang aplikasinya.")}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-base font-extrabold text-white ring-2 ring-white/40 transition hover:bg-white/10 hover:ring-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <IkonWhatsApp className="size-5" /> Tanya via WhatsApp
            </a>
          </div>
        </div>
        <Maskot src={lompat} sizes="(min-width: 1024px) 420px, 80vw" className="relative mx-auto mt-6 mb-8 w-[80%] max-w-[400px] lg:mt-10 lg:mb-10" />
      </div>
    </section>
  );
}

