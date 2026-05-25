# BAR LEÓN — MERGE PLAN

**Objective:** Converge three competing prototypes into one coherent final system.  
**Method:** Consolidation only. No redesign. No new aesthetic directions.  
**Date:** 2026-05-25

---

## The three sources

| System | Repo | URL | Last updated |
|---|---|---|---|
| CMS base | `miriamsaxetech-code/bar-leon-cms` | (Cloudflare Pages — CMS repo) | 2026-05-25 |
| Visual prototype | `miriamsaxetech-code/bar-leon-clean` | bar-leon-clean.pages.dev | 2026-04-24 |
| Translation prototype | `miriamsaxetech-code/Restaurante-Leon-V2` | restaurante-bar-leon-3lx.pages.dev | 2026-04-16 |

There are also two older repositories (`Restaurante-Leon`, `restaurante-bar-leon`) that predate all three. They are irrelevant to this merge.

---

## Audit — what each source contributes

### bar-leon-clean.pages.dev

**What it has that no other source has:**

- **Two real photographs** confirmed in production:
  - `bar-leon-granada-fachada-azulejo-principal-01.jpg` — facade exterior, azulejo tiles (hero-quality)
  - `bar-leon-granada-cerveza-tapa-barra-01.jpg` — barra interior with cerveza and tapa
- **Complete wine list** — `/vinos/` page with D.O. Granada wines, Rioja, Ribera del Duero, Valladolid, Rueda, Andalucía. Copa and botella prices. Pairing notes. This data exists nowhere else.
- **Drink sections in carta** — Aperitivos (Fino/Manzanilla 4,50 €, Málaga 2,80 €, Martini 2,60 €, Cider 2,90 €, Tinto de Verano 2,70 €, Vermuth 2,80 €), Cervezas (10 brands with prices), Refrescos y Aguas. This data exists nowhere else.
- **Featured dishes section** on homepage (Para no dudar qué pedir) — Tortilla del Sacromonte, Riñones, Carne de monte, Callos, Habas con jamón. With editorial descriptions in Spanish and wine pairings.
- **Bocadillos list with prices** — 6 bocadillos, marked "NO SE SIRVEN EN EL RESTAURANTE." Confirms bocadillos exist at the barra only.
- **Complete navigation** — Carta, Vinos, Historia, Galería, Contacto (5 pages).
- **Founded year explicit** — "Bar de barrio · Granada since 1959" in hero subheading.
- **Rich Spanish dish descriptions** — more editorial and specific than the CMS version.

**What it has wrong or missing:**

- Address: "C. Pan, 1 · **Albaicín**" — wrong spelling (should be Albayzín)
- Menú del día: Shows `platosDelDia` as the only seconds section — missing the 6 fixed `segundos` options (same structural error the CMS had before it was corrected)
- Menú del día: Includes `Miércoles: Cerrado` as a platosDelDia entry — wrong. Wednesday is a closure, not a plato.
- Menú del día primeros: Lists 4 items (Gazpacho, Sopa de picadillo, Ensalada, Salmorejo) — Gazpacho and Sopa de picadillo are flagged as unconfirmed in MASTER_FOOD_SYSTEM.md
- Category names in carta: "Entrantes y Sopas" (merged) and "Pescados y Frituras" (renamed) — differs from CMS
- No CMS. Static files. Not owner-editable.

---

### restaurante-bar-leon-3lx.pages.dev (Restaurante-Leon-V2)

**What it has that no other source has:**

- **Best English dish translations** in the project. Honest, specific, non-generic. Examples:
  - *"Crispy fried bull's testicles — a bold Andalusian bar tradition"* (Criadillas)
  - *"Tiny whole baby cuttlefish, fried golden — eat them whole, tentacles and all"* (Chopos/Puntillitas)
  - *"Dogfish marinated in vinegar, garlic and cumin, fried crispy — Andalusian coastal classic"* (Cazón)
  - *"Clear broth with shredded chicken, hard-boiled egg and bread — Granada's Sunday soup"* (Sopa de picadillo)
  - *"Garlic soup with paprika, bread and poached egg — rustic and warming"* (Sopa de ajos)
