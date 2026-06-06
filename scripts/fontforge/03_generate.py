#!/usr/bin/env fontforge
# -*- coding: utf-8 -*-
"""
León Display v1 — Phase 3: Generate Fonts
==========================================
Run with:  fontforge -script 03_generate.py [Bold|Medium]

Prerequisites:
  - Phase 1 and Phase 2 complete.
  - All bespoke and punctuation glyphs drawn.
  - Anchors verified, metrics checked.

What this script does:
  1. Opens the completed .sfd.
  2. Runs validation and auto-hint on new glyphs.
  3. Verifies the minimum required glyph set is present and non-empty.
  4. Generates:
       LeonDisplay-{Weight}.otf   (desktop/print)
       LeonDisplay-{Weight}.woff2 (web, primary)
       LeonDisplay-{Weight}.woff  (web, legacy)
  5. Prints a QA checklist.
"""

import fontforge
import os
import sys

# ─── CONFIGURATION ────────────────────────────────────────────────────────────

WEIGHT   = sys.argv[1] if len(sys.argv) > 1 else "Bold"
OUT_DIR  = "/Users/kokonvt/Projects/bar-leon-cms/fonts/LeonDisplay"
SFD_PATH = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.sfd")

OTF_OUT   = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.otf")
TTF_OUT   = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.ttf")
WOFF2_OUT = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.woff2")
WOFF_OUT  = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.woff")

# Minimum required Unicode codepoints that must be present AND non-empty
REQUIRED_CODEPOINTS = [
    # Spanish
    0x00C1, 0x00C9, 0x00CD, 0x00D3, 0x00DA, 0x00DC, 0x00D1, 0x00A1, 0x00BF,
    # French
    0x00C0, 0x00C2, 0x00C7, 0x00C8, 0x00CA, 0x00CB, 0x00CE, 0x00CF,
    0x00D4, 0x00D9, 0x00DB, 0x0178,
    # German
    0x00C4, 0x00D6, 0x00DF,
    # Punctuation
    0x0021, 0x003F, 0x003A, 0x003B,
]

# Glyphs that must exist but may legitimately be empty (composites built from marks)
COMPOSITE_CODEPOINTS = [
    0x00C1, 0x00C9, 0x00CD, 0x00D3, 0x00DA, 0x00DC, 0x00D1,
    0x00C0, 0x00C2, 0x00C7, 0x00C8, 0x00CA, 0x00CB, 0x00CE, 0x00CF,
    0x00D4, 0x00D9, 0x00DB, 0x0178, 0x00C4, 0x00D6,
]

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _build_cp_map(f):
    """Build codepoint→glyph map by iterating all glyphs (cmap integer lookup unreliable in SFD)."""
    m = {}
    for g in f.glyphs():
        if g.unicode != -1:
            m[g.unicode] = g
        if g.altuni:
            for (uni, vs, fid) in g.altuni:
                if uni not in m:
                    m[uni] = g
    return m

_CP_MAP = None

def glyph_at(f, codepoint):
    """Return glyph if it has the given unicode value, else None."""
    global _CP_MAP
    if _CP_MAP is None:
        _CP_MAP = _build_cp_map(f)
    return _CP_MAP.get(codepoint)


def has_outlines(g):
    """True if the glyph has actual contours in the foreground layer."""
    if g is None:
        return False
    try:
        return len(g.foreground) > 0
    except Exception:
        return False


def has_refs(g):
    """True if the glyph has references (composite)."""
    if g is None:
        return False
    try:
        return len(g.references) > 0
    except Exception:
        return False


def is_non_empty(g):
    return has_outlines(g) or has_refs(g)

# ─── MAIN ─────────────────────────────────────────────────────────────────────

print(f"\n=== León Display v1 — Phase 3: Generate ({WEIGHT}) ===\n")

if not os.path.exists(SFD_PATH):
    print(f"ERROR: SFD not found at {SFD_PATH}")
    raise SystemExit(1)

f = fontforge.open(SFD_PATH)

# ── 1. PRE-FLIGHT VALIDATION ──────────────────────────────────────────────────
print("[1/4] Pre-flight glyph validation...")

