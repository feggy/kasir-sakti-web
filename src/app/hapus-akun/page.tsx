import type { Metadata } from "next";
import { ogDasar } from "@/seo";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FormHapusAkun } from "@/components/FormHapusAkun";
import { HalamanLegal } from "@/components/HalamanLegal";
import { IkonWhatsApp } from "@/components/ui";
import { site } from "@/site";

// URL ini didaftarkan di Play Console (Data safety → "Delete account URL"). Jangan dipindah.
export const metadata: Metadata = {
  title: "Hapus Akun — Kasir Sakti",
  description: "Cara menghapus akun Kasir Sakti beserta datanya — dari aplikasi atau langsung dari halaman ini — dan data apa saja yang dihapus.",
  alternates: { canonical: "/hapus-akun" },
  openGraph: { ...ogDasar, title: "Hapus Akun — Kasir Sakti", description: "Cara menghapus akun Kasir Sakti beserta datanya — dari aplikasi atau langsung dari halaman ini — dan data apa saja yang dihapus.", url: "/hapus-akun" },
};

const PESAN =
  "Halo Kasir Sakti, saya butuh bantuan untuk MENGHAPUS AKUN saya.\n\nNama usaha: \nNama pemilik: \nNo. HP / email terdaftar: \nKendala: ";

export default function HapusAkun() {
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(PESAN)}`;
  const mail = `mailto:${site.email}?subject=${encodeURIComponent("Bantuan hapus akun Kasir Sakti")}&body=${encodeURIComponent(PESAN)}`;
  return (
    <HalamanLegal judul="Hapus Akun" berlaku="13 November 2026">
      <p>
        Kamu bisa menghapus akun <b>Kasir Sakti</b> beserta data yang tersimpan di server kami, dari aplikasi maupun dari halaman ini tanpa
        memasang aplikasi. Halaman ini menjelaskan caranya, data apa yang dihapus, dan apa yang perlu kamu ketahui sebelumnya.
      </p>

      <h2>Sebelum menghapus, perhatikan</h2>
      <ul>
        <li>
          <b>Paket Lifetime dan sisa masa Premium hangus.</b> Keduanya melekat pada akun, jadi ikut hilang dan tidak dapat dikembalikan,
          diuangkan, atau dipindahkan.
        </li>
        <li>
          Penghapusan akun hanya menghapus data di server kami; data yang tersimpan di HP-mu tetap ada. Untuk membersihkannya, hapus aplikasi Kasir Sakti dari HP atau hapus data
          aplikasi di pengaturan Android.
        </li>
        <li>Ingin menyimpan data usahamu? Buat cadangan atau ekspor laporan dari aplikasi sebelum menghapus akun.</li>
        <li>Hanya ingin menghapus sebagian data, misalnya data yang tersinkron ke cloud, tanpa menutup akun? Hubungi kami lewat WhatsApp atau email (lihat “Butuh bantuan?” di bawah).</li>
      </ul>

      <h2>Cara 1 — dari aplikasi</h2>
      <ol>
        <li>Buka aplikasi Kasir Sakti dan masuk sebagai pemilik usaha.</li>
        <li>
          Buka <b>Pengaturan › Akun › Hapus akun</b>.
        </li>
        <li>Masukkan kode 6 digit yang kami kirim ke email akunmu, lalu konfirmasi.</li>
      </ol>

      <h2>Cara 2 — dari halaman ini</h2>
      <ol>
        <li>Isi email atau nomor HP akun pemilik, lalu tekan <b>Kirim kode konfirmasi</b>.</li>
        <li>Kami mengirim kode 6 digit ke <b>email akun</b> (berlaku 5 menit). Masukkan kode itu di bawah, lalu tekan <b>Hapus akun saya</b>.</li>
      </ol>
      <FormHapusAkun />

      <h2>Setelah dikonfirmasi</h2>
      <ul>
        <li>
          Akun dan seluruh data usahanya dihapus <b>permanen 14 hari</b> setelah konfirmasi. Semua perangkat yang memakai akun ini langsung
          dikeluarkan, dan kami mengirim email berisi tanggal penghapusan.
        </li>
        <li>
          <b>Berubah pikiran?</b> Masuk lagi ke aplikasi dengan akun pemilik sebelum tanggal itu — penghapusan otomatis dibatalkan.
        </li>
        <li>Setelah tanggal itu lewat, akun dan data tidak bisa dipulihkan.</li>
      </ul>
      <p>Hanya pemilik usaha yang bisa menghapus akun. Akun karyawan dihapus oleh pemilik usaha dari aplikasi.</p>

      <h2>Butuh bantuan?</h2>
      <p>Tidak menerima email, lupa email akun, atau ada kendala lain? Hubungi kami dari nomor HP atau email yang terdaftar di akunmu.</p>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        <a href={wa} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl bg-brand-press p-4 font-extrabold text-white no-underline hover:bg-brand-deep">
          <IkonWhatsApp className="size-6 flex-none" />
          <span>
            Tanya lewat WhatsApp
            <span className="block text-sm font-medium text-[#e3f4ea]">Pesan sudah disiapkan</span>
          </span>
        </a>
        <a href={mail} className="flex items-center gap-3 rounded-2xl bg-tint p-4 font-extrabold text-ink no-underline ring-1 ring-line hover:ring-brand">
          <Mail className="size-6 flex-none text-brand-deep" aria-hidden />
          <span>
            Tanya lewat email
            <span className="block text-sm font-medium break-all text-body">{site.email}</span>
          </span>
        </a>
      </div>

      <h2>Data yang dihapus</h2>
      <ul>
        <li>Data akun: nama usaha, nama pemilik, jenis usaha, nomor HP, email, dan kata sandi.</li>
        <li>Data usaha yang tersinkron ke server: produk, stok, transaksi, pelanggan dan kasbon, meja, shift, serta akun karyawan.</li>
        <li>Data perangkat dan token notifikasi yang terhubung ke akun.</li>
      </ul>

      <h2>Data yang tetap disimpan</h2>
      <ul>
        <li>
          Bukti pembayaran paket (nama usaha, produk, periode, nominal, metode, dan waktu bayar) disimpan terpisah sesuai kewajiban
          pembukuan dan perpajakan — tanpa email, nomor HP, atau data usaha lainnya.
        </li>
        <li>
          Salinan cadangan sistem kami hanya dipakai untuk memulihkan layanan bila terjadi gangguan, dan ikut terhapus saat cadangan lama
          dibuang sesuai jadwal penyimpanan cadangan.
        </li>
      </ul>

      <p>
        Penjelasan lengkap tentang data yang kami kumpulkan ada di <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>.
      </p>
    </HalamanLegal>
  );
}
