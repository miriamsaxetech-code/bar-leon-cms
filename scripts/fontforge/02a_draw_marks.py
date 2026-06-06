#!/usr/bin/env fontforge
# -*- coding: utf-8 -*-
"""
León Display v1 — Phase 2a: Draw Combining Marks
=================================================
Run BEFORE 02_build_composites.py.

API confirmed against FontForge 20251009:
  g.clear()                               clears outlines + anchors
  g.layers[1]                             foreground layer
  fontforge.contour()  .closed = True
  c.moveTo(x, y)  .lineTo(x, y)  .cubicTo(cp1x,cp1y, cp2x,cp2y, x,y)
  lyr = g.layers[1]; lyr += c; g.layers[1] = lyr
  g.addAnchorPoint(name, type, x, y)      re-adds anchors after clear

Usage:  fontforge -script 02a_draw_marks.py [Bold|Medium]
"""

import fontforge
import os
import sys

WEIGHT   = sys.argv[1] if len(sys.argv) > 1 else "Bold"
OUT_DIR  = "/Users/kokonvt/Projects/bar-leon-cms/fonts/LeonDisplay"
SFD_PATH = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.sfd")

# Bold = full design size; Medium = 78% stroke weight
SCALE = 1.0 if WEIGHT == "Bold" else 0.78

KAPPA = 0.5522847498   # cubic bezier circle approximation constant

# ─── COORDINATE HELPERS ───────────────────────────────────────────────────────

def s(v):
    return int(round(v * SCALE))


def make_poly(*pts):
    """Closed straight-line polygon from (x, y) pairs."""
    c = fontforge.contour()
    c.closed = True
    first = True
    for (x, y) in pts:
        if first:
            c.moveTo(int(x), int(y))
            first = False
        else:
            c.lineTo(int(x), int(y))
    return c


def make_spline(cmds):
    """
    Closed mixed straight/cubic contour.
    cmds: list of ('M', x, y) | ('L', x, y) | ('C', cp1x, cp1y, cp2x, cp2y, x, y)
    """
    c = fontforge.contour()
    c.closed = True
    for cmd in cmds:
        if cmd[0] == 'M':
            c.moveTo(int(cmd[1]), int(cmd[2]))
        elif cmd[0] == 'L':
            c.lineTo(int(cmd[1]), int(cmd[2]))
        elif cmd[0] == 'C':
            c.cubicTo(int(cmd[1]), int(cmd[2]),
                      int(cmd[3]), int(cmd[4]),
                      int(cmd[5]), int(cmd[6]))
    return c


def make_circle(cx, cy, r):
    """Approximate circle via 4-segment cubic bezier."""
    k = round(KAPPA * r)
    cx, cy, r = int(cx), int(cy), int(r)
    c = fontforge.contour()
    c.closed = True
    c.moveTo(cx + r, cy)
    c.cubicTo(cx + r, cy + k,  cx + k, cy + r,  cx,     cy + r)
    c.cubicTo(cx - k, cy + r,  cx - r, cy + k,  cx - r, cy    )
    c.cubicTo(cx - r, cy - k,  cx - k, cy - r,  cx,     cy - r)
    c.cubicTo(cx + k, cy - r,  cx + r, cy - k,  cx + r, cy    )
    return c


# ─── MARK SHAPE DEFINITIONS ───────────────────────────────────────────────────
# (0, 0) = mark anchor point — attaches to base letter at y=850.
# Marks extend upward (positive y). Cedilla descends (negative y).

def make_acutecomb():
    """Acute ´ — bold wedge rising right. Width 120u (was 85) to match letter stem weight."""
    return [make_poly(
        (s(-115), s(15)),
        (s(5),    s(15)),
        (s(105),  s(180)),
        (s(-15),  s(180)),
    )]


def make_gravecomb():
    """Grave ` — mirror of acute. Width 120u."""
    return [make_poly(
        (s(-5),   s(15)),
        (s(115),  s(15)),
        (s(15),   s(180)),
        (s(-105), s(180)),
    )]


def make_circumflexcomb():
    """
    Circumflex ^ — single 6-point polygon. Eliminates the split-peak gap
    that two separate arm contours produce. The V-notch at (0,100) separates
    the two feet; the outer peak at (0,185) is a single connected apex.
    """
    return [make_poly(
        (s(-150), s(15)),   # outer-left foot
        (s(-55),  s(15)),   # inner-left foot
        (s(0),    s(100)),  # inner peak / V-notch
        (s(55),   s(15)),   # inner-right foot
        (s(150),  s(15)),   # outer-right foot
        (s(0),    s(185)),  # outer apex — single connected point
    )]


