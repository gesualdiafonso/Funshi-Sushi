"""
Brand assets as SVG with the text converted to outlines (dev-time only).

Favicons, app icons and the social share image are shown by browsers, phones
and link previews that can't load the site's web fonts, so any text in them
must be drawn as paths. This script reads the self-hosted brand fonts and
writes:

  favicon.svg                         browser tab icon (scales cleanly)
  assets/brand/icon.svg               square app icon source (PNG sizes from it)
  assets/brand/icon-maskable.svg      full-bleed version for Android's masks
  assets/brand/og-overlay.svg         wordmark layer of the share image

Then `node tools/build-icons.mjs` rasterizes them (PNG, ICO, JPEG).

    python3 tools/brand_assets.py

Needs fontTools + brotli (pip install fonttools brotli).
"""

from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "assets" / "fonts"
MINCHO = FONTS / "shippori-mincho-b1-latin-600-normal.woff2"
GOTHIC = FONTS / "zen-kaku-gothic-new-latin-500-normal.woff2"

# BRAND_GUIDELINES §3
URUSHI = "#240910"
AKAMI = "#4B011D"
SHARI = "#F2EEE8"
KINARI = "#B8A994"


def text_path(font_path, text, size, x, baseline, tracking=0.0, anchor="start"):
    """SVG path data for `text` set at `size` px, baseline at y=`baseline`.
    tracking: extra space between letters, in em. anchor: start|middle."""
    font = TTFont(font_path)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    names = [cmap[ord(ch)] for ch in text]
    advances = [font["hmtx"][n][0] * scale + tracking * size for n in names]
    width = sum(advances) - (tracking * size if names else 0)
    cursor = x - width / 2 if anchor == "middle" else x
    pen = SVGPathPen(glyphs)
    for name, advance in zip(names, advances):
        # Font units are y-up; SVG is y-down.
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor, baseline)))
        cursor += advance
    return pen.getCommands(), width


def write(path, svg):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(svg + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def monogram(size, radius, glyph_size, background=AKAMI):
    d, _ = text_path(MINCHO, "F", glyph_size, size / 2, size * 0.735, anchor="middle")
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" rx="{radius}" fill="{background}"/>'
        f'<path d="{d}" fill="{SHARI}"/></svg>'
    )


def og_overlay():
    """1200×630: the wordmark on the left, over an urushi panel; the dish
    illustration fills the right (composited by build-icons.mjs)."""
    name, name_w = text_path(MINCHO, "Funshi", 118, 88, 314)
    sub, _ = text_path(GOTHIC, "SUSHI", 30, 94, 372, tracking=0.42)
    line, _ = text_path(GOTHIC, "Japanese restaurant", 30, 92, 500)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">'
        f'<rect width="560" height="630" fill="{URUSHI}"/>'
        f'<rect x="560" width="4" height="630" fill="{AKAMI}"/>'
        f'<path d="{name}" fill="{SHARI}"/>'
        f'<path d="{sub}" fill="{KINARI}"/>'
        f'<rect x="92" y="430" width="{min(name_w, 120):.0f}" height="2" fill="{KINARI}"/>'
        f'<path d="{line}" fill="{SHARI}"/>'
        "</svg>"
    )


if __name__ == "__main__":
    write(ROOT / "favicon.svg", monogram(64, 6, 46))
    write(ROOT / "assets" / "brand" / "icon.svg", monogram(512, 48, 360))
    # Maskable: full bleed, letter inside the central 80 % safe zone.
    write(ROOT / "assets" / "brand" / "icon-maskable.svg", monogram(512, 0, 280))
    write(ROOT / "assets" / "brand" / "og-overlay.svg", og_overlay())