- **Correct Albayzín spelling** in address ("C. Pan, 1 · Albayzín")
- **Lion logo SVG** — may be the official logo asset
- **French translations** for dish names

**What it has wrong:**

- **Hours are critically wrong.** Shows: Lunes Cerrado, Martes–Sábado 12:30–16:00 · 20:00–23:30, Domingo 12:30–16:00. 
  - Real hours: Lunes ABIERTO, Martes CERRADO TARDE (lunch only), Miércoles CERRADO.
  - This is the opposite of reality on two days. Do not use these hours.
- **"Sofrito \[POR CONFIRMAR\]"** — an unconfirmed dish in the Sabores de Andalucía section. Must be removed.
- **Placeholder Maps link** — `https://maps.app.goo.gl/YourBarLeonLink`. Not a real link.
- **Historia section** on homepage shows placeholder text (repeats dish section copy).
- **Arroces section missing** from carta entirely.
- **Menú del día section missing** from all pages entirely.
- No CMS. Not owner-editable.

---

### bar-leon-cms (miriamsaxetech-code/bar-leon-cms — current working repo)

**What it has correctly:**

- **Only CMS-editable system.** Decap CMS with GitHub backend. Owner can edit without technical help.
- **Correct menú del día data model** — primeros + segundos (6 fixed options) + platosDelDia (daily rotation) + postres. This is the only prototype that shows the full structure correctly.
- **Correct horarios** — Lunes ABIERTO, Martes CERRADO TARDE (13:00–16:00 solo), Miércoles CERRADO, etc.
- **Correct Albayzín spelling** in data.
- **MASTER_FOOD_SYSTEM.md** — gastronomic governance document.
- **Full 75-dish carta** in es.json, en.json, fr.json.
- **Accordion carta UI** — categories expand/collapse.
- **Active maintenance** — most recently updated (today).

**What it is missing:**

- Real photographs (using editorial hero panel placeholder)
- Wine list (wines are embedded as pairing strings in dish descriptions only)
- Drinks sections (aperitivos, cervezas, refrescos) not in data or UI
- Bocadillos section
- /vinos/, /historia/, /galeria/, /contacto/ pages
- Better EN dish descriptions (restaurante-bar-leon-3lx has superior versions)
- Featured dishes on homepage
- Address on footer shows "Plaza Nueva" but street address is "C. Pan, 1"

---

## Conflict matrix

| Issue | bar-leon-clean | restaurante-bar-leon-3lx | bar-leon-cms | RESOLUTION |
|---|---|---|---|---|
| **Hours** | Correct | WRONG (Lun=Cerrado) | Correct | Use bar-leon-cms hours |
| **Address spelling** | Albaicín ✗ | Albayzín ✓ | Albayzín ✓ | Albayzín |
| **Menú del día structure** | platosDelDia only ✗ | Missing entirely ✗ | Correct ✓ | Use bar-leon-cms |
| **Primeros (menú)** | 4 items (unconfirmed) | Missing | 3 confirmed items | Owner must confirm |
| **Wine list** | Complete ✓ | Present (not audited) | Embedded strings only | Extract from bar-leon-clean |
| **Drinks in carta** | Complete ✓ | Not seen | Missing | Extract from bar-leon-clean |
| **EN descriptions** | Partial | Best ✓ | Generic | Extract from restaurante-bar-leon-3lx |
| **Real photos** | 2 photos ✓ | 1 hero (unverified) | None | Extract from bar-leon-clean |
| **Category structure** | Merged (Entrantes+Sopas) | Merged | Separate | Decision required (see below) |
| **Bocadillos** | Present (barra-only) ✓ | Present (barra-only) ✓ | Missing | Add as barra-only type |
| **Sofrito** | Not present | [POR CONFIRMAR] ✗ | Not present | Delete from restaurante-bar-leon-3lx |
| **CMS editability** | None | None | Full ✓ | bar-leon-cms is the base |
| **Featured dishes** | Yes ✓ | Partial | No | Extract pattern from bar-leon-clean |
| **Address (street)** | C. Pan, 1 ✓ | C. Pan, 1 ✓ | Plaza Nueva only | Add C. Pan, 1 to footer/contacto |

