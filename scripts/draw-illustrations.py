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
    src/assets/illustrations/profile/
        tibbie-portrait.svg        Tibbie's avatar: head and shoulders, drawn
    src/assets/illustrations/shop/
        bands.svg                  the Bands shelf: a bass, an amp, picks
        art.svg                    the Art shelf: a splattered canvas, a can, a brush
        sessions.svg               the Sessions shelf: a video call, cards, an hourglass
    src/assets/illustrations/shop/shelves/
        <shelf id>.svg             the Buy tab's first screen: a poster strip per
                                   shelf (sessions, bands, art, tees, patches,
                                   stickers, buttons)
    src/assets/illustrations/shop/sessions/
        chat.svg                   the video chats, as a session: a poster strip
        tarot.svg                  the tarot readings, as a session: a poster strip
        lessons.svg                the lessons, as a session: a poster strip
    src/assets/illustrations/shop/bands/
        <band id>.svg              each band's shelf: a gig-poster strip
    src/assets/illustrations/shop/designs/
        <item id>.svg              each design: the formats it is sold in
    src/assets/illustrations/shop/collections/
        <item id>.svg              each design as a collection: a poster strip
    src/assets/illustrations/shop/formats/
        tees.svg, patches.svg,     the formats a collection comes in: one
        stickers.svg, buttons.svg, square hang tag each, the same for all
        music.svg

The shop's pictures go by level, and every picture on one level shares a
template (shelf_tile for the shelves, band_tile for the bands and the
collections, design_tile for the designs, format_tile for the formats);
each level gets its own.

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
import re
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
    "B": (8.6, [[(0, 0), (0, 14)], [(0, 0), (5.4, 0), (7.9, 1.8), (7.9, 5), (5.4, 6.8), (0, 6.8)], [(0, 6.8), (5.8, 6.8), (8.6, 8.8), (8.6, 12), (5.8, 14), (0, 14)]]),
    "D": (9, [[(0, 0), (0, 14)], [(0, 0), (4.4, 0), (8.2, 2.8), (9, 7), (8.2, 11.2), (4.4, 14), (0, 14)]]),
    "C": (9, [[(9, 2.6), (6.5, 0.2), (3, 0.6), (0.5, 4), (0.4, 9.5), (2.6, 13.2), (6, 14), (9, 11.6)]]),
    "E": (8, [[(8, 0), (0, 0), (0, 14), (8, 14)], [(0, 7), (6.2, 7)]]),
    "F": (8, [[(8, 0), (0, 0), (0, 14)], [(0, 7), (6.2, 7)]]),
    "G": (10, [[(9.4, 2.6), (6.8, 0.2), (3, 0.6), (0.5, 4), (0.4, 9.5), (2.6, 13.2), (6, 14), (9.4, 12)], [(9.4, 12), (9.4, 8.2), (5.4, 8.2)]]),
    "H": (9, [[(0, 0), (0, 14)], [(9, 0), (9, 14)], [(0, 7.2), (9, 7.2)]]),
    "I": (2, [[(1, 0), (1, 14)]]),
    "K": (9, [[(0, 0), (0, 14)], [(9, 0), (0.6, 8.4)], [(3.2, 5.8), (9, 14)]]),
    "L": (7.5, [[(0, 0), (0, 14), (7.5, 14)]]),
    "M": (11, [[(0, 14), (0, 0), (5.5, 8.4), (11, 0), (11, 14)]]),
    "N": (9, [[(0, 14), (0, 0), (9, 14), (9, 0)]]),
    "O": (10, [ELLIPSE]),
    "Ö": (10, [ELLIPSE, [(3.2, -3.4), (3.4, -3.1)], [(6.8, -3.4), (7, -3.1)]]),
    "P": (8, [[(0, 14), (0, 0), (5.6, 0), (8, 1.8), (8, 5.2), (5.6, 7.2), (0, 7.2)]]),
    "R": (9, [[(0, 14), (0, 0), (5.8, 0), (8.4, 1.8), (8.4, 5.2), (5.8, 7.2), (0, 7.2)], [(4, 7.2), (9, 14)]]),
    "S": (8.5, [[(8.2, 1.8), (5.6, 0), (2.2, 0.3), (0.4, 3), (1.6, 5.8), (6.8, 8), (8.4, 11), (6.2, 14), (2.4, 14), (0, 12.2)]]),
    "T": (9, [[(0, 0), (9, 0)], [(4.5, 0), (4.5, 14)]]),
    "U": (9, [[(0, 0), (0, 9.8), (1.6, 13.3), (4.5, 14), (7.4, 13.3), (9, 9.8), (9, 0)]]),
    "V": (10, [[(0, 0), (5, 14), (10, 0)]]),
    "X": (9, [[(0, 0), (9, 14)], [(9, 0), (0, 14)]]),
    "Y": (10, [[(0, 0), (5, 7.2), (10, 0)], [(5, 7.2), (5, 14)]]),
}
SMOOTH = {"B", "C", "D", "G", "O", "Ö", "S", "U"}


def marker_width(text):
    """How wide `text` letters out, in alphabet units (cap height 14)."""
    return sum(GLYPHS[c][0] + 3.4 if c != " " else 7 for c in text) - 3.4


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



# --- The portrait ----------------------------------------------------------------

def lift(d, scale, frm, to):
    """Redraw path data at another size and place: absolute points move from
    around `frm` to around `to` and scale, relative ones only scale. Covers
    the M, L, C (and m, l, c) the tarot figure is drawn with."""
    out, cmd, nums = [], None, []

    def flush():
        if cmd is None:
            return
        pts = []
        for i in range(0, len(nums), 2):
            x, y = nums[i] * scale, nums[i + 1] * scale
            if cmd.isupper():
                x = to[0] + (nums[i] - frm[0]) * scale
                y = to[1] + (nums[i + 1] - frm[1]) * scale
            pts.append(f"{x:.1f} {y:.1f}")
        out.append(cmd + " ".join(pts))

    for token in re.findall(r"[MLCZmlcz]|-?\d*\.?\d+", d):
        if token.isalpha():
            flush()
            cmd, nums = token, []
            if token in "Zz":
                out.append("Z")
                cmd = None
        else:
            nums.append(float(token))
    flush()
    return " ".join(out)


