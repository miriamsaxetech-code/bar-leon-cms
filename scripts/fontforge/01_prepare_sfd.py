#!/usr/bin/env fontforge
# -*- coding: utf-8 -*-
"""
León Display v1 — Phase 1: Prepare SFD
=======================================
Run with:  fontforge -script 01_prepare_sfd.py [Bold|Medium]

What this script does:
  1. Opens the original CQT León OTF.
  2. Renames the family to "León Display".
  3. Updates vertical metrics to accommodate diacritics.
  4. Adds a GPOS mark2base lookup with two anchor classes: "top" and "cedilla".
  5. Places base anchors on all 26 letters from their actual bounding boxes.
  6. Creates empty glyph slots for:
       - 6 combining mark primitives (to be drawn by designer)
       - 21 precomposed composite glyphs (built automatically in Phase 2)
       - Bespoke glyphs: AE, OE, germandbls, exclamdown, questiondown
       - Full punctuation set
       - Quotation marks and currency
  7. Sets unicase altuni entries (lowercase → same glyph as uppercase).
  8. Sets advance widths for all new glyphs.
  9. Saves as .sfd (FontForge native format) — preserves everything for Phase 2.

After running this script:
  → Open the .sfd in FontForge.
  → Draw the 6 combining marks (see DRAWING GUIDE in the plan document).
  → Run 02_build_composites.py.
"""

import fontforge
import psMat
import os
import sys

# ─── CONFIGURATION ────────────────────────────────────────────────────────────

WEIGHT = sys.argv[1] if len(sys.argv) > 1 else "Bold"

BASE_DIR = "/Users/kokonvt/Projects/bar-leon-clean/04_ASSETS/FONTS"
OUT_DIR  = "/Users/kokonvt/Projects/bar-leon-cms/fonts/LeonDisplay"

SOURCE = {
    "Bold":   os.path.join(BASE_DIR, "CQTLeón-Bold.otf"),
    "Medium": os.path.join(BASE_DIR, "CQTLeón-Medium.otf"),
}

WEIGHT_CLASS = {"Bold": 700, "Medium": 500}

os.makedirs(OUT_DIR, exist_ok=True)

SFD_OUT = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.sfd")

# ─── METRICS ──────────────────────────────────────────────────────────────────
# Diacritics sit in the 850-980 zone above baseline.
# We raise ascent metrics to prevent clipping in browsers.

NEW_TYPO_ASCENDER  =  900
NEW_HHEA_ASCENT    = 1050
NEW_WIN_ASCENT     = 1050
CAP_HEIGHT         =  800
TOP_ANCHOR_Y       =  850   # where top-diacritic anchors sit on base letters
CEDILLA_ANCHOR_Y   =    0   # baseline (cedilla hangs below)

# ─── GLYPH TABLES ─────────────────────────────────────────────────────────────

# (glyph_name, unicode_cap, unicode_lc_altuni, base_glyph, mark_glyph)
# unicode_lc_altuni = None means no unicase alias needed
COMPOSITES = [
    # Spanish
    ("Aacute",      0x00C1, 0x00E1, "A", "acutecomb"),
    ("Eacute",      0x00C9, 0x00E9, "E", "acutecomb"),
    ("Iacute",      0x00CD, 0x00ED, "I", "acutecomb"),
    ("Oacute",      0x00D3, 0x00F3, "O", "acutecomb"),
    ("Uacute",      0x00DA, 0x00FA, "U", "acutecomb"),
    ("Udieresis",   0x00DC, 0x00FC, "U", "dieresiscomb"),
    ("Ntilde",      0x00D1, 0x00F1, "N", "tildecomb"),
    # French extras
    ("Agrave",      0x00C0, 0x00E0, "A", "gravecomb"),
    ("Acircumflex", 0x00C2, 0x00E2, "A", "circumflexcomb"),
    ("Ccedilla",    0x00C7, 0x00E7, "C", "cedillacomb"),
    ("Egrave",      0x00C8, 0x00E8, "E", "gravecomb"),
    ("Ecircumflex", 0x00CA, 0x00EA, "E", "circumflexcomb"),
    ("Edieresis",   0x00CB, 0x00EB, "E", "dieresiscomb"),
    ("Icircumflex", 0x00CE, 0x00EE, "I", "circumflexcomb"),
    ("Idieresis",   0x00CF, 0x00EF, "I", "dieresiscomb"),
    ("Ocircumflex", 0x00D4, 0x00F4, "O", "circumflexcomb"),
    ("Ugrave",      0x00D9, 0x00F9, "U", "gravecomb"),
    ("Ucircumflex", 0x00DB, 0x00FB, "U", "circumflexcomb"),
    ("Ydieresis",   0x0178, 0x00FF, "Y", "dieresiscomb"),
    # German extras
    ("Adieresis",   0x00C4, 0x00E4, "A", "dieresiscomb"),
    ("Odieresis",   0x00D6, 0x00F6, "O", "dieresiscomb"),
]

