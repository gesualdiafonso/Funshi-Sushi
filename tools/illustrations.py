"""Generate the SVG illustration sources (assets/images/src/*.svg).

Original artwork for Funshi Sushi — explicitly illustrations, not photos of the
restaurant's food. Deterministic (seeded), so re-running gives the same files.
    python3 tools/illustrations.py   →   then: node tools/build-images.mjs
"""
import math, random, pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets/images/src'
rnd = random.Random(11)

def grains(n, rx, ry, band):
    """Rice grains along the long edges of the rice body (where the fish doesn't cover)."""
    out = []
    for _ in range(n):
        x = rnd.uniform(-rx + 20, rx - 20)
        top = rnd.random() < 0.5
        y = rnd.uniform(-ry, -ry + band) if top else rnd.uniform(ry - band, ry)
        # keep inside the rounded body
        if (x / rx) ** 2 + (y / ry) ** 2 > 0.98 and abs(x) > rx - ry:
            continue
        a = rnd.uniform(-40, 40) + (90 if rnd.random() < 0.25 else 0)
        shade = rnd.choice(['#fbf8f2', '#f6f1e8', '#efe8dc'])
        out.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="11" ry="5" transform="rotate({a:.0f} {x:.0f} {y:.0f})" fill="{shade}" stroke="#cfc3b1" stroke-width="1.2"/>')
    return '\n        '.join(out)

SLAB = 'M -236 -54 C -90 -92, 70 -94, 204 -66 C 222 -20, 232 20, 246 58 C 96 92, -64 96, -196 66 C -214 22, -226 -16, -236 -54 Z'

def cut_lines(color, widths, opacity, spacing=64):
    # Parallel to the diagonal knife cut at the slab ends (dx 40 over dy 132).
    lines = []
    x = -250
    i = 0
    while x < 260:
        w = widths[i % len(widths)]
        lines.append(f'<path d="M {x} -84 C {x+18} -20, {x+20} 30, {x+44} 86" stroke-width="{w}"/>')
        x += spacing + rnd.uniform(-8, 8)
        i += 1
    return f'<g fill="none" stroke="{color}" stroke-linecap="round" opacity="{opacity}">' + ''.join(lines) + '</g>'

DEFS = f'''
  <defs>
    <radialGradient id="bg" cx="22%" cy="16%" r="100%">
      <stop offset="0" stop-color="#3a121a"/><stop offset="0.5" stop-color="#240910"/><stop offset="1" stop-color="#14040a"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="5"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0"/>
    </filter>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="contact" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur-lg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>

    <linearGradient id="rice" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#f8f4ec"/><stop offset="0.65" stop-color="#ebe3d6"/><stop offset="1" stop-color="#cbbfac"/>
    </linearGradient>
    <linearGradient id="salmon" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#f6a271"/><stop offset="0.5" stop-color="#e97e50"/><stop offset="1" stop-color="#c85d36"/>
    </linearGradient>
    <linearGradient id="tuna" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#c2304a"/><stop offset="0.55" stop-color="#9b1830"/><stop offset="1" stop-color="#6d0b1f"/>
    </linearGradient>
    <linearGradient id="whitefish" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9b8b2"/><stop offset="0.22" stop-color="#f4e4db"/><stop offset="1" stop-color="#e6d3c6"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.38"/><stop offset="0.4" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="tray" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#62102c"/><stop offset="0.45" stop-color="#4b011d"/><stop offset="1" stop-color="#2f0010"/>
    </linearGradient>
    <linearGradient id="hinoki" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#e6d2ae"/><stop offset="1" stop-color="#cbb089"/>
    </linearGradient>
    <clipPath id="slab"><path d="{SLAB}"/></clipPath>

    <g id="rice-body">
      <ellipse cx="46" cy="58" rx="250" ry="112" fill="#000" opacity="0.6" filter="url(#shadow)"/>
      <rect x="-178" y="-90" width="356" height="180" rx="88" fill="#000" opacity="0.35" filter="url(#contact)" transform="translate(8 10)"/>
      <rect x="-178" y="-90" width="356" height="180" rx="88" fill="url(#rice)"/>
      <g>
        {grains(150, 178, 90, 30)}
      </g>
    </g>
    <g id="slab-shadow"><path d="{SLAB}" fill="#000" opacity="0.38" filter="url(#contact)" transform="translate(10 14)"/></g>

    <g id="nigiri-salmon">
      <use href="#rice-body"/><use href="#slab-shadow"/>
      <g clip-path="url(#slab)">
        <rect x="-260" y="-90" width="520" height="180" fill="url(#salmon)"/>
        {cut_lines('#fde3d0', [14, 9, 12, 8, 11], 0.78)}
        <rect x="-260" y="-90" width="520" height="180" fill="url(#sheen)"/>
      </g>
    </g>
    <g id="nigiri-tuna">
      <use href="#rice-body"/><use href="#slab-shadow"/>
      <g clip-path="url(#slab)">
        <rect x="-260" y="-90" width="520" height="180" fill="url(#tuna)"/>
        {cut_lines('#d9546a', [4, 3, 5], 0.4, 78)}
        <rect x="-260" y="-90" width="520" height="180" fill="url(#sheen)"/>
      </g>
    </g>
    <g id="nigiri-whitefish">
      <use href="#rice-body"/><use href="#slab-shadow"/>
      <g clip-path="url(#slab)">
        <rect x="-260" y="-90" width="520" height="180" fill="url(#whitefish)"/>
        <path d="M -240 -60 C -80 -78, 80 -80, 210 -72" fill="none" stroke="#b9aeb6" stroke-width="7" opacity="0.8"/>
        {cut_lines('#ffffff', [5, 4, 6], 0.45, 70)}
        <rect x="-260" y="-90" width="520" height="180" fill="url(#sheen)"/>
      </g>
    </g>
    <g id="wasabi">
      <ellipse cx="22" cy="30" rx="74" ry="46" fill="#000" opacity="0.55" filter="url(#contact)"/>
      <path d="M -70 12 C -74 -20, -40 -48, 4 -50 C 44 -52, 74 -26, 72 6 C 70 34, 40 52, 0 52 C -38 52, -66 38, -70 12 Z" fill="#a3b465"/>
      <path d="M -40 -10 C -22 -30, 10 -36, 36 -22 M -50 14 C -24 -6, 20 -10, 52 6 M -36 34 C -10 22, 22 22, 44 30" fill="none" stroke="#7f8f45" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
      <path d="M -30 -30 C -10 -42, 18 -42, 34 -32" fill="none" stroke="#d7e3a6" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    </g>
  </defs>'''