def portrait():
    """Tibbie's avatar: a head-and-shoulders drawing of her. The head, hair and
    captain's cap are the tarot figure's own, redrawn bigger, so she is the
    same person in every picture; the bust, the halter, the chains and the
    sunglasses come from the photo. Square and transparent round the
    figure, so the avatar's ring shows behind her the way it did behind the
    cut-out, and drawn to survive the ring's circular crop."""
    w = h = 320
    s, frm, to = 1.12, (205, 164), (150, 140)  # the tarot head -> this one

    def tarot(d, fill, stroke=INK, width=3):
        return f'<path d="{lift(d, s, frm, to)}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" />'

    tank = "#F7ECE8"  # the tarot figure's white tank
    pivot = lift("M205 100", s, frm, to)[1:]

    body = "\n".join([
        # Hair, the mass behind her shoulders: the tarot figure's.
        tarot("M152 104 C120 130 132 160 118 190 C104 222 128 236 116 262 C140 276 168 268 176 252 "
              "L234 252 C244 270 274 276 296 262 C284 236 306 220 292 190 C278 160 290 128 258 104 Z", HAIR),
        tarot("M132 176 C126 200 140 214 130 240 M282 176 C290 200 274 216 284 240", "none", HAIR_SHADE),

        # Neck, then shoulders broad enough to fill the frame.
        f'<path d="M132 184 L132 240 L168 240 L168 184 Z" fill="{SKIN_SHADE}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M24 340 L34 284 C46 258 92 242 128 236 L172 236 C208 242 250 254 264 278 L276 340 Z" '
        f'fill="{SKIN}" stroke="{INK}" stroke-width="3" />',

        # The halter: two straps up to the back of her neck, the top over them.
        f'<path d="M118 282 L136 238 M182 282 L164 238" fill="none" stroke="{INK}" stroke-width="11" />'
        f'<path d="M118 282 L136 238 M182 282 L164 238" fill="none" stroke="{tank}" stroke-width="6" />',
        f'<path d="M68 340 L78 290 C94 276 110 272 122 278 C134 300 166 300 178 278 C190 272 206 276 222 290 '
        f'L232 340 Z" fill="{tank}" stroke="{INK}" stroke-width="3" />',
        f'<path d="M134 316 C144 324 156 324 166 316" fill="none" stroke="#E4D3CD" stroke-width="3" />',

        # Two chains: the short one with the tarot pendant, the long one
        # down to the sunglasses hooked in her neckline.
        f'<path d="M131 226 C134 258 166 258 169 226" fill="none" stroke="{AMBER_MID}" stroke-width="2" />'
        f'<path d="M150 250 l4 8 -4 8 -4 -8z" fill="{AMBER}" stroke="{AMBER_DARK}" stroke-width="1.4" />',
        f'<path d="M129 230 C120 280 140 292 150 292 C160 292 180 280 171 230" fill="none" stroke="{AMBER_MID}" stroke-width="2" />',
        f'<path d="M126 298 L174 298" stroke="{INK}" stroke-width="3" />'
        f'<ellipse cx="137" cy="304" rx="12" ry="9" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        f'<ellipse cx="163" cy="304" rx="12" ry="9" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M131 302 l6 -4 M157 302 l6 -4" stroke="{OUTLINE}" stroke-width="1.6" />',

        # Tattoos on both shoulders: the tarot figure's rose on her right.
        f'<path d="M58 266 c8 -6 16 0 12 8 c-4 8 -14 4 -12 -4 M70 288 c-8 2 -10 10 -4 14 '
        f'M220 268 l10 -8 M226 280 l10 -8" fill="none" stroke="{INK}" stroke-width="2.4" />'
        f'<circle cx="65" cy="271" r="3.4" fill="{RED}" />',

        # Head, faceless, and the hair in front: the tarot figure's.
        f'<ellipse cx="150" cy="140" rx="56" ry="65" fill="{SKIN}" stroke="{INK}" stroke-width="3" />',
        tarot("M156 112 C176 136 210 128 236 116 C246 112 256 114 258 120 C262 140 258 150 254 156 "
              "C252 136 240 128 226 132 C204 140 174 140 156 128 Z", HAIR),
        tarot("M156 116 C140 140 150 168 140 196 C132 220 148 236 140 252 C156 252 162 236 160 216 "
              "C158 196 168 176 164 156 C162 140 166 128 156 116 Z", HAIR),
        tarot("M254 116 C270 140 260 168 270 196 C278 220 262 236 270 252 C254 252 248 236 250 216 "
              "C252 196 242 176 246 156 C248 140 244 128 254 116 Z", HAIR),
        tarot("M150 170 C146 190 156 206 150 228 M260 170 C264 190 254 206 260 228", "none", HAIR_SHADE, 2.4),
        f'<circle cx="95" cy="173" r="7" fill="none" stroke="{AMBER_MID}" stroke-width="2.4" />'
        f'<circle cx="205" cy="173" r="7" fill="none" stroke="{AMBER_MID}" stroke-width="2.4" />',

        # The captain's cap: the tarot figure's, at the same tilt.
        f'<g transform="rotate(-6 {pivot})">'
        + tarot("M146 112 C140 92 160 70 205 68 C254 66 274 88 266 112 Z", BLACK)
        + tarot("M150 100 L262 100 L264 114 L148 114 Z", DARK)
        + tarot("M148 114 C170 128 240 128 264 114 C252 132 162 132 148 114 Z", BLACK)
        + tarot("M156 118 C178 126 232 126 256 118", "none", DARK_HI, 2)
        + f'<path d="{lift("M152 106 L260 106", s, frm, to)}" stroke="{AMBER}" stroke-width="2" stroke-dasharray="4 3" />'
        + tarot("M205 80 l5 9 10 1 -8 6 3 10 -10 -6 -10 6 3 -10 -8 -6 10 -1z", AMBER, AMBER_DARK, 1.2)
        + "</g>",

    ])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <!-- Tibbie, drawn and faceless: head and shoulders, in the captain's cap,
       halter and chains, tattooed shoulders. The profile card's
       avatar (site/ProfileCard.tsx). Generated by scripts/draw-illustrations.py;
       edit it there: the tarot figure's head, hair and cap at this size, flat
       shapes in the site's palette, with a paper sticker edge round her. -->
  <defs>
    {STICKER}
  </defs>
  <g filter="url(#sticker)" stroke-linejoin="round" stroke-linecap="round">
{body}
  </g>
</svg>
"""


# --- Shop shelves (the top level: Bands, Art) -----------------------------------

def shelf_tile(title, art, seed):
    """The template every shelf picture shares: a 600px square, edge to edge,
    the halftone screen the link-row prints show through, the drawing in the
    upper part, and the shelf's name hand-lettered on a strip of paper tape
    across the bottom. Only `art` and the title change between shelves."""
    w = h = 600
    defs = f"""<pattern id="halftone" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="{DARK}" />
      <circle cx="6" cy="6" r="2" fill="{DARK_HI}" />
    </pattern>
    <radialGradient id="pool" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="{AMBER}" stop-opacity="0.22" />
      <stop offset="1" stop-color="{AMBER}" stop-opacity="0" />
    </radialGradient>
    <pattern id="grille" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 3.5 H7" stroke="{DARK_HI}" stroke-width="1.6" />
    </pattern>"""
    rng = random.Random(seed)
    top, bottom = 470, 566
    edge = [(36, top)] + [(36 + i * 528 / 8, top + rng.uniform(-3, 3)) for i in range(1, 8)] + [(564, top)]
    edge += [(564 + rng.uniform(-4, 4), top + (bottom - top) * j / 4) for j in range(1, 4)]
    edge += [(564, bottom)] + [(564 - i * 528 / 8, bottom + rng.uniform(-3, 3)) for i in range(1, 8)] + [(36, bottom)]
    edge += [(36 + rng.uniform(-4, 4), bottom - (bottom - top) * j / 4) for j in range(1, 4)]
    tape = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in edge) + " Z"
    body = "\n".join([
        f'<rect width="{w}" height="{h}" fill="url(#halftone)" />',
        f'<rect width="{w}" height="{h}" fill="url(#pool)" />',
        art,
        f'<g transform="rotate(-3 300 518)">'
        f'<path d="{tape}" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M36 {top + 12} H564" stroke="{INK}" stroke-opacity="0.08" stroke-width="10" />'
        + marker(title, 300, 490, 56, INK, seed=seed + 1)
        + "</g>",
    ])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <!-- The {title.title()} shelf in the shop. A placeholder, generated by
       scripts/draw-illustrations.py; edit it there. Every shelf picture
       shares this template (shelf_tile): a square, edge to edge, the drawing
       over a halftone screen and the name on a strip of tape. -->
  <defs>
    {defs}
  </defs>
  <g stroke-linejoin="round" stroke-linecap="round">
{body}
  </g>
</svg>
"""


