import Image, { type StaticImageData } from "next/image";
import berpikir from "@/assets/maskot/berpikir.webp";
import cari from "@/assets/maskot/cari.webp";
import dasar from "@/assets/maskot/dasar.webp";
import koin from "@/assets/maskot/koin.webp";
import laporan from "@/assets/maskot/laporan.webp";
import melambai from "@/assets/maskot/melambai.webp";
import offline from "@/assets/maskot/offline.webp";
import pusing from "@/assets/maskot/pusing.webp";

// Maskot Kasir Sakti (pose 3D yang sama dengan situs & aplikasi) untuk keadaan kosong, galat, dan layar masuk.

const POSES = { berpikir, cari, dasar, koin, laporan, melambai, offline, pusing } satisfies Record<string, StaticImageData>;
export type MaskotPose = keyof typeof POSES;

/** `size` = tinggi dalam px; lebar mengikuti rasio gambar. Dekoratif (alt kosong). */
export function Maskot({ pose, size = 96, className = "", priority }: { pose: MaskotPose; size?: number; className?: string; priority?: boolean }) {
  const img = POSES[pose];
  return (
    <Image
      src={img}
      alt=""
      aria-hidden
      priority={priority}
      height={size}
      width={Math.round((img.width / img.height) * size)}
      className={`h-auto select-none ${className}`}
      style={{ height: size, width: "auto" }}
    />
  );
}
