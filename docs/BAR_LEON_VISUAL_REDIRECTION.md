# BAR LEÓN — VISUAL REDIRECTION BRIEF

**Creative direction:** "Bar León: a living Granada institution."
**Date:** 2026-07-12 · **Status:** brief only — no implementation, no code changes, no commit
**Supersedes:** visual sections (§4–§9) of `docs/BAR_LEON_CANONICAL.md` **once approved by Miriam**. Identity, voice, data and CMS rules (§1–§3, §10–§16) remain in force.

**Why this exists:** the current site was rejected aesthetically — too rigid, too narrow, too dark in places (pizarra block, black CTAs), typography hard to read (León Display used at text sizes). This brief modernizes the visual language without losing the 1959 identity.

---

## 1. Asset inventory

Audited: `bar-leon-cms`, `Restaurante-Leon`, `Restaurante-Leon-V2`, `restaurante-bar-leon` — 243 image/PDF/video files, ~140 distinct after cross-repo duplicates. Quality graded ★–★★★ (web usability at 2×). "AI" = machine-generated or AI-enhanced — **verify against reality before publishing** (canonical rule: no invented content).

### 1.1 Logos & marks

| File | Source | Type | Quality | Historic value | Use |
|---|---|---|---|---|---|
| `Bar-leon-fotos/Logo.jpeg` (1588×596) | Restaurante-Leon | Original lockup scan: crowned rampant lion + "RESTAURANTE Bar LEÓN" | ★★★ crisp B/W | **Master mark** | Header, hero, print. Trace to SVG for scaling (redraw = vectorize, not reinvent) |
| `assets/images/lion-logo.svg` | bar-leon-cms | Vector lion (current) | ★★★ | High | Current header/hero — keep |
| `public/logo-leon2.svg`, `leon-512.png`, `lion-square.png` | V2 / R-Leon | Lion variants | ★★ | Medium | Favicon, avatars, stamps |
| `public/brand/Logo-Gemini.svg` (+`Logo-Gemini-cropped.svg` in rbl 04_ASSETS) | R-Leon / V2 | AI-redrawn logo | ★★ | Low — **AI** | Do not use as primary mark; reference only |
| `fonts/LeonDisplay/*` (woff2 + specimens) | bar-leon-cms | Bespoke unicase display font from the signage | ★★★ | **High — it IS the sign** | Display only (see §3.2) |

### 1.2 Fajalauza / azulejo / motif sources

| File | Source | Type | Quality | Historic value | Use |
|---|---|---|---|---|---|
| `gallery/bar-leon-granada-fachada-azulejo-flores-01.jpg` + `hero/bar-leon-granada-fachada-azulejo-principal-01.jpg` note: filename mismatch — principal-01 is actually a dark interior; flores-01 is the facade | V2 | **The facade Fajalauza panel**: blue-green brushwork foliage with pomegranates around "RESTAURANTE BAR LEÓN" tile lettering | ★★★ | **Highest — the single most identifying image the bar owns** | Hero, motif source (trace pomegranate + foliage into SVG ornament), history |
| `Gemini_Generated_Image_*.png` ×4 (gallery) | V2 | AI-enhanced renditions of facade/Cruz de Mayo scenes | ★★ clean but **AI** | Low as documents | Motif tracing reference only — publish the real photos instead |
| `public/Pattern.jpeg` (1500×2000) + `photos/azulejo-fajalauza-panel/detalle.png` (+optimized .webp) | V2 / R-Leon | Interior wall tiles: Alhambra-style geometric lattice, green/caramel/ink on pale ground | ★★★ | High — the bar's actual walls | Backgrounds (low-opacity), section dividers, borders |
| `assets/images/web/azulejo-leon.png/.webp` | bar-leon-cms | Lion azulejo tile photo | ★★★ | High | History/identity blocks — already in use |
| `public/motif-fajalauza.svg` | R-Leon | Small vector Fajalauza motif (4 KB) | ★★ | Medium | Starting point for the ornament system (§3.6) |
| `hemeroteca/bar-leon-granada-cruz-mayo-fachada-01.jpg` | V2 | Cruz de Mayo on the facade: red flower cross, copper lion plates, Fajalauza planters | ★★★ | **High** | Granada-identity section, seasonal hero |