---

## Decision: Category structure

bar-leon-clean and restaurante-bar-leon-3lx both merge soups with starters ("Entrantes y Sopas"). The CMS keeps them separate.

**The case for merging:**
- Soups are often ordered as a first course alongside starters
- Fewer categories = less scrolling in the accordion
- The two prototypes independently arrived at the same solution

**The case for keeping them separate:**
- Soups at Bar León are a genuine sub-identity (platos de cuchara is a category with cultural weight)
- "Sopas y platos de cuchara" is specific and communicates something
- 7 soups listed — enough to justify their own section
- Seasonal relevance: summer/winter variation is clearer in a dedicated section

**Recommendation:** Keep separate in the CMS (`SOPAS Y PLATOS DE CUCHARA` and `ENTRANTES Y RACIONES`). The merged label "Entrantes y Sopas" was a convenience decision in static prototypes, not an informed editorial one.

---

## Final determinations

### FINAL base repository: `miriamsaxetech-code/bar-leon-cms`

Reason: It is the only system with CMS architecture, the only one with the correct data model, the only one with active governance, and the only one the owner can edit without developer involvement.

All other repositories are prototypes to be extracted from and then archived.

---

### FINAL visual direction

From `bar-leon-clean` (the visual source of truth as specified):
- The real facade photo is the hero when available
- Barra photo used as secondary visual
- "Bar de barrio · Granada since 1959" as the homepage hero subheading register
- Featured dishes section on homepage (3–5 signature dishes with editorial descriptions)
- Wine preview strip on homepage (top 3–4 wines, linking to /vinos/)
- Footer: "Desde 1959 en Granada. Cocina andaluza sin artificio."

The current CMS editorial hero panel (typographic, no photo) is the fallback until photos are integrated. It stays until replaced — do not remove it.

**Palette and typography are already canonical** in bar-leon-canonical.md:
- `--bg: #F6F3EC`, `--ink: #1C1A17`, `--accent: #7A1C1C`, `--muted: #5C5752`
- Playfair Display 700 / Inter 400–600 / Courier New for precio del menú

No changes to the design system.

---

### FINAL translation philosophy

From `restaurante-bar-leon-3lx` as the source for EN descriptions. The principle:

**Spanish name first. Honest explanation after. No comfort-editing.**

The superior English translations from restaurante-bar-leon-3lx are the canonical target:

| Dish | Canonical EN description |
|---|---|
| Criadillas | Crispy fried bull's testicles — a bold Andalusian bar tradition |
| Chopos fritos (puntillitas) | Tiny whole baby cuttlefish, fried golden — eat them whole, tentacles and all |
| Cazón en adobo | Dogfish marinated in vinegar, garlic and cumin, fried crispy — Andalusian coastal classic |
| Sopa de picadillo | Clear broth with shredded chicken, hard-boiled egg and bread — Granada's Sunday soup |
| Sopa de ajos | Garlic soup with paprika, bread and poached egg — rustic and warming |
| Gambas al pil-pil | Prawns in sizzling garlic and chilli oil — served bubbling in an earthenware dish |
| Ensaladilla rusa | Spanish potato salad with tuna, olives and homemade mayo |
| Fritura de pescado variado | Mixed fried fish assortment — the Andalusian seaside fritanga |
| Presa ibérica | Iberian pork shoulder cut — rich marbling from acorn-fed black pig |
| Ternera estofada | Slow-braised veal stew — tender, rich and comforting |
| Bacalao con tomate | Salt cod slowly cooked in tomato sauce |

