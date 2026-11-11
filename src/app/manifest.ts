import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kasir Sakti",
    short_name: "Kasir Sakti",
    description: "Aplikasi kasir warung yang tetap jalan tanpa internet.",
    start_url: "/",
    display: "browser",
    background_color: "#f3faf6",
    theme_color: "#2e8b62",
    icons: [
      { src: "/ikon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/ikon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