def bands_art():
    """A bass in front of an amp, picks on the floor: playing, not one band."""
    picks = "".join(
        f'<path d="M0 -14 C10 -14 14 -8 12 -2 C9 7 3 13 0 16 C-3 13 -9 7 -12 -2 C-14 -8 -10 -14 0 -14 Z" '
        f'transform="translate({x} {y}) rotate({a})" fill="{c}" stroke="{INK}" stroke-width="2.4" />'
        for x, y, a, c in [(96, 430, -20, RED), (140, 448, 25, AMBER), (468, 438, 10, CORAL), (512, 420, -35, PAPER)])
    strings = "".join(
        f'<path d="M{-9 + i * 6} -250 L{-9 + i * 6} 70" stroke="{OUTLINE}" stroke-width="1.4" />' for i in range(4))
    return "\n".join([
        # The amp behind.
        f'<rect x="300" y="168" width="232" height="270" rx="10" fill="{BLACK}" stroke="{INK}" stroke-width="3" />',
        f'<rect x="314" y="182" width="204" height="44" rx="4" fill="{DARK_HI}" stroke="{INK}" stroke-width="2" />',
        "".join(f'<circle cx="{x}" cy="204" r="8" fill="{AMBER}" stroke="{INK}" stroke-width="2" />' for x in (340, 372, 404, 436)),
        f'<rect x="314" y="238" width="204" height="186" rx="4" fill="url(#grille)" stroke="{INK}" stroke-width="2" />',
        f'<circle cx="416" cy="331" r="66" fill="none" stroke="{DARK_HI}" stroke-width="5" />',
        # The bass, leaning across.
        f'<g transform="translate(262 326) rotate(-32) scale(0.9)">'
        # Neck and headstock.
        f'<rect x="-15" y="-270" width="30" height="230" rx="4" fill="#8A5A3A" stroke="{INK}" stroke-width="3" />'
        + "".join(f'<path d="M-15 {-250 + i * 22} H15" stroke="{OUTLINE}" stroke-width="1.6" />' for i in range(10))
        + f'<path d="M-18 -270 L-24 -330 C-10 -340 14 -340 22 -326 L18 -270 Z" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        + "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="{OUTLINE}" stroke="{INK}" stroke-width="1.6" />' for x, y in [(-30, -316), (-30, -292), (28, -316), (28, -292)])
        # Body: an offset double cutaway.
        + f'<path d="M-30 -60 C-60 -96 -96 -84 -92 -44 C-90 -12 -110 10 -108 48 C-104 104 -50 132 0 128 C56 132 108 100 106 46 C104 10 86 -4 90 -40 C94 -78 60 -96 30 -60 C14 -44 -14 -44 -30 -60 Z" '
          f'fill="{RED}" stroke="{INK}" stroke-width="3" />'
        + f'<path d="M-26 -50 C-48 -70 -76 -64 -74 -36 C-72 -10 -90 12 -88 46 C-84 92 -40 112 0 108" fill="none" stroke="{PAPER}" stroke-opacity="0.35" stroke-width="6" />'
        # Pickguard, pickups, bridge, knobs.
        + f'<path d="M-20 -44 C-44 -40 -60 -10 -52 30 C-46 60 -20 70 4 64 L12 -40 Z" fill="{BLACK}" stroke="{INK}" stroke-width="2.4" />'
        + f'<rect x="-22" y="-10" width="44" height="18" rx="5" fill="{BLACK}" stroke="{OUTLINE}" stroke-width="2" />'
        + f'<rect x="-22" y="28" width="44" height="18" rx="5" fill="{BLACK}" stroke="{OUTLINE}" stroke-width="2" />'
        + f'<rect x="-20" y="62" width="40" height="12" rx="2" fill="{OUTLINE}" stroke="{INK}" stroke-width="2" />'
        + "".join(f'<circle cx="{x}" cy="{y}" r="7" fill="{AMBER}" stroke="{INK}" stroke-width="2" />' for x, y in [(56, 50), (64, 80)])
        + strings
        + "</g>",
        picks,
    ])


def art_art():
    """A canvas splattered red and amber, a spray can, a brush."""
    rng = random.Random(77)
    splats = []
    for cx, cy, r, c in [(250, 190, 46, RED), (330, 270, 34, AMBER_MID), (200, 300, 26, CORAL), (360, 170, 18, AMBER), (290, 330, 14, RED)]:
        splats.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{c}" />')
        for _ in range(7):
            a = rng.uniform(0, math.tau)
            d = r + rng.uniform(6, 24)
            splats.append(f'<circle cx="{cx + d * math.cos(a):.1f}" cy="{cy + d * math.sin(a):.1f}" r="{rng.uniform(2, 6):.1f}" fill="{c}" />')
        splats.append(f'<path d="M{cx - r * 0.3:.1f} {cy + r * 0.8:.1f} q2 {r * 0.9:.1f} 0 {r * 1.3:.1f}" stroke="{c}" stroke-width="{max(4, r / 5):.1f}" fill="none" />')
    return "\n".join([
        # The canvas, a little skewed on its stretcher.
        f'<g transform="rotate(-4 280 250)">'
        f'<rect x="132" y="88" width="300" height="320" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
        f'<rect x="132" y="88" width="300" height="320" fill="none" stroke="{OUTLINE}" stroke-opacity="0.5" stroke-width="10" />'
        + "".join(splats)
        # One loaded brushstroke swept across it.
        + f'<path d="M166 360 C214 300 262 352 300 270 C330 204 364 220 398 134" fill="none" stroke="{RED}" stroke-width="18" />'
        + f'<path d="M172 366 C220 306 268 358 306 276 C336 210 370 226 404 140" fill="none" stroke="{RED_DEEP}" stroke-opacity="0.35" stroke-width="5" />'
        + "</g>",
        # The spray can, at the right.
        f'<g transform="translate(470 300) rotate(10)">'
        f'<rect x="-34" y="-70" width="68" height="160" rx="10" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        f'<rect x="-34" y="-10" width="68" height="56" fill="{AMBER}" stroke="{INK}" stroke-width="2.4" />'
        f'<path d="M-12 4 L12 32 M12 4 L-12 32" stroke="{RED}" stroke-width="6" />'
        f'<path d="M-26 -70 C-26 -100 26 -100 26 -70 Z" fill="{OUTLINE}" stroke="{INK}" stroke-width="3" />'
        f'<rect x="-9" y="-112" width="18" height="18" rx="3" fill="{PAPER}" stroke="{INK}" stroke-width="2.4" />'
        f'<path d="M-24 -60 V80" stroke="{PAPER}" stroke-opacity="0.25" stroke-width="6" />'
        "</g>",
        # The brush, across the lower left.
        f'<g transform="translate(150 388) rotate(-38) scale(0.92)">'
        f'<rect x="-12" y="-140" width="24" height="150" rx="10" fill="{AMBER_MID}" stroke="{INK}" stroke-width="3" />'
        f'<rect x="-14" y="10" width="28" height="34" fill="{OUTLINE}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M-14 44 C-16 70 -6 92 0 100 C6 92 16 70 14 44 Z" fill="{RED}" stroke="{INK}" stroke-width="3" />'
        "</g>",
    ])


# --- Band shelves (the second level, under Bands) --------------------------------

# Room round a banner's strip for the tape on its corners: the canvas is the
# 600 x 200 strip plus this much each side. BANNER_WIDTH/BANNER_HEIGHT in
# content/shop.ts restate the canvas: change both.
BANNER_MARGIN = (24, 16)


