# BAR LEÓN — DESIGN RESET

**Date:** 2026-07-12 · **Status:** design document only — no implementation, no commit, no deploy
**Replaces as working direction:** the Fajalauza Vivo prototype (branch `design/fajalauza-vivo-prototype`), rejected for visual overload, weak hierarchy, and solving everything at once. The redirection brief (`BAR_LEON_VISUAL_REDIRECTION.md`) remains background research; **this document wins where they disagree.**

---

## 1. The one visual concept

> **A historic Granada tavern renewed through colour, photography and restrained Fajalauza details.**

Three carriers, in order: **colour** (one blue, one red, on warm white), **photography** (seven photographs total on the whole site — each earns its place), **restrained Fajalauza details** (exactly two motifs, used exactly where defined). Everything else is typography and space. If an element is not colour, photography, or one of the two motifs, it is not decoration — it is removed.

---

## 2. Homepage architecture (one, simplified)

Top to bottom, nothing else:

1. **Hero** — one photograph, wordmark, one line, one primary action.
2. **Three signature dishes** — photo, name, price. Three, not four, not six.
3. **Daily menu** — price and days legible in 2 seconds; detail folds away.
4. **Family / history** — "1959", two archive photographs, three sentences.
5. **Granada / Fajalauza identity** — one facade photograph, one caption explaining the motif's origin.
6. **Location** — address, today's hours, map link.
7. **Footer** — contact, languages, owner access.

One viewport = one message. No section repeats another's job; the carta does the selling, the homepage does the *convincing*.

## 3. Mobile carta architecture (one, simplified)

1. **Header** — back, "Carta", languages. One line at 320 px.
2. **Category navigation** — horizontal chips, sticky, 44 px, active = solid azul.
3. **Dish list** — flat rows: name → short description → price line. No thumbnails in v1 (photography lives on the homepage; the carta is for reading).
4. **Prices** — one treatment (see §4), never colliding with names.
5. **Sticky actions** — Llamar · Horario · Arriba on white, azul icons, safe-area.

Dropped from the prototype: allergen chips (v2, once data is confirmed dish-by-dish), wine editorial blocks, per-dish pairing microcopy on mobile (available behind the row in v2).

---

## 4. Reduced design system

### Colours — 4 total

| Token | Hex | Job |
|---|---|---|
| `--blanco` | `#FAF7EF` | The page. Every background. (Bands may use it at 97% brightness via opacity — not a fifth colour.) |
| `--tinta` | `#1C1A17` | All text. Secondary text = tinta at 62% opacity — not a fifth colour. |
| `--azul` | `#1D4D85` | Identity: buttons, links, active states, motif line-work, hairlines (at 16% opacity). |
| `--granada` | `#A93226` | Prices and the pomegranate mark. Nothing else. |

Cut from the prototype: crema `#F1EBDD`, azul-profundo `#163A63`, verde `#2E6B5E`, cobre `#B07830`. The daily-menu panel becomes **azul on blanco** (blue frame, blue heading, white ground) — no dark slab anywhere on the site.

### Typefaces — 2 total

| Face | Job | Rules |
|---|---|---|
| **León Display Bold** (local) | H1, H2, "1959", carta category heads | Never under 1.4 rem. Never sentences. Never prices. |
| **Georgia** (system) | Everything else: body, dish names (bold), descriptions, captions, buttons, chips, meta, prices | Body 1.06 rem / 1.65. |

Cut: Inter, Caveat, Courier New. The pizarra loses the chalk hand — availability is information, not theatre.

### Buttons — 2 total

| Style | Spec | Used for |
|---|---|---|
| **Primary** | Solid `--azul`, white Georgia bold 1 rem, 52 px min-height, 2 px corners | Ver la carta · Llamar (sticky bar) · Abrir en Maps |
| **Secondary** | 1 px `--azul` border on blanco, azul label, same metrics | Menú del día · Cómo llegar · category chips (active chip = primary colours) |

### One Fajalauza motif

**The ramo** — a single-line foliage sprig traced from the facade panel, azul, one weight (1.5 px stroke). Appears in exactly two places on the whole site: under the hero block and above the footer. Static. Nowhere else.

### One pomegranate motif

**The granada mark** — one line-drawn pomegranate glyph, `--granada`, 14 px. Appears in exactly one role: the "recomendado" mark beside dish names (home and carta). Static. No bullets, no dividers, no footer sign-off.

### One card style

