# León Font Analysis & Design Specification for León Display

**Source files analysed:** `CQTLeón-Bold.otf` · `CQTLeón-Medium.otf`  
**Tool:** fontTools 4.63.0 via Python  
**Date:** 2026-06-06  

---

## Implementation Status — 2026-06-06

> **León Display is live in production as of branch `typography-kakin-v1`.**

The expanded font files (Bold + Medium, with Spanish diacritics) are at `fonts/LeonDisplay/`.
The @font-face declarations are in `css/style.css` under family name `'Leon Display'`.
Granaina Limpia and Granaina Sucia have been fully retired.

**Glyph coverage confirmed live:**
- Á É Í Ó Ú Ü Ñ — uppercase Spanish diacritics ✓
- Unicase cmap — lowercase a–z maps to same uppercase glyphs ✓
- 0–9 digits ✓
- `.brand-name` renders "BAR LÉÓN" fully in León Display Bold ✓

**CSS selectors using León Display Bold:**
`.brand-name` · `.site-name` · `.carta-bar-name` · `.categoria-head h2` ·
`.home-section-head h2` · `.wine-editorial__name` · `.cana-editorial h2` · `.historia-year`

**CSS selectors using Georgia fallback (mixed-case accented content):**
`.check-name` · `.carta-brand` · `.hero-editorial-name` · `.location-friends` ·
`.qr-btn` · `.mala-folla h2` · `.mala-folla__text p:first-child`

**Pending font work (see Section 4 below):**
The expanded font in `fonts/LeonDisplay/` covers Spanish. French/German diacritics and
punctuation beyond period+comma are still missing. The expansion plan remains in Sections 3–6.

---

## 1. Technical Analysis

### 1.1 Font Identity

| Property | CQT León Bold | CQT León Medium |
|---|---|---|
| Family name | CQT León Bold | CQT León Medium |
| PostScript name | CQTLeon-Bold | CQTLeon-Medium |
| Version | 2.000 (Glyphs 3.3 / 3310) | 2.000 (Glyphs 3.3 / 3310) |
| Vendor ID | UKWN (unknown/private) | UKWN |
| Weight class | 700 (Bold) | 500 (Medium) |
| Width class | 5 (Normal) | 5 (Normal) |
| Italic angle | 0° (upright) | 0° (upright) |
| Fixed pitch | No (proportional) | No (proportional) |

### 1.2 Vertical Metrics (units per em = 1000)

| Metric | Value |
|---|---|
| Units per em | 1000 |
| Typo ascender | 800 |
| Typo descender | −200 |
| Typo line gap | 200 |
| HHEA ascent | 1000 |
| HHEA descent | −200 |
| x-height (`sxHeight`) | 600 |
| Cap height (`sCapHeight`) | 800 |
| Underline position | −100 |
| Underline thickness | 50 |

> **Note:** x-height = cap height = 800. This confirms the font is **unicase** — there is no distinct lowercase optical correction. All glyphs sit at cap height.

### 1.3 Bounding Box

| | Bold | Medium |
|---|---|---|
| xMin | 20 | 35 |
| yMin | −244 | −209 |
| xMax | 2079 | 2094 |
| yMax | 809 | 809 |

The `yMax` of 809 slightly exceeds the declared cap height of 800, consistent with hand-drawn forms that breach the guideline by a few units — a deliberate organic quality. The `yMin` of −244 / −209 indicates descending strokes on the `C_u_c_h_i` ligature and possibly some digits.

### 1.4 OpenType Tables Present

```
CFF   GSUB   GlyphOrder   OS/2   cmap   head   hhea   hmtx   maxp   name   post
```

- **CFF** (not CFF2): PostScript-flavoured outlines. No TrueType `glyf` table. Single master.
- **GSUB**: Two features active — `aalt` (all alternates) and `ss01` (Stylistic Set 1).
- No `GPOS`, no `kern` table — **kerning is not implemented**.
- No `HVAR`, no variable font axes.

### 1.5 Embedding Rights

`fsType = 8` → Editable embedding permitted. Font may be embedded in PDFs, web pages, and editable documents.

---

## 2. Glyph Inventory