def band_tile(name, sub_line, emblem, paper, ink, seed, sub_ink=None,
              sub_size=15, about=None):
    """The template every band's picture shares, and unlike the shelf tiles
    above: a wide 3:1 gig-poster strip, torn along its top and bottom and
    taped at two corners. Nothing is painted behind it, so the page shows
    through the torn edges, and the canvas runs past the strip on every side
    (BANNER_MARGIN) so the tape hanging off its corners isn't cut off. The band's name is lettered huge
    on the left with her role and years under it, and the band's emblem is a
    sticker on the right. Only the name, the line, the emblem and the paper
    and ink colours change between bands.

    The collections under a band (and under Art) wear the same strip, with
    what they come in as the line and their sticker as the emblem: `about`
    replaces the file's header comment, and `sub_size` lets a longer line
    clear the emblem."""
    w, h = 600, 200
    mx, my = BANNER_MARGIN
    rng = random.Random(seed)
    top = [(0, 14)] + [(i * 600 / 14, 14 + rng.uniform(-5, 5)) for i in range(1, 14)] + [(600, 14)]
    bottom = [(600, 186)] + [(600 - i * 600 / 14, 186 + rng.uniform(-5, 5)) for i in range(1, 14)] + [(0, 186)]
    poster = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in top + bottom) + " Z"
    speckle = "".join(
        f'<circle cx="{rng.uniform(0, 600):.0f}" cy="{rng.uniform(16, 184):.0f}" r="{rng.uniform(0.6, 1.8):.1f}" />'
        for _ in range(140))
    tape = (f'<rect x="-46" y="-13" width="92" height="26" fill="{OUTLINE}" fill-opacity="0.92" stroke="{INK}" stroke-opacity="0.4" stroke-width="1.4" />'
            f'<path d="M-46 -6 H46 M-46 4 H46" stroke="{INK}" stroke-opacity="0.15" stroke-width="2" />')
    body = "\n".join([
        f'<path d="{poster}" fill="{paper}" stroke="{INK}" stroke-width="3" />',
        # Photocopier grit.
        f'<g fill="{ink}" fill-opacity="0.18">{speckle}</g>',
        # One line big, or two a size down; either way it fills the left.
        *([marker(name[0], 34, 36, 84, ink, anchor="start", angle=-2, seed=seed + 1, fit=360)]
          if len(name) == 1 else
          [marker(line, 34, 38 + i * 58, 50, ink, anchor="start", angle=-2, seed=seed + 1 + i, fit=360)
           for i, line in enumerate(name)]),
        f'<text x="38" y="168" font-family="ui-monospace, Menlo, monospace" font-size="{sub_size}" font-weight="700" '
        f'letter-spacing="{2.4 if sub_size >= 15 else 1.6}" fill="{sub_ink or ink}" fill-opacity="0.85">{sub_line}</text>',
        emblem,
        f'<g transform="translate(22 22) rotate(-34)">{tape}</g>',
        f'<g transform="translate(578 178) rotate(-34)">{tape}</g>',
    ])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-mx} {-my} {w + 2 * mx} {h + 2 * my}" width="{w + 2 * mx}" height="{h + 2 * my}">
  <!-- {about or f"{' '.join(name).title()}'s shelf in the shop."} A placeholder,
       generated by scripts/draw-illustrations.py; edit it there. Every band's
       and collection's picture shares this template (band_tile): a 3:1
       gig-poster strip on nothing, taped, the name lettered big, a line
       under it, an emblem. -->
  <defs>
    {CANVAS}
  </defs>
  <g stroke-linejoin="round" stroke-linecap="round">
{body}
  </g>
</svg>
"""


def roundel(cx, cy, r, fill, ring, text, ink, seed, small=None):
    out = (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{INK}" stroke-width="3" />'
           f'<circle cx="{cx}" cy="{cy}" r="{r - 8}" fill="none" stroke="{ring}" stroke-opacity="0.6" stroke-width="1.6" />'
           + marker(text, cx, cy - r * 0.42, r * 0.62, ink, angle=-6, seed=seed))
    if small:
        out += mono(small, cx, cy + r * 0.52, 10, ink, spacing=1.6)
    return out


def starburst(cx, cy, r_out, r_in, fill, angle=-8):
    pts = []
    for i in range(24):
        r = r_out if i % 2 == 0 else r_in
        a = i * math.pi / 12 - math.pi / 2
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"
    return f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="3" transform="rotate({angle} {cx} {cy})" />'


def mic_badge(cx, cy, r):
    """A paper badge with a stage mic on it, for GASH."""
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
            f'<g transform="translate({cx} {cy}) rotate(-24)">'
            f'<path d="M0 -6 L0 44" stroke="{INK}" stroke-width="12" />'
            f'<path d="M0 -6 L0 44" stroke="{DARK_HI}" stroke-width="7" />'
            f'<circle cx="0" cy="-22" r="20" fill="{OUTLINE}" stroke="{INK}" stroke-width="3" />'
            f'<path d="M-14 -30 L14 -14 M-14 -16 L12 -32 M-6 -40 L18 -24" stroke="{INK}" stroke-opacity="0.45" stroke-width="1.6" />'
            f'</g>'
            f'<path d="M{cx - 48} {cy - 30} l10 6 M{cx - 52} {cy - 6} l12 0 M{cx + 40} {cy - 34} l-10 8" stroke="{RED}" stroke-width="3" />')


BAND_TILES = {
    "reagan-youth": dict(
        name=["REAGAN", "YOUTH"], sub_line="BASS · 2018 – PRESENT", paper=RED, ink=PAPER, seed=400,
        emblem=roundel(500, 100, 66, PAPER, RED, "RY", RED, seed=401, small="QUEENS 1980")),
    "leftover-crack": dict(
        name=["LEFTÖVER", "CRACK"], sub_line="BASS · 2015 – PRESENT", paper=AMBER, ink=INK, seed=410,
        emblem=starburst(500, 100, 74, 56, CORAL) + marker("LÖC", 500, 82, 34, INK, angle=-8, seed=411)),
    "gash": dict(
        name=["GASH"], sub_line="BASS · VOCALS · 2019 – PRESENT", paper=DARK, ink=RED, sub_ink=PAPER, seed=420,
        emblem=mic_badge(500, 100, 66)),
}


# --- Designs (the third level, a band's shelf or Art) ----------------------------

def womens_tee(x, y, w, h, fill, angle=0):
    """The women's cut: fitted through the waist, with short cap sleeves."""
    sx, sy = w / 230, h / 350
    d = ("M80 0 C96 16 134 16 150 0 L196 16 L214 66 L184 76 L178 120 "
         "C170 172 176 236 188 350 L42 350 C54 236 60 172 52 120 L46 76 "
         "L16 66 L34 16 Z")
    collar = "M80 0 C96 16 134 16 150 0"
    return (f'<g transform="translate({x} {y}) rotate({angle} {w / 2} {h / 2}) scale({sx:.4f} {sy:.4f})">'
            f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="{3 / sx:.2f}" />'
            f'<path d="{collar}" fill="none" stroke="{INK}" stroke-width="{6 / sx:.2f}" />'
            f'</g>')