French translations: extract from restaurante-bar-leon-3lx. Verify against Spanish; do not use without review.

---

### FINAL CMS architecture

The CMS in `bar-leon-cms` is the only CMS. It uses Decap CMS with GitHub backend.

**Content types to finalize (in priority order):**

**Tier 1 — Exists and is correct. No changes needed.**
- `menuDia` — primeros, segundos, platosDelDia, postres, condiciones, disponible
- `horarios` — 7-day schedule with estado and detalle
- `inicio` — titular, subtitulo, avisoEspecial
- `carta` — 8 categories, 75 dishes

**Tier 2 — Exists in prototypes. Must be added to CMS.**
- `vinos` — wine list (D.O. Granada priority, then Rioja, Ribera, etc.)
- `aperitivos` — fino, manzanilla, vermut, martini, tinto de verano
- `cervezas` — 10 brands with sizes and prices
- `bebidas` — aguas, refrescos, zumos

**Tier 3 — Exists at the barra. Must be defined as barra-only content.**
- `bocadillos` — 6 confirmed items, marked barra-only, never in restaurante

**CMS file mapping:**
```
data/es.json      → Spanish source of truth (currently in Tier 1)
data/en.json      → English translations (derived, updated manually or via AI assist)
data/fr.json      → French translations (derived)
data/vinos.json   → Wine list (to be created)
data/bebidas.json → Drinks (to be created)
```

**CMS collections to add:**
- A new `data_vinos` collection pointing at `data/vinos.json`
- Optionally merge bebidas into a `data_barra.json`

---

### FINAL content hierarchy

**Homepage:**
1. Site name + location + founding year
2. Navigation (Carta · Vinos · Horarios · Llamar)
3. Tagline
4. Hero (photo when available; editorial panel as fallback)
5. Trust strip (Maps · Google reviews)
6. Featured dishes (3–5 from Sabores de Andalucía)
7. Wine preview strip (3–4 wines from D.O. Granada)
8. Footer (address + phone)

**Carta page:**
1. Header (back · Bar León · lang selector)
2. Menú del día block (if disponible: SI) — primeros → segundos → plato del día → postre
3. Carta accordion (8 categories)
4. Divider
5. Horarios
6. Footer CTA (llamar)

**Vinos page (to create):**
1. Intro: "Granada primero. Fino y manzanilla como aperitivo."
2. D.O. Granada wines (priority section)
3. Other Spanish regions
4. Aperitivos (Fino, Manzanilla, Vermut, etc.)
5. Footer

---

### FINAL multilingual strategy

**Three languages: ES · EN · FR**

Rules:
- Spanish is always the source of truth
- Dish names stay in Spanish across all languages
- Descriptions translate the dish, not the name
- EN translations: use restaurante-bar-leon-3lx versions as base, reviewed manually
- FR translations: extract and review — do not auto-publish without check
- Menú del día section labels already multilingual via NAV object in carta.js
- The `disponible` field uses "SI"/"NO" as internal values, never shown to users — no translation needed

**Translation update workflow:**
1. Owner edits Spanish in CMS
2. Miriam (or AI-assisted process) updates en.json and fr.json
3. No automated publication of unreviewed translations

---

### FINAL operational structure

Address (two correct forms, both in use):
- **Landmark:** Plaza Nueva · Granada (for homepage, wayfinding)
- **Postal:** C. Pan, 1 · Albayzín · 18010 Granada (for footer, contacto page, maps)

Hours (canonical from bar-leon-cms data):
- Lunes: 13:00–16:00 / 20:00–23:00
- Martes: 13:00–16:00 (solo mediodía)
- Miércoles: Cerrado
- Jueves: 13:00–16:00 / 20:00–23:00
- Viernes: 13:00–16:00 / 20:30–23:30
- Sábado: 13:00–16:00 / 20:00–23:30
- Domingo: 13:00–16:00 / 20:00–23:00

