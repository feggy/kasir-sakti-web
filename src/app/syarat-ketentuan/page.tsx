import Link from "next/link";
import type { Metadata } from "next";
import { ogDasar } from "@/seo";
import { HalamanLegal } from "@/components/HalamanLegal";
import { rupiah, site } from "@/site";

// Alamat ini dipakai aplikasi (kasir-sakti-app: Env.termsUrl) — jangan diganti tanpa mengubah aplikasi.
export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Kasir Sakti",
  description: "Aturan pemakaian aplikasi Kasir Sakti: akun, paket Lifetime dan Premium, pembayaran, dan tanggung jawab.",
  alternates: { canonical: "/syarat-ketentuan" },
  openGraph: { ...ogDasar, title: "Syarat & Ketentuan — Kasir Sakti", description: "Aturan pemakaian aplikasi Kasir Sakti: akun, paket Lifetime dan Premium, pembayaran, dan tanggung jawab.", url: "/syarat-ketentuan" },
};

export default function SyaratKetentuan() {
  const wa = `https://wa.me/${site.whatsapp}`;
  return (
    <HalamanLegal judul="Syarat & Ketentuan" berlaku="11 November 2026">
      <p>
        Syarat ini mengatur pemakaian aplikasi <b>Kasir Sakti</b> yang dikembangkan oleh <b>{site.pembuat}</b> (&quot;kami&quot;). Dengan membuat
        akun atau memakai aplikasi, kamu menyetujui syarat ini dan <Link href="/kebijakan-privasi">Kebijakan Privasi</Link> kami.
      </p>

      <h2>1. Akun</h2>
      <ul>
        <li>Kamu wajib memberi data yang benar saat mendaftar dan menjaga kerahasiaan kata sandi serta PIN.</li>
        <li>Satu akun mewakili satu usaha. Kamu bertanggung jawab atas aktivitas yang terjadi di akunmu, termasuk oleh karyawan yang kamu tambahkan.</li>
        <li>Pendaftaran dan masuk pertama kali membutuhkan koneksi internet.</li>
      </ul>

      <h2>2. Masa uji coba</h2>
      <p>
        Akun baru mendapat masa uji coba gratis {site.hariUjiCoba} hari dengan semua fitur, termasuk fitur Premium. Setelah masa uji coba
        berakhir, pilih paket Lifetime atau Premium untuk terus memakai fitur yang sesuai.
      </p>

      <h2>3. Paket dan harga</h2>
      <h3>Lifetime</h3>
      <ul>
        <li>
          Sekali bayar untuk memakai semua fitur yang berjalan di satu perangkat tanpa server (penjualan, struk, produk, stok, laporan, meja,
          open bill, voucher, serta karyawan yang bergantian dengan PIN) tanpa biaya bulanan dan tanpa internet.
        </li>
        <li>Lisensi melekat pada akun dan berlaku untuk satu perangkat aktif. Masuk di perangkat baru akan menonaktifkan perangkat sebelumnya.</li>
        <li>
          &quot;Selamanya&quot; berarti selama aplikasi Kasir Sakti masih dioperasikan oleh kami. Pemilik Lifetime tidak dikenai biaya lagi untuk
          fitur kasir yang termasuk dalam paket.
        </li>
      </ul>
      <h3>Premium</h3>
      <ul>
        <li>Langganan berjangka (1, 6, atau 12 bulan) untuk fitur yang butuh server: sinkron, banyak perangkat, akun karyawan di HP pribadi, cadangan cloud, notifikasi, dan pantau dari jauh.</li>
        <li>Premium bisa digabung dengan Lifetime. Jika Premium berakhir, fitur online terkunci kembali; data di perangkat tetap ada.</li>
        <li>Premium tanpa Lifetime: setelah masa aktif dan masa tenggang berakhir, aplikasi masuk mode baca-saja sampai paket diperpanjang.</li>
      </ul>
      <h3>Harga</h3>
      <p>
        Harga yang berlaku adalah harga yang tampil di halaman Paket di aplikasi saat kamu membeli. Harga promo Lifetime saat ini{" "}
        {rupiah(site.hargaLifetime)} (normal {rupiah(site.hargaLifetimeNormal)}) berlaku untuk waktu terbatas. Perubahan harga tidak berlaku surut
        untuk paket yang sudah dibayar.
      </p>

      <h2>4. Pembayaran</h2>
      <ul>
        <li>Pembayaran dilakukan lewat transfer ke rekening yang tertera di aplikasi, lalu dikonfirmasi melalui WhatsApp dengan kode pesanan.</li>
        <li>Paket aktif setelah pembayaran kami terima dan catat.</li>
        <li>
          Karena tersedia masa uji coba gratis, pembayaran yang sudah diterima tidak dapat dikembalikan, kecuali terjadi kesalahan
          pembayaran (misalnya bayar ganda) atau diwajibkan oleh hukum.
        </li>
      </ul>

      <h2>5. Data dan cadangan</h2>
      <ul>
        <li>Data usaha adalah milikmu. Kami tidak mengklaim kepemilikan atas data yang kamu masukkan.</li>
        <li>
          Pada paket Lifetime, data tersimpan di perangkat. Kamu bertanggung jawab membuat cadangan secara berkala dan menyimpannya di tempat
          aman. Kami tidak dapat memulihkan data yang hilang karena perangkat rusak, hilang, atau aplikasi dihapus tanpa cadangan.
        </li>
        <li>Dengan Premium, data dicadangkan otomatis ke server selama paket aktif.</li>
      </ul>

      <h2>6. Pemakaian yang dilarang</h2>
      <ul>
        <li>Memakai aplikasi untuk kegiatan yang melanggar hukum, termasuk mencatat transaksi barang terlarang.</li>
        <li>Membongkar, menyalin, atau memodifikasi aplikasi, atau mencoba membobol sistem lisensi.</li>
        <li>Membagikan atau menjual ulang akun dan lisensi kepada pihak lain.</li>
      </ul>
      <p>Kami dapat menangguhkan akun yang melanggar ketentuan ini.</p>

      <h2>7. Batasan tanggung jawab</h2>
      <ul>
        <li>
          Aplikasi disediakan &quot;sebagaimana adanya&quot;. Kami berusaha agar aplikasi bekerja dengan baik, tetapi tidak menjamin bebas dari
          gangguan atau kesalahan.
        </li>
        <li>
          Laporan dan perhitungan di aplikasi adalah alat bantu. Kamu tetap bertanggung jawab atas pembukuan, pajak, dan kewajiban usahamu.
        </li>
        <li>
          Sejauh diizinkan hukum, tanggung jawab kami atas kerugian yang timbul dari pemakaian aplikasi terbatas pada jumlah yang kamu bayarkan
          kepada kami dalam 12 bulan terakhir.
        </li>
      </ul>

      <h2>8. Perubahan layanan dan syarat</h2>
      <p>
        Kami dapat memperbarui aplikasi dan syarat ini. Perubahan penting akan diberitahukan lewat aplikasi atau situs ini. Dengan tetap memakai
        aplikasi setelah perubahan berlaku, kamu menyetujui syarat yang baru.
      </p>

      <h2>9. Hukum yang berlaku</h2>
      <p>
        Syarat ini tunduk pada hukum Republik Indonesia. Perselisihan diselesaikan lebih dulu secara musyawarah; jika tidak tercapai, melalui
        jalur hukum yang berlaku di Indonesia.
      </p>

      <h2>10. Hubungi kami</h2>
      <p>
        Pertanyaan tentang syarat ini bisa dikirim ke {site.pembuat} lewat <a href={wa}>WhatsApp</a> atau email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. Alamat dan jalur lain ada di halaman <Link href="/kontak">Kontak</Link>.
      </p>
    </HalamanLegal>
  );
}