def design_tile(spec):
    """The template every design's picture shares, and unlike the two levels
    above: a 600px square flat-lay on a screen printer's cutting mat, the
    design's name and band on a strip of masking tape, and the design shown
    in every format it is sold in.

    Which pieces are in the pile follows the formats, never the drawing:
      - tees only: a men's tee and a women's tee side by side;
      - otherwise one tee, plus a patch if there is a patch, a sticker if
        there is a sticker, and a record if there is a track."""
    w = h = 600
    formats = spec["formats"]
    seed = spec["seed"]
    tees_only = formats <= {"tee", "tee-womens"}
    grid = "".join(
        f'<path d="M{i * 30} 0 V{h} M0 {i * 30} H{w}" stroke="{OUTLINE}" '
        f'stroke-opacity="{0.22 if i % 5 == 0 else 0.08}" stroke-width="{1.6 if i % 5 == 0 else 1}" />'
        for i in range(1, 20))
    ticks = "".join(
        f'<path d="M{i * 15} 0 V{9 if i % 2 else 16} M0 {i * 15} H{9 if i % 2 else 16}" stroke="{OUTLINE}" stroke-opacity="0.45" stroke-width="1.2" />'
        for i in range(1, 40))
    lines, tee_fill, tee_ink = spec["lines"], spec["tee"], spec["tee_ink"]

    def lettering(cx, cy, size, fit, angle, k):
        # One size for every line, so a long line does not shrink alone.
        size = min(size, fit * 14 / max(marker_width(line) for line in lines))
        return "".join(
            marker(line, cx, cy + i * (size + 12), size, tee_ink, angle=angle, seed=seed + k + i)
            for i, line in enumerate(lines))

    pieces = []
    if tees_only:
        pieces += [
            tee(28, 128, 296, 448, tee_fill, angle=-5),
            lettering(176, 262, 30, 150, -5, 10),
            womens_tee(300, 176, 262, 372, spec.get("tee_womens", tee_fill), angle=5),
            lettering(432, 292, 26, 124, 5, 20),
        ]
    else:
        pieces += [tee(24, 130, 300, 456, tee_fill, angle=-4),
                   lettering(174, 268, 30, 156, -4, 10)]
        if "record" in formats:
            pieces.append(record(462, 196, 104, spec.get("record_label", RED)))
        if "patch" in formats:
            fill, ink, text = spec["patch"]
            pieces.append(raw_patch(316, 392, 240, 150, fill, ink, seed=seed + 30, angle=5))
            pieces += [marker(line, 436, 432 + i * 34, 24, ink, angle=5, seed=seed + 31 + i, fit=176)
                       for i, line in enumerate(text)]
        if "sticker" in formats:
            pieces.append(spec["sticker"](*((530, 318, 60) if "record" in formats else (464, 236, 82))))

    rng = random.Random(seed)
    top, bottom = 22, 98
    edge = [(22, top)] + [(22 + i * 300 / 6, top + rng.uniform(-2, 2)) for i in range(1, 6)] + [(322, top)]
    edge += [(326, (top + bottom) / 2)]
    edge += [(322, bottom)] + [(322 - i * 300 / 6, bottom + rng.uniform(-2, 2)) for i in range(1, 6)] + [(22, bottom)]
    edge += [(18, (top + bottom) / 2)]
    tape = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in edge) + " Z"

    body = "\n".join([
        f'<rect width="{w}" height="{h}" fill="{DARK}" />',
        grid,
        ticks,
        f'<g filter="url(#sticker)">{"".join(pieces)}</g>',
        f'<g transform="rotate(-3 172 60)">'
        f'<path d="{tape}" fill="{CREAM}" fill-opacity="0.96" stroke="{INK}" stroke-width="2.4" />'
        + marker(spec["label"], 40, 34, 26, INK, anchor="start", seed=seed + 40, fit=270)
        + f'<text x="41" y="86" font-family="ui-monospace, Menlo, monospace" font-size="12" '
          f'font-weight="700" letter-spacing="2.2" fill="{INK}" fill-opacity="0.75">{spec["band"]}</text>'
        + "</g>",
    ])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <!-- {spec["label"].title()}, as a design in the shop: the formats it is
       sold in, laid out on a cutting mat. A placeholder for its card,
       generated by scripts/draw-illustrations.py; edit it there. Every
       design's picture shares this template (design_tile). -->
  <defs>
    {STICKER}
    {CANVAS}
  </defs>
  <g stroke-linejoin="round" stroke-linecap="round">
{body}
  </g>
</svg>
"""


def sticker_roundel(fill, ink, text, seed):
    return lambda cx, cy, r: (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{INK}" stroke-width="3" />'
        f'<circle cx="{cx}" cy="{cy}" r="{r - 8}" fill="none" stroke="{ink}" stroke-opacity="0.5" stroke-width="1.6" />'
        + marker(text, cx, cy - r * 0.26, r * 0.5, ink, angle=-8, seed=seed, fit=r * 1.5))


def sticker_burst(fill, ink, text, seed):
    return lambda cx, cy, r: (
        starburst(cx, cy, r * 1.08, r * 0.82, fill)
        + marker(text, cx, cy - r * 0.24, r * 0.46, ink, angle=-8, seed=seed, fit=r * 1.3))


# Keyed by the shop item's id (content/shop.ts). `formats` is the item's
# format ids, plus "record" for a design with a track: the pile is built from
# it, so keep it in step with the item.
DESIGN_TILES = {
    "ry-the-next-generation": dict(
        label="THE NEXT GENERATION", band="REAGAN YOUTH", seed=500,
        formats={"sticker", "patch", "tee", "tee-womens"},
        tee=BLACK, tee_ink=AMBER, lines=["THE NEXT", "GENERATION"],
        patch=(BLACK, AMBER, ["NEXT", "GEN"]),
        sticker=sticker_roundel(AMBER, INK, "TNG", 501)),
    "lc-leftover-frank": dict(
        label="LEFTOVER FRANK", band="LEFTOVER CRACK", seed=510,
        formats={"sticker", "patch", "tee", "tee-womens"},
        tee=BLACK, tee_ink=PAPER, lines=["LEFTOVER", "FRANK"],
        patch=(CREAM, INK, ["FRANK"]),
        sticker=sticker_burst(PAPER, INK, "FRANK", 511)),
    "gash-on-a-leash": dict(
        label="ON A LEASH", band="GASH", seed=520,
        formats={"tee", "tee-womens"},
        tee=BLACK, tee_womens=DARK_HI, tee_ink=PAPER, lines=["GASH", "ON A LEASH"]),
    "a-vampire-cats": dict(
        label="VAMPIRE CATS", band="ART", seed=530,
        formats={"sticker", "patch", "tee", "tee-womens"},
        tee=BLACK, tee_ink=CORAL, lines=["VAMPIRE", "CATS"],
        patch=(RED, PAPER, ["VAMPIRE", "CATS"]),
        sticker=sticker_roundel(CORAL, INK, "CATS", 531)),
}


def chain_badge(cx, cy, r):
    """A paper badge with three links of chain, for On a Leash, which has no
    sticker to borrow."""
    links = "".join(
        f'<ellipse cx="{cx + dx}" cy="{cy + dy}" rx="17" ry="10" transform="rotate({a} {cx + dx} {cy + dy})" '
        f'fill="none" stroke="{INK}" stroke-width="9" />'
        f'<ellipse cx="{cx + dx}" cy="{cy + dy}" rx="17" ry="10" transform="rotate({a} {cx + dx} {cy + dy})" '
        f'fill="none" stroke="{OUTLINE}" stroke-width="5" />'
        for dx, dy, a in [(-28, 20, -40), (0, 0, 50), (28, -20, -40)])
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
            + links)


# Each design as a collection under its band or under Art: the band strip's
# template, its name, its parent and formats as the line, and the sticker
# from its pile (DESIGN_TILES) as the emblem. Keyed by item id, like those.
COLLECTION_BANNERS = {
    "ry-the-next-generation": dict(
        name=["THE NEXT", "GENERATION"], sub_line="REAGAN YOUTH · STICKER · PATCH · TEES",
        paper=BLACK, ink=AMBER, sub_ink=PAPER, seed=600,
        emblem=DESIGN_TILES["ry-the-next-generation"]["sticker"](500, 100, 66)),
    "lc-leftover-frank": dict(
        name=["LEFTOVER", "FRANK"], sub_line="LEFTOVER CRACK · STICKER · PATCH · TEES",
        paper=AMBER_MID, ink=PAPER, seed=610,
        emblem=DESIGN_TILES["lc-leftover-frank"]["sticker"](500, 100, 62)),
    "gash-on-a-leash": dict(
        name=["ON A", "LEASH"], sub_line="GASH · TEES",
        paper=DARK_HI, ink=PAPER, seed=620,
        emblem=chain_badge(500, 100, 66)),
    "a-vampire-cats": dict(
        name=["VAMPIRE", "CATS"], sub_line="ART · STICKER · PATCH · TEES",
        paper=RED_DEEP, ink=PAPER, seed=630,
        emblem=DESIGN_TILES["a-vampire-cats"]["sticker"](500, 100, 66)),
}


# --- Formats (the fourth level: what a collection comes in) ----------------------

def format_tile(label, item, seed):
    """The template every format's picture shares, and unlike the levels
    above: a garment hang tag on a string, square on black, one generic
    piece drawn on it and the format's name lettered underneath. It names no
    design or band, so one tag serves every collection."""
    w, h = 600, 600
    rng = random.Random(seed)
    # The tag: clipped top corners and a punched, reinforced hole.
    tag = "M110 64 L370 64 L420 114 L420 572 L60 572 L60 114 Z"
    weave = "".join(
        f'<circle cx="{rng.uniform(64, 416):.0f}" cy="{rng.uniform(70, 568):.0f}" r="{rng.uniform(0.6, 1.6):.1f}" />'
        for _ in range(90))
    body = "\n".join([
        f'<rect width="{w}" height="{h}" fill="{BLACK}" />',
        # The tag is drawn 480 wide; centre it in the square.
        '<g transform="translate(60 0)">',
        # The string, looping up off the top.
        f'<path d="M240 98 C214 60 226 22 262 0" fill="none" stroke="{AMBER_MID}" stroke-width="4" />'
        f'<path d="M240 98 C270 64 286 30 300 0" fill="none" stroke="{AMBER_MID}" stroke-width="4" />',
        f'<g transform="rotate(-3 240 318)">'
        f'<path d="{tag}" fill="{CREAM}" stroke="{INK}" stroke-width="3" />'
        f'<g fill="{INK}" fill-opacity="0.16">{weave}</g>'
        f'<path d="M72 120 L72 560 L408 560 L408 120" fill="none" stroke="{INK}" stroke-opacity="0.25" stroke-width="1.6" stroke-dasharray="6 5" />'
        f'<circle cx="240" cy="98" r="16" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
        f'<circle cx="240" cy="98" r="8" fill="{BLACK}" />'
        f'<g filter="url(#sticker)">{item}</g>'
        + marker(label, 240, 486, 48, INK, seed=seed + 1, fit=300)
        + "</g>",
        "</g>",
    ])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <!-- {label.title()}, one of the formats a collection comes in. A
       placeholder, generated by scripts/draw-illustrations.py; edit it
       there. Every format's picture shares this template (format_tile): a
       hang tag on a string, one generic piece, the format lettered. -->
  <defs>
    {STICKER}
    {CANVAS}
  </defs>
  <g stroke-linejoin="round" stroke-linecap="round">
{body}
  </g>
</svg>
"""


