"""Build an SVG <symbol> sprite from Lucide icon files. Usage: build_sprite.py ICON_DIR OUT names..."""
import sys, re, xml.etree.ElementTree as ET
icon_dir, out, names = sys.argv[1], sys.argv[2], sys.argv[3:]
NS = '{http://www.w3.org/2000/svg}'
parts = ['<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
         '<!-- Icons: Lucide (https://lucide.dev), ISC License. See LICENSE-lucide.txt. Regenerate, don\'t hand-edit. -->']
for n in names:
    root = ET.parse(f'{icon_dir}/{n}.svg').getroot()
    inner = ''
    for el in root:
        tag = el.tag.replace(NS, '')
        attrs = ' '.join(f'{k}="{v}"' for k, v in el.attrib.items())
        inner += f'<{tag} {attrs}/>'
    parts.append(f'<symbol id="{n}" viewBox="0 0 24 24">{inner}</symbol>')
parts.append('</svg>\n')
open(out, 'w').write('\n'.join(parts))
print(f'{len(names)} icons -> {out}')