warnings = []
errors   = []

for cp in REQUIRED_CODEPOINTS:
    g = glyph_at(f, cp)
    if g is None:
        errors.append(f"  MISSING  U+{cp:04X} ({chr(cp)!r})")
    elif not is_non_empty(g):
        if cp in COMPOSITE_CODEPOINTS:
            warnings.append(f"  EMPTY    U+{cp:04X} ({chr(cp)!r}) — composite, mark may not be drawn")
        else:
            errors.append(f"  EMPTY    U+{cp:04X} ({chr(cp)!r}) — needs drawing")
    else:
        print(f"  OK       U+{cp:04X} ({chr(cp)!r})")

for w in warnings:
    print(w)
for e in errors:
    print(e)

if errors:
    print(f"\n{len(errors)} error(s) found. Fix before generating.")
    print("Continuing anyway — output will have empty glyphs.\n")
else:
    print(f"\nAll required glyphs present. {len(warnings)} composite warning(s).\n")

# ── 2. AUTO-HINT ──────────────────────────────────────────────────────────────
print("[2/4] Auto-hinting new glyphs...")

hinted = 0
for g in f.glyphs():
    if g.isWorthOutputting():
        try:
            g.autoHint()
            hinted += 1
        except Exception:
            pass

print(f"  Hinted {hinted} glyphs.")

# ── 3. GENERATE ───────────────────────────────────────────────────────────────
print(f"\n[3/4] Generating font files...")

gen_flags = ("opentype", "PfEd-comments", "no-flex", "omit-instructions")

print(f"  OTF  → {OTF_OUT}")
f.generate(OTF_OUT, flags=gen_flags)

print(f"  TTF  → {TTF_OUT}")
try:
    ttf_flags = ("no-flex", "omit-instructions")
    f.generate(TTF_OUT, flags=ttf_flags)
except Exception as e:
    print(f"    TTF generation failed: {e}")

print(f"  WOFF → {WOFF_OUT}")
try:
    f.generate(WOFF_OUT, flags=gen_flags)
except Exception as e:
    print(f"    WOFF generation failed: {e}")
    print("    Install woff2 tools and use: woff2_compress LeonDisplay-Bold.otf")

print(f"  WOFF2 → {WOFF2_OUT}")
try:
    f.generate(WOFF2_OUT, flags=gen_flags)
except Exception as e:
    print(f"    WOFF2 generation failed: {e}")
    print("    Post-process: woff2_compress LeonDisplay-Bold.otf")

# ── 4. QA SUMMARY ─────────────────────────────────────────────────────────────
print(f"""
[4/4] QA Checklist
=================
Test the following in a browser or design tool:

Unicase behaviour:
  Type: ñoño güey ¡hola! façade ä ö ü ß
  Expected: renders identical to uppercase equivalents

Spanish (¡ ¿ and accents):
  ÑOÑO GÜEY ¡HOLA! ¿QUÉ TAL? ÁLVARO FÉLIX ÓSCAR

French (accents, ligatures, angle quotes):
  FAÇADE BŒUF PRÉFÉRENCE À BIENTÔT NOËL
  (AE and OE if drawn: ÆTHER ŒUVRE)

German (umlauts, angle quotes):
  KÄSE ÖFFNEN ÜBER STRAßE (or STRASSE if ß→SS active)

Punctuation:
  : ; ! ? - – — / & @ ( ) [ ] {{ }} " '

Quotation mark variants:
  "LÉON" 'CACHI' «BONJOUR» ‹FIN›

Currency:
  € £ $

Vertical clipping test:
  ÁÀÂÄÅÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜÑ
  (verify no diacritic is clipped at top in browser at any size)

Spacing test:
  AV VA WA AW TA AT FA LT LV
  (check for obvious gaps — a kern pass may be needed)

Ligature test:
  Cuchi  (C_u_c_h_i ligature must survive)
  Toggle ss01 in InDesign: A M V W Y vs alternates

Generated: {OTF_OUT}
""")

f.close()
print("=== PHASE 3 COMPLETE ===")