# (glyph_name, unicode, width_reference_glyph or int, note)
BESPOKE = [
    ("AE",           0x00C6, "A",   "AE ligature — draw from scratch"),
    ("OE",           0x0152, "O",   "OE ligature — draw from scratch"),
    ("germandbls",   0x00DF, "S",   "Eszett — draw or use GSUB SS sub"),
    ("exclamdown",   0x00A1, 350,   "Inverted ! — derive from exclam"),
    ("questiondown", 0x00BF, 580,   "Inverted ? — derive from question"),
]
BESPOKE_ALTUNI = {
    0x00C6: 0x00E6,   # AE → ae
    0x0152: 0x0153,   # OE → oe
}

# (glyph_name, unicode, width, note)
PUNCTUATION = [
    # Basic (likely missing entirely from source)
    ("exclam",       0x0021, 350,  "Vertical stroke + dot — derive from period"),
    ("question",     0x003F, 580,  "Curved arm + dot — Q-curve quality"),
    ("colon",        0x003A, 350,  "Two periods stacked"),
    ("semicolon",    0x003B, 350,  "Period + comma stacked"),
    ("hyphen",       0x002D, 400,  "Horizontal bar at mid-height"),
    ("endash",       0x2013, 600,  "En dash — 1.5× hyphen"),
    ("emdash",       0x2014, 1000, "Em dash — 2.5× hyphen"),
    ("slash",        0x002F, 460,  "Diagonal — match italic angle of thin strokes"),
    ("ampersand",    0x0026, 900,  "Calligraphic & — draw from scratch"),
    ("at",           0x0040, 960,  "@ — draw from scratch"),
    ("parenleft",    0x0028, 360,  "Gentle open curve"),
    ("parenright",   0x0029, 360,  "Mirror of parenleft"),
    ("bracketleft",  0x005B, 360,  "Rectangular bracket"),
    ("bracketright", 0x005D, 360,  "Mirror of bracketleft"),
    ("braceleft",    0x007B, 360,  "Calligraphic brace"),
    ("braceright",   0x007D, 360,  "Mirror of braceleft"),
    ("quotedbl",     0x0022, 460,  "Two vertical ticks"),
    ("quotesingle",  0x0027, 250,  "Single vertical tick"),
    # Typographic quotes
    ("quoteleft",    0x2018, 260,  "Rotated comma"),
    ("quoteright",   0x2019, 260,  "Comma shape"),
    ("quotedblleft", 0x201C, 460,  "Two quoteright forms"),
    ("quotedblright",0x201D, 460,  "Two quoteright forms"),
    ("quotedblbase", 0x201E, 460,  "Low-9 double — two commas"),
    ("guillemotleft",0x00AB, 560,  "Double angle «"),
    ("guillemotright",0x00BB,560,  "Double angle »"),
    ("guilsinglleft",0x2039, 340,  "Single angle ‹"),
    ("guilsinglright",0x203A,340,  "Single angle ›"),
    # Currency
    ("euro",         0x20AC, 760,  "€ — derive from C + two bars"),
    ("sterling",     0x00A3, 760,  "£ — derive from L + crossbar + tail"),
    ("dollar",       0x0024, 760,  "$ — derive from S + vertical bar"),
]

