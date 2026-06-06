# León Display v1 — Implementation Plan

**Based on:** `docs/leon-font-analysis.md`  
**Source fonts:** CQT León Bold (46 glyphs) · CQT León Medium (46 glyphs)  
**Target:** León Display Bold + Medium with full Spanish / French / German / English support  
**Scripts:** `scripts/fontforge/`  

---

## Answer: Can León Display v1 be generated automatically?

**Partially. Here is the honest breakdown.**

| Work type | Automatable? | Script | Effort |
|---|---|---|---|
| Glyph slot creation (all new glyphs) | **Yes — fully** | `01_prepare_sfd.py` | 0h |
| Unicode cmap / unicase altuni | **Yes — fully** | `01_prepare_sfd.py` | 0h |
| GPOS mark2base lookup & anchor setup | **Yes — fully** | `01_prepare_sfd.py` | 0h |
| Vertical metrics update | **Yes — fully** | `01_prepare_sfd.py` | 0h |
| Name table update | **Yes — fully** | `01_prepare_sfd.py` | 0h |
| 21 composite accented glyphs (Á, É, Ñ…) | **Yes — after marks are drawn** | `02_build_composites.py` | 0h |
| ß → SS GSUB substitution | **Yes — fully** | `02_build_composites.py` | 0h |
| aalt GSUB rebuild | **Yes — fully** | `02_build_composites.py` | 0h |
| OTF + WOFF2 generation + validation | **Yes — fully** | `03_generate.py` | 0h |
| **6 combining mark outlines** | **No — must draw** | — | ~12–18h |
| Æ, Œ ligature outlines | No — must draw | — | ~4–6h |
| ¡, ¿ inverted punctuation | No — must draw | — | ~2h |
| 20 punctuation glyphs | No — must draw | — | ~15–25h |
| &, @, €, £, $ | No — must draw | — | ~6–10h |
| Anchor fine-tuning | No — visual QA | — | ~3–5h |

**Conclusion:** The scripts handle all the structural font engineering. Once the 6 combining marks are drawn, the 21 composite accented glyphs are assembled in seconds. The remaining work — ~40–66h per weight — is type design: drawing new letterforms that match the León voice.

**Shortcut for the Medium weight:** Most mark shapes can be interpolated or scaled from the Bold weight (adjust stroke weight only). Saves ~50% of mark drawing time.

---

## 1. Glyph Construction Order

### Phase A — Draw first (marks everything else depends on)

Draw these in FontForge in this exact order. Each mark enables multiple composites.

| # | Glyph name | U+ | Composites it enables | Priority |
|---|---|---|---|---|
| 1 | `acutecomb` | 0301 | Á É Í Ó Ú — 5 glyphs (Spanish core) | CRITICAL |
| 2 | `dieresiscomb` | 0308 | Ü Ä Ë Ï Ö Ÿ — 6 glyphs (DE+FR) | CRITICAL |
| 3 | `tildecomb` | 0303 | Ñ — 1 glyph (Spanish core) | CRITICAL |
| 4 | `cedillacomb` | 0327 | Ç — 1 glyph (FR) | HIGH |
| 5 | `circumflexcomb` | 0302 | Â Ê Î Ô Û — 5 glyphs (FR) | HIGH |
| 6 | `gravecomb` | 0300 | À È Ù — 3 glyphs (FR) | MEDIUM |

After drawing marks 1–3 and running Phase 2, Spanish support is complete.  
After marks 1–6 and Phase 2, French and German are complete.

### Phase B — Composites (built by script after marks are drawn)

21 glyphs. Zero drawing required. Run `02_build_composites.py`.

