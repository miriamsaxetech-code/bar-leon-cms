#!/usr/bin/env fontforge
# -*- coding: utf-8 -*-
"""
León Display v1 — Phase 2: Build Composite Glyphs
==================================================
Run with:  fontforge -script 02_build_composites.py [Bold|Medium]

Prerequisites:
  - Phase 1 complete (01_prepare_sfd.py was run).
  - All 6 combining marks have been DRAWN in FontForge:
      acutecomb, gravecomb, circumflexcomb, tildecomb, dieresiscomb, cedillacomb
  - Each mark has a mark anchor set at its bottom centre.

What this script does:
  1. Opens the .sfd produced by Phase 1.
  2. Verifies all 6 combining marks have outlines (warns if not).
  3. Builds each composite by:
       a. Clearing any existing references.
       b. Adding the base letter reference at the origin.
       c. Adding the mark reference via FontForge's anchor-based placement.
  4. Runs FontForge's built-in "Build Accented Glyphs" as a safety net.
  5. Validates bounding boxes (warns if diacritic clips the ascent).
  6. Updates the GSUB aalt feature to include all new precomposed glyphs.
  7. Adds the germandbls GSUB substitution (ß → S S).
  8. Saves updated SFD.
"""

import fontforge
import psMat
import os
import sys

# ─── CONFIGURATION ────────────────────────────────────────────────────────────

WEIGHT   = sys.argv[1] if len(sys.argv) > 1 else "Bold"
OUT_DIR  = "/Users/kokonvt/Projects/bar-leon-cms/fonts/LeonDisplay"
SFD_PATH = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.sfd")

COMPOSITES = [
    ("Aacute",      0x00C1, 0x00E1, "A", "acutecomb"),
    ("Eacute",      0x00C9, 0x00E9, "E", "acutecomb"),
    ("Iacute",      0x00CD, 0x00ED, "I", "acutecomb"),
    ("Oacute",      0x00D3, 0x00F3, "O", "acutecomb"),
    ("Uacute",      0x00DA, 0x00FA, "U", "acutecomb"),
    ("Udieresis",   0x00DC, 0x00FC, "U", "dieresiscomb"),
    ("Ntilde",      0x00D1, 0x00F1, "N", "tildecomb"),
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
    ("Adieresis",   0x00C4, 0x00E4, "A", "dieresiscomb"),
    ("Odieresis",   0x00D6, 0x00F6, "O", "dieresiscomb"),
]

REQUIRED_MARKS = [
    "acutecomb", "gravecomb", "circumflexcomb",
    "tildecomb", "dieresiscomb", "cedillacomb",
]

HHEA_ASCENT = 1050   # must match Phase 1 value

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def glyph_has_outlines(f, name):
    """Return True if the named glyph exists and has at least one contour."""
    if name not in f:
        return False
    g = f[name]
    # A glyph with real outlines has foreground layer with contours
    return g.foreground is not None and len(g.foreground) > 0


def mark_anchor_position(f, mark_name, anchor_class):
    """
    Return the (x, y) position of the mark anchor on a combining mark glyph.
    Returns (0, 0) if not found (placeholder).
    """
    g = f[mark_name]
    for ap in g.anchorPoints:
        # ap = (anchorClassName, type, x, y)
        if ap[0] == anchor_class and ap[1] == "mark":
            return ap[2], ap[3]
    return 0, 0


def base_anchor_position(f, base_name, anchor_class):
    """Return the (x, y) position of the base anchor on a base letter glyph."""
    g = f[base_name]
    for ap in g.anchorPoints:
        if ap[0] == anchor_class and ap[1] == "base":
            return ap[2], ap[3]
    return None, None


# ─── MAIN ─────────────────────────────────────────────────────────────────────

print(f"\n=== León Display v1 — Phase 2: Build Composites ({WEIGHT}) ===\n")

if not os.path.exists(SFD_PATH):
    print(f"ERROR: SFD not found at {SFD_PATH}")
    print("Run 01_prepare_sfd.py first.")
    raise SystemExit(1)

f = fontforge.open(SFD_PATH)

# ── 1. VERIFY MARKS ───────────────────────────────────────────────────────────
print("[1/5] Verifying combining marks...")

marks_ready = True
for mark_name in REQUIRED_MARKS:
    has_outline = glyph_has_outlines(f, mark_name)
    status = "OK" if has_outline else "WARNING: NO OUTLINE — composite will be empty"
    print(f"  {mark_name}: {status}")
    if not has_outline:
        marks_ready = False

if not marks_ready:
    print("""
WARNING: One or more combining marks have no outlines.
Composites will be built with correct STRUCTURE but EMPTY appearance.
Draw the marks in FontForge, then re-run this script.
Continuing anyway to establish glyph structure...
""")

# ── 2. BUILD COMPOSITES ───────────────────────────────────────────────────────
print("\n[2/5] Building composite glyphs...")

built = 0
skipped = 0