# Combining marks — designer must draw these
MARKS = [
    ("acutecomb",      0x0301, "Acute — calligraphic stroke ~65° angle"),
    ("gravecomb",      0x0300, "Grave — calligraphic stroke, opposite of acute"),
    ("circumflexcomb", 0x0302, "Circumflex — inverted V, echo A/V angles"),
    ("tildecomb",      0x0303, "Tilde — S-wave, calligraphic, loose"),
    ("dieresiscomb",   0x0308, "Diaeresis — two dots matching period weight"),
    ("cedillacomb",    0x0327, "Cedilla — hook below baseline, right-curving"),
]

# Letters that get cedilla — need a secondary base anchor
CEDILLA_BASES = ["C"]   # Only C in the required set; G could be added later

# ─── MAIN ─────────────────────────────────────────────────────────────────────

print(f"\n=== León Display v1 — Phase 1: Preparing SFD ({WEIGHT}) ===\n")

f = fontforge.open(SOURCE[WEIGHT])

# ── 1. NAME TABLE ─────────────────────────────────────────────────────────────
print("[1/8] Updating name table...")

family = f"León Display {WEIGHT}"
f.familyname = family
f.fullname   = family
f.fontname   = f"LeonDisplay-{WEIGHT}"
f.version    = "3.000"
f.copyright  = "Based on CQT León by Carlos Campos. Extended edition for Bar León, Granada."

f.sfnt_names = (
    ("English (US)", "Family",            family),
    ("English (US)", "SubFamily",         "Regular"),
    ("English (US)", "UniqueID",          f"3.000;LEON;LeonDisplay-{WEIGHT}"),
    ("English (US)", "Fullname",          family),
    ("English (US)", "Version",           "Version 3.000"),
    ("English (US)", "PostScriptName",    f"LeonDisplay-{WEIGHT}"),
    ("English (US)", "Trademark",         "Extended edition. Based on CQT León by Carlos Campos."),
    ("English (US)", "Manufacturer",      "Bar León, Granada"),
    ("English (US)", "Preferred Family",  "León Display"),
    ("English (US)", "Preferred Styles",  WEIGHT),
)

# ── 2. VERTICAL METRICS ───────────────────────────────────────────────────────
print("[2/8] Updating vertical metrics...")

f.os2_typoascent  = NEW_TYPO_ASCENDER
f.os2_typodescent = -200
f.os2_typolinegap = 200
f.hhea_ascent     = NEW_HHEA_ASCENT
f.hhea_descent    = -200
f.hhea_linegap    = 200
f.os2_winascent   = NEW_WIN_ASCENT
f.os2_windescent  = 200

# ── 3. GPOS MARK POSITIONING LOOKUP ──────────────────────────────────────────
print("[3/8] Adding GPOS mark2base lookup...")

LOOKUP_NAME   = "mark-positioning"
SUBTABLE_TOP  = "mark-top-subtable"
SUBTABLE_CED  = "mark-cedilla-subtable"
ANCHOR_TOP    = "top"
ANCHOR_CED    = "cedilla"

script_lang = [
    ["mark", [
        ["DFLT", ["dflt"]],
        ["latn", ["dflt", "ESP ", "FRA ", "DEU "]],
    ]]
]

f.addLookup(LOOKUP_NAME, "gpos_mark2base", 0, script_lang)
f.addLookupSubtable(LOOKUP_NAME, SUBTABLE_TOP)
f.addAnchorClass(SUBTABLE_TOP, ANCHOR_TOP)
f.addLookupSubtable(LOOKUP_NAME, SUBTABLE_CED)
f.addAnchorClass(SUBTABLE_CED, ANCHOR_CED)

# ── 4. BASE ANCHORS ON A–Z ────────────────────────────────────────────────────
print("[4/8] Placing base anchors on A–Z...")

for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
    g = f[letter]
    bb = g.boundingBox()  # (xmin, ymin, xmax, ymax)
    x_centre = int((bb[0] + bb[2]) / 2)
    # "top" anchor: sits at cap-height + 50 to give diacritics clear air
    g.addAnchorPoint(ANCHOR_TOP, "base", x_centre, TOP_ANCHOR_Y)
    # "cedilla" anchor: bottom centre for C (cedilla hangs below)
    if letter in CEDILLA_BASES:
        g.addAnchorPoint(ANCHOR_CED, "base", x_centre, CEDILLA_ANCHOR_Y)