### 2.1 Complete Glyph List (46 glyphs per weight)

| Slot | Glyph name | Unicode(s) | Category |
|---|---|---|---|
| 0 | `.notdef` | — | Fallback |
| 1 | `space` | U+0020, U+00A0 | Whitespace |
| 2–27 | `A`–`Z` | U+0041–005A **and** U+0061–007A | 26 uppercase capitals (both cases mapped) |
| 28 | `A.ss01` | (via GSUB ss01) | Alternate A |
| 29 | `M.ss01` | (via GSUB ss01) | Alternate M |
| 30 | `V.ss01` | (via GSUB ss01) | Alternate V |
| 31 | `W.ss01` | (via GSUB ss01) | Alternate W |
| 32 | `Y.ss01` | (via GSUB ss01) | Alternate Y |
| 33 | `C_u_c_h_i` | (ligature, via GSUB) | Multi-letter ligature "Cuchi" |
| 34–43 | `zero`–`nine` | U+0030–0039 | Digits 0–9 |
| 44 | `period` | U+002E | Punctuation |
| 45 | `comma` | U+002C | Punctuation |

### 2.2 Unicase Cmap Behaviour

Lowercase codepoints U+0061–007A are mapped directly to the uppercase glyphs (`A`–`Z`). The font renders identically regardless of input case — this is intentional for a display/logotype typeface.

### 2.3 Advance Widths — Bold

| Glyph | Width | Glyph | Width |
|---|---|---|---|
| space | 250 | A | 850 |
| B | 805 | C | 760 |
| D | 805 | E | 805 |
| F | 805 | G | 805 |
| H | 850 | I | 590 |
| J | 850 | K | 850 |
| L | 805 | M | **1160** |
| N | 850 | O | 760 |
| P | 805 | Q | 760 |
| R | 850 | S | 760 |
| T | 804 | U | 850 |
| V | 850 | W | **1216** |
| X | 850 | Y | 850 |
| Z | 778 | period | 406 |
| comma | 354 | C_u_c_h_i | **2099** |

### 2.4 Advance Widths — Medium

| Glyph | Width | Glyph | Width |
|---|---|---|---|
| space | 250 | A | 725 |
| B | 655 | C | 610 |
| D | 655 | E | 655 |
| F | 655 | G | 655 |
| H | 700 | I | 440 |
| J | 700 | K | 700 |
| L | 655 | M | **901** |
| N | 700 | O | 610 |
| P | 655 | Q | 610 |
| R | 700 | S | 610 |
| T | 654 | U | 700 |
| V | 727 | W | **1059** |
| X | 719 | Y | 718 |
| Z | 635 | period | 310 |
| comma | 293 | C_u_c_h_i | **2129** |

---

## 3. Missing Glyph List

> **Neither weight contains any diacritic, punctuation beyond period/comma, or currency glyph.**  
> Every entry below is missing from both Bold and Medium.

### 3.1 Spanish (16 missing)

| Glyph | Unicode | Description |
|---|---|---|
| Á | U+00C1 | A with acute |
| É | U+00C9 | E with acute |
| Í | U+00CD | I with acute |
| Ó | U+00D3 | O with acute |
| Ú | U+00DA | U with acute |
| Ü | U+00DC | U with diaeresis |
| Ñ | U+00D1 | N with tilde |
| á | U+00E1 | a with acute (→ same form as Á in unicase) |
| é | U+00E9 | e with acute (→ É) |
| í | U+00ED | i with acute (→ Í) |
| ó | U+00F3 | o with acute (→ Ó) |
| ú | U+00FA | u with acute (→ Ú) |
| ü | U+00FC | u with diaeresis (→ Ü) |
| ñ | U+00F1 | n with tilde (→ Ñ) |
| ¡ | U+00A1 | Inverted exclamation mark |
| ¿ | U+00BF | Inverted question mark |

### 3.2 French (33 missing)

