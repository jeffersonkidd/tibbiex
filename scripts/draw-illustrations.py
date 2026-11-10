"""Draws the site's placeholder illustrations as SVG.

    python3 scripts/draw-illustrations.py          # write them into src/assets
    python3 scripts/draw-illustrations.py DIR      # write drafts to DIR instead

What it draws, and where each lands:

    src/assets/illustrations/link-rows/
        tarot-spread.svg           Tibbie with a three-card spread
        gash-onstage.svg           Tibbie on stage with GASH
        reagan-youth-merch.svg     the Reagan Youth merch pile
        leftover-crack-merch.svg   the Leftover Crack merch pile
    src/assets/illustrations/fund/
        podcast-interview.svg      Tibbie and a guest at the "Still Alive" mics

The tarot picture was drawn by hand as one piece of SVG before the rest
existed, so it is kept below as that markup (TAROT) rather than built from
the helpers.

Every figure is faceless and every picture a placeholder, flagged staged in
content/ until a real photo replaces it. The lettering is a hand-drawn
marker alphabet (GLYPHS, stroked paths), so the files need no font: an SVG
shown through <img> cannot load the site's web fonts. The only real <text>
is small monospace, which falls back to the system's.

Output is deterministic -- the hand-lettering's wobble comes from seeded
random numbers -- so running it again without changes rewrites the same
files. No dependencies beyond the standard library."""

import math
import xml.etree.ElementTree as ElementTree
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DRAFTS = Path(sys.argv[1]) if len(sys.argv) > 1 else None

# The site's palette, written out: an SVG shown as <img> cannot read var().
PAPER = "#FEDBD5"  # inverse-surface
INK = "#412B27"  # inverse-on-surface
RED = "#BA0800"  # primary
RED_HOT = "#E61A0A"  # primary-container
RED_DEEP = "#8A0600"
CORAL = "#FD6953"  # secondary-container
AMBER = "#FFDDB0"  # tertiary-fixed
AMBER_MID = "#9E6A00"  # tertiary-container
AMBER_DARK = "#7D5400"  # tertiary
BLACK = "#1A0A07"  # surface-container-lowest
DARK = "#291714"  # surface-container-low
DARK_HI = "#452F2C"  # surface-container-highest
OUTLINE = "#AF8781"  # outline
SKIN = "#F3C2B1"
SKIN_SHADE = "#E6A996"
HAIR = "#F2D29A"
HAIR_SHADE = "#C99A52"
CREAM = "#EFE3D3"
YELLOW = "#F2C14E"

STICKER = f"""<filter id="sticker" x="-5%" y="-5%" width="110%" height="110%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="grown" />
      <feFlood flood-color="{PAPER}" />
      <feComposite in2="grown" operator="in" result="edge" />
      <feMerge>
        <feMergeNode in="edge" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>"""

# --- Marker alphabet ---------------------------------------------------------
# Each glyph is (width, strokes) on a cap height of 14; y runs down. Strokes in
# SMOOTH are drawn as curves through their points, the rest as straight runs.
ELLIPSE = [(5 + 5 * math.cos(a), 7 + 7 * math.sin(a)) for a in
           [i * math.pi / 6 - math.pi / 2 for i in range(13)]]
GLYPHS = {
    "A": (10, [[(0, 14), (5, 0), (10, 14)], [(2.3, 8.6), (7.7, 8.6)]]),
    "C": (9, [[(9, 2.6), (6.5, 0.2), (3, 0.6), (0.5, 4), (0.4, 9.5), (2.6, 13.2), (6, 14), (9, 11.6)]]),
    "E": (8, [[(8, 0), (0, 0), (0, 14), (8, 14)], [(0, 7), (6.2, 7)]]),
    "F": (8, [[(8, 0), (0, 0), (0, 14)], [(0, 7), (6.2, 7)]]),
    "G": (10, [[(9.4, 2.6), (6.8, 0.2), (3, 0.6), (0.5, 4), (0.4, 9.5), (2.6, 13.2), (6, 14), (9.4, 12)], [(9.4, 12), (9.4, 8.2), (5.4, 8.2)]]),
    "H": (9, [[(0, 0), (0, 14)], [(9, 0), (9, 14)], [(0, 7.2), (9, 7.2)]]),
    "I": (2, [[(1, 0), (1, 14)]]),
    "K": (9, [[(0, 0), (0, 14)], [(9, 0), (0.6, 8.4)], [(3.2, 5.8), (9, 14)]]),
    "L": (7.5, [[(0, 0), (0, 14), (7.5, 14)]]),
    "N": (9, [[(0, 14), (0, 0), (9, 14), (9, 0)]]),
    "O": (10, [ELLIPSE]),
    "Ö": (10, [ELLIPSE, [(3.2, -3.4), (3.4, -3.1)], [(6.8, -3.4), (7, -3.1)]]),
    "P": (8, [[(0, 14), (0, 0), (5.6, 0), (8, 1.8), (8, 5.2), (5.6, 7.2), (0, 7.2)]]),
    "R": (9, [[(0, 14), (0, 0), (5.8, 0), (8.4, 1.8), (8.4, 5.2), (5.8, 7.2), (0, 7.2)], [(4, 7.2), (9, 14)]]),
    "S": (8.5, [[(8.2, 1.8), (5.6, 0), (2.2, 0.3), (0.4, 3), (1.6, 5.8), (6.8, 8), (8.4, 11), (6.2, 14), (2.4, 14), (0, 12.2)]]),
    "T": (9, [[(0, 0), (9, 0)], [(4.5, 0), (4.5, 14)]]),
    "U": (9, [[(0, 0), (0, 9.8), (1.6, 13.3), (4.5, 14), (7.4, 13.3), (9, 9.8), (9, 0)]]),
    "V": (10, [[(0, 0), (5, 14), (10, 0)]]),
    "Y": (10, [[(0, 0), (5, 7.2), (10, 0)], [(5, 7.2), (5, 14)]]),
}
SMOOTH = {"C", "G", "O", "Ö", "S", "U"}