### 1.3 Family / history / press (hemeroteca)

| File(s) | Source | Type | Quality | Historic value | Use |
|---|---|---|---|---|---|
| `history/bar-leon-granada-caricatura-carlos-belda-01.jpg` (1440²) | V2 | Vintage ink caricature on yellowed paper (Carlos Belda) | ★★★ scan | **Very high — family archive** | History hero, "archivo" strip |
| `hero/…interior (mislabeled azulejo-principal-01)` | V2 | Founder relief portrait + cofrade shrine behind the bar, available light | ★★ dark but atmospheric | Very high | History section (needs exposure lift, stays documentary) |
| `hemeroteca/…ayuntamiento-reconocimiento-01…14.jpg` (14 files) | V2 | City-hall recognition ceremony photos | ★★ | High | Hemeroteca/press page, history grid |
| `hemeroteca/…prensa-ideal-loteria-01.jpg` | V2 | IDEAL press article screenshot (22-12-2025), "la familia León" | ★★★ | **High — third-party validation** | Press section — canonical rule: only with validated URL |
| `hemeroteca/…semana-santa-procesion-01.jpg` | V2 | Semana Santa procession at the bar | ★★ | High | Granada-identity section |
| `history/…clientes-cofrades-01.jpg`, `…equipo-reconocimiento-01.jpg` | V2 | People of the bar | ★★ | High | History/family section |
| `barleongranada_*.mp4` ×2 (13 MB + 0.8 MB) | R-Leon | Instagram videos from the bar | ★★ vertical | Medium | Source for still frames; possible muted loop later (out of scope) |
| `stitch_*/screen.png` (V2, R-Leon, rbl 03_DESIGN) | various | Stitch AI layout mockups | ★ | None — **AI mockups** | Archive; do not publish |

### 1.4 Food & interior photography

| File(s) | Source | Type | Quality | Use |
|---|---|---|---|---|
| `assets/images/web/bar-leon-plato-01…06`, `leon-barra`, `leon-pinchodetortilla`, `leon-papasalopobre`, `bar.leon-tapa-01` (png+webp) | bar-leon-cms | Documentary food/barra close-ups, available light | ★★★ | Carta headers, signature dishes, home gallery — the production set |
| `assets/images/ref_01…13.webp` | bar-leon-cms | Food/interior reference set | ★★ (batch not individually reviewed) | Gallery candidates — review pass needed |
| `04_ASSETS/galeria/` (callos, gambas, pulpo, sesos, almejas, la-caña, pobres, pilpil) | rbl | Named dish photos 1200×900 | ★★–★★★ | **Carta dish images — filenames match carta items** |
| `photos/set_20260219_*.jpg` (17 files, 4000×3000) | V2 (+8 dupes in R-Leon) | Full-res documentary shoot 19-02-2026 | ★★★ **master set** | Crop source for everything; keep as archive masters |
| `Fachada-01…05`, `Outside-1/2`, `Interior-01…04`, `Detalle`, `Leon-1`, `bar-leon.jpeg` | R-Leon + V2 (dupes) | Facade/interior set | ★★ | Location section, gallery |
| `WhatsApp Image 2026-02-23*` ×6 | R-Leon | Phone photos from family | ★–★★ | Review individually; some may be history gold |
| `hero-leon.png/.webp`, `header-leon.webp`, `leon1…leon8.jpeg`, `og.png` | bar-leon-cms (+dupes in rbl) | Current hero/header/og set | ★★–★★★ | In production |
| `images/menu/…` (8 files: arroz, croqueta, guiso, potaje, puchero, tortilla-tapa, cerveza-tapa, plato-cuchara) | V2 | Dish photos, small (~50–170 KB) | ★★ | Carta thumbnails |
| `photos/optimized/*.webp` (9 files incl. `carta-restaurante-leon-granada`, `vinos-bodega-granada`, hero) | V2 | Pre-optimized web set | ★★★ | Direct reuse |