White ground, 1 px hairline border (azul at 16%), 2 px corners, 16 px padding, **no shadow**. Used for: archive photographs (with a caption line inside), the daily-menu panel, the map block. Nothing else is a card — dishes are rows, not cards.

### One price treatment

Georgia bold, `--granada`, right-aligned on the row's last line, format:
`10,00 €` · or · `Media 7,50 € · Ración 10,00 €`
Always that order, always the same line position, one size (0.95 rem — one step below the dish name). Unconfirmed prices are not shown (canonical §14 unchanged).

### One spacing scale

8 px base: **8 · 16 · 24 · 40 · 64**. Section seams: 64 mobile / 96 desktop (one exception allowed nowhere). Measures: 680 px prose · 880 px lists/grids · 1080 px hero. Three measures, fixed.

---

## 5. Photograph selection — 7 total, exact paths

All previously opened and visually verified (see `BAR_LEON_PROTOTYPE_ASSETS.md` register). No AI imagery.

| # | Role | Exact source path | Why this one |
|---|---|---|---|
| 1 | **Hero** | `/Users/kokonvt/Projects/2_Clients/Restaurante-Leon-V2/public/images/hemeroteca/bar-leon-granada-semana-santa-procesion-01.jpg` | Frontal, timeless view of the facade's Fajalauza panel — lettering, foliage and pomegranates fill the frame with no seasonal props and no people. It *is* the concept in one image: colour (azul on white ceramic), photography, Fajalauza. 1080×1350 holds a mobile-first hero crop. (Filename is misleading — verified content is the panel, not a procession.) |
| 2 | Food | `/Users/kokonvt/Projects/2_Clients/bar-leon-cms/assets/images/web/leon-pinchodetortilla.webp` | Tortilla del Sacromonte is dish #1 of the house; shot on the real barra, available light; already production-optimized. |
| 3 | Food | `/Users/kokonvt/Projects/2_Clients/restaurante-bar-leon/04_ASSETS/galeria/callos-leon.jpg` | Callos in cazuela with two cañas — guiso + barra in a single frame; warm colour against the blue system; 1200×900. |
| 4 | Food | `/Users/kokonvt/Projects/2_Clients/restaurante-bar-leon/04_ASSETS/galeria/sesos-leon.jpg` | Sesos: the dish "most Granada bars stopped serving" — the identity claim made edible; clean top-light documentary shot; 900×1200 works as the portrait crop among two landscapes. |
| 5 | History | `/Users/kokonvt/Projects/2_Clients/Restaurante-Leon-V2/public/images/history/bar-leon-granada-caricatura-carlos-belda-01.jpg` | The Carlos Belda ink caricature on yellowed paper — the single strongest family-archive object; instantly reads as "three generations". 1440². |
| 6 | History | `/Users/kokonvt/Projects/2_Clients/Restaurante-Leon-V2/public/images/hero/bar-leon-granada-fachada-azulejo-principal-01.jpg` | The founder's relief portrait presiding over the barra beside the cofrade corner — family, faith and the room itself in one documentary frame. Dark, but honestly dark; sits inside a card, not as a background. (Filename misleading — verified content is this interior.) |
| 7 | Facade / location | `/Users/kokonvt/Projects/2_Clients/Restaurante-Leon-V2/public/images/hero/bar-leon-granada-fachada-terraza-01.webp` | The full facade with Cruz de Mayo, copper lion plates and the panel in context on Calle Pan — places the bar in its street for the identity/location block; its seasonal red echoes `--granada`. 1440×1800. |

Runner-up kept in reserve (not used in v1): `ayuntamiento-reconocimiento-05.jpg` (brighter family group, swaps with #6 if Miriam prefers people over the room).

---

## 6. Wireframes

Three files, grayscale boxes only — hierarchy and proportions, no ornament, no motion, no colour:

- `docs/wireframes/reset-home-mobile.svg` (390-wide reference)
- `docs/wireframes/reset-home-desktop.svg` (1440-wide reference)
- `docs/wireframes/reset-carta-mobile.svg` (390-wide reference)

Reading notes: box heights are proportional to intended real heights; percentages on the right margin give each section's share of the page; type sizes shown as labels (H1/H2/body/price), not styled.

---

## 7. Boundaries of this reset

- No full website, no HTML/CSS/JS edits, no data edits, no motion, no commit, no deploy.
- The Fajalauza Vivo prototype stays parked on its branch as reference — nothing from it is deleted, nothing more is built on it until this reset is approved.
- Next step after approval: apply §2–§4 to the *existing* production templates as one restrained pass — not a new prototype.