def x_mark(cx, cy, size, ink, width=10):
    half = size / 2
    return (f'<path d="M{cx - half} {cy - half} L{cx + half} {cy + half} M{cx + half} {cy - half} L{cx - half} {cy + half}" '
            f'stroke="{ink}" stroke-width="{width}" />')


def pin_button(cx, cy, r, face, art="", angle=0):
    """A pinback button, face up: the printed face rolled over a metal rim,
    a crescent of shine across its top left, the art in the middle."""
    shine = (f'<path d="M{cx - r * 0.72:.1f} {cy - r * 0.18:.1f} A{r * 0.74:.1f} {r * 0.74:.1f} 0 0 1 '
             f'{cx - r * 0.1:.1f} {cy - r * 0.74:.1f}" fill="none" stroke="{PAPER}" '
             f'stroke-opacity="0.55" stroke-width="{max(3, r * 0.09):.1f}" />')
    return (f'<g transform="rotate({angle} {cx} {cy})">'
            f'<circle cx="{cx}" cy="{cy + r * 0.06:.1f}" r="{r}" fill="{OUTLINE}" stroke="{INK}" stroke-width="3" />'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{face}" stroke="{INK}" stroke-width="3" />'
            f'<circle cx="{cx}" cy="{cy}" r="{r * 0.88:.1f}" fill="none" stroke="{INK}" stroke-opacity="0.22" stroke-width="2" />'
            f'{art}{shine}</g>')


def pin_back(cx, cy, r, angle=0):
    """A pinback button turned over: the bare back and its bent steel pin."""
    return (f'<g transform="rotate({angle} {cx} {cy})">'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{OUTLINE}" stroke="{INK}" stroke-width="3" />'
            f'<circle cx="{cx}" cy="{cy}" r="{r * 0.8:.1f}" fill="{CREAM}" stroke="{INK}" stroke-width="2" />'
            f'<path d="M{cx - r * 0.62:.1f} {cy + r * 0.1:.1f} L{cx + r * 0.6:.1f} {cy - r * 0.08:.1f}" '
            f'stroke="{INK}" stroke-width="6" />'
            f'<path d="M{cx - r * 0.62:.1f} {cy + r * 0.1:.1f} L{cx + r * 0.6:.1f} {cy - r * 0.08:.1f}" '
            f'stroke="{OUTLINE}" stroke-width="3" />'
            f'<path d="M{cx - r * 0.62:.1f} {cy + r * 0.1:.1f} c-10 -2 -12 -16 -2 -18" fill="none" '
            f'stroke="{INK}" stroke-width="4" />'
            f'<rect x="{cx + r * 0.52:.1f}" y="{cy - r * 0.2:.1f}" width="{r * 0.26:.1f}" height="{r * 0.24:.1f}" rx="3" '
            f'fill="{DARK_HI}" stroke="{INK}" stroke-width="2" /></g>')


def star(cx, cy, r, fill, points=5):
    pts = []
    for i in range(points * 2):
        rad = r if i % 2 == 0 else r * 0.45
        a = i * math.pi / points - math.pi / 2
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"
    return f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="3" />'


FORMAT_TILES = {
    # Both cuts: the women's tee peeks out behind the men's.
    "tees": ("TEES", "".join([
        womens_tee(214, 156, 178, 262, RED_DEEP, angle=8),
        tee(88, 150, 214, 318, BLACK, angle=-5),
        x_mark(194, 262, 54, RED, width=12),
    ])),
    "patches": ("PATCHES", "".join([
        raw_patch(104, 176, 272, 184, RED, PAPER, seed=710, angle=-5),
        x_mark(240, 268, 70, PAPER, width=14),
    ])),
    # A round one and a starburst, overlapping.
    "stickers": ("STICKERS", "".join([
        f'<circle cx="182" cy="220" r="76" fill="{AMBER}" stroke="{INK}" stroke-width="3" />',
        star(182, 220, 44, RED),
        starburst(300, 322, 82, 62, CORAL, angle=10),
        x_mark(300, 322, 50, INK, width=10),
    ])),
    # A record sliding out of its sleeve.
    "music": ("LISTEN", "".join([
        record(290, 246, 104, RED),
        f'<rect x="100" y="232" width="206" height="206" rx="3" fill="{BLACK}" stroke="{INK}" stroke-width="3" transform="rotate(-4 203 335)" />',
        f'<circle cx="203" cy="335" r="62" fill="none" stroke="{DARK_HI}" stroke-width="3" transform="rotate(-4 203 335)" />',
        star(203, 335, 30, RED),
    ])),
    # Two buttons face up, one turned over to show its pin.
    "buttons": ("BUTTONS", "".join([
        pin_back(318, 196, 62, angle=-18),
        pin_button(184, 236, 88, RED, star(184, 236, 46, AMBER), angle=-8),
        pin_button(300, 344, 70, BLACK, x_mark(300, 344, 44, CORAL, width=11), angle=6),
    ])),
}


# --- Sessions (a shelf of her time, beside Bands and Art) ------------------------

def tarot_card(cx, cy, angle, face=False, w=78, h=118):
    """One tarot card: a back with a moon and a star, or The Star face up."""
    half_w, half_h = w / 2, h / 2
    if face:
        inner = (f'<rect x="{-half_w + 8}" y="{-half_h + 8}" width="{w - 16}" height="{h - 16}" rx="3" fill="none" stroke="{AMBER_MID}" stroke-width="1.6" />'
                 + mono("XVII", 0, -half_h + 26, 11, INK)
                 + f'<path d="M0 -22 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6z" fill="{AMBER_MID}" />'
                 + mono("THE STAR", 0, half_h - 14, 8.5, INK, spacing=1))
        fill = PAPER
    else:
        inner = (f'<rect x="{-half_w + 8}" y="{-half_h + 8}" width="{w - 16}" height="{h - 16}" rx="3" fill="none" stroke="{AMBER}" stroke-width="1.6" />'
                 f'<path d="M6 -22 a17 17 0 1 0 0 30 a13 13 0 1 1 0 -30z" fill="{AMBER}" />'
                 f'<path d="M0 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="{AMBER}" />')
        fill = "#3A211C"
    return (f'<g transform="translate({cx} {cy}) rotate({angle})">'
            f'<rect x="{-half_w}" y="{-half_h}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{INK}" stroke-width="3" />'
            f'{inner}</g>')