### 1.5 Documents

| File | Source | Type | Use |
|---|---|---|---|
| `CARTA REST. BAR LEÓN 2025 (1).pdf` (2.1 MB) | rbl | The printed carta | **Price/dish provenance** + typographic reference for Direction A |
| `fuente 2/Granaina-licencia-CC.pdf` | V2 | CC licence for retired Granaina font | Legal archive only |
| `fonts/LeonDisplay/specimen-*.png` | bar-leon-cms | Font specimens | Design reference |

**Inventory notes:** (1) V2's `images/hero/` filenames are unreliable — verify each visually before use. (2) Everything marked AI must never appear as a document of the real bar. (3) The 4000×3000 master set is duplicated across two repos — treat `Restaurante-Leon-V2/public/photos/` as the archive of record.

---

## 2. New visual system

### 2.1 Colour palette (exact values)

Derived from owned surfaces: facade Fajalauza panel, interior geometric tiles, copper plates, paper archive. Azul stays the identity anchor.

| Token | Hex | Name | Role |
|---|---|---|---|
| `--blanco` | `#FAF7EF` | Blanco cerámica | Page ground (lighter than current `#F6F3EC` — answers "too dark/compressed") |
| `--crema` | `#F1EBDD` | Crema Fajalauza | Cards, alternate section bands |
| `--ink` | `#1C1A17` | Tinta | Body text (keep) |
| `--muted` | `#5C5752` | Gris piedra | Secondary text (keep) |
| `--azul` | `#1D4D85` | Azul Fajalauza | Primary identity: nav, links, buttons, rules (keep) |
| `--azul-profundo` | `#163A63` | Azul cobalto | Hover, dark accents, pizarra ground (replaces near-black `#202321`) |
| `--azul-claro` | `#3A6FA8` | Azul claro | Washes, hover tints (keep) |
| `--verde-faja` | `#2E6B5E` | Verde Fajalauza | Secondary motif colour (from facade foliage + wall tiles) — motifs/illustration only, never text |
| `--granada` | `#A93226` | Rojo granada | Pomegranate accent: prices, small badges, motif fruit (evolves `--granate #7A1C1C`, which stays for print-dark contexts) |
| `--cobre` | `#B07830` | Cobre | Rare warm accent (copper plates, caramel tile) — decorative only |
| `--tile-line` | `rgba(29,77,133,0.16)` | Línea azulejo | Hairlines, borders |

Contrast rules: text only in ink/muted/azul on blanco/crema; granada only ≥0.95 rem bold (prices); verde and cobre never carry text.

### 2.2 Typography roles

| Role | Face | Usage |
|---|---|---|
| Signage | **León Display Bold** (local) | H1/H2 section heads, wordmark, year numerals ("1959"), category heads. **Never below 1.4 rem, never mixed-case body, never prices** — this is the root of the current legibility failure |
| Editorial | Georgia / Times New Roman stack (current) — candidate upgrade: a real editorial serif (e.g., self-hosted Source Serif) **as a later decision, not assumed** | Dish names, body copy, captions. Body 1.06 rem/1.65 on mobile (up from 1.0 — older-reader readability) |
| UI | Inter (already loaded) | Buttons, labels, meta, tabs, prices-meta |
| Chalk | Caveat (already loaded) | Pizarra only |
| Data | Courier New stack | Prices only, tabular figures |

Scale (mobile → desktop): 2.0→3.0 rem H1 · 1.5→2.0 H2 · 1.2→1.35 H3/dish · 1.06→1.12 body · 0.95 price · 0.8 meta caps.

### 2.3 Button system

