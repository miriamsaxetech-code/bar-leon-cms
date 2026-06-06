#!/usr/bin/env fontforge
# -*- coding: utf-8 -*-
"""
León Display v1 — Inspect SFD
==============================
Run at any point to check current state of the SFD.

Usage:  fontforge -script 04_inspect_sfd.py [Bold|Medium]
"""

import fontforge
import os
import sys

WEIGHT   = sys.argv[1] if len(sys.argv) > 1 else "Bold"
OUT_DIR  = "/Users/kokonvt/Projects/bar-leon-cms/fonts/LeonDisplay"
SFD_PATH = os.path.join(OUT_DIR, f"LeonDisplay-{WEIGHT}.sfd")

if not os.path.exists(SFD_PATH):
    # Fall back to original OTF
    SFD_PATH = f"/Users/kokonvt/Projects/bar-leon-clean/04_ASSETS/FONTS/CQTLeón-{WEIGHT}.otf"
    print(f"SFD not found, inspecting source OTF: {SFD_PATH}")

f = fontforge.open(SFD_PATH)

print(f"\n=== {f.fullname} — Glyph Inventory ===\n")
print(f"{'Glyph':<20} {'Unicode':>8}  {'Width':>6}  {'Has outline':>12}  {'Has refs':>9}  Anchors")
print("-" * 80)

def has_outlines(g):
    try:
        return len(g.foreground) > 0
    except Exception:
        return False

def has_refs(g):
    try:
        return len(g.references) > 0
    except Exception:
        return False

for g in f.glyphs():
    uni = f"U+{g.unicode:04X}" if g.unicode != -1 else "     —"
    outline = "YES" if has_outlines(g) else "no"
    refs    = "YES" if has_refs(g)    else "no"
    anchors = " | ".join(f"{ap[0]}({ap[1]})" for ap in (g.anchorPoints or []))
    print(f"  {g.glyphname:<20} {uni:>8}  {g.width:>6}  {outline:>12}  {refs:>9}  {anchors}")

print(f"\nTotal glyphs: {len(list(f.glyphs()))}")
print(f"\nGSUB lookups: {list(f.gsub_lookups)}")
print(f"GPOS lookups: {list(f.gpos_lookups)}")

f.close()
