import type { MetadataRoute } from "next";
import { artikel } from "@/panduan";
import { site } from "@/site";

/** Tanggal terakhir isi situs diubah (perbarui saat teks/harga berubah). */
const diperbarui = new Date("2026-11-11");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: diperbarui, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/panduan`, lastModified: diperbarui, changeFrequency: "monthly", priority: 0.7 },
    ...artikel.map((a) => ({ url: `${site.url}/panduan/${a.slug}`, lastModified: diperbarui, changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${site.url}/kontak`, lastModified: diperbarui, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}/kebijakan-privasi`, lastModified: diperbarui, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/syarat-ketentuan`, lastModified: diperbarui, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/hapus-akun`, lastModified: diperbarui, changeFrequency: "yearly", priority: 0.2 },
  ];
}