def smooth_path(pts):
    """A Catmull-Rom curve through the points, as cubic Béziers."""
    d = f"M{pts[0][0]:.2f} {pts[0][1]:.2f}"
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}"
    return d


def line_path(pts):
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts)


def marker(text, x, y, size, color, angle=0, anchor="middle", weight=0.17, seed=1, fit=None):
    """Hand-lettered text: cap height `size`, baseline-free (y is the cap
    top), each letter a touch off level like a real marker."""
    rng = random.Random(seed)
    unit = size / 14
    gap, space = 3.4, 7
    width = sum(GLYPHS[c][0] + gap if c != " " else space for c in text) - gap
    if fit:
        size = min(size, fit * 14 / width)
        unit = size / 14
    start = {"start": 0, "middle": -width / 2, "end": -width}[anchor]
    parts, cursor = [], start
    for c in text:
        if c == " ":
            cursor += space
            continue
        w, strokes = GLYPHS[c]
        tilt = rng.uniform(-5, 5)
        lift = rng.uniform(-0.8, 0.8)
        ds = [(smooth_path if c in SMOOTH and len(s) > 2 else line_path)(s) for s in strokes]
        paths = "".join(f'<path d="{d}" />' for d in ds)
        parts.append(
            f'<g transform="translate({cursor:.2f} {lift:.2f}) rotate({tilt:.2f} {w / 2} 7)">{paths}</g>')
        cursor += w + gap
    return (f'<g transform="translate({x} {y}) rotate({angle}) scale({unit:.4f})" fill="none" '
            f'stroke="{color}" stroke-width="{14 * weight:.2f}" stroke-linecap="round" '
            f'stroke-linejoin="round">{"".join(parts)}</g>')


def mono(text, x, y, size, color, angle=0, spacing=1.5):
    return (f'<text x="{x}" y="{y}" transform="rotate({angle} {x} {y})" text-anchor="middle" '
            f'font-family="ui-monospace, Menlo, monospace" font-size="{size}" font-weight="700" '
            f'letter-spacing="{spacing}" fill="{color}">{text}</text>')


def svg(w, h, title, body, extra_defs=""):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <!-- {title} A placeholder for a link row's print (content/links.ts),
       generated by scripts/draw-illustrations.py; edit it there: flat
       shapes in the site's palette, hand-lettered, with a paper sticker
       edge round the whole thing. -->
  <defs>
    {STICKER}
    {extra_defs}
  </defs>
  <g filter="url(#sticker)" stroke-linejoin="round" stroke-linecap="round">
{body}
  </g>
</svg>
"""


# --- Merch pieces ------------------------------------------------------------

def tee(x, y, w, h, fill, angle=0):
    sx, sy = w / 230, h / 350
    d = ("M70 0 C92 20 138 20 160 0 L230 32 L210 108 L180 98 L180 350 "
         "L50 350 L50 98 L20 108 L0 32 Z")
    collar = "M70 0 C92 20 138 20 160 0"
    return (f'<g transform="translate({x} {y}) rotate({angle} {w / 2} {h / 2}) scale({sx:.4f} {sy:.4f})">'
            f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="{3 / sx:.2f}" />'
            f'<path d="{collar}" fill="none" stroke="{INK}" stroke-width="{6 / sx:.2f}" />'
            f'<path d="M50 98 L50 130 M180 98 L180 130" stroke="{INK}" stroke-opacity="0.25" stroke-width="{2 / sx:.2f}" />'
            f'</g>')


def record(cx, cy, r, label):
    grooves = "".join(
        f'<circle cx="{cx}" cy="{cy}" r="{r * k:.1f}" fill="none" stroke="{DARK_HI}" stroke-width="1.2" />'
        for k in (0.9, 0.8, 0.7, 0.6, 0.5))
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{BLACK}" stroke="{INK}" stroke-width="3" />{grooves}'
            f'<path d="M{cx - r * 0.75:.1f} {cy - r * 0.35:.1f} A{r * 0.82:.1f} {r * 0.82:.1f} 0 0 1 {cx - r * 0.2:.1f} {cy - r * 0.8:.1f}" '
            f'fill="none" stroke="{OUTLINE}" stroke-opacity="0.55" stroke-width="4" />'
            f'<circle cx="{cx}" cy="{cy}" r="{r * 0.3:.1f}" fill="{label}" />'
            f'<circle cx="{cx}" cy="{cy}" r="4" fill="{BLACK}" />')


def x_border(x, y, w, h, ink, rng, inset=10, size=6, step=13):
    """A border of X's printed just inside a patch's edge, so it reads as a
    patch at a glance. Ink, not thread: the patches are screen printed, never
    stitched, so this is part of the print."""
    left, top = x + inset, y + inset
    right, bottom = x + w - inset, y + h - inset
    across = max(1, round((right - left) / step))
    down = max(1, round((bottom - top) / step))
    spots = ([(left + (right - left) * i / across, top) for i in range(across + 1)]
             + [(left + (right - left) * i / across, bottom) for i in range(across + 1)]
             + [(left, top + (bottom - top) * j / down) for j in range(1, down)]
             + [(right, top + (bottom - top) * j / down) for j in range(1, down)])
    half = size / 2
    marks = "".join(
        f'<path d="M{-half} {-half} L{half} {half} M{half} {-half} L{-half} {half}" '
        f'transform="translate({cx:.1f} {cy:.1f}) rotate({rng.uniform(-12, 12):.1f})" />'
        for cx, cy in spots)
    return (f'<g fill="none" stroke="{ink}" stroke-width="2" stroke-linecap="round">'
            f'{marks}</g>')


def raw_patch(x, y, w, h, fill, ink, seed, angle=0):
    """Screen printed on canvas and cut with scissors: an uneven edge, a few
    loose threads, a printed border of X's, no stitching."""
    rng = random.Random(seed)
    pts = []
    for i in range(10):
        pts.append((x + w * i / 10, y + rng.uniform(-2, 2)))
    for i in range(7):
        pts.append((x + w + rng.uniform(-2, 2), y + h * i / 7))
    for i in range(10, 0, -1):
        pts.append((x + w * i / 10, y + h + rng.uniform(-2, 2)))
    for i in range(7, 0, -1):
        pts.append((x + rng.uniform(-2, 2), y + h * i / 7))
    d = "M" + " L".join(f"{px:.1f} {py:.1f}" for px, py in pts) + " Z"
    threads = "".join(
        f'<path d="M{x + w * t:.1f} {y + h} q{rng.uniform(-3, 3):.1f} 4 {rng.uniform(-2, 2):.1f} {rng.uniform(5, 9):.1f}" '
        f'fill="none" stroke="{fill}" stroke-width="1.6" />'
        for t in (0.18, 0.47, 0.81))
    weave = (f'<path d="{d}" fill="url(#canvas)" />')
    return (f'<g transform="rotate({angle} {x + w / 2} {y + h / 2})">{threads}'
            f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="2.4" />{weave}'
            f'{x_border(x, y, w, h, ink, rng)}</g>')