| Glyph | Unicode | Description |
|---|---|---|
| À / à | U+00C0 / U+00E0 | A with grave |
| Â / â | U+00C2 / U+00E2 | A with circumflex |
| Æ / æ | U+00C6 / U+00E6 | AE ligature |
| Ç / ç | U+00C7 / U+00E7 | C with cedilla |
| È / è | U+00C8 / U+00E8 | E with grave |
| Ê / ê | U+00CA / U+00EA | E with circumflex |
| Ë / ë | U+00CB / U+00EB | E with diaeresis |
| Î / î | U+00CE / U+00EE | I with circumflex |
| Ï / ï | U+00CF / U+00EF | I with diaeresis |
| Ô / ô | U+00D4 / U+00F4 | O with circumflex |
| Œ / œ | U+0152 / U+0153 | OE ligature |
| Ù / ù | U+00D9 / U+00F9 | U with grave |
| Û / û | U+00DB / U+00FB | U with circumflex |
| Ÿ / ÿ | U+0178 / U+00FF | Y with diaeresis |
| « | U+00AB | Left-pointing double angle quotation |
| » | U+00BB | Right-pointing double angle quotation |
| ‹ | U+2039 | Left-pointing single angle quotation |
| › | U+203A | Right-pointing single angle quotation |

### 3.3 German (13 missing)

| Glyph | Unicode | Description |
|---|---|---|
| Ä / ä | U+00C4 / U+00E4 | A with diaeresis |
| Ö / ö | U+00D6 / U+00F6 | O with diaeresis |
| Ü / ü | U+00DC / U+00FC | U with diaeresis |
| ß | U+00DF | Eszett (sharp s) |
| « | U+00AB | Left angle quotes |
| » | U+00BB | Right angle quotes |
| „ | U+201E | Double low-9 quotation mark |
| " | U+201C | Left double quotation mark |
| ‚ | U+201A | Single low-9 quotation mark |
| ' | U+2018 | Left single quotation mark |

### 3.4 Punctuation & Symbols (shared gaps)

| Glyph | Unicode | Needed for |
|---|---|---|
| ! | U+0021 | All languages |
| ? | U+003F | All languages |
| : | U+003A | All languages |
| ; | U+003B | All languages |
| - | U+002D | All languages |
| – | U+2013 | All languages (en dash) |
| — | U+2014 | All languages (em dash) |
| … | U+2026 | All languages (ellipsis) |
| ' ' | U+2018 / U+2019 | English, French, German |
| " " | U+201C / U+201D | English, French, German |
| & | U+0026 | All languages |
| @ | U+0040 | Digital use |
| # | U+0023 | Digital use |
| / | U+002F | All languages |
| ( ) | U+0028 / U+0029 | All languages |
| € | U+20AC | Euro |
| £ | U+00A3 | Pound |
| $ | U+0024 | Dollar |
| ° | U+00B0 | Degrees |
| · | U+00B7 | Interpunct (Spanish) |

---

## 4. Character Expansion Plan

### 4.1 Principles

1. **Unicase strategy:** Since the font maps lowercase to uppercase glyphs, accented lowercase (á, é, ñ…) will map to the same glyph as the accented uppercase (Á, É, Ñ…). Design one form per letter — the diacritic floats above the capital body.
2. **Diacritic height:** With capHeight=800 and `yMax` already reaching 809, all diacritics must be designed to extend above 800 — typically into the 850–1000 zone. The vertical metrics may need adjustment: `sTypoAscender` should move to at least 900, HHEA ascent to 1050.
3. **Diacritic style:** Derive marks from the stroke character of the existing glyphs — if stems are calligraphic/wedged, the acute should be a short calligraphic stroke; the tilde should echo the waviness of existing curves.
4. **No lowercase distortion:** The expansion creates zero new base forms. All new glyphs are composites = existing base + diacritic anchor.
5. **Kerning pass:** Add a `GPOS kern` feature. At minimum kern: T/V/W/Y against following vowels; A against preceding V; quotation marks against all letters.

### 4.2 Priority Tiers

**Tier 1 — Spanish core (minimum viable for Bar León use)**

```
Á É Í Ó Ú Ü Ñ ¡ ¿
+ unicase cmap: á é í ó ú ü ñ → same glyphs
```
9 new glyphs (plus 9 cmap entries pointing at the same glyphs).

**Tier 2 — Full Western European (ES + FR + DE + EN)**