def make_tildecomb():
    """
    Tilde ~ — thicker S-wave. Stroke width raised from ~60u to ~100u
    so it reads at bold display weight. Upper edge peaks at 195, lower at 95.
    """
    return [make_spline([
        # Upper edge: low-left → high → low-center → high → low-right
        ('M', s(-130), s(140)),
        ('C', s(-110), s(195),  s(-20), s(195),  s(0),    s(165)),
        ('C', s(20),   s(135),  s(110), s(195),  s(130),  s(140)),
        # Step down ~100u to lower edge
        ('L', s(130),  s(40)),
        # Lower edge: reverse wave right-to-left (mirrors upper)
        ('C', s(110),  s(95),   s(20),  s(35),   s(0),    s(65)),
        ('C', s(-20),  s(95),   s(-110),s(95),   s(-130), s(40)),
    ])]


def make_dieresiscomb():
    """
    Dieresis ¨ — larger dots. Radius raised from 48u to 68u (diameter 136u)
    so they read as bold marks rather than pinpoints over massive letter bodies.
    """
    r = s(68)
    cx = s(80)   # half-separation between dot centres
    cy = s(90)
    return [
        make_circle(-cx, cy, r),
        make_circle( cx, cy, r),
    ]


def make_cedillacomb():
    """Cedilla ¸ — bold C-hook below baseline (negative y coordinates)."""
    return [make_spline([
        # Top stub (near baseline)
        ('M', s(-18),  s(-8)),
        ('L', s(18),   s(-8)),
        ('L', s(22),   s(-42)),
        # Outer arc sweeps right and down
        ('C', s(62),   s(-50),   s(68),   s(-115),  s(22),   s(-148)),
        # Bottom arc curls back left
        ('C', s(-12),  s(-165),  s(-52),  s(-142),  s(-48),  s(-105)),
        # Inner return curves back up toward connector
        ('C', s(-38),  s(-78),   s(-8),   s(-65),   s(8),    s(-50)),
        ('L', s(4),    s(-35)),
    ])]


# ─── APPLY TO GLYPH ───────────────────────────────────────────────────────────

MARKS = [
    ("acutecomb",      make_acutecomb),
    ("gravecomb",      make_gravecomb),
    ("circumflexcomb", make_circumflexcomb),
    ("tildecomb",      make_tildecomb),
    ("dieresiscomb",   make_dieresiscomb),
    ("cedillacomb",    make_cedillacomb),
]


def apply_mark(f, mark_name, make_fn):
    """Draw mark outlines, preserving anchor points (g.clear removes them)."""
    if mark_name not in f:
        print(f"  SKIP {mark_name}: glyph not found — run Phase 1 first")
        return False

    g = f[mark_name]
    saved = list(g.anchorPoints)   # (name, type, x, y)

    g.clear()                      # removes outlines AND anchors

    contours = make_fn()
    lyr = g.layers[1]              # index 1 = foreground
    for c in contours:
        lyr += c
    g.layers[1] = lyr

    g.width = 0                    # combining marks are zero-advance

    for ap in saved:
        g.addAnchorPoint(ap[0], ap[1], ap[2], ap[3])

    anchor_str = " | ".join(f"{ap[0]}({ap[1]})" for ap in saved)
    print(f"  {mark_name:<18} {len(contours)} contour(s)   [{anchor_str}]")
    return True


# ─── MAIN ─────────────────────────────────────────────────────────────────────

print(f"\n=== León Display v1 — Phase 2a: Draw Combining Marks ({WEIGHT}) ===\n")
print(f"Scale: {SCALE}  (Bold = 1.0, Medium = 0.78)\n")

if not os.path.exists(SFD_PATH):
    print(f"ERROR: SFD not found: {SFD_PATH}")
    print("Run 01_prepare_sfd.py first.")
    raise SystemExit(1)

f = fontforge.open(SFD_PATH)
print(f"Opened: {f.fullname}  ({len(list(f.glyphs()))} glyphs)\n")

drawn = 0
for mark_name, make_fn in MARKS:
    if apply_mark(f, mark_name, make_fn):
        drawn += 1

print(f"\nDrawn: {drawn}/{len(MARKS)}")
print(f"\nSaving to {SFD_PATH} ...")
f.save(SFD_PATH)
f.close()

print(f"""
=== PHASE 2a COMPLETE ===

All {drawn} combining marks have outlines.

Next — build composite accented glyphs:
  fontforge -script scripts/fontforge/02_build_composites.py {WEIGHT}

Or via run.sh:
  ./scripts/fontforge/run.sh 2 {WEIGHT}
""")