print(f"  Placed 'top' anchors on 26 letters at y={TOP_ANCHOR_Y}")
print(f"  Placed 'cedilla' anchor on C at y={CEDILLA_ANCHOR_Y}")

# ── 5. CREATE COMBINING MARK SLOTS ───────────────────────────────────────────
print("[5/8] Creating combining mark glyph slots...")

for name, codepoint, note in MARKS:
    if codepoint in f:
        g = f[codepoint]
    else:
        g = f.createChar(codepoint, name)
    g.width = 0   # combining marks have zero advance width
    # Placeholder mark anchor at origin — designer must reposition after drawing
    g.addAnchorPoint(ANCHOR_TOP, "mark", 0, 0)
    if name == "cedillacomb":
        # Cedilla attaches below — its mark anchor is at its topmost point
        g.addAnchorPoint(ANCHOR_CED, "mark", 0, 0)
    print(f"  {name} U+{codepoint:04X}  (DRAW THIS: {note})")

# ── 6. CREATE COMPOSITE GLYPH SLOTS ──────────────────────────────────────────
print("\n[6/8] Creating composite glyph slots...")

for (gname, uni_cap, uni_lc, base, mark) in COMPOSITES:
    # Create the glyph at the uppercase codepoint
    if uni_cap in f:
        g = f[uni_cap]
    else:
        g = f.createChar(uni_cap, gname)

    # Inherit advance width from base letter
    g.width = f[base].width

    # Add unicase altuni: lowercase codepoint maps to same glyph
    existing_altuni = list(g.altuni) if g.altuni else []
    if not any(a[0] == uni_lc for a in existing_altuni):
        existing_altuni.append((uni_lc, -1, 0))
    g.altuni = tuple(existing_altuni)

    print(f"  {gname} U+{uni_cap:04X} / U+{uni_lc:04X}  ← {base} + {mark}  width={g.width}")

# ── 7. CREATE BESPOKE AND PUNCTUATION SLOTS ───────────────────────────────────
print("\n[7/8] Creating bespoke and punctuation glyph slots...")

for (gname, uni, width_ref, note) in BESPOKE:
    if uni in f:
        g = f[uni]
    else:
        g = f.createChar(uni, gname)
    if isinstance(width_ref, str):
        g.width = f[width_ref].width
    else:
        g.width = width_ref
    # Add unicase altuni if needed
    if uni in BESPOKE_ALTUNI:
        uni_lc = BESPOKE_ALTUNI[uni]
        existing = list(g.altuni) if g.altuni else []
        if not any(a[0] == uni_lc for a in existing):
            existing.append((uni_lc, -1, 0))
        g.altuni = tuple(existing)
    print(f"  {gname} U+{uni:04X}  width={g.width}  (DRAW: {note})")

for (gname, uni, width, note) in PUNCTUATION:
    if uni in f:
        g = f[uni]
    else:
        g = f.createChar(uni, gname)
    g.width = width
    print(f"  {gname} U+{uni:04X}  width={width}")

# ── 8. SAVE SFD ───────────────────────────────────────────────────────────────
print(f"\n[8/8] Saving SFD to {SFD_OUT} ...")
f.save(SFD_OUT)

f.close()

print(f"""
=== PHASE 1 COMPLETE ===

SFD saved: {SFD_OUT}

NEXT STEPS — open {SFD_OUT} in FontForge:

  1. Draw the 6 combining marks in this order:
       acutecomb  U+0301   (draw first — used most)
       gravecomb  U+0300
       circumflexcomb U+0302
       tildecomb  U+0303
       dieresiscomb   U+0308
       cedillacomb    U+0327  (remember: this sits BELOW baseline)

  2. For each mark, set the mark anchor:
       Point > Add Anchor > class=top / cedilla, type=mark
       Place at the BOTTOM CENTRE of the mark outline.

  3. Save the SFD.

  4. Run:  fontforge -script 02_build_composites.py {WEIGHT}
""")