CANVAS = f"""<pattern id="canvas" width="4" height="4" patternUnits="userSpaceOnUse">
      <path d="M0 0.5 H4 M0.5 0 V4" stroke="{INK}" stroke-opacity="0.12" stroke-width="0.8" />
    </pattern>"""


def merch_pile(title, *, sticker, record_label, tee_fill, tee_ink, sleeve_fill,
               sleeve_ink, sleeve_note, patch_fill, patch_ink, name, seed):
    w, h = 455, 560
    body = "\n".join([
        tee(10, 150, 232, 350, tee_fill, angle=-3),
        marker(name[0], 118, 272, 26, tee_ink, angle=-6, seed=seed, fit=112),
        marker(name[1], 118, 306, 26, tee_ink, angle=-6, seed=seed + 1, fit=112),
        record(312, 126, 104, record_label),
        f'<g transform="rotate(-4 318 278)"><rect x="210" y="160" width="216" height="232" rx="3" fill="{sleeve_fill}" stroke="{INK}" stroke-width="3" />'
        + marker(name[0], 318, 248, 30, sleeve_ink, seed=seed + 2, fit=180)
        + marker(name[1], 318, 288, 30, sleeve_ink, seed=seed + 3, fit=180)
        + mono(sleeve_note, 262, 360, 10, sleeve_ink if sleeve_fill != PAPER else INK, spacing=2)
        + "</g>",
        sticker,
        raw_patch(36, 412, 176, 112, patch_fill, patch_ink, seed=seed, angle=-4),
        marker(name[0], 124, 446, 18, patch_ink, angle=-4, seed=seed + 4, fit=120),
        marker(name[1], 124, 472, 18, patch_ink, angle=-4, seed=seed + 5, fit=120),
    ])
    return svg(w, h, title, body, CANVAS)


def ry_sticker():
    return (f'<circle cx="94" cy="98" r="58" fill="{RED}" stroke="{INK}" stroke-width="3" />'
            f'<circle cx="94" cy="98" r="50" fill="none" stroke="{PAPER}" stroke-opacity="0.5" stroke-width="1.4" />'
            + marker("RY", 94, 70, 34, PAPER, angle=-6, seed=11)
            + mono("QUEENS 1980", 94, 132, 9.5, PAPER, spacing=1.6))


def loc_sticker():
    pts = []
    for i in range(24):
        r = 62 if i % 2 == 0 else 46
        a = i * math.pi / 12 - math.pi / 2
        pts.append((94 + r * math.cos(a), 98 + r * math.sin(a)))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"
    return (f'<path d="{d}" fill="{AMBER}" stroke="{INK}" stroke-width="3" transform="rotate(-8 94 98)" />'
            + marker("LÖC", 94, 84, 28, INK, angle=-8, seed=21))


# --- GASH on stage -------------------------------------------------------------