One family, two weights, square corners (2 px):
- **Primary** — solid `--azul`, white label, 52 px min-height mobile (up from 48 — older users), Inter 600.
- **Secondary** — 1 px `--azul` border on blanco, azul label. (Replaces today's mixed ink/black/outline zoo.)
- **Tertiary/text** — azul underline offset 3 px.
- LLAMAR joins the family as Primary with phone glyph — no more black bar, no inset stripe.
- Full-bleed CTA bar on mobile only for the sticky service bar (Carta · Llamar · Cómo llegar) — blanco ground, azul icons+labels, top hairline.

### 2.4 Spacing scale

Base 4 px; steps 8·12·16·24·36·56·88. Sections separated by 88 px desktop / 56 px mobile (current site compresses at ~40). Content measure: 680 px text, 880 px carta/grid zones, 1080 px hero band max — "wider but never wide".

### 2.5 Image treatment

- Documentary only: available light, no props (canonical §4 stays).
- Crops: 3:2 landscape, 4:5 portrait, 1:1 tiles — nothing else.
- Duotone/filters prohibited except archive items which keep their native paper yellow.
- Frames: 1 px `--tile-line` border OR 10 px crema mat (history items) — never drop shadows.
- Archive scans (caricatura, press, WhatsApp finds) sit on crema with a caption line: serif italic 0.85 rem + date.

### 2.6 Fajalauza motif system

Source: trace the facade panel (foliage + pomegranates) and `motif-fajalauza.svg` into a small SVG ornament kit:
- **Ramo** (foliage sprig) — section-divider centrepiece, replaces `hr.divider` at 3–4 key seams max per page.
- **Cenefa** (border strip) — horizontal repeat for hero base and footer top, 1-colour azul at 20% on blanco.
- **Pieza** (single tile corner) — card corner mark for featured dishes, 16 px, verde-faja.
Rules: motifs are punctuation, not wallpaper; max one per viewport; always mono-colour (azul or verde), never full-colour illustration.

### 2.7 Pomegranate motif system

The granada (fruit of Granada, present in the facade tiles) becomes the micro-brand:
- Single line-drawn pomegranate glyph (traced from facade) at 3 sizes: 12 px bullet, 20 px badge, 40 px divider centre.
- Uses: "recomendado" badge (replaces caps kicker), list bullets in Granada-identity section, footer sign-off mark.
- Colour: `--granada` fill or azul line — never both, never gradient.

### 2.8 Iconography

Stroke icons 1.5 px, square joins, 20/24 px grid, azul: phone, map-pin, clock, fork, wine glass, arrow. No filled blobs, no emoji, no rounded playful sets. Allergen glyphs: the standard 14 EU allergens as monoline circles 18 px, muted; legend in footer of carta.

### 2.9 Border & corner language

Corners 2 px everywhere (0 on full-bleed). Hairline borders `--tile-line`. Double-rule (1+1 px, 3 px gap) reserved for pizarra frame and press clippings — the "printed edict" signal. No shadows except a single 0 1px 2px rgba(ink,0.06) on the sticky mobile bar.

### 2.10 Mobile / desktop principles

- Mobile-first composition: one focal element per viewport; food reachable in ≤2 taps (canonical §2 stays law).
- Thumb zone: primary actions in bottom 30% (sticky bar); accordions open on tap, min 52 px rows.
- Desktop is the *same* page breathing: 680/880/1080 measures, two-column only for dish grids and history text+image pairs. No sidebars, no mega-nav.
- Type never shrinks below mobile sizes on desktop — it grows.

---

## 3. Motion system

Principle: **the bar does not perform; it lives.** Motion = a curtain moving in a doorway, not a stage show.

| Layer | Spec |
|---|---|
| Entrance | Sections fade-rise 12 px, 400 ms, ease-out, IntersectionObserver at 15%, stagger 60 ms, max 3 items staggered. Once per page-life (no re-trigger) |
| Hover | Links: underline draws left→right 200 ms. Buttons: ground shifts to `--azul-profundo` 150 ms. Images: scale 1.02, 500 ms ease-out — no lift, no shadow growth |
| Scroll | Hero azulejo band: translateY parallax ≤6% (transform only). Sticky bar: appears after 320 px scroll, 200 ms fade. **No scroll-jacking, no pinned scenes** |
| Image movement | Gallery cross-fade 600 ms on manual advance only — nothing auto-plays |
| Decorative | Pomegranate/ramo SVGs: stroke-dashoffset draw-in 800 ms when the history and identity sections enter view — the only "delight" moments, 2 per page maximum |
| Reduced motion | `prefers-reduced-motion: reduce` → all of the above off, opacity-only 150 ms; pattern already exists in `css/style.css` — extend it |
| Performance | transform+opacity only; no animated filters/box-shadows; IO not scroll listeners; CSS animations inline (no library — **no new dependencies**); LCP: hero image preloaded, no entrance animation on LCP element; CLS budget 0; JS motion code ≤3 KB |

---

## 4. New homepage structure

1. **Header** — lion mark 28 px + BAR LEÓN (León Display) + lang ES·EN·FR right. Blanco, hairline bottom. No dark strip.
2. **Hero** — full-bleed facade Fajalauza panel photo (real one), gentle parallax; over crema band below it: "Desde 1959 · Albayzín · Granada" + status (quiet inline note, not pill).
3. **Primary actions** — one row: Primary "Carta" + Secondary "Menú del día" + Secondary "Llamar". Three, not five.
4. **Signature dishes** ("Sabores de Andalucía") — 4–6 items, serif names, granada prices, one documentary photo per pair; pomegranate badge for recommendations.
5. **Menú del día** — pizarra keeps the chalk concept on `--azul-profundo` (not near-black), Caveat, price in chalk gold; opens as accordion exactly as today (CMS-driven, unchanged data).
6. **Family & history** — caricatura + founder-portrait photo on crema mats, 3 short paragraphs, "1959" in León Display 4 rem; ramo divider draws in.
7. **Granada identity** — Cruz de Mayo photo + Semana Santa photo + one sentence each; pomegranate bullets. (New section — the "living institution" proof.)
8. **Location** — map, address, hours table, "Encuéntrenos en Plaza Nueva".
9. **Footer** — cenefa strip 20% azul, contact, lang switch, "Acceso propietario", pomegranate sign-off mark.

## 5. New carta structure

1. **Header** — back-arrow + "Carta" (not the full brand repeat) + lang. One line at 320 px.
2. **Category navigation** — horizontal scroll chips (azul outline, active = solid azul), sticky under header; López-index: tapping scrolls to category with 12 px offset; León Display category heads in-page.
3. **Dish cards** — flat rows (no cards-with-borders): serif name 1.2 rem ink → description 1.0 rem muted (max 2 lines) → meta row. Optional 1:1 thumbnail right (64 px) where a real photo exists (rbl `04_ASSETS/galeria` matches by name).
4. **Prices** — single system everywhere: monospace `--granada`, right-aligned on the meta row. Media/Ración: "Media 7,50 · Ración 10,00" always in that order, tab-aligned across the category so eyes travel one vertical line. Items pending price confirmation stay unpublished (canonical §14).
5. **Allergens** — monoline glyph row under description, 18 px, muted; tap → tooltip name; legend accordion at page foot. (Data model already has `allergens` — display only.)
6. **Sticky mobile actions** — Llamar · Horario · Arriba, blanco bar, safe-area inset (current behaviour preserved, restyled).
7. **Readability for older users** — body ≥1.06 rem, row height ≥52 px, contrast ≥7:1 for names, chips ≥44 px, no pure-grey text below 0.85 rem, "volver arriba" every 2 categories.

---

## 6. Three creative directions

### A — Editorial granadino contemporáneo
- **Concept:** the printed carta as a website. Paper, ink, typographic confidence; photography does the emotion; ornament nearly absent.
- **Palette:** blanco `#FAF7EF`, ink, azul `#1D4D85`, granada prices; verde/cobre unused.
- **Typography:** León Display heads XL (3 rem+), Georgia body, huge "1959"; ragged-right, no justification.
- **Layout:** single 680 px column, generous 88 px seams, full-bleed photos as chapter breaks.
- **Motifs:** hairlines and a single pomegranate colophon. That's all.
- **Movement:** entrance fades only.
- **Risks:** closest to the *rejected* site — may read as "the same but bigger"; sober to the point of cold; underuses the Fajalauza asset.
- **Suitability:** high safety, low transformation. 6/10.

### B — Fajalauza vivo
- **Concept:** the facade comes inside. White ceramic ground, blue-green brushwork borders, pomegranates alive in the corners; the site feels like eating beside the tiled wall.
- **Palette:** blanco + azul + **verde-faja** + granada + cobre — full system of §2.1.
- **Typography:** León Display heads, Georgia body; category heads sit inside cenefa-framed bands.
- **Layout:** as §4/§5 with motif punctuation at every section seam; hero = facade panel full-bleed.
- **Motifs:** full ramo/cenefa/pieza + pomegranate kit; tile-lattice (Pattern.jpeg) at 4% opacity behind history.
- **Movement:** §3 complete, including both stroke-draw moments.
- **Risks:** one step from souvenir-shop kitsch if motif discipline slips; more SVG/asset work; needs the tracing done well.
- **Suitability:** highest identity payload; directly answers "modern without losing 1959" — the motifs are *literally on the building*. 9/10 **if** the one-motif-per-viewport rule is enforced.

### C — Archivo familiar moderno
- **Concept:** the family album as interface. Caricatura, press clippings, founder portrait, WhatsApp-recovered photos on crema mats with typed captions; food appears as "what the family cooks".
- **Palette:** crema-forward `#F1EBDD`, ink, sepia photo tones, azul reduced to wayfinding, granada rare.
- **Typography:** Georgia dominant (even heads), León Display only for the wordmark and dates; typewriter-style meta.
- **Layout:** vertical timeline spine on home; carta almost direction-A plain.
- **Motifs:** paper textures, archival double-rules, date stamps; no Fajalauza ornament.
- **Movement:** slow cross-fades, no draws.
- **Risks:** museum before restaurant — food demoted; hardest to keep appetizing; hero weaker (no strong colour); depends on archive depth we only partially have (14 ceremony photos, 1 caricatura, ~6 WhatsApp unknowns).
- **Suitability:** beautiful for the history page; wrong lead for a bar that lives on lunch traffic. 5/10 as the whole site.

---

## 7. Recommendation

**Direction B "Fajalauza vivo", tempered by A's editorial discipline, with C compressed into the history section.**

Concretely: A's typographic structure and restraint (680 px prose, huge quiet heads, flat rows) + B's colour system and motif kit at section seams and the hero + C's crema-mat archive treatment *inside* section 6 (family/history) only.

Reasons: (1) it is the only direction whose decoration is *documentary* — the motifs exist on the facade, so "modern" cannot drift into "generic Andalusian theme"; (2) it fixes every stated rejection: lighter ground, wider measure, serif content type, azul-profundo instead of black; (3) it keeps carta data, CMS, and the pizarra concept untouched — implementation is CSS + SVG assets + template classes, no architecture risk; (4) C alone starves the commercial priority (food in 2 taps), A alone reproduces the rejection.

**Guard-rails carried over unchanged:** Albayzín spelling · no invented dishes/prices · no luxury/tourism language · León Display never at text sizes · one motif per viewport · reduced-motion parity.

**Next steps (not executed):** 1) Miriam approves direction; 2) trace facade → SVG ornament kit (design task, "do not create images" respected here — tracing is a follow-up); 3) token swap + section-by-section restyle on a branch; 4) before/after screenshot review at 390/768/1440; 5) update canonical §4–§9.