| Glyph | U+ (cap) | U+ (lc) | = Base + Mark |
|---|---|---|---|
| Aacute | 00C1 | 00E1 | A + acutecomb |
| Eacute | 00C9 | 00E9 | E + acutecomb |
| Iacute | 00CD | 00ED | I + acutecomb |
| Oacute | 00D3 | 00F3 | O + acutecomb |
| Uacute | 00DA | 00FA | U + acutecomb |
| Udieresis | 00DC | 00FC | U + dieresiscomb |
| Ntilde | 00D1 | 00F1 | N + tildecomb |
| Agrave | 00C0 | 00E0 | A + gravecomb |
| Acircumflex | 00C2 | 00E2 | A + circumflexcomb |
| Ccedilla | 00C7 | 00E7 | C + cedillacomb |
| Egrave | 00C8 | 00E8 | E + gravecomb |
| Ecircumflex | 00CA | 00EA | E + circumflexcomb |
| Edieresis | 00CB | 00EB | E + dieresiscomb |
| Icircumflex | 00CE | 00EE | I + circumflexcomb |
| Idieresis | 00CF | 00EF | I + dieresiscomb |
| Ocircumflex | 00D4 | 00F4 | O + circumflexcomb |
| Ugrave | 00D9 | 00F9 | U + gravecomb |
| Ucircumflex | 00DB | 00FB | U + circumflexcomb |
| Ydieresis | 0178 | 00FF | Y + dieresiscomb |
| Adieresis | 00C4 | 00E4 | A + dieresiscomb |
| Odieresis | 00D6 | 00F6 | O + dieresiscomb |

### Phase C — Bespoke glyphs (must draw)

| Glyph | U+ | Suggested width | Strategy |
|---|---|---|---|
| AE | 00C6 / 00E6 | Bold 1100, Med 900 | A + E joined at crossbar; E emerges rightward |
| OE | 0152 / 0153 | Bold 950, Med 780 | O + E joined at right; E shares O's right curve |
| germandbls | 00DF | Bold 805, Med 655 | GSUB: auto-substitutes to SS — drawing optional |
| exclamdown | 00A1 | 350 | Draw `exclam` first, then rotate/reflect |
| questiondown | 00BF | 580 | Draw `question` first, then rotate/reflect |

### Phase D — Punctuation (must draw, lowest risk to brand)

Priority order:

| # | Glyph | U+ | Width (Bold/Med) | Derives from |
|---|---|---|---|---|
| 1 | exclam ! | 0021 | 350 / 280 | period + vertical stroke |
| 2 | question ? | 003F | 580 / 480 | Q's curve + arm + period |
| 3 | colon : | 003A | 350 / 280 | Two periods stacked |
| 4 | semicolon ; | 003B | 350 / 280 | colon + comma lower dot |
| 5 | hyphen - | 002D | 400 / 320 | Horizontal bar at ~400 height |
| 6 | endash – | 2013 | 600 / 480 | 1.5× hyphen |
| 7 | emdash — | 2014 | 1000 / 800 | 2.5× hyphen |
| 8 | parenleft ( | 0028 | 360 / 290 | Vertical arc, open right |
| 9 | parenright ) | 0029 | 360 / 290 | Mirror of ( |
| 10 | slash / | 002F | 460 / 370 | Diagonal ~70° |
| 11 | ampersand & | 0026 | 900 / 720 | Calligraphic — new draw |
| 12 | at @ | 0040 | 960 / 780 | New draw |
| 13 | bracketleft [ | 005B | 360 / 290 | Rectangular |
| 14 | bracketright ] | 005D | 360 / 290 | Mirror of [ |
| 15 | braceleft { | 007B | 360 / 290 | Calligraphic brace |
| 16 | braceright } | 007D | 360 / 290 | Mirror of { |
| 17 | quotedbl " | 0022 | 460 / 370 | Two upright ticks |
| 18 | quotesingle ' | 0027 | 250 / 200 | Single tick |
| 19 | quoteleft ' | 2018 | 260 / 210 | Rotated comma |
| 20 | quoteright ' | 2019 | 260 / 210 | Comma form |
| 21 | quotedblleft " | 201C | 460 / 370 | Two quoteright |
| 22 | quotedblright " | 201D | 460 / 370 | Two quoteright |
| 23 | quotedblbase „ | 201E | 460 / 370 | Two commas at baseline |
| 24 | guillemotleft « | 00AB | 560 / 450 | Double angle chevron |
| 25 | guillemotright » | 00BB | 560 / 450 | Mirror of « |
| 26 | guilsinglleft ‹ | 2039 | 340 / 270 | Single angle chevron |
| 27 | guilsinglright › | 203A | 340 / 270 | Mirror of ‹ |
| 28 | euro € | 20AC | 760 / 610 | C + two bars |
| 29 | sterling £ | 00A3 | 760 / 610 | L-based, crossbar + serif tail |
| 30 | dollar $ | 0024 | 760 / 610 | S + vertical bar |

---

## 2. Composite Strategy

### Why composites, not standalone glyphs

Drawing 21 standalone accented glyphs would take ~60–90h and create a maintenance nightmare: any change to A or E requires 5+ separate edits. The composite system means:

- Change A → Á, À, Â, Ä all update automatically.
- Change the acute → all acute-accented letters update automatically.
- Medium inherits marks from Bold's design intent; only stroke weight differs.

### How composites work in this font

```
Á (U+00C1)
├── Reference: A  (at origin, 0,0)
└── Reference: acutecomb  (translated so mark's bottom anchor aligns with A's top anchor)

cmap entry: U+00C1 → Aacute
altuni:     U+00E1 (á) → same glyph Aacute   ← unicase mapping preserved
```

The GPOS `mark2base` lookup manages the runtime positioning:
- When text renders Á, the shaping engine applies the mark offset from the GPOS table.
- The visual editor preview uses the explicit `psMat.translate()` computed from anchor positions.

### Anchor system

Two anchor classes:

**`top`** — for diacritics above the letter
```
Base letter (A, E, I, N, O, U, Y): anchor at (x_optical_centre, 850)
Combining mark (acutecomb, etc.):   anchor at (x_mark_centre, 0) — bottom of mark
```

**`cedilla`** — for cedilla below the letter
```
Base letter (C): anchor at (x_optical_centre, 0) — at baseline
cedillacomb:     anchor at (x_mark_centre, mark_top) — top of cedilla
```

### Anchor placement in FontForge (manual step after Phase 1)

After running Phase 1, the base anchors are placed automatically from bounding boxes. You only need to set the mark anchors on the 6 combining marks themselves:

For each mark glyph:
1. Open in FontForge glyph editor.
2. Point > Add Anchor Point.
3. Choose the anchor class (`top` or `cedilla`), type = `mark`.
4. Drag to the **bottom centre** of the mark outline.
5. Save.

---

## 3. FontForge Scripts

Located in `scripts/fontforge/`. Run with FontForge, not system Python.

### Install FontForge

```bash
brew install fontforge
# Verify:
fontforge --version
```

### Script overview

```
scripts/fontforge/
├── 01_prepare_sfd.py      Phase 1 — open OTF, create all glyph slots, save SFD
├── 02_build_composites.py Phase 2 — build composites from drawn marks
├── 03_generate.py         Phase 3 — generate OTF, WOFF2, WOFF with validation
├── 04_inspect_sfd.py      Utility — print current glyph inventory at any time
└── run.sh                 Master runner with phase control
```

### Run Phase 1

```bash
cd scripts/fontforge
./run.sh 1 Bold
./run.sh 1 Medium
```

Output: `fonts/LeonDisplay/LeonDisplay-Bold.sfd` and `…-Medium.sfd`

### Run Phase 1 for both weights at once

```bash
./run.sh both-weights
```

### Inspect at any time

```bash
./run.sh inspect Bold
./run.sh inspect Medium
```

### After drawing marks — Run Phase 2

```bash
./run.sh 2 Bold
./run.sh 2 Medium
```

### Generate final fonts

```bash
./run.sh 3 Bold
./run.sh 3 Medium
```

Output:
```
fonts/LeonDisplay/
├── LeonDisplay-Bold.otf
├── LeonDisplay-Bold.woff2
├── LeonDisplay-Bold.woff
├── LeonDisplay-Medium.otf
├── LeonDisplay-Medium.woff2
└── LeonDisplay-Medium.woff
```

### If WOFF2 generation fails

FontForge's built-in WOFF2 encoder requires the `woff2` library at compile time. If it fails, post-process manually:

```bash
brew install woff2
woff2_compress fonts/LeonDisplay/LeonDisplay-Bold.otf
woff2_compress fonts/LeonDisplay/LeonDisplay-Medium.otf
```

### Validate with fontTools after generation

```bash
pip3 install fonttools
python3 -m fontTools.ttLib fonts/LeonDisplay/LeonDisplay-Bold.otf
# Or run the OT Sanitiser:
pip3 install opentype-sanitizer
ots-sanitize fonts/LeonDisplay/LeonDisplay-Bold.otf
```

---

## 4. Estimated Work Required

### Per weight (Bold first, Medium benefits from reuse)

| Task | Hours (Bold) | Hours (Medium) | Notes |
|---|---|---|---|
| Install FontForge, run scripts, verify SFD | 0.5 | 0.5 | Scripts are already written |
| Draw `acutecomb` | 1.5–2.5 | 1–2 | Med: adjust weight only |
| Draw `gravecomb` | 0.5–1 | 0.5 | Derive from acute (mirror) |
| Draw `circumflexcomb` | 1–1.5 | 0.5–1 | Two-stroke V form |
| Draw `tildecomb` | 1.5–2 | 1–1.5 | Calligraphic S-wave; most creative |
| Draw `dieresiscomb` | 0.5–1 | 0.5 | Two dots matching period weight |
| Draw `cedillacomb` | 1–1.5 | 0.5–1 | Hook; verify C composite |
| Set all 6 mark anchors | 0.5 | 0.5 | Visual fine-tuning |
| Run Phase 2 (composites) | 0.1 | 0.1 | Script |
| Visual QA of 21 composites | 1–2 | 0.5–1 | Adjust individual anchors if off |
| Draw AE (Æ) | 2–3 | 1.5–2 | New letterform |
| Draw OE (Œ) | 1.5–2 | 1–1.5 | New letterform |
| Draw ¡ and ¿ | 1.5–2 | 1 | Derive from ! and ? |
| Draw ! and ? | 1.5–2 | 1 | Draw these first |
| Draw : ; and dashes | 1 | 0.5 | Derive from period/comma/hyphen |
| Draw ( ) [ ] { } / | 2–3 | 1.5–2 | |
| Draw quotation marks | 2–3 | 1–1.5 | Derive from comma |
| Draw « » ‹ › | 1–1.5 | 0.5–1 | |
| Draw & | 2–3 | 1.5 | Most complex punctuation |
| Draw @ | 2–3 | 1.5 | Second most complex |
| Draw € £ $ | 3–4 | 1.5–2 | Derive from C, L, S |
| Kern pass (T/V/W/Y pairs) | 2–3 | 1 | GPOS kern in FontForge |
| Final generate + QA | 0.5 | 0.5 | Scripts |

| | **Bold total** | **Medium total** |
|---|---|---|
| Optimistic | 31h | 19h |
| Realistic | 42h | 26h |
| With perfection pass | 55h | 35h |

**Both weights combined: 50–90h.** Scheduling across 2–3 working weeks is realistic.

### Minimum viable Spanish-only v1 (fastest path)

If the goal is Bar León's own Spanish text support only:

1. Run Phase 1. (30 min)
2. Draw: `acutecomb`, `tildecomb`, `dieresiscomb`. (4–6h)
3. Add marks. Run Phase 2. (30 min)
4. Result: Á É Í Ó Ú Ü Ñ all working. Unicase cmap correct. (6–8h total)
5. Draw ¡ and ¿ separately. (1–2h)

**Total for Spanish-only v1: 8–10h.**

---

## 5. Drawing Guide for the 6 Combining Marks

This section describes each mark in terms of the León voice — not generic geometry.

### Acute accent — `acutecomb` U+0301

**Character:** A single calligraphic upstroke.

```
Design parameters (Bold):
  Start point:  approximately (−80, 0)    ← bottom left
  End point:    approximately (80, 200)   ← top right
  Angle:        ~65° from horizontal
  Stroke width: match the THIN stroke of existing letters (~40–60 units)
  Terminal:     wedge-cut at both ends, consistent with León letterforms
  Width:        0 (combining mark — zero advance width)
  Bounding box approx: xMin=−80, yMin=0, xMax=80, yMax=200
```

**Mark anchor:** place at (0, 0) — the bottom centre of the stroke.

**Bold vs Medium:** The Medium acute is lighter. Use the same skeleton, reduce the stroke thickness.

### Grave accent — `gravecomb` U+0300

Mirror of the acute. Draw the acute first, then:
1. Duplicate it.
2. Scale x by −1 (horizontal flip).
3. Adjust terminals to match the "falling" direction.

The grave can be very slightly longer than the acute — falling strokes read lighter.

### Circumflex — `circumflexcomb` U+0302

**Character:** Two short strokes meeting at a point — an inverted V.

```
Design parameters (Bold):
  Peak point:       (0, 200)      ← top centre
  Left leg bottom:  (−120, 40)
  Right leg bottom: (120, 40)
  Stroke weight:    match thin stroke
  Total height:     ~200 units
  Width span:       ~240 units
  Terminal style:   echo the angled terminals of A and V already in the font
```

**Trick:** The circumflex peak angle should echo the A apex. Open A in the glyph editor for visual reference.

### Tilde — `tildecomb` U+0303

**Character:** A calligraphic S-wave. This is the most creative mark — it must feel handmade, not mechanical.

```
Design parameters (Bold):
  Total width:  ~260 units (fits over N, widest affected letter)
  Height span:  ~100 units (e.g., from y=60 to y=160)
  Form:         Rising S-curve — thin at left and right extremes,
                two swelling strokes crossing at mid-height
  Stroke weight: vary from ~20 (thin ends) to ~80 (thick swells)
```

**Do not** draw a mechanical tilde (sinusoidal curve with constant weight). Study the curves in C, S, and G for reference on how León handles calligraphic curves.

### Diaeresis — `dieresiscomb` U+0308

**Character:** Two dots. The simplest mark to draw.

```
Design parameters (Bold):
  Dot shape:     Circular or slightly oval — derive from the period glyph
  Dot size:      ~80×80 units (Bold); ~55×55 units (Medium)
  Left dot centre:  (−80, 150)
  Right dot centre: (80, 150)
  Gap between dots: ~160 units centre-to-centre
```

**To draw:** Open the `period` glyph. Copy the outline. Paste into `dieresiscomb`. Position the first dot. Duplicate, translate to the second position. Done.

### Cedilla — `cedillacomb` U+0327

**Character:** A small hook below the baseline. Attaches under C.

```
Design parameters (Bold):
  Start point (top): approximately (0, 0)   ← baseline level, where it attaches
  End point:         curves to (~40, −150)  ← hook end
  Form:              Rightward-curving hook, ends with a small serif or ball
  Stroke weight:     match thin stroke of C at the attachment point
  Total height:      ~160 units below baseline
```

**Mark anchor for cedilla:** Unlike the top marks, the cedilla anchor is at the TOP of the cedilla glyph (y ≈ 0, where it meets the baseline). The `cedillacomb` anchor type is `mark` under the `cedilla` class, placed at (0, 0).

---

## 6. Unicase Cmap — What the Scripts Do

The original font maps:
```
U+0061 (a) → A glyph
U+0062 (b) → B glyph
… etc.
```

The scripts extend this to accented characters:
```
U+00C1 (Á) → Aacute glyph  ← primary codepoint
U+00E1 (á) → Aacute glyph  ← altuni on the same glyph
```

This means a user can type either uppercase Á or lowercase á — the font renders identically. This is set via `g.altuni` in the FontForge Python API.

---

## 7. Post-Generation CSS

```css
@font-face {
  font-family: 'León Display';
  src: url('/fonts/LeonDisplay/LeonDisplay-Bold.woff2') format('woff2'),
       url('/fonts/LeonDisplay/LeonDisplay-Bold.woff')  format('woff'),
       url('/fonts/LeonDisplay/LeonDisplay-Bold.otf')   format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'León Display';
  src: url('/fonts/LeonDisplay/LeonDisplay-Medium.woff2') format('woff2'),
       url('/fonts/LeonDisplay/LeonDisplay-Medium.woff')  format('woff'),
       url('/fonts/LeonDisplay/LeonDisplay-Medium.otf')   format('opentype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

/* Usage */
.brand-heading {
  font-family: 'León Display', serif;
  font-weight: 700;
  /* Unicase — text-transform not needed, both cases render identically */
  font-feature-settings: "ss01" 1;  /* Enable stylistic alternates */
}
```

---

## 8. Running Phase 1 Right Now (Smoke Test)

You can run Phase 1 immediately, before FontForge is even installed, to verify the script logic by inspecting the output with fontTools:

```bash
# Install fontforge
brew install fontforge

# Run Phase 1
cd /Users/kokonvt/Projects/bar-leon-cms
fontforge -script scripts/fontforge/01_prepare_sfd.py Bold

# Inspect the SFD (uses fontTools, already installed)
fontforge -script scripts/fontforge/04_inspect_sfd.py Bold
```

Phase 1 takes approximately **30 seconds** per weight and requires no manual steps. The resulting SFD is a fully valid FontForge file that can be opened in the GUI immediately.