```
À Â Æ Ç È Ê Ë Î Ï Ô Œ Ù Û Ÿ  (FR)
Ä Ö ß                           (DE)
+ all unicase cmap entries
```
17 additional glyphs.

**Tier 3 — Complete punctuation & symbols**

```
! ? : ; - – — … & @ # / ( ) [ ] { }
' ' " " „ « » ‹ ›
€ £ $ ° ·
```
~30 glyphs. These can reuse conventional forms at the existing stroke weight.

**Tier 4 — OpenType feature polish**

```
kern pairs (GPOS)
dnom/numr/frac for digits
ss01 alternates for any new accented A / accented Y
liga: keep C_u_c_h_i; consider C_u_c_h_a, C_a_n_a variants for Bar León menus
mark/mkmk: mark positioning table for diacritics
```

---

## 5. Design Specification — León Display

### 5.1 Visual DNA

Based on the extracted metrics and glyph structure, CQT León has these defining characteristics:

**Architecture**
- All-caps display typeface with unicase cmap behaviour (deliberately).
- Zero italic angle — pure vertical axis.
- Proportional spacing with substantial width variation (I=440–590, M=901–1160).
- Very wide M and W — suggests Trajan-like or classical Roman influence, or wide-bodied calligraphic letterpress.
- Generous sidebearing: LSB is consistently 50 units across every glyph.

**Rhythm and spacing**
- Bold: average capital width ~800 units; narrow letters (C, O, Q, S) at 760.
- Medium: 12–15% narrower than Bold on average — normal condensing ratio.
- Space at 250 (narrow for display use — suggests tight setting is intended).
- `C_u_c_h_i` ligature at 2099–2129 = approximately 2× capital width, implying a connected word-image (logotype ligature).

**Weight**
- Bold (700): thick-thin contrast is expected to be high.
- Medium (500): lighter weight of same skeleton.
- No Regular, no Light, no Black currently exist.

**Stylistic alternates (ss01): A, M, V, W, Y**
- Five of the most geometrically complex or variable letters have alternates.
- This is consistent with a calligraphic or historical revival face where A can be angled or straight-apex, V can be serifed or unseriffed, W can be overlapped or separate, etc.

**Granada identity signals**
- Name "León" and the `C_u_c_h_i` ligature tie this directly to Bar León, Granada.
- The "CQT" vendor prefix and private vendor ID suggest a custom commission, not a retail typeface.
- The handcrafted spirit must be preserved — no mechanisation of curves, no normalisation of spacing.

### 5.2 Diacritic Design Rules

#### Acute accent (´) — for Á É Í Ó Ú
- Angle: ~65°–70° from horizontal (matching the stress angle of the thin stroke in the letters).
- Weight: approximately 60–70% of the thick stem weight.
- Length: 180–220 units tall, placed 80–100 units above capHeight.
- Form: a calligraphic single stroke, slightly cupped (not a mechanical wedge).
- Optical placement: centred over the optical centre of each letter, not geometric centre.
  - On I: centred over the stem.
  - On A: shifted slightly right of geometric centre to follow visual mass.

#### Grave accent (`) — for À È Ù
- Mirror of the acute, angled ~65°–70° in the opposite direction.
- Slightly longer to compensate for the "falling" direction appearing lighter.

#### Circumflex (^) — for Â Ê Î Ô Û
- Two short strokes meeting at a point (inverted V form).
- Height: approximately 160–180 units.
- Leg width spread: ≈ 70% of the base letter's width.
- Echoes the A/V/W angles already present in the font.

#### Diaeresis / umlaut (¨) — for Ä Ë Ï Ö Ü Ÿ
- Two short vertical rectangular dots or round dots.
- Dot size: 80×80 units (approximately).
- Gap between dots: 100 units.
- Position: centred, 80–100 units above capHeight.
- Dot shape: derive from the period glyph already in the font. In Bold the period will be heavier; match that weight.

#### Tilde (~) — for Ñ
- A calligraphic S-curve, not a mechanical tilde.
- Width: approximately 70% of N's advance width.
- Height span: 80–100 units.
- Placed 80 units above capHeight.
- The tilde should feel like it belongs to the Granada hand — loose, rhythmic.