def gash():
    w, h = 560, 526
    defs = f"""<linearGradient id="beam-pink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFD2C8" /><stop offset="1" stop-color="#F28A76" />
    </linearGradient>
    <linearGradient id="beam-amber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFF0D8" /><stop offset="1" stop-color="#FFC979" />
    </linearGradient>
    <pattern id="grille" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 3.5 H7" stroke="{DARK_HI}" stroke-width="1.6" />
    </pattern>"""

    def beam(cx, fill):
        return (f'<path d="M{cx - 12} 14 L{cx + 12} 14 L{cx + 66} 380 L{cx - 66} 380 Z" fill="{fill}" stroke="{INK}" stroke-width="3" />'
                f'<circle cx="{cx}" cy="14" r="11" fill="{PAPER}" stroke="{INK}" stroke-width="3" />')

    def amp(x):
        return (f'<rect x="{x}" y="214" width="104" height="286" rx="5" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
                f'<rect x="{x + 8}" y="222" width="88" height="34" rx="2" fill="{DARK_HI}" />'
                f'<rect x="{x + 8}" y="266" width="88" height="224" rx="2" fill="url(#grille)" />')

    # Arms are a thick ink stroke under a thinner skin one, so they read outlined.
    def limb(d, w=34):
        return (f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w}" />'
                f'<path d="{d}" fill="none" stroke="{SKIN}" stroke-width="{w - 6}" />')

    body = "\n".join([
        beam(150, "url(#beam-pink)"),
        beam(285, "url(#beam-amber)"),
        beam(420, "url(#beam-pink)"),
        amp(12),
        amp(444),
        # The kick drum behind her, its head lettered.
        f'<circle cx="430" cy="392" r="88" fill="{BLACK}" stroke="{OUTLINE}" stroke-width="8" />'
        f'<circle cx="430" cy="392" r="92" fill="none" stroke="{INK}" stroke-width="3" />'
        + marker("GASH", 430, 368, 40, RED, angle=-8, seed=31),
        # Hair, the mass behind her.
        f'<path d="M216 140 C190 176 202 230 186 286 C204 312 236 306 246 294 L308 294 C318 306 350 312 368 286 C352 230 364 176 338 140 C312 118 242 118 216 140 Z" fill="{HAIR}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M208 200 C204 230 210 254 200 282 M346 200 C350 230 344 254 354 282 M218 246 C214 266 222 280 216 294 M336 246 C340 266 332 280 338 294" fill="none" stroke="{HAIR_SHADE}" stroke-width="2.4" />',
        # Neck, shoulders and the red top.
        f'<path d="M260 260 L260 300 L294 300 L294 260 Z" fill="{SKIN_SHADE}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M196 330 C214 306 240 298 262 296 L292 296 C316 298 344 306 360 330 L370 470 L186 470 Z" fill="{SKIN}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M190 346 C206 334 220 332 234 338 C250 352 304 352 320 338 C334 332 350 334 366 346 L372 470 L184 470 Z" fill="{RED}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M232 338 L226 308 M322 338 L328 308" stroke="{INK}" stroke-width="3" />',
        f'<path d="M256 300 C262 320 292 320 298 300" fill="none" stroke="{AMBER_MID}" stroke-width="2" />'
        f'<path d="M250 302 C258 334 296 334 304 302" fill="none" stroke="{AMBER_MID}" stroke-width="2" />',
        # The fist, thrown up at her right.
        # Upper arm down behind the monitor, forearm straight up out of it.
        limb("M206 348 L176 480 L168 372"),
        f'<path d="M148 362 c-4 -18 6 -32 22 -34 c16 -2 28 8 28 24 c0 14 -10 26 -26 26 c-12 0 -22 -6 -24 -16 z" fill="{SKIN}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M156 340 c6 -4 14 -4 18 2 M152 352 c8 -4 16 -4 22 2 M154 364 c8 -3 14 -2 18 2" fill="none" stroke="{INK}" stroke-width="2.4" />',
        # The arm holding the mic up to her, tattooed.
        limb("M350 348 L392 480 L322 338"),
        f'<path d="M362 386 c8 -4 14 4 8 10 c-6 6 -14 0 -8 -10 M372 410 c-6 2 -6 10 0 12" fill="none" stroke="{INK}" stroke-width="2.4" />',
        # Head, faceless.
        f'<ellipse cx="277" cy="210" rx="52" ry="60" fill="{SKIN}" stroke="{INK}" stroke-width="3" />',
        # Hair in front: a blunt fringe and pieces down each side.
        f'<path d="M222 182 C224 148 252 132 280 134 C310 134 334 152 334 186 C318 176 300 174 284 180 C266 172 242 174 222 182 Z" fill="{HAIR}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M250 150 C256 160 262 166 270 170 M300 148 C298 158 300 166 306 172" fill="none" stroke="{HAIR_SHADE}" stroke-width="2.4" />',
        f'<circle cx="228" cy="236" r="6" fill="none" stroke="{AMBER_MID}" stroke-width="2.4" />'
        f'<circle cx="326" cy="236" r="6" fill="none" stroke="{AMBER_MID}" stroke-width="2.4" />',
        # The mic, up where her mouth would be, and the hand on it.
        f'<path d="M286 248 L316 336" stroke="{INK}" stroke-width="14" />'
        f'<path d="M286 248 L316 336" stroke="{DARK_HI}" stroke-width="9" />',
        f'<circle cx="282" cy="240" r="16" fill="{OUTLINE}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M270 232 L294 248 M270 244 L290 230 M276 226 L298 242" stroke="{INK}" stroke-opacity="0.45" stroke-width="1.6" />',
        f'<path d="M300 318 c0 -12 10 -18 20 -16 c10 2 14 12 10 22 c-4 10 -14 12 -22 8 c-6 -2 -8 -8 -8 -14 z" fill="{SKIN}" stroke="{INK}" stroke-width="3" />',
        # The floor monitor in front, with the band's name on it.
        f'<path d="M150 422 L410 422 L436 520 L124 520 Z" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M166 432 L394 432 L414 510 L146 510 Z" fill="url(#grille)" />'
        + marker("GASH", 280, 452, 40, RED, angle=-3, seed=41),
    ])
    return svg(w, h, "Tibbie, drawn and faceless: on stage with GASH, fist up, mic in hand, between amp stacks under three lights.", body, defs)


# --- "Still Alive", the podcast ------------------------------------------------

