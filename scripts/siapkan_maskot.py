"""Render maskot 3D (prototype/maskot3d/render/*.png) → src/assets/maskot/*.webp

    python3 kasir-sakti-web/scripts/siapkan_maskot.py

Bayangan dari shadow catcher Blender meninggalkan alfa tipis di seluruh lantai: alfa < 18 dibuang, lalu bayangan
dibatasi ke sekitar tubuh (masker area padat yang dilebarkan & dihaluskan) supaya tidak ada tepi kotak samar.
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "prototype/maskot3d/render"
OUT = Path(__file__).resolve().parents[1] / "src/assets/maskot"

for f in sorted(SRC.glob("*.png")):
    im = Image.open(f).convert("RGBA")
    r, g, b, a = im.split()
    a = a.point(lambda v: 0 if v < 18 else min(255, int((v - 18) * 255 / (255 - 18))))
    padat = a.point(lambda v: 255 if v > 60 else 0)
    masker = padat.filter(ImageFilter.MaxFilter(61)).filter(ImageFilter.GaussianBlur(28))
    a = ImageChops.multiply(a, masker)
    im = Image.merge("RGBA", (r, g, b, a))
    im = im.crop(a.point(lambda v: 255 if v > 3 else 0).getbbox())
    im.save(OUT / f"{f.stem}.webp", quality=86, method=6)
    print(f.stem, im.size)