#### Cedilla (¸) — for Ç
- Attach below the C, centred on the base curve.
- Length: 120–140 units descending below baseline.
- Slight rightward hook (classic cedilla form).
- Weight: match thin stroke weight of C.

#### Eszett (ß) — for German
- Since the font is all-caps, design this as the **capital Eszett (ẞ, U+1E9E)** form but map it at U+00DF.
- The capital ẞ resembles a tall B with a loop — should feel constructed from existing B and S curves.
- Width: approximately 805 units (same as B).
- Alternative approach: map ß → SS (double-S replacement via GSUB), which is typographically correct for all-caps German text and avoids designing a new glyph.

#### AE / OE ligatures — for French
- **Æ (U+00C6):** Construct as A + E joined. The E arm emerges from the crossbar of A. Width: approximately A-width + 60% of E-width = ~1000 units (Bold).
- **Œ (U+0152):** Construct as O + E joined. The E arm grows from the right side of O. Width: approximately O-width + 60% of E-width = ~900 units (Bold).
- Both ligatures must honour the existing stroke contrast and terminal style.

#### Inverted punctuation — for Spanish
- **¡ (U+00A1):** Mirror of `!` (which must first be drawn). Same weight as existing period/comma.
- **¿ (U+00BF):** Mirror/rotation of `?` (which must first be drawn).
- Both sit below the baseline for display use (Spanish convention for display type).

### 5.3 Punctuation Design Rules

The existing comma and period set the standard for punctuation forms.

**Comma (reference):** Bold=354 wide; Medium=293. Proportional to advance widths.
**Period (reference):** Bold=406 wide; Medium=310.

New punctuation should maintain these proportions:

| Glyph | Suggested Bold Width | Form |
|---|---|---|
| ! | 406 | Vertical stroke + period dot |
| ? | 580 | Curved form derived from hook quality in Q |
| : | 406 | Two periods stacked |
| ; | 406 | Period + comma stacked |
| – (en dash) | 600 | Horizontal bar at x-height midpoint |
| — (em dash) | 1000 | Double en dash |
| ... (ellipsis) | 1000 | Three periods, optical spacing |
| & | 900 | Calligraphic ampersand echoing existing curves |
| ( ) | 460 | Parentheses, gentle curve |
| ' (apos) | 250 | Single comma rotated |
| " " | 500 | Two apos forms |
| « » | 560 | Double angle marks, stroke weight = thin stroke |

### 5.4 Quotation Mark Forms

Because the font has a Granada calligraphic identity, quotation marks should be calligraphic comma-like strokes rather than mechanical rectangles.

- **' U+2018 / ' U+2019:** Use the existing comma as a starting point. Rotate and adjust.
- **" U+201C / " U+201D:** Double-comma form.
- **„ U+201E:** Low-9 = comma pair sitting at baseline. Derive from existing comma.
- **« U+00AB / » U+00BB:** Angle-quote chevrons. Thin strokes, wedge terminals.

### 5.5 Currency Symbols

| Symbol | Unicode | Approach |
|---|---|---|
| € | U+20AC | Derive from C; add two horizontal bars. Stroke weight = thin stroke. |
| £ | U+00A3 | Derive from L; add crossbar and tail. Historic English pound form. |
| $ | U+0024 | Derive from S; add vertical bar through centre. |

### 5.6 Vertical Metrics Adjustment

Adding diacritics above the capHeight requires updating the vertical metrics to avoid clipping in browsers and applications.

**Recommended new values:**

| Metric | Current | Recommended |
|---|---|---|
| `sTypoAscender` | 800 | 900 |
| `sTypoDescender` | −200 | −200 (unchanged) |
| `sTypoLineGap` | 200 | 200 (unchanged) |
| `HHEA ascent` | 1000 | 1050 |
| `HHEA descent` | −200 | −200 |
| `OS/2 usWinAscent` | (not reported) | 1050 |
| `OS/2 usWinDescent` | (not reported) | 200 |

The diacritics will sit in the range 880–1000 units above baseline.

---

## 6. Recommended Implementation Workflow — FontForge