def podcast():
    """Tibbie and a punk guest at the desk, both in headphones, on mics. A
    full square scene, not a cutout: the fund's window shows it edge to edge."""
    w = h = 600
    defs = f"""<pattern id="foam" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="30" height="30" fill="{DARK}" />
      <path d="M0 0 L15 15 L0 30 Z M30 0 L15 15 L30 30 Z" fill="{DARK_HI}" />
      <path d="M0 0 L15 15 L30 0 Z" fill="#3A211C" />
    </pattern>
    <filter id="neon" x="-20%" y="-40%" width="140%" height="180%">
      <feGaussianBlur stdDeviation="5" />
    </filter>"""

    def limb(d, fill, wd=34):
        return (f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{wd}" />'
                f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{wd - 6}" />')

    def headphones(cx, cy, rx):
        return (f'<path d="M{cx - rx - 4} {cy} C{cx - rx - 4} {cy - 96} {cx + rx + 4} {cy - 96} {cx + rx + 4} {cy}" '
                f'fill="none" stroke="{INK}" stroke-width="13" />'
                f'<path d="M{cx - rx - 4} {cy} C{cx - rx - 4} {cy - 96} {cx + rx + 4} {cy - 96} {cx + rx + 4} {cy}" '
                f'fill="none" stroke="{BLACK}" stroke-width="8" />'
                f'<rect x="{cx - rx - 16}" y="{cy - 22}" width="22" height="46" rx="9" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
                f'<rect x="{cx + rx - 6}" y="{cy - 22}" width="22" height="46" rx="9" fill="{BLACK}" stroke="{INK}" stroke-width="3" />')

    def mic(arm, x, y, angle):
        return (f'<path d="{arm}" fill="none" stroke="{INK}" stroke-width="9" />'
                f'<path d="{arm}" fill="none" stroke="{DARK_HI}" stroke-width="5" />'
                f'<g transform="translate({x} {y}) rotate({angle})">'
                f'<rect x="-15" y="-34" width="30" height="68" rx="14" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
                f'<path d="M-15 -8 H15 M-15 0 H15 M-15 8 H15" stroke="{OUTLINE}" stroke-width="1.6" />'
                f'<rect x="-18" y="10" width="36" height="8" rx="2" fill="{OUTLINE}" stroke="{INK}" stroke-width="2" />'
                f'</g>')

    def hand(cx, cy):
        return (f'<ellipse cx="{cx}" cy="{cy}" rx="20" ry="13" fill="{SKIN}" stroke="{INK}" stroke-width="3" />'
                f'<path d="M{cx - 8} {cy - 6} v8 M{cx} {cy - 7} v9 M{cx + 8} {cy - 6} v8" stroke="{INK}" stroke-width="2" />')

    studs = "".join(f'<circle cx="{x}" cy="{y}" r="3.2" fill="{OUTLINE}" stroke="{INK}" stroke-width="1.2" />'
                    for x, y in [(352, 318), (364, 310), (376, 304), (464, 304), (476, 310), (488, 318)])
    spikes = "".join(
        f'<path d="M{x - 13} {b} L{x} {t} L{x + 13} {b} Z" fill="{CORAL}" stroke="{INK}" stroke-width="3" />'
        for x, t, b in [(390, 168, 200), (406, 140, 190), (422, 128, 186), (438, 140, 190), (454, 168, 200)])

    body = "\n".join([
        # The room: foam on the wall, the sign, the REC light, flyers.
        f'<rect width="{w}" height="{h}" fill="{BLACK}" />',
        f'<rect x="0" y="118" width="{w}" height="340" fill="url(#foam)" />',
        f'<rect x="0" y="0" width="{w}" height="118" fill="{DARK}" />',
        f'<g filter="url(#neon)" opacity="0.9">'
        + marker("STILL", 300, 22, 30, CORAL, angle=-3, seed=51)
        + marker("ALIVE", 300, 64, 30, CORAL, angle=-3, seed=52) + "</g>",
        marker("STILL", 300, 22, 30, "#FFD2C8", angle=-3, weight=0.11, seed=51),
        marker("ALIVE", 300, 64, 30, "#FFD2C8", angle=-3, weight=0.11, seed=52),
        f'<rect x="478" y="34" width="92" height="40" rx="8" fill="{RED}" stroke="{INK}" stroke-width="3" />'
        f'<circle cx="498" cy="54" r="7" fill="{PAPER}" />'
        + mono("REC", 538, 61, 17, PAPER, spacing=2),
        f'<g transform="rotate(-6 74 196)"><rect x="30" y="140" width="88" height="112" fill="{PAPER}" stroke="{INK}" stroke-width="2.4" />'
        + marker("GASH", 74, 158, 20, RED, seed=61)
        + f'<path d="M44 196 H104 M44 208 H96 M44 220 H100" stroke="{INK}" stroke-opacity="0.5" stroke-width="2" /></g>',
        f'<g transform="rotate(5 530 200)"><rect x="488" y="146" width="84" height="108" fill="{AMBER}" stroke="{INK}" stroke-width="2.4" />'
        + marker("RY", 530, 164, 26, INK, seed=62)
        + f'<path d="M502 214 H558 M502 226 H548" stroke="{INK}" stroke-opacity="0.5" stroke-width="2" /></g>',

        # Tibbie, on the left: hair, red top, headphones.
        f'<path d="M136 196 C114 236 126 290 112 340 C132 356 156 348 164 336 L208 336 C216 348 242 356 260 340 C246 290 258 236 236 196 C220 164 152 164 136 196 Z" fill="{HAIR}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M170 290 L170 326 L202 326 L202 290 Z" fill="{SKIN_SHADE}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M100 470 L108 360 C114 338 146 326 170 324 L202 324 C228 326 258 338 264 360 L272 470 Z" fill="{SKIN}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M104 470 L110 372 C126 358 140 354 152 360 C164 380 208 380 220 360 C232 354 246 358 262 372 L268 470 Z" fill="{RED}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M150 360 L144 332 M222 360 L228 332" stroke="{INK}" stroke-width="3" />',
        f'<path d="M168 326 C176 344 196 344 204 326" fill="none" stroke="{AMBER_MID}" stroke-width="2" />',
        f'<ellipse cx="186" cy="244" rx="44" ry="52" fill="{SKIN}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M142 226 C146 194 170 182 190 184 C214 186 232 200 232 230 C216 216 200 214 186 222 C172 214 156 214 142 226 Z" fill="{HAIR}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M142 238 C130 266 140 296 130 326 M232 238 C244 266 234 296 244 326" fill="none" stroke="{HAIR_SHADE}" stroke-width="2.4" />',
        headphones(186, 244, 44),

        # The guest, on the right: a red mohawk, a studded leather jacket.
        spikes,
        f'<path d="M402 290 L402 326 L438 326 L438 290 Z" fill="{SKIN_SHADE}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M326 470 L334 358 C340 332 376 318 402 316 L438 316 C466 318 500 332 506 358 L514 470 Z" fill="{BLACK}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M398 318 L420 404 L442 318 Z" fill="{PAPER}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M398 318 L384 360 L404 372 L420 404 M442 318 L456 360 L436 372 L420 404" fill="{DARK_HI}" stroke="{INK}" stroke-width="3" />',
        studs,
        f'<g transform="rotate(-8 474 394)"><rect x="456" y="376" width="38" height="36" fill="{RED}" stroke="{INK}" stroke-width="2" />'
        f'<path d="M464 384 L486 404 M486 384 L464 404" stroke="{PAPER}" stroke-width="3" /></g>',
        f'<ellipse cx="420" cy="246" rx="42" ry="50" fill="{SKIN}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M382 226 C384 210 392 200 404 196 L436 196 C448 200 456 210 458 226" fill="none" stroke="{SKIN_SHADE}" stroke-width="6" />',
        f'<circle cx="378" cy="262" r="5" fill="none" stroke="{OUTLINE}" stroke-width="2.4" />',
        headphones(420, 246, 42),

        # The mics on their boom arms.
        mic("M118 0 L166 132 L226 238", 232, 252, 38),
        mic("M492 0 L452 132 L380 238", 374, 252, -38),

        # The desk, what is on it, and their arms on it.
        f'<rect x="0" y="448" width="{w}" height="{h - 448}" fill="{DARK_HI}" stroke="{INK}" stroke-width="3" />',
        f'<rect x="0" y="448" width="{w}" height="16" fill="#5E3F3A" stroke="{INK}" stroke-width="3" />',
        f'<rect x="250" y="416" width="100" height="40" rx="5" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        + "".join(f'<circle cx="{x}" cy="430" r="5" fill="{AMBER}" stroke="{INK}" stroke-width="1.4" />' for x in (268, 290, 312, 334))
        + "".join(f'<rect x="{x - 3}" y="440" width="6" height="10" fill="{OUTLINE}" />' for x in (268, 290, 312, 334)),
        f'<path d="M532 418 L564 418 L560 458 L536 458 Z" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M564 428 c12 0 12 20 -2 20" fill="none" stroke="{INK}" stroke-width="3" />'
        f'<path d="M542 404 c-4 -8 4 -10 0 -18 M554 404 c-4 -8 4 -10 0 -18" fill="none" stroke="{OUTLINE}" stroke-width="2" />',
        f'<path d="M60 600 C80 540 150 520 250 456" fill="none" stroke="{BLACK}" stroke-width="5" />',
        # Her interview notes, slid across the desk.
        f'<g transform="rotate(-7 300 540)"><rect x="236" y="494" width="132" height="92" fill="{PAPER}" stroke="{INK}" stroke-width="2.4" />'
        + mono("Q'S", 270, 518, 12, RED, spacing=2)
        + f'<path d="M252 534 H350 M252 548 H340 M252 562 H346 M252 576 H320" stroke="{INK}" stroke-opacity="0.45" stroke-width="2" />'
        + f'<path d="M354 506 l6 6 m0 -6 l-6 6" stroke="{RED}" stroke-width="2.4" /></g>',
        limb("M114 400 L132 470 L214 470", SKIN),
        limb("M262 400 L250 470 L230 470", SKIN),
        hand(222, 470),
        limb("M336 400 L352 472 L398 472", BLACK, 38),
        limb("M506 400 L494 472 L452 472", BLACK, 38),
        hand(404, 472),
        hand(446, 472),
    ])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <!-- "Still Alive": Tibbie and a punk guest at the desk, both in
       headphones, on boom-arm mics, under the show's sign. Faceless and
       drawn, a placeholder for the fund's print (content/fund.ts).
       Generated by scripts/draw-illustrations.py; edit it there: flat
       shapes in the site's palette, hand-lettered. -->
  <defs>
    {defs}
  </defs>
  <g stroke-linejoin="round" stroke-linecap="round">
{body}
  </g>
</svg>
"""


# --- Tarot -----------------------------------------------------------------------
# Hand-drawn markup, kept whole; the palette is written out inside it.
TAROT = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 560" width="410" height="560">
  <!-- Tibbie, drawn and faceless: sitting cross-legged in a red tulle skirt with a
       three-card spread in front of her and one card held up. A placeholder
       for the tarot row's print (content/links.ts), generated by
       scripts/draw-illustrations.py; edit it there: flat shapes in the
       site's palette, with a paper sticker edge round the whole figure. -->
  <defs>
    <filter id="sticker" x="-5%" y="-5%" width="110%" height="110%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="grown" />
      <feFlood flood-color="#FEDBD5" />
      <feComposite in2="grown" operator="in" result="edge" />
      <feMerge>
        <feMergeNode in="edge" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <pattern id="glitter" width="22" height="18" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="5" r="1.4" fill="#FFDDB0" />
      <circle cx="15" cy="12" r="1" fill="#FFDDB0" />
      <circle cx="11" cy="3" r="0.8" fill="#FEDBD5" />
    </pattern>
    <g id="card-back">
      <rect x="-39" y="-59" width="78" height="118" rx="6" fill="#3A211C" stroke="#412B27" stroke-width="3" />
      <rect x="-31" y="-51" width="62" height="102" rx="3" fill="none" stroke="#FFDDB0" stroke-width="1.6" />
      <path d="M6 -22 a17 17 0 1 0 0 30 a13 13 0 1 1 0 -30z" fill="#FFDDB0" />
      <path d="M0 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFDDB0" />
    </g>
  </defs>

  <g filter="url(#sticker)" stroke-linejoin="round" stroke-linecap="round">
    <!-- Hair, the mass behind her shoulders. -->
    <path d="M152 104 C120 130 132 160 118 190 C104 222 128 236 116 262 C140 276 168 268 176 252 L234 252 C244 270 274 276 296 262 C284 236 306 220 292 190 C278 160 290 128 258 104 Z"
      fill="#F2D29A" stroke="#412B27" stroke-width="3" />
    <path d="M132 176 C126 200 140 214 130 240 M282 176 C290 200 274 216 284 240" fill="none" stroke="#C99A52" stroke-width="3" />

    <!-- The raised arm, and the card it holds up. -->
    <path d="M262 262 L322 220 L340 146" fill="none" stroke="#412B27" stroke-width="36" />
    <path d="M262 262 L322 220 L340 146" fill="none" stroke="#F3C2B1" stroke-width="30" />
    <path d="M300 234 c6 -10 16 -12 22 -6 M312 246 c-4 -6 -2 -14 6 -16" fill="none" stroke="#412B27" stroke-width="2.4" />
    <use href="#card-back" transform="translate(356 78) rotate(14)" />
    <path d="M326 150 c-2 -14 4 -24 14 -26 c10 -2 18 6 18 16 c0 10 -8 18 -18 18 c-8 0 -13 -3 -14 -8z" fill="#F3C2B1" stroke="#412B27" stroke-width="3" />
    <path d="M338 128 l4 -10 M346 128 l5 -9" stroke="#412B27" stroke-width="2.4" />

    <!-- Neck and chest, then the white tank over them. -->
    <path d="M188 200 L188 236 L222 236 L222 200 Z" fill="#E6A996" stroke="#412B27" stroke-width="3" />
    <path d="M146 250 C160 238 176 234 190 232 L220 232 C236 234 252 238 266 250 L256 360 L156 360 Z"
      fill="#F3C2B1" stroke="#412B27" stroke-width="3" />
    <path d="M150 262 C164 254 172 252 178 262 C188 284 222 284 232 262 C238 252 248 254 262 262 L254 362 L158 362 Z"
      fill="#F7ECE8" stroke="#412B27" stroke-width="3" />
    <path d="M176 262 L170 240 M234 262 L240 240" stroke="#412B27" stroke-width="3" />
    <path d="M190 292 C198 300 214 300 222 292" fill="none" stroke="#E4D3CD" stroke-width="3" />
    <!-- Chain and pendant. -->
    <path d="M186 236 C192 256 218 256 224 236" fill="none" stroke="#9E6A00" stroke-width="2" />
    <path d="M205 254 l4 8 -4 8 -4 -8z" fill="#FFDDB0" stroke="#7D5400" stroke-width="1.4" />

    <!-- The arm resting on her knee, tattooed. -->
    <path d="M154 262 L122 326 L114 396" fill="none" stroke="#412B27" stroke-width="36" />
    <path d="M154 262 L122 326 L114 396" fill="none" stroke="#F3C2B1" stroke-width="30" />
    <path d="M128 284 c8 -6 16 0 12 8 c-4 8 -14 4 -12 -4 M134 306 c-8 2 -10 10 -4 14 M122 296 l-4 10" fill="none" stroke="#412B27" stroke-width="2.4" />
    <circle cx="136" cy="290" r="4" fill="#BA0800" />

    <!-- Skirt: three layers of red tulle, glittered. -->
    <path d="M150 344 C112 372 60 408 36 452 C60 470 92 460 112 474 C140 462 168 478 205 470 C242 478 270 462 298 474 C318 460 350 470 374 452 C350 408 298 372 260 344 Z"
      fill="#8A0600" stroke="#412B27" stroke-width="3" />
    <path d="M156 346 C124 372 86 404 66 440 C86 452 108 444 124 456 C150 446 176 458 205 452 C234 458 260 446 286 456 C302 444 324 452 344 440 C324 404 286 372 254 346 Z"
      fill="#BA0800" />
    <path d="M162 348 C138 370 116 396 102 424 C120 432 136 426 150 436 C170 428 188 438 205 432 C222 438 240 428 260 436 C274 426 290 432 308 424 C294 396 272 370 248 348 Z"
      fill="#E61A0A" />
    <path d="M36 452 C60 470 92 460 112 474 C140 462 168 478 205 470 C242 478 270 462 298 474 C318 460 350 470 374 452 C350 408 298 372 260 344 L150 344 C112 372 60 408 36 452Z" fill="url(#glitter)" />
    <path d="M152 340 L258 340 L260 356 L150 356 Z" fill="#1A0A07" stroke="#412B27" stroke-width="3" />

    <!-- Boots, crossed, poking out either side. -->
    <path d="M26 446 C30 430 52 424 70 430 L96 444 C102 456 96 470 84 472 L34 472 C24 470 22 456 26 446 Z" fill="#1A0A07" stroke="#412B27" stroke-width="3" />
    <path d="M38 434 L44 446 M50 430 L56 442 M62 430 L66 442" stroke="#FFDDB0" stroke-width="2" />
    <path d="M384 446 C380 430 358 424 340 430 L314 444 C308 456 314 470 326 472 L376 472 C386 470 388 456 384 446 Z" fill="#1A0A07" stroke="#412B27" stroke-width="3" />
    <path d="M372 434 L366 446 M360 430 L354 442 M348 430 L344 442" stroke="#FFDDB0" stroke-width="2" />

    <!-- The resting hand. -->
    <path d="M98 398 c0 -12 8 -18 16 -18 c10 0 16 8 14 18 c-2 10 -10 14 -18 12 c-6 -2 -12 -6 -12 -12z" fill="#F3C2B1" stroke="#412B27" stroke-width="3" />

    <!-- Head. -->
    <ellipse cx="205" cy="164" rx="50" ry="58" fill="#F3C2B1" stroke="#412B27" stroke-width="3" />
    <!-- Hair in front: a sweep under the cap and waves down each side. -->
    <path d="M156 112 C176 136 210 128 236 116 C246 112 256 114 258 120 C262 140 258 150 254 156 C252 136 240 128 226 132 C204 140 174 140 156 128 Z"
      fill="#F2D29A" stroke="#412B27" stroke-width="3" />
    <path d="M156 116 C140 140 150 168 140 196 C132 220 148 236 140 252 C156 252 162 236 160 216 C158 196 168 176 164 156 C162 140 166 128 156 116 Z"
      fill="#F2D29A" stroke="#412B27" stroke-width="3" />
    <path d="M254 116 C270 140 260 168 270 196 C278 220 262 236 270 252 C254 252 248 236 250 216 C252 196 242 176 246 156 C248 140 244 128 254 116 Z"
      fill="#F2D29A" stroke="#412B27" stroke-width="3" />
    <path d="M150 170 C146 190 156 206 150 228 M260 170 C264 190 254 206 260 228" fill="none" stroke="#C99A52" stroke-width="2.4" />
    <!-- Hoops. -->
    <circle cx="156" cy="194" r="7" fill="none" stroke="#9E6A00" stroke-width="2.4" />
    <circle cx="254" cy="194" r="7" fill="none" stroke="#9E6A00" stroke-width="2.4" />

    <!-- Captain's cap, worn at an angle. -->
    <g transform="rotate(-6 205 100)">
      <path d="M146 112 C140 92 160 70 205 68 C254 66 274 88 266 112 Z" fill="#1A0A07" stroke="#412B27" stroke-width="3" />
      <path d="M150 100 L262 100 L264 114 L148 114 Z" fill="#291714" stroke="#412B27" stroke-width="3" />
      <path d="M148 114 C170 128 240 128 264 114 C252 132 162 132 148 114 Z" fill="#1A0A07" stroke="#412B27" stroke-width="3" />
      <path d="M156 118 C178 126 232 126 256 118" fill="none" stroke="#452F2C" stroke-width="2" />
      <path d="M152 106 L260 106" stroke="#FFDDB0" stroke-width="2" stroke-dasharray="4 3" />
      <path d="M205 80 l5 9 10 1 -8 6 3 10 -10 -6 -10 6 3 -10 -8 -6 10 -1z" fill="#FFDDB0" stroke="#7D5400" stroke-width="1.2" />
    </g>

    <!-- The spread: two backs either side of The Star, face up. -->
    <use href="#card-back" transform="translate(112 490) rotate(-10)" />
    <use href="#card-back" transform="translate(298 490) rotate(10)" />
    <g transform="translate(205 486)">
      <rect x="-39" y="-59" width="78" height="118" rx="6" fill="#FEDBD5" stroke="#412B27" stroke-width="3" />
      <rect x="-31" y="-51" width="62" height="102" rx="3" fill="none" stroke="#9E6A00" stroke-width="1.6" />
      <text x="0" y="-36" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="11" font-weight="700" letter-spacing="1.5" fill="#412B27">XVII</text>
      <path d="M0 -24 l6 18 18 6 -18 6 -6 18 -6 -18 -18 -6 18 -6z" fill="#9E6A00" />
      <circle cx="-16" cy="-18" r="2" fill="#9E6A00" />
      <circle cx="17" cy="20" r="2" fill="#9E6A00" />
      <circle cx="-14" cy="22" r="1.5" fill="#9E6A00" />
      <text x="0" y="44" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="9" font-weight="700" letter-spacing="1" fill="#412B27">THE STAR</text>
    </g>
  </g>
</svg>
"""


LINK_ROWS = "src/assets/illustrations/link-rows"
FUND = "src/assets/illustrations/fund"

files = {
    f"{LINK_ROWS}/tarot-spread.svg": TAROT,
    f"{FUND}/podcast-interview.svg": podcast(),
    f"{LINK_ROWS}/gash-onstage.svg": gash(),
    f"{LINK_ROWS}/reagan-youth-merch.svg": merch_pile(
        "The Reagan Youth merch pile: tee, the record out of its sleeve, a sticker and a raw-cut patch.",
        sticker=ry_sticker(), record_label=RED, tee_fill=BLACK, tee_ink=PAPER,
        sleeve_fill=PAPER, sleeve_ink=INK, sleeve_note="REISSUE LP",
        patch_fill=BLACK, patch_ink=CORAL, name=("REAGAN", "YOUTH"), seed=100),
    f"{LINK_ROWS}/leftover-crack-merch.svg": merch_pile(
        "The Leftover Crack merch pile: tee, the record out of its sleeve, a sticker and a raw-cut patch.",
        sticker=loc_sticker(), record_label=YELLOW, tee_fill=CREAM, tee_ink=INK,
        sleeve_fill=BLACK, sleeve_ink=CORAL, sleeve_note="LP",
        patch_fill=RED, patch_ink=INK, name=("LEFTÖVER", "CRACK"), seed=200),
}

for path, text in files.items():
    # A browser draws nothing at all from an SVG that is not well-formed XML
    # (a "--" inside a comment is enough), so refuse to write one.
    ElementTree.fromstring(text)
    out = DRAFTS / Path(path).name if DRAFTS else ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    print(f"{out.relative_to(ROOT) if not DRAFTS else out}  {len(text.encode()) / 1000:.1f} kB")
