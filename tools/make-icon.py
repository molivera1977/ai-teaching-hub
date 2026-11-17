# The tab icon (Marcos 11/17, choice A): the menu's "AI" logo — white AI (Nunito 900) on the blue-to-purple tile
# (#4f6ef7 → #7b5ea7, the .logo-mark colors in style.css). Letters are turned into shapes so every computer shows the same thing.
#   python3 tools/make-icon.py   → icons/favicon.svg, icons/favicon-32.png, icons/apple-touch-icon.png
# Bump ?v= on the three <link>s in every page after a change.
import os, re, tempfile, urllib.request
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
C1, C2, INK = (0x4f, 0x6e, 0xf7), (0x7b, 0x5e, 0xa7), '#ffffff'
TEXT, WIDTH, TRACK, RX = 'AI', 70, 20, 22   # letters 70 of 100 units wide, centered; corner radius 22

css = urllib.request.urlopen('https://fonts.googleapis.com/css2?family=Nunito:wght@900&text=' + TEXT).read().decode()
font_file = os.path.join(tempfile.mkdtemp(), 'nunito-900.ttf')
urllib.request.urlretrieve(re.search(r'url\((https://fonts\.gstatic\.com[^)]+)\)', css).group(1), font_file)
f = TTFont(font_file)
gs, cmap, hm, upm = f.getGlyphSet(), f.getBestCmap(), f['hmtx'], f['head'].unitsPerEm

letters, x = [], 0          # (glyph, where it starts) in font units
for ch in TEXT:
    g = cmap[ord(ch)]
    letters.append((ch, g, x))
    x += hm[g][0] + TRACK
bp = BoundsPen(gs)
for _, g, lx in letters:
    gs[g].draw(TransformPen(bp, (1, 0, 0, 1, lx, 0)))
x0, y0, x1, y1 = bp.bounds
s = WIDTH / (x1 - x0)                 # font units → icon units
dx = 50 - (x0 + x1) * s / 2           # left edge of the first letter's box
base = 50 + (y0 + y1) * s / 2         # baseline, so the ink sits in the middle

os.makedirs(OUT, exist_ok=True)
pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
for _, g, lx in letters:
    gs[g].draw(TransformPen(pen, (s, 0, 0, -s, dx + lx * s, base)))
hexc = lambda c: '#%02x%02x%02x' % c
with open(os.path.join(OUT, 'favicon.svg'), 'w') as fh:
    fh.write("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>"
             f"<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='{hexc(C1)}'/>"
             f"<stop offset='1' stop-color='{hexc(C2)}'/></linearGradient></defs>"
             f"<rect width='100' height='100' rx='{RX}' fill='url(#g)'/><path fill='{INK}' d='{pen.getCommands()}'/></svg>\n")


def png(size, name, rounded):
    """Drawn 8× bigger, then shrunk, so the edges are smooth. iOS rounds its own corners: a square, solid tile there."""
    n, k = size * 8, size * 8 / 100
    tile = Image.new('RGB', (n, n))
    px = tile.load()
    for yy in range(n):                       # same diagonal blend as the SVG gradient
        for xx in range(n):
            t = (xx + yy) / (2 * (n - 1))
            px[xx, yy] = tuple(round(a + (b - a) * t) for a, b in zip(C1, C2))
    d = ImageDraw.Draw(tile)
    face = ImageFont.truetype(font_file, round(upm * s * k))
    for ch, _, lx in letters:
        d.text(((dx + lx * s) * k, base * k), ch, font=face, fill=INK, anchor='ls')
    im = tile.convert('RGBA')
    if rounded:
        mask = Image.new('L', (n, n), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, n - 1, n - 1), radius=RX * k, fill=255)
        im.putalpha(mask)
    im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name))


png(32, 'favicon-32.png', True)
png(180, 'apple-touch-icon.png', False)
print('icons/: favicon.svg, favicon-32.png, apple-touch-icon.png · letters', round((y1 - y0) * s, 1), 'of 100 tall')