def sessions_art():
    """A phone propped up mid video call, Tibbie on the screen, faceless;
    a fan of tarot cards beside it, and an hourglass for the time booked."""
    return "\n".join([
        # The hourglass, at the left.
        f'<g transform="translate(96 330)">'
        f'<rect x="-34" y="-82" width="68" height="12" rx="3" fill="{AMBER_MID}" stroke="{INK}" stroke-width="3" />'
        f'<rect x="-34" y="70" width="68" height="12" rx="3" fill="{AMBER_MID}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M-26 -70 C-26 -20 -4 -10 -4 0 C-4 10 -26 20 -26 70 L26 70 C26 20 4 10 4 0 C4 -10 26 -20 26 -70 Z" fill="{PAPER}" fill-opacity="0.85" stroke="{INK}" stroke-width="3" />'
        f'<path d="M-18 -46 L18 -46 C14 -26 4 -14 0 -6 C-4 -14 -14 -26 -18 -46 Z" fill="{AMBER}" />'
        f'<path d="M0 -6 L0 50" stroke="{AMBER}" stroke-width="2" />'
        f'<path d="M-22 70 C-14 48 14 48 22 70 Z" fill="{AMBER}" />'
        f'</g>',
        # The cards, fanned at the right.
        tarot_card(452, 300, 18),
        tarot_card(420, 296, 4),
        tarot_card(388, 300, -10, face=True),
        # The phone, propped up in the middle.
        f'<g transform="rotate(-4 262 260)">'
        f'<rect x="168" y="64" width="190" height="378" rx="28" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        f'<rect x="180" y="86" width="166" height="334" rx="16" fill="{DARK_HI}" />'
        f'<rect x="240" y="72" width="46" height="8" rx="4" fill="{DARK_HI}" />'
        # Her, on the call: hair, red top, the cap, no face.
        f'<path d="M222 182 C204 214 214 262 200 300 C218 314 240 308 246 298 L282 298 C288 308 310 314 326 300 C312 262 322 214 304 182 Z" fill="{HAIR}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M190 420 L196 352 C204 326 236 314 256 312 L272 312 C292 314 324 326 332 352 L338 420 Z" fill="{RED}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M248 280 L248 314 L280 314 L280 280 Z" fill="{SKIN_SHADE}" stroke="{INK}" stroke-width="3" />'
        f'<ellipse cx="264" cy="236" rx="40" ry="48" fill="{SKIN}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M226 222 C230 196 248 186 266 188 C286 188 302 200 302 224 C290 214 276 212 264 218 C252 212 238 212 226 222 Z" fill="{HAIR}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M218 196 C214 176 232 158 264 156 C298 154 316 172 310 196 Z" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
        f'<path d="M216 196 C238 206 292 206 312 196" fill="none" stroke="{INK}" stroke-width="5" />'
        f'<path d="M264 162 l3.5 7 7.5 1 -5.5 5 1.5 7.5 -7 -4 -7 4 1.5 -7.5 -5.5 -5 7.5 -1z" fill="{AMBER}" />'
        # The self-view in the corner, and the call's buttons.
        f'<rect x="290" y="98" width="46" height="62" rx="6" fill="{BLACK}" stroke="{OUTLINE}" stroke-width="1.6" />'
        f'<circle cx="313" cy="122" r="10" fill="{OUTLINE}" />'
        f'<path d="M297 160 C299 144 327 144 329 160 Z" fill="{OUTLINE}" />'
        f'<rect x="180" y="378" width="166" height="42" fill="{BLACK}" fill-opacity="0.55" />'
        f'<circle cx="230" cy="399" r="13" fill="{DARK_HI}" stroke="{PAPER}" stroke-width="1.6" />'
        f'<circle cx="296" cy="399" r="13" fill="{RED}" stroke="{PAPER}" stroke-width="1.6" />'
        f'<path d="M289 401 C293 395 299 395 303 401" fill="none" stroke="{PAPER}" stroke-width="3" />'
        f'<path d="M230 392 V402 M225 400 C225 408 235 408 235 400" fill="none" stroke="{PAPER}" stroke-width="2" />'
        f'</g>',
    ])


def speech_bubbles(cx, cy, angle):
    """Two speech bubbles talking over each other: a paper one with the
    three dots of someone typing, and a red one answering under it."""
    return (f'<g transform="translate({cx} {cy}) rotate({angle})">'
            f'<path d="M-58 -50 H30 a12 12 0 0 1 12 12 V6 a12 12 0 0 1 -12 12 H-22 L-44 38 L-38 18 H-58 a12 12 0 0 1 -12 -12 V-38 a12 12 0 0 1 12 -12 Z" '
            f'fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
            + "".join(f'<circle cx="{x}" cy="-16" r="6" fill="{INK}" />' for x in (-40, -14, 12))
            + f'<path d="M4 2 H58 a10 10 0 0 1 10 10 V40 a10 10 0 0 1 -10 10 H54 L60 66 L38 50 H4 a10 10 0 0 1 -10 -10 V12 a10 10 0 0 1 10 -10 Z" '
            f'fill="{RED}" stroke="{INK}" stroke-width="3" />'
            f'<path d="M10 20 H52 M10 32 H40" stroke="{PAPER}" stroke-width="3" stroke-linecap="round" />'
            f'</g>')


def notebook(cx, cy, angle):
    """An open ruled notebook with a pencil laid across it."""
    rules = "".join(
        f'<path d="M-60 {y} L-10 {y + 3}" stroke="{OUTLINE}" stroke-width="2" />'
        f'<path d="M10 {y + 3} L60 {y}" stroke="{OUTLINE}" stroke-width="2" />'
        for y in (-26, -12, 2, 16))
    return (f'<g transform="translate({cx} {cy}) rotate({angle})">'
            f'<path d="M0 -42 C-22 -54 -50 -54 -72 -44 V48 C-50 38 -22 38 0 50 Z" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
            f'<path d="M0 -42 C22 -54 50 -54 72 -44 V48 C50 38 22 38 0 50 Z" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
            f'{rules}'
            f'<g transform="translate(14 22) rotate(-34)">'
            f'<rect x="-50" y="-7" width="84" height="14" fill="{AMBER_MID}" stroke="{INK}" stroke-width="3" />'
            f'<rect x="-64" y="-7" width="14" height="14" fill="{CORAL}" stroke="{INK}" stroke-width="3" />'
            f'<path d="M34 -7 L54 0 L34 7 Z" fill="{SKIN}" stroke="{INK}" stroke-width="3" stroke-linejoin="round" />'
            f'<path d="M47 -2.5 L54 0 L47 2.5 Z" fill="{INK}" />'
            f'</g></g>')


# Each kind of session, as a banner inside Sessions: the collection strip's
# template, the session's name, how it is given and how long it runs, and
# an emblem. Keyed by the service id in content/offerings.ts.
SESSION_BANNERS = {
    "chat": dict(
        name=["VIDEO", "CHATS"], sub_line="OVER FACETIME · 15, 30 OR 60 MIN",
        paper=CORAL, ink=INK, seed=910,
        emblem=speech_bubbles(500, 96, -6)),
    "lessons": dict(
        name=["PRIVATE", "LESSONS"], sub_line="OVER FACETIME · 30, 60 OR 90 MIN",
        paper=YELLOW, ink=INK, seed=920,
        emblem=notebook(498, 100, -6)),
    "tarot": dict(
        name=["TAROT", "READINGS"], sub_line="OVER FACETIME · 30, 60 OR 90 MIN",
        paper="#3A211C", ink=AMBER, sub_ink=PAPER, seed=900,
        emblem=tarot_card(500, 100, 8, face=True, w=84, h=126)),
}


# --- The Buy tab's first screen: a banner per shelf ------------------------------

