"""Siapkan screenshot aplikasi untuk landing page → src/assets/layar/*.webp

    python3 kasir-sakti-web/scripts/siapkan_layar.py

Sumber: hasil `kasir-sakti-app/tool/render_screens_test.dart` (build/shots) dan prototype/app-shots.
Pita "Status paket belum diperiksa" (latar #EAF1FE) dibuang: di HP barisnya dihapus (navigasi bawah naik),
di tablet gambar dipotong tepat di atas pita.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SHOTS = ROOT / "kasir-sakti-app/build/shots"
PROTO = ROOT / "prototype/app-shots"
OUT = Path(__file__).resolve().parents[1] / "src/assets/layar"

PITA = (234, 241, 254)

SUMBER = {
    "tablet-kasir": PROTO / "tablet_tx_cashier.png",
    "tablet-laporan": SHOTS / "tablet_rpt_reports.png",
    "tablet-beranda": SHOTS / "tablet_p10_home.png",
    "hp-kasir": PROTO / "phone_tx_cashier.png",
    "hp-berhasil": SHOTS / "phone_tx_success.png",
    "hp-laporan": SHOTS / "phone_rpt_reports.png",
    "hp-meja": SHOTS / "meja_hp_1x.png",
    "hp-perhatian": SHOTS / "phone_inv_home_attention.png",
}


def dekat(c, ref, tol=6):
    return all(abs(a - b) <= tol for a, b in zip(c, ref))


def baris_pita(im):
    """Indeks baris yang ≥60% pikselnya berwarna pita, plus tepi atas pita (1–3 baris lebih gelap)."""
    w, h = im.size
    px = im.load()
    rows = [y for y in range(h) if sum(dekat(px[x, y], PITA) for x in range(0, w, 4)) >= 0.6 * (w / 4)]
    if not rows:
        return []
    top, bot = min(rows), max(rows)
    return list(range(max(0, top - 3), bot + 2))


def bersihkan(nama, im):
    rows = baris_pita(im)
    if not rows:
        return im
    if nama.startswith("tablet"):
        # pita di tablet menempel di bawah (kanan sidebar): potong
        return im.crop((0, 0, im.width, rows[0]))
    keep = [y for y in range(im.height) if y not in set(rows)]
    out = Image.new("RGB", (im.width, len(keep)))
    for i, y in enumerate(keep):
        out.paste(im.crop((0, y, im.width, y + 1)), (0, i))
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for nama, src in SUMBER.items():
        im = bersihkan(nama, Image.open(src).convert("RGB"))
        im.save(OUT / f"{nama}.webp", quality=92, method=6)
        print(nama, im.size)


main()