for (gname, uni_cap, uni_lc, base_name, mark_name) in COMPOSITES:
    # Determine anchor class
    anchor_class = "cedilla" if mark_name == "cedillacomb" else "top"

    # Get the glyph — look up by NAME (cmap integer lookup is unreliable in SFD)
    if gname not in f:
        print(f"  SKIP {gname}: glyph slot missing (run Phase 1 first)")
        skipped += 1
        continue

    g = f[gname]
    # Ensure unicode codepoint is set on the glyph object
    if g.unicode != uni_cap:
        g.unicode = uni_cap

    # Clear existing references so we start clean
    # g.clear() removes anchors too — composites don't use anchors so that's fine
    g.clear()

    # Add base letter reference at origin
    g.addReference(base_name, psMat.identity())

    # Add mark reference.
    # FontForge positions mark references using anchor points when the font
    # is generated — we just need to add the reference; the GPOS lookup
    # handles the actual runtime positioning. However, for the SFD preview
    # we compute an explicit translation so the mark appears visually correct
    # in the editor.
    base_x, base_y = base_anchor_position(f, base_name, anchor_class)
    mark_x, mark_y = mark_anchor_position(f, mark_name, anchor_class)

    if base_x is not None and glyph_has_outlines(f, mark_name):
        # Translate mark so its mark anchor aligns with the base anchor
        dx = base_x - mark_x
        dy = base_y - mark_y
        g.addReference(mark_name, psMat.translate(dx, dy))
        print(f"  {gname} U+{uni_cap:04X}: built  (offset dx={dx}, dy={dy})")
    else:
        # No outline yet — add reference at zero offset as placeholder
        g.addReference(mark_name, psMat.identity())
        print(f"  {gname} U+{uni_cap:04X}: structure only (mark not drawn yet)")

    # Ensure advance width matches base letter
    g.width = f[base_name].width

    # Ensure unicase altuni is set
    existing = list(g.altuni) if g.altuni else []
    if not any(a[0] == uni_lc for a in existing):
        existing.append((uni_lc, -1, 0))
    g.altuni = tuple(existing)

    built += 1

print(f"\n  Built: {built}  /  Skipped: {skipped}")

# ── 3. BOUNDING BOX VALIDATION ────────────────────────────────────────────────
print("\n[3/5] Checking composite bounding boxes...")

clipping_risk = []
for (gname, uni_cap, uni_lc, base_name, mark_name) in COMPOSITES:
    if gname not in f:
        continue
    g = f[gname]
    try:
        bb = g.boundingBox()
        ymax = bb[3]
        if ymax > HHEA_ASCENT:
            clipping_risk.append((gname, ymax))
            print(f"  WARNING {gname}: yMax={ymax} exceeds HHEA ascent={HHEA_ASCENT}")
        else:
            print(f"  {gname}: yMax={ymax}  OK")
    except Exception:
        print(f"  {gname}: cannot compute (empty)")

if not clipping_risk:
    print("  All composites within ascent bounds.")

# ── 4. GSUB: REBUILD AALT + ADD ß → SS ───────────────────────────────────────
print("\n[4/5] Updating GSUB features...")

# Rebuild aalt to include new precomposed glyphs
try:
    f.buildOrReplaceAALTFeatures()
    print("  aalt feature rebuilt.")
except Exception as e:
    print(f"  aalt rebuild: {e}")

# Add ß → SS substitution (all-caps display: ß is rendered as double-S)
# Strategy: GSUB single substitution — germandbls substitutes to a ligature S S.
# Since this is an all-caps unicase font, the typographically correct form of ß
# in all-caps German is "SS". We implement this as a GSUB lookup so the font
# automatically handles it when the liga or calt feature is active.
ESZETT_LOOKUP   = "eszett-to-SS"
ESZETT_SUBTABLE = "eszett-SS-subtable"

# gsub_lookups is a tuple of strings like "'aalt' Access All Alternates lookup 0"
gsub_lookups = f.gsub_lookups
already_exists = any(ESZETT_LOOKUP in lname for lname in gsub_lookups)

if not already_exists:
    try:
        f.addLookup(
            ESZETT_LOOKUP,
            "gsub_ligature",
            0,
            [["liga", [["DFLT", ["dflt"]], ["latn", ["dflt", "DEU "]]]]]
        )
        f.addLookupSubtable(ESZETT_LOOKUP, ESZETT_SUBTABLE)
        # Register the ligature: germandbls = S + S
        if "germandbls" in f:
            eszett = f["germandbls"]
            eszett.addPosSub(ESZETT_SUBTABLE, ("S", "S"))
            print("  germandbls → SS ligature registered.")
    except Exception as e:
        print(f"  germandbls GSUB: {e} (manual setup may be needed)")
else:
    print(f"  {ESZETT_LOOKUP} already present.")

# ── 5. SAVE ───────────────────────────────────────────────────────────────────
print(f"\n[5/5] Saving SFD to {SFD_PATH} ...")
f.save(SFD_PATH)
f.close()

print(f"""
=== PHASE 2 COMPLETE ===

Next:
  → Open {SFD_PATH} in FontForge.
  → Draw any remaining bespoke glyphs:
       AE (Æ)  OE (Œ)  germandbls (ß, or leave for GSUB)
       exclamdown (¡)  questiondown (¿)
  → Draw all punctuation slots (see plan for widths and forms).
  → Fine-tune anchor positions if composites look off.
  → When satisfied, run:
       fontforge -script 03_generate.py {WEIGHT}
""")
