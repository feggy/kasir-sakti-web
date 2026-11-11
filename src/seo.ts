import { site } from "@/site";

/** Bagian openGraph yang sama untuk semua halaman. Metadata Next tidak menggabung openGraph induk & anak,
 *  jadi halaman yang menulis openGraph sendiri wajib menyebarkan ini supaya gambar pratinjau tidak hilang. */
export const ogDasar = {
  locale: "id_ID",
  type: "website" as const,
  siteName: site.nama,
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kasir Sakti — kasir warung yang tetap jalan tanpa internet, Rp145.000 sekali bayar" }],
};
