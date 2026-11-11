"""Panduan pemakaian dari aplikasi → situs (/panduan).

    python3 kasir-sakti-web/scripts/siapkan_panduan.py

Sumber tunggal = aplikasi, supaya isi situs sama dengan halaman Bantuan di app:
- teks: kasir-sakti-app/lib/l10n/arb/app_id.arb (kunci help<Artikel>Title/Body, helpTopic<Topik>)
- urutan topik, artikel per topik, "paling sering dibaca": lib/features/help/models/help_content.dart
- gambar: kasir-sakti-app/build/shots (render_screens_test.dart) — dipasangkan manual di GAMBAR

Hasil: src/data/panduan.json + public/panduan/*.webp
"""

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "kasir-sakti-app"
SHOTS = APP / "build/shots"
WEB = Path(__file__).resolve().parents[1]

# Artikel yang tidak ditampilkan di web (alasan di sebelahnya).
LEWATI = {
    "rejected": "teks masih menyebut 'slot booking' (sisa fitur penyewaan Sissi)",
    # Fitur dimatikan di app (BacklogFlags.selfOrder / BacklogFlags.kitchen) — tampilkan lagi saat dinyalakan.
    "selfOrderQueue": "Pesanan QR belum dijual (BacklogFlags.selfOrder)",
    "selfOrderSetup": "Pesan & Bayar Mandiri belum dijual (BacklogFlags.selfOrder)",
    "readyOrders": "Dapur/siap diantar belum dijual (BacklogFlags.kitchen)",
}

# artikel → screenshot (build/shots). guide_paket TIDAK dipakai: masih harga Lifetime lama Rp199.000.
GAMBAR = {
    "setup": "tablet_p10_home.png",
    "checkout": "../../../prototype/app-shots/tablet_tx_cashier.png",
    "selfOrderQueue": "guide_pesanan_qr_tablet.png",
    "selfOrderSetup": "guide_pesan_mandiri_tablet.png",
    "readyOrders": "guide_siap_diantar_tablet.png",
    "printer": "guide_bluetooth_printer_tablet.png",
    "receiptCopy": "guide_struk_salinan_tablet.png",
    "lock": "guide_kunci_otomatis_tablet.png",
    "shift": "tablet_shift_panel.png",
    "cash": "guide_team_cash_void_tablet.png",
    "team": "guide_team_att_via_tablet.png",
    "products": "guide_out_bundle_tablet.png",
    "stock": "tablet_prd_stock.png",
    "productImport": "guide_impor_csv_tablet.png",
    "password": "guide_ganti_password_tablet.png",
    "notifications": "guide_notifikasi_pengaturan_tablet.png",
}

PITA = (234, 241, 254)  # pita "Status paket belum diperiksa" (sama dengan siapkan_layar.py)


def dekat(c, ref, tol=6):
    return all(abs(a - b) <= tol for a, b in zip(c, ref))


def potong_pita(im):
    """Baris yang ≥60% pikselnya berwarna pita = pita; tablet dipotong tepat di atasnya (3 px tepi atas ikut)."""
    w, h = im.size
    px = im.load()
    rows = [y for y in range(h) if sum(dekat(px[x, y], PITA) for x in range(0, w, 4)) >= 0.6 * (w / 4)]
    return im.crop((0, 0, w, max(0, min(rows) - 3))) if rows else im


def kebab(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    arb = json.loads((APP / "lib/l10n/arb/app_id.arb").read_text())
    dart = (APP / "lib/features/help/models/help_content.dart").read_text()

    topik = re.findall(r"^\s+(\w+)\(LucideIcons\.(\w+)\)[,;]", dart, re.M)
    artikel = re.findall(r"^\s+(\w+)\(HelpTopic\.(\w+)\)[,;]", dart, re.M)
    populer = re.search(r"static const popular = \[(.*?)\];", dart, re.S).group(1)
    populer = [p.strip() for p in populer.split(",") if p.strip()]
    cap = lambda s: s[0].upper() + s[1:]

    out_img = WEB / "public/panduan"
    out_img.mkdir(parents=True, exist_ok=True)
    data = {"topik": [], "artikel": [], "populer": []}
    slug_of = {}
    for t, ikon in topik:
        data["topik"].append({"id": t, "judul": arb[f"helpTopic{cap(t)}"], "ikon": ikon})
    for a, t in artikel:
        if a in LEWATI:
            continue
        judul = arb[f"help{cap(a)}Title"]
        slug = kebab(judul)
        slug_of[a] = slug
        item = {"slug": slug, "topik": t, "judul": judul, "isi": arb[f"help{cap(a)}Body"]}
        if a in GAMBAR:
            src = (SHOTS / GAMBAR[a]).resolve()
            im = potong_pita(Image.open(src).convert("RGB"))
            im.save(out_img / f"{slug}.webp", quality=90, method=6)
            item["gambar"] = {"src": f"/panduan/{slug}.webp", "w": im.width, "h": im.height}
        data["artikel"].append(item)
    data["populer"] = [slug_of[p] for p in populer if p in slug_of]
    # topik tanpa artikel (semua dilewati) tidak ditampilkan
    data["topik"] = [t for t in data["topik"] if any(a["topik"] == t["id"] for a in data["artikel"])]

    (WEB / "src/data").mkdir(exist_ok=True)
    (WEB / "src/data/panduan.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print(len(data["topik"]), "topik,", len(data["artikel"]), "artikel,", sum("gambar" in a for a in data["artikel"]), "gambar")


main()
