import Link from "next/link";
import type { Metadata } from "next";
import { ogDasar } from "@/seo";
import { HalamanLegal } from "@/components/HalamanLegal";
import { site } from "@/site";

// Alamat ini dipakai aplikasi (kasir-sakti-app: Env.privacyUrl) — jangan diganti tanpa mengubah aplikasi.
export const metadata: Metadata = {
  title: "Kebijakan Privasi — Kasir Sakti",
  description: "Data apa yang dikumpulkan aplikasi Kasir Sakti, untuk apa, dan bagaimana kamu mengendalikannya.",
  alternates: { canonical: "/kebijakan-privasi" },
  openGraph: { ...ogDasar, title: "Kebijakan Privasi — Kasir Sakti", description: "Data apa yang dikumpulkan aplikasi Kasir Sakti, untuk apa, dan bagaimana kamu mengendalikannya.", url: "/kebijakan-privasi" },
};

export default function KebijakanPrivasi() {
  const wa = `https://wa.me/${site.whatsapp}`;
  return (
    <HalamanLegal judul="Kebijakan Privasi" berlaku="11 November 2026">
      <p>
        Kebijakan ini menjelaskan data apa yang dikumpulkan oleh aplikasi <b>Kasir Sakti</b> dan situs kasirsakti.id, untuk apa data itu
        dipakai, dan bagaimana kamu bisa mengendalikannya. Kasir Sakti dikembangkan dan dikelola oleh <b>{site.pembuat}</b> (&quot;kami&quot;).
      </p>
      <p>
        Prinsip kami sederhana: data usahamu adalah milikmu. Sebagian besar data disimpan di perangkatmu sendiri, dan kami tidak menjual data
        kepada siapa pun.
      </p>

      <h2>1. Data yang kami kumpulkan</h2>
      <h3>Data akun</h3>
      <p>Saat mendaftar, kami menyimpan di server: nama usaha, nama pemilik, jenis usaha, nomor HP, alamat email, dan kata sandi.</p>
      <ul>
        <li>Kata sandi disimpan dalam bentuk hash satu arah, bukan teks asli.</li>
        <li>Jika kamu daftar atau masuk dengan akun Google, kami menerima nama dan alamat email dari akun Google tersebut.</li>
      </ul>

      <h3>Data usaha</h3>
      <p>
        Produk, stok, transaksi, pelanggan dan kasbon, meja, shift, serta data karyawan yang kamu masukkan disimpan <b>di perangkatmu</b>.
      </p>
      <ul>
        <li>
          Selama masa uji coba dan selama paket Premium aktif, data ini juga dikirim ke server kami agar bisa disinkronkan antarperangkat,
          dicadangkan otomatis, dan dipantau dari jauh.
        </li>
        <li>Pada paket Lifetime tanpa Premium, data usaha tidak dikirim ke server. Cadangan dibuat sebagai file di perangkatmu.</li>
      </ul>

      <h3>Data perangkat dan paket</h3>
      <p>
        Kami mencatat pengenal perangkat dan status paket (uji coba, Lifetime, Premium) untuk menjalankan aturan satu perangkat aktif dan
        memeriksa masa berlaku paket.
      </p>

      <h3>Notifikasi</h3>
      <p>
        Jika kamu mengizinkan notifikasi, aplikasi mendaftarkan token notifikasi melalui Firebase Cloud Messaging (Google) agar kami bisa
        mengirim pemberitahuan, misalnya selisih kas saat tutup kasir atau stok menipis.
      </p>

      <h3>Izin perangkat</h3>
      <ul>
        <li>
          <b>Kamera</b> — untuk memindai barcode dan kode QRIS, serta memotret produk. Foto hanya diambil saat kamu menekan tombolnya.
        </li>
        <li>
          <b>Bluetooth</b> — untuk menyambung ke printer struk. Android mewajibkan izin lokasi untuk memindai perangkat Bluetooth; izin itu
          tidak kami pakai untuk melacak lokasimu.
        </li>
        <li>
          <b>Lokasi</b> — hanya dipakai jika pemilik mengaktifkan absensi karyawan berbasis lokasi. Lokasi dibaca sekali saat karyawan
          absen masuk atau pulang, bukan terus-menerus.
        </li>
        <li>
          <b>Penyimpanan</b> — untuk menyimpan file cadangan dan hasil ekspor laporan di perangkat.
        </li>
      </ul>

      <h3>Pembayaran paket</h3>
      <p>
        Pembayaran dilakukan lewat transfer bank dan dikonfirmasi melalui WhatsApp. Kami mencatat produk yang dibeli, nominal, dan tanggal
        pembayaran. Kami tidak menyimpan nomor kartu atau data rekening lengkapmu.
      </p>

      <h2>2. Untuk apa data dipakai</h2>
      <ul>
        <li>Membuat dan mengamankan akunmu, termasuk verifikasi saat masuk.</li>
        <li>Menjalankan fitur aplikasi: sinkron, cadangan cloud, akun karyawan, dan notifikasi.</li>
        <li>Mengelola paket dan memproses pembayaran.</li>
        <li>Membantu saat kamu menghubungi kami untuk bantuan.</li>
        <li>Memperbaiki masalah teknis dan menjaga keamanan layanan.</li>
      </ul>
      <p>Kami tidak memakai data usahamu untuk iklan dan tidak menampilkan iklan di aplikasi.</p>

      <h2>3. Berbagi data dengan pihak lain</h2>
      <p>Kami tidak menjual atau menyewakan data. Data hanya diproses oleh pihak yang membantu kami menjalankan layanan:</p>
      <ul>
        <li>Penyedia server dan basis data tempat akun serta data sinkron disimpan.</li>
        <li>Google, untuk masuk dengan akun Google dan Firebase Cloud Messaging (notifikasi).</li>
        <li>Pihak berwenang, hanya jika diwajibkan oleh hukum yang berlaku di Indonesia.</li>
      </ul>
      <p>Struk yang kamu kirim lewat WhatsApp dikirim langsung dari perangkatmu ke penerima yang kamu pilih.</p>

      <h2>4. Penyimpanan dan keamanan</h2>
      <ul>
        <li>Data di server dikirim melalui koneksi terenkripsi (HTTPS).</li>
        <li>
          Data di perangkat tersimpan di penyimpanan aplikasi. Jaga perangkatmu dengan kunci layar, dan aktifkan PIN kasir di aplikasi bila
          perangkat dipakai bersama.
        </li>
        <li>Data akun disimpan selama akunmu aktif. Data sinkron disimpan selama paket uji coba atau Premium berjalan, ditambah masa tenggang.</li>
      </ul>

      <h2>5. Hak kamu</h2>
      <p>Sesuai Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, kamu berhak untuk:</p>
      <ul>
        <li>meminta salinan data pribadimu;</li>
        <li>memperbaiki data yang tidak akurat;</li>
        <li>meminta penghapusan akun beserta data yang tersimpan di server kami;</li>
        <li>menarik persetujuan, misalnya mematikan izin notifikasi atau lokasi di pengaturan perangkat.</li>
      </ul>
      <p>
        Untuk meminta penghapusan akun atau data, ikuti langkah di halaman <Link href="/hapus-akun">Hapus Akun</Link> atau hubungi kami
        lewat <a href={wa}>WhatsApp</a> dari nomor yang terdaftar. Kami memproses permintaan paling lambat 14 hari kerja. Data yang tersimpan di perangkatmu bisa kamu hapus sendiri dengan menghapus aplikasi.
      </p>

      <h2>6. Situs kasirsakti.id</h2>
      <p>
        Situs ini tidak memakai cookie pelacak atau alat analitik, dan tidak memiliki formulir. Penyedia hosting situs dapat mencatat log
        teknis standar (alamat IP, jenis peramban, waktu akses) untuk keamanan dan menjaga situs tetap berjalan.
      </p>

      <h2>7. Anak-anak</h2>
      <p>Kasir Sakti ditujukan untuk pelaku usaha dewasa dan tidak ditujukan untuk anak di bawah 17 tahun.</p>

      <h2>8. Perubahan kebijakan</h2>
      <p>
        Jika kebijakan ini berubah, kami memperbarui tanggal berlaku di atas. Untuk perubahan penting, kami juga memberi tahu lewat aplikasi.
      </p>

      <h2>9. Hubungi kami</h2>
      <p>
        Pertanyaan tentang privasi bisa dikirim ke {site.pembuat} lewat <a href={wa}>WhatsApp</a> atau email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. Alamat dan jalur lain ada di halaman <Link href="/kontak">Kontak</Link>.
      </p>
    </HalamanLegal>
  );
}
