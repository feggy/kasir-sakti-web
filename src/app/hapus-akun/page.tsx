import type { Metadata } from "next";
import { ogDasar } from "@/seo";
import Link from "next/link";
import { Mail } from "lucide-react";
import { HalamanLegal } from "@/components/HalamanLegal";
import { IkonWhatsApp } from "@/components/ui";
import { site } from "@/site";

// URL ini didaftarkan di Play Console (Data safety → "Delete account URL"). Jangan dipindah.
export const metadata: Metadata = {
  title: "Hapus Akun — Kasir Sakti",
  description: "Cara meminta penghapusan akun Kasir Sakti beserta datanya, dan data apa saja yang dihapus.",
  alternates: { canonical: "/hapus-akun" },
  openGraph: { ...ogDasar, title: "Hapus Akun — Kasir Sakti", description: "Cara meminta penghapusan akun Kasir Sakti beserta datanya, dan data apa saja yang dihapus.", url: "/hapus-akun" },
};

const PESAN =
  "Halo Kasir Sakti, saya ingin MENGHAPUS AKUN saya.\n\nNama usaha: \nNama pemilik: \nNo. HP / email terdaftar: \n\nSaya mengerti akun dan datanya tidak bisa dikembalikan.";

export default function HapusAkun() {
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(PESAN)}`;
  const mail = `mailto:${site.email}?subject=${encodeURIComponent("Permintaan hapus akun Kasir Sakti")}&body=${encodeURIComponent(PESAN)}`;
  return (
    <HalamanLegal judul="Hapus Akun" berlaku="11 November 2026">
      <p>
        Kamu bisa meminta kami menghapus akun <b>Kasir Sakti</b> beserta data yang tersimpan di server kami. Halaman ini menjelaskan caranya,
        data apa yang dihapus, dan apa yang perlu kamu ketahui sebelum meminta.
      </p>

      <h2>Cara meminta penghapusan</h2>
      <p>Kirim permintaan dari <b>nomor HP atau email yang terdaftar</b> di akunmu, lewat salah satu jalur ini:</p>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        <a href={wa} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl bg-brand-press p-4 font-extrabold text-white no-underline hover:bg-brand-deep">
          <IkonWhatsApp className="size-6 flex-none" />
          <span>
            Minta lewat WhatsApp
            <span className="block text-sm font-medium text-[#e3f4ea]">Pesan sudah disiapkan</span>
          </span>
        </a>
        <a href={mail} className="flex items-center gap-3 rounded-2xl bg-tint p-4 font-extrabold text-ink no-underline ring-1 ring-line hover:ring-brand">
          <Mail className="size-6 flex-none text-brand-deep" aria-hidden />
          <span>
            Minta lewat email
            <span className="block text-sm font-medium break-all text-body">{site.email}</span>
          </span>
        </a>
      </div>
      <ol>
        <li>Sebutkan nama usaha, nama pemilik, dan nomor HP atau email yang terdaftar.</li>
        <li>Kami mencocokkan permintaan dengan data akun. Bila perlu, kami meminta konfirmasi tambahan untuk memastikan permintaan benar dari pemilik akun.</li>
        <li>Akun dihapus paling lambat <b>14 hari kerja</b> setelah terverifikasi, dan kami mengabarimu setelah selesai.</li>
      </ol>
      <p>Hanya pemilik akun yang bisa meminta penghapusan. Akun karyawan dihapus oleh pemilik usaha dari aplikasi.</p>

      <h2>Data yang dihapus</h2>
      <ul>
        <li>Data akun: nama usaha, nama pemilik, jenis usaha, nomor HP, email, dan kata sandi.</li>
        <li>Data usaha yang tersinkron ke server: produk, stok, transaksi, pelanggan dan kasbon, meja, shift, serta akun karyawan.</li>
        <li>Data perangkat dan token notifikasi yang terhubung ke akun.</li>
      </ul>

      <h2>Data yang tetap disimpan sementara</h2>
      <ul>
        <li>
          Catatan pembayaran paket (produk, nominal, tanggal) disimpan sesuai kewajiban pembukuan dan perpajakan yang berlaku, lalu dihapus
          setelah masa wajib simpannya berakhir.
        </li>
        <li>Salinan di cadangan sistem kami terhapus otomatis paling lambat 30 hari setelah akun dihapus.</li>
      </ul>

      <h2>Sebelum meminta, perhatikan</h2>
      <ul>
        <li>
          <b>Penghapusan tidak bisa dibatalkan.</b> Paket Lifetime dan sisa masa Premium melekat pada akun, jadi ikut hilang dan tidak dapat
          dikembalikan atau dipindahkan.
        </li>
        <li>
          Penghapusan akun hanya menghapus data di server kami; data yang tersimpan di HP-mu tetap ada. Untuk membersihkannya, hapus aplikasi Kasir Sakti dari HP atau hapus data
          aplikasi di pengaturan Android.
        </li>
        <li>Ingin menyimpan data usahamu? Buat cadangan atau ekspor laporan dari aplikasi sebelum meminta penghapusan.</li>
        <li>Hanya ingin menghapus sebagian data, misalnya data yang tersinkron ke cloud, tanpa menutup akun? Sampaikan saja lewat jalur yang sama.</li>
      </ul>

      <p>
        Penjelasan lengkap tentang data yang kami kumpulkan ada di <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>.
      </p>
    </HalamanLegal>
  );
}