Phone: +34 958 22 51 43 (tap-to-call on all pages)

---

## Merge execution plan

The merge has four phases. Each phase is independent. They can be done in sequence over multiple sessions without breaking the live site.

---

### Phase 1 — Extract and migrate assets (no UI changes)

**1.1 Photos**
- Clone `bar-leon-clean` locally
- Copy `images/hero/bar-leon-granada-fachada-azulejo-principal-01.jpg` to `bar-leon-cms/assets/images/hero/`
- Copy `images/menu/bar-leon-granada-cerveza-tapa-barra-01.jpg` to `bar-leon-cms/assets/images/`
- Verify file sizes are reasonable for web (compress if >400kb)

**1.2 Wine data**
- Extract the complete wine list from `bar-leon-clean/es/vinos/` into a new `data/vinos.json`
- Structure: `{ "granadaTintos": [...], "granadaBlancos": [...], "rioja": [...], "ribera": [...], "otros": [...], "aperitivos": [...] }`
- Each entry: `{ "nombre", "bodega", "origen", "descripcion", "maridaje", "copa", "botella" }`
- Copa value may be null for bottle-only wines

**1.3 Drinks data**
- Extract aperitivos and cervezas from `bar-leon-clean/es/carta/` into `data/bebidas.json`
- Structure: `{ "aperitivos": [...], "cervezas": [...], "refrescos": [...] }`

**1.4 English descriptions**
- Update `en.json` carta item descriptions using the restaurante-bar-leon-3lx versions listed in the translation table above
- Priority: Sabores de Andalucía section first (highest visibility)
- Do not change dish names — only `descripcion` fields

**1.5 Bocadillos**
- Add bocadillos to `data/es.json` as a separate top-level key (not mixed into `carta`)
- Mark each with `"sirveEn": "barra"` — prevents them appearing in the restaurant carta
- Six items with prices (extracted from bar-leon-clean)

---

### Phase 2 — CMS config updates

**2.1 Add wine collection to admin/config.yml**
- New collection: `data_vinos` pointing at `data/vinos.json`
- Fields: nombre, bodega, origen, descripcion, maridaje, copa, botella, disponible

**2.2 Add bebidas collection**
- New collection or add to existing: aperitivos, cervezas, refrescos
- Keep minimal — owner rarely edits this

**2.3 Update carta CMS hints**
- Update `hint` text for primeros to reflect confirmed items only

---

### Phase 3 — Pages (new routes)

Pages to create in priority order:

**3.1 /vinos/** — Wine list page (ES · EN · FR)
- Load from `data/vinos.json`
- Grouped by region, D.O. Granada first
- Copa/botella pricing display
- Pairing suggestions
- No accordion needed — shorter list than carta

**3.2 /contacto/** — Contact page (ES · EN · FR)
- Address with map link (real URL needed — MASTER_FOOD_SYSTEM Appendix A)
- Phone as tap-to-call
- Hours repeat (same data source as carta horarios)
- Note: no reservation form at this stage

**3.3 /historia/** — History page (ES · EN · FR)
- Minimal: founding (1959), family continuity, location
- Do not invent. Do not decorate.
- Source: owner interview or existing copy from bar-leon-clean

**3.4 /galeria/** — Gallery (ES · EN · FR)
- Only create when more than 2 photos exist
- Currently blocked pending photo acquisition

---

### Phase 4 — Homepage enrichment

**4.1 Add featured dishes section**
- Pattern from bar-leon-clean: 3–5 dishes from Sabores de Andalucía
- Hardcoded in homepage.js initially (not CMS-driven) — simpler and more stable
- Dishes: Tortilla del Sacromonte, Riñones al Jerez, Carne de monte, Callos, Habas con jamón
- Spanish description + pairing note per dish

**4.2 Replace editorial hero panel with real photo**
- When `bar-leon-granada-fachada-azulejo-principal-01.jpg` is in assets/images/hero/
- Update homepage.js to render `<img>` inside `.hero-frame` instead of `.hero-editorial`
- Keep `.hero-editorial` CSS — use as fallback if img fails to load

**4.3 Add wine strip to homepage**
- Pattern from bar-leon-clean: 3–4 wines, copa price, linking to /vinos/
- Sourced from `data/vinos.json` (first 4 entries of granadaTintos)

---

## What to delete / archive

### Delete immediately
- `Sofrito [POR CONFIRMAR]` entry in restaurante-bar-leon-3lx — already not in our CMS, no action needed
- `Miércoles: Cerrado` in bar-leon-clean's platosDelDia — already not in our CMS
- `FINAL_ROUTER_VERIFICATION.md`, `ROUTER_REPLACEMENT_LOG.md`, `ROUTING_CONSOLIDATION_PLAN.md` — orphaned planning docs in personal-assistant root (unrelated to Bar León, but clutter)

### Archive (keep repo, mark inactive)
- `Restaurante-Leon` — oldest prototype, no unique content
- `restaurante-bar-leon` — older version, no unique content

### Keep but do not publish
- `bar-leon-clean` — source of photos and wine data. Do not shut down until assets are extracted to bar-leon-cms.
- `Restaurante-Leon-V2` — source of EN/FR translations. Do not shut down until descriptions are migrated.

### Note on Cloudflare deployments
Both `bar-leon-clean.pages.dev` and `restaurante-bar-leon-3lx.pages.dev` can remain live during the migration — they are prototypes, not the public-facing URL. Once bar-leon-cms has all the content, those deployments can be removed from Cloudflare Pages.

---

## Unresolved items requiring owner verification

These must be resolved before Phase 1 is complete. They cannot be decided without the owner.

| Item | Question |
|---|---|
| Gazpacho y Sopa de picadillo | Are these currently on the menú del día as primeros? (bar-leon-clean says yes, MASTER_FOOD_SYSTEM says unconfirmed) |
| Potaje de vigilia (Viernes Santo) | Is this offered? If so, should it appear in the menú del día section? |
| Real Maps link | What is the correct Google Maps link for C. Pan, 1? |
| Lion logo | Is the SVG lion in Restaurante-Leon-V2 the official logo? Should it appear on the final site? |
| Bocadillos serving rules | At what hours are bocadillos served? Bar only, or also at tables? |
| Historia page content | What should the history page say beyond "1959 · tres generaciones"? |
| Gallería photos | Are there other photos available beyond the two in bar-leon-clean? |
| Tuesday horarios in en.json | Confirm: Tuesday is lunch only (CERRADO TARDE). En.json currently shows ABIERTO — needs correction. |
| Tarta Canadá | Is "Tarta Contesa" the correct product name for what's on the menu? |

---

## Summary

| Dimension | Final answer |
|---|---|
| **Base repo** | `bar-leon-cms` |
| **Visual source** | bar-leon-clean (photos, homepage structure) |
| **Translation source** | restaurante-bar-leon-3lx (EN descriptions) |
| **Data model authority** | MASTER_FOOD_SYSTEM.md |
| **Content hierarchy** | MASTER_FOOD_SYSTEM.md Section 2 |
| **CMS** | Decap CMS on bar-leon-cms — owner-editable |
| **Address** | Plaza Nueva (landmark) · C. Pan, 1 · Albayzín (postal) |
| **Hours source of truth** | bar-leon-cms data/es.json |
| **Repos to archive** | Restaurante-Leon, restaurante-bar-leon |
| **Repos to migrate then archive** | bar-leon-clean, Restaurante-Leon-V2 |
| **Immediate data errors to fix** | Tuesday CERRADO TARDE in en.json + fr.json |
