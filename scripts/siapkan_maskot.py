"""Pose maskot 3D (prototype/maskot3d/pose/web/*.png) → src/assets/maskot/*.webp

    /tmp/ks-fontvenv/bin/python kasir-sakti-web/scripts/siapkan_maskot.py   (butuh pillow)

Sumber = maskot berkacamata hasil generate pemilik (2026-11-13), latar putihnya sudah dipotong jadi transparan oleh
prototype/generator/potong_pose.py. Di sini hanya diperkecil (sisi terpanjang 900 px, cukup untuk tampilan ±450 px
@2×) dan dikompres ke WebP.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "prototype/maskot3d/pose/web"
OUT = Path(__file__).resolve().parents[1] / "src/assets/maskot"
SISI = 900

for f in sorted(SRC.glob("*.png")):
    im = Image.open(f).convert("RGBA")
    im.thumbnail((SISI, SISI), Image.LANCZOS)
    im.save(OUT / f"{f.stem}.webp", quality=84, method=6)
    print(f.stem, im.size, (OUT / f"{f.stem}.webp").stat().st_size // 1024, "KB")