def badge(cx, cy, r, fill=PAPER):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{INK}" stroke-width="3" />'


def phone_badge(cx, cy):
    """A phone mid call, for Sessions."""
    return (badge(cx, cy, 66)
            + f'<g transform="rotate(-8 {cx} {cy})">'
            f'<rect x="{cx - 26}" y="{cy - 46}" width="52" height="92" rx="9" fill="{BLACK}" stroke="{INK}" stroke-width="3" />'
            f'<rect x="{cx - 21}" y="{cy - 38}" width="42" height="70" rx="4" fill="{DARK_HI}" />'
            f'<circle cx="{cx}" cy="{cy - 10}" r="11" fill="{SKIN}" />'
            f'<path d="M{cx - 14} {cy - 16} C{cx - 12} {cy - 30} {cx + 12} {cy - 30} {cx + 14} {cy - 16} C{cx + 16} {cy - 4} {cx + 14} {cy + 6} {cx + 12} {cy + 8} L{cx + 8} {cy - 8} L{cx - 8} {cy - 8} L{cx - 12} {cy + 8} C{cx - 14} {cy + 6} {cx - 16} {cy - 4} {cx - 14} {cy - 16} Z" fill="{HAIR}" />'
            f'<path d="M{cx - 18} {cy + 32} C{cx - 16} {cy + 12} {cx + 16} {cy + 12} {cx + 18} {cy + 32} Z" fill="{RED}" />'
            f'<circle cx="{cx + 10}" cy="{cy + 40}" r="4" fill="{RED}" />'
            f'</g>')


def pick_badge(cx, cy):
    """A big guitar pick with a star on it, for Bands."""
    return (f'<path d="M0 -58 C42 -58 58 -34 50 -8 C38 28 14 52 0 64 C-14 52 -38 28 -50 -8 C-58 -34 -42 -58 0 -58 Z" '
            f'transform="translate({cx} {cy}) rotate(-10)" fill="{PAPER}" stroke="{INK}" stroke-width="3" />'
            + star(cx, cy - 4, 26, RED))


def splat_badge(cx, cy):
    """Paint thrown at a paper roundel, for Art."""
    rng = random.Random(61)
    drops = "".join(
        f'<circle cx="{cx + 22 + 34 * math.cos(a):.1f}" cy="{cy - 10 + 34 * math.sin(a):.1f}" r="{rng.uniform(2, 5):.1f}" fill="{RED}" />'
        for a in [rng.uniform(0, math.tau) for _ in range(8)])
    return (badge(cx, cy, 66)
            + f'<circle cx="{cx + 14}" cy="{cy - 8}" r="24" fill="{RED}" />' + drops
            + f'<circle cx="{cx - 22}" cy="{cy + 18}" r="16" fill="{AMBER_MID}" />'
            + f'<path d="M{cx + 8} {cy + 14} q2 18 0 26" stroke="{RED}" stroke-width="6" fill="none" />'
            + f'<path d="M{cx - 44} {cy + 34} C{cx - 10} {cy} {cx + 10} {cy + 30} {cx + 44} {cy - 30}" stroke="{INK}" stroke-width="5" fill="none" />')


def tee_badge(cx, cy):
    """A tee on a paper roundel, for Tee Shirts."""
    return badge(cx, cy, 66) + tee(cx - 34, cy - 42, 68, 90, BLACK, angle=-6) + x_mark(cx - 2, cy - 2, 18, RED, width=5)


def patch_badge(cx, cy):
    """A raw-cut patch with its border of X's, for Patches."""
    return (raw_patch(cx - 62, cy - 42, 124, 84, RED, PAPER, seed=640, angle=-6)
            + x_mark(cx, cy, 34, PAPER, width=8))


def button_badge(cx, cy):
    """Two pinback buttons, overlapping, for Buttons."""
    return (pin_button(cx - 22, cy - 6, 52, BLACK, star(cx - 22, cy - 6, 28, AMBER), angle=-8)
            + pin_button(cx + 34, cy + 26, 40, AMBER, x_mark(cx + 34, cy + 26, 24, RED, width=7), angle=8))


def sticker_badge(cx, cy):
    """A starburst sticker with a star, for Stickers."""
    return starburst(cx, cy, 70, 52, AMBER, angle=8) + star(cx, cy, 30, RED)


# Keyed by the shelf id in content/shop.ts (SHOP_SHELVES), in that order.
SHELF_BANNERS = {
    "sessions": dict(name=["SESSIONS"], sub_line="CHATS · TAROT · LESSONS · OVER FACETIME",
                     paper=BLACK, ink=CORAL, sub_ink=PAPER, seed=1000, emblem=phone_badge(500, 100)),
    "bands": dict(name=["BANDS"], sub_line="MERCH FROM THE BANDS SHE PLAYS IN",
                  paper=RED, ink=PAPER, seed=1010, emblem=pick_badge(500, 96)),
    "art": dict(name=["ART"], sub_line="ORIGINAL ART BY TIBBIE X",
                paper=AMBER, ink=INK, seed=1020, emblem=splat_badge(500, 100)),
    "tees": dict(name=["TEE", "SHIRTS"], sub_line="MEN’S AND WOMEN’S · EVERY DESIGN",
                 paper=DARK_HI, ink=PAPER, seed=1030, emblem=tee_badge(500, 100)),
    "patches": dict(name=["PATCHES"], sub_line="SCREEN PRINTED ON CANVAS · RAW CUT",
                    paper=CREAM, ink=RED, sub_ink=INK, seed=1040, emblem=patch_badge(500, 100)),
    "stickers": dict(name=["STICKERS"], sub_line="DIE CUT · FULL COLOR",
                     paper=CORAL, ink=INK, seed=1050, emblem=sticker_badge(500, 100)),
    "buttons": dict(name=["BUTTONS"], sub_line="PINBACK · FOR JACKETS, BAGS AND HATS",
                    paper=RED_DEEP, ink=AMBER, sub_ink=PAPER, seed=1060, emblem=button_badge(500, 100)),
}


LINK_ROWS = "src/assets/illustrations/link-rows"
FUND = "src/assets/illustrations/fund"
PROFILE = "src/assets/illustrations/profile"
SHOP = "src/assets/illustrations/shop"

files = {
    f"{LINK_ROWS}/tarot-spread.svg": TAROT,
    f"{SHOP}/bands.svg": shelf_tile("BANDS", bands_art(), seed=300),
    f"{SHOP}/art.svg": shelf_tile("ART", art_art(), seed=310),
    f"{SHOP}/sessions.svg": shelf_tile("SESSIONS", sessions_art(), seed=320),
    **{f"{SHOP}/shelves/{shelf}.svg": band_tile(**spec, sub_size=13,
                                                about=f"The {' '.join(spec['name']).title()} shelf, on the Buy tab's first screen.")
       for shelf, spec in SHELF_BANNERS.items()},
    **{f"{SHOP}/sessions/{service}.svg": band_tile(**spec, sub_size=13,
                                                   about=f"{' '.join(spec['name']).title()}, a session in the shop.")
       for service, spec in SESSION_BANNERS.items()},
    **{f"{SHOP}/bands/{band}.svg": band_tile(**spec) for band, spec in BAND_TILES.items()},
    **{f"{SHOP}/designs/{item}.svg": design_tile(spec) for item, spec in DESIGN_TILES.items()},
    **{f"{SHOP}/collections/{item}.svg": band_tile(**spec, sub_size=13,
                                                   about=f"{' '.join(spec['name']).title()}, a collection in the shop.")
       for item, spec in COLLECTION_BANNERS.items()},
    **{f"{SHOP}/formats/{name}.svg": format_tile(label, item, seed=800 + i * 10)
       for i, (name, (label, item)) in enumerate(FORMAT_TILES.items())},
    f"{FUND}/podcast-interview.svg": podcast(),
    f"{PROFILE}/tibbie-portrait.svg": portrait(),
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