def svg(w, h, title, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <title>{title}</title>
  <!-- Original illustration for Funshi Sushi — not a photograph of the restaurant's food.
       Generated by tools/illustrations.py; rasterized by tools/build-images.mjs. -->{DEFS}
  <rect width="{w}" height="{h}" fill="url(#bg)"/>
{body}
  <rect width="{w}" height="{h}" filter="url(#grain)" opacity="0.05"/>
</svg>
'''

hero = svg(2000, 2000, 'Three nigiri on a lacquered tray (illustration source)', '''
  <g transform="translate(1060 1060) rotate(-14)">
    <rect x="-1100" y="-470" width="2200" height="940" rx="34" fill="#000" opacity="0.7" filter="url(#shadow)" transform="translate(50 70)"/>
    <rect x="-1100" y="-470" width="2200" height="940" rx="34" fill="#2a000d"/>
    <rect x="-1084" y="-454" width="2168" height="908" rx="26" fill="url(#tray)"/>
    <ellipse cx="-380" cy="-260" rx="620" ry="120" fill="#ffffff" opacity="0.06" filter="url(#blur-lg)" transform="rotate(-6)"/>
    <path d="M -1050 -448 L 1050 -448" stroke="#ffffff" stroke-opacity="0.10" stroke-width="6" stroke-linecap="round"/>
    <use href="#nigiri-salmon" transform="translate(-560 -40) rotate(5) scale(1.38)"/>
    <use href="#nigiri-tuna" transform="translate(70 30) rotate(-3) scale(1.38)"/>
    <use href="#nigiri-whitefish" transform="translate(690 -30) rotate(6) scale(1.38)"/>
    <use href="#wasabi" transform="translate(600 300) scale(1.25)"/>
  </g>''')

wood = ''.join(
    f'<path d="M -900 {y:.0f} C -400 {y + rnd.uniform(-14, 14):.0f}, 300 {y + rnd.uniform(-14, 14):.0f}, 900 {y + rnd.uniform(-10, 10):.0f}" stroke-width="{rnd.choice([2, 3, 4])}"/>'
    for y in [-300 + i * rnd.uniform(34, 52) for i in range(15)] if y < 310)
counter = svg(2400, 1600, 'Two nigiri on a hinoki serving board (illustration source)', f'''
  <g transform="translate(1250 830) rotate(-4)">
    <rect x="-930" y="-340" width="1860" height="680" rx="14" fill="#000" opacity="0.7" filter="url(#shadow)" transform="translate(44 64)"/>
    <rect x="-930" y="-340" width="1860" height="680" rx="14" fill="url(#hinoki)"/>
    <g fill="none" stroke="#b5976a" opacity="0.45" transform="scale(1.03 1)">{wood}</g>
    <path d="M -910 -332 L 910 -332" stroke="#ffffff" stroke-opacity="0.4" stroke-width="5" stroke-linecap="round"/>
    <use href="#nigiri-tuna" transform="translate(-400 -20) rotate(-6) scale(1.08)"/>
    <use href="#nigiri-salmon" transform="translate(200 10) rotate(-6) scale(1.08)"/>
    <use href="#wasabi" transform="translate(700 -150)"/>
  </g>''')

portrait = svg(1600, 2000, 'Three nigiri across a lacquered tray, portrait (illustration source)', '''
  <g transform="translate(820 1000) rotate(-66)">
    <rect x="-1400" y="-470" width="2800" height="940" rx="34" fill="#000" opacity="0.7" filter="url(#shadow)" transform="translate(60 40)"/>
    <rect x="-1400" y="-470" width="2800" height="940" rx="34" fill="#2a000d"/>
    <rect x="-1384" y="-454" width="2768" height="908" rx="26" fill="url(#tray)"/>
    <ellipse cx="-300" cy="-250" rx="700" ry="120" fill="#ffffff" opacity="0.06" filter="url(#blur-lg)"/>
    <path d="M -1350 -448 L 1350 -448" stroke="#ffffff" stroke-opacity="0.10" stroke-width="6" stroke-linecap="round"/>
    <use href="#nigiri-salmon" transform="translate(-560 -10) rotate(84) scale(1.28)"/>
    <use href="#nigiri-tuna" transform="translate(0 20) rotate(92) scale(1.28)"/>
    <use href="#nigiri-whitefish" transform="translate(560 -10) rotate(86) scale(1.28)"/>
    <use href="#wasabi" transform="translate(300 330) scale(1.2)"/>
  </g>''')

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'hero.svg').write_text(hero)
    (OUT / 'hero-portrait.svg').write_text(portrait)
    (OUT / 'counter.svg').write_text(counter)
    print('wrote', OUT / 'hero.svg', OUT / 'hero-portrait.svg', OUT / 'counter.svg')
    print('product illustrations: python3 tools/product_illustrations.py')