### 6.1 Prerequisites

```bash
# macOS
brew install fontforge

# Verify
fontforge --version
```

### 6.2 Phase 1 — Open and Audit

```python
# fontforge_audit.py — run via: fontforge -script fontforge_audit.py

import fontforge

fonts = [
    "/path/to/CQTLeón-Bold.otf",
    "/path/to/CQTLeón-Medium.otf",
]

for path in fonts:
    f = fontforge.open(path)
    print(f.fontname, "— glyphs:", len(list(f.glyphs())))
    for g in f.glyphs():
        print(f"  {g.glyphname}: width={g.width}")
    f.close()
```

### 6.3 Phase 2 — Prepare Anchor Points

Before adding any diacritic, define anchor classes on the base letters:

1. **FontForge → Element → Anchor Classes** → Add class `top`.
2. On each base letter (A, E, I, N, O, U, Y, C…):
   - Open the glyph.
   - **Point → Add Anchor** → Class: `top`, type: Base.
   - Place the anchor at the optical top-centre of the glyph (not necessarily the geometric centre).
3. On each diacritic mark (acute, grave, circumflex, diaeresis, tilde, cedilla):
   - **Point → Add Anchor** → Class: `top`, type: Mark.
   - Place the anchor at the bottom centre of the mark.

### 6.4 Phase 3 — Draw Diacritics

**Order of work:** Draw once, reuse everywhere.

1. Draw the **acute** mark glyph (name: `acutecomb`, U+0301).
2. Draw the **grave** mark glyph (name: `gravecomb`, U+0300).
3. Draw the **circumflex** mark glyph (name: `circumflexcomb`, U+0302).
4. Draw the **tilde** mark glyph (name: `tildecomb`, U+0303).
5. Draw the **diaeresis** mark glyph (name: `dieresiscomb`, U+0308).
6. Draw the **cedilla** (name: `cedillacomb`, U+0327) — below-baseline attachment.

For each: match the stroke weight and terminal style of the existing font at that weight. Bold marks are heavier than Medium marks — they are **not** the same mark scaled.

### 6.5 Phase 4 — Build Composite Glyphs

Use FontForge's **Build Accented Glyphs** command:

```
Element → Build → Build Accented Glyphs
```

FontForge will automatically:
1. Create a new glyph for each missing precomposed character (Á, É, Ñ, etc.)
2. Compose it from the base letter + the combining mark via the anchor positions you defined.

For glyphs not auto-built, use:

```python
# fontforge_build_composites.py

import fontforge

f = fontforge.open("CQTLeón-Bold.otf")

# Example: Á = A + acutecomb
a_acute = f.createChar(0x00C1, "Aacute")
a_acute.addReference("A")
a_acute.addReference("acutecomb")
a_acute.useRefsMetrics("A")  # inherit width from A

# Add unicase cmap entry (lowercase → same glyph)
f[0x00E1].unicode = -1  # clear if it exists
# Map á (U+00E1) → Aacute
# Use cmap table manipulation instead:
a_acute.altuni = ((0x00E1, -1, 0),)

f.generate("CQTLeón-Bold-v3.otf")
f.close()
```

Repeat for all precomposed characters in the missing glyph list.

### 6.6 Phase 5 — Draw Bespoke Glyphs

Some glyphs cannot be built from composites and must be drawn:

| Glyph | Reason |
|---|---|
| ß / ẞ | New letterform (or GSUB SS substitution) |
| Æ / æ | Joined ligature form |
| Œ / œ | Joined ligature form |
| ¡ | Inverted, no precomposed anchor |
| ¿ | Inverted/rotated, no precomposed anchor |
| & | New letterform |
| All punctuation | New forms |
| All currency | New forms |

Draw directly in FontForge's glyph editor, matching the stroke quality of existing letters. Use the existing `C_u_c_h_i` ligature as a reference for how joins and terminals are handled at display size.

### 6.7 Phase 6 — Add Kerning (GPOS)

FontForge → **Metrics → Kern Pairs**:

Priority kern pairs for display use:

```
# Tight pairs (reduce spacing)
T A  −80    T O  −60    T U  −60
V A  −80    V O  −60    Y A  −80
A V  −80    A W  −80    A T  −60
W A  −80    F A  −60    P A  −60

# Accented variants (same kern values as unaccented)
V Á  −80    T Á  −60    etc.

# Quote pairs
" A  −60    ' A  −40    A "  −40
```

Use **lookups** rather than individual pairs for maintainability:
- **FontForge → Element → Font Info → Lookups → GPOS tab** → Add kern lookup.

### 6.8 Phase 7 — Update Vertical Metrics

**FontForge → Element → Font Info → OS/2 tab:**

- `Typo Ascent`: 900
- `Typo Descent`: −200
- `Typo Line Gap`: 200
- `Win Ascent`: 1050
- `Win Descent`: 200

**FontForge → Element → Font Info → hhea tab:**

- `Ascent`: 1050
- `Descent`: −200
- `Line Gap`: 200

### 6.9 Phase 8 — Update Name Table

For the expanded family, update the naming to distinguish it clearly from the source:

| nameID | Value |
|---|---|
| 1 — Family | León Display Bold / León Display Medium |
| 2 — Subfamily | Regular |
| 4 — Full name | León Display Bold |
| 6 — PostScript | LeonDisplay-Bold |
| 5 — Version | 3.000 |
| 7 — Trademark | Based on CQT León · Extended edition |
| 8 — Manufacturer | Bar León, Granada |

### 6.10 Phase 9 — Generate and Validate

```python
# Generate OTF + webfont variants

import fontforge, subprocess

for weight in ["Bold", "Medium"]:
    f = fontforge.open(f"CQTLeón-{weight}-v3.otf")
    f.generate(f"LeonDisplay-{weight}.otf")  # Desktop
    f.generate(f"LeonDisplay-{weight}.woff2", flags=("opentype",))  # Web
    f.close()

# Validate with fontTools
subprocess.run(["python3", "-m", "fonttools", "varLib.instancer", "--help"])
# Run OTS (OpenType Sanitiser) if available
```

Post-generation validation checklist:
- [ ] All 62 precomposed Latin glyphs present (Latin-1 Supplement full coverage)
- [ ] Unicase cmap entries correct (lowercase → uppercase glyphs)
- [ ] `ss01` alternates still accessible
- [ ] `C_u_c_h_i` ligature intact
- [ ] GPOS kern lookup functioning
- [ ] No bounding box clipping in browser (`yMax` < `HHEA ascent`)
- [ ] Both weights generate without errors
- [ ] Test string: `ÑOÑO GÜEY ¡HOLA! FAÇADE Ä Ö Ü ß «BONJOUR» LÉON`

### 6.11 Suggested File Naming

```
LeonDisplay-Bold.otf          Desktop embedding
LeonDisplay-Medium.otf        Desktop embedding
LeonDisplay-Bold.woff2        Web (primary)
LeonDisplay-Medium.woff2      Web (primary)
LeonDisplay-Bold.woff         Web (legacy fallback)
LeonDisplay-Medium.woff       Web (legacy fallback)
```

---

## 7. Summary

| | Current CQT León | Target León Display |
|---|---|---|
| Weights | Bold, Medium | Bold, Medium (same) |
| Glyph count | 46 per weight | ~140 per weight |
| Latin coverage | Basic Latin only | Latin-1 Supplement + Latin Extended-A (OE/oe) |
| Spanish | 0 / 16 required | 16 / 16 |
| French | 0 / 33 required | 33 / 33 |
| German | 0 / 13 required | 13 / 13 |
| Punctuation | period, comma only | Full Western punctuation set |
| Kerning | None | GPOS kern lookup |
| Ligatures | `C_u_c_h_i`, ss01 alternates | Same, preserved |
| Variable | No | No (out of scope) |
| Estimated new glyphs | — | ~94 per weight |
| Estimated effort | — | 30–60 h per weight (hand-drawn marks + composites + kerning) |

The León typeface has strong bones: a consistent stroke voice, deliberate all-caps architecture, and a distinctive Granada character. The expansion to León Display is an engineering and craft task — not a redesign. Every new mark should feel like it was always there.
