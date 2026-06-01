# Missing Functionality — Bar León CMS

**Audit date:** 2026-06-01

Sources: `docs/MERGE_PLAN.md`, `docs/MASTER_FOOD_SYSTEM.md`, `admin/config.yml` vs `data/venue.json` comparison.

---

## From MERGE_PLAN.md — phase status

### Phase 1 — Extract and migrate assets

| Item | Status | Notes |
|---|---|---|
| Hero façade photo (`bar-leon-granada-fachada-azulejo-principal-01.jpg`) | ❌ Missing | `assets/images/hero/` directory does not exist. `homepage.js` falls back to editorial panel when `d.hero.image` is falsy. Source: `bar-leon-clean` repo. |
| Barra interior photo (`bar-leon-granada-cerveza-tapa-barra-01.jpg`) | ❌ Missing | Source: `bar-leon-clean` repo. |
| Wine data | ✅ Done | `venue.json` has `wines[]` array. `admin/config.yml` has wines collection. `carta.js` renders wine section. |
| Drinks data (aperitivos, cervezas, refrescos) | ✅ Done | `venue.json` has `beverages[]` array. `admin/config.yml` has beverages collection. `carta.js` renders bar section. |
| EN dish descriptions (superior versions from `restaurante-bar-leon-3lx`) | ⚠️ Unverified | The canonical EN translations listed in MERGE_PLAN.md (criadillas, cazón, chopos, etc.) have not been verified against the current `venue.json` content. This requires reading the actual dish records. |
| Bocadillos | ⚠️ Partial | `carta.js` has a `bocadillos-warning` handler for `category_id === 'bocadillos'`, suggesting the feature was planned. Unclear if the category and items are populated in `venue.json`. |

### Phase 2 — CMS config updates

| Item | Status | Notes |
|---|---|---|
| Wines collection in config.yml | ✅ Done | Present in `admin/config.yml` |
| Beverages collection in config.yml | ✅ Done | Present in `admin/config.yml` |
| `chalkboard` collection in config.yml | ❌ Missing | `chalkboard` exists in `venue.json` and is fully rendered by `carta.js` (barra tab). No CMS collection in `admin/config.yml`. Owner cannot edit chalkboard items without direct JSON editing. |
| `service_mode` in config.yml | ❌ Missing | `service_mode` (3 booleans: menu_del_dia, restaurant_open, bar_open) exists in `venue.json` and affects CTA logic in `carta.js renderFooter()`. Not exposed in any CMS UI. |

### Phase 3 — New pages

| Page | Status | Notes |
|---|---|---|
| `/vinos/` | ❌ Not created | Wine data is in `venue.json`. Rendering logic for wines exists in `carta.js renderWines()`. No standalone page or HTML shell. |
| `/contacto/` | ❌ Not created | Contact data and location block logic exist. `homepage.js` renders a `location-section` inline. No standalone page. |
| `/historia/` | ❌ Not created | Copy available in `docs/MASTER_BAR_LEON_SOURCE_OF_TRUTH.md` and `docs/MASTER_FOOD_SYSTEM.md`. No page template or HTML shell. |
| `/galeria/` | ❌ Blocked | Blocked until more than 2 production-quality photos are available. `assets/images/` has `leon1-8.jpeg` (historical/reference) and `ref_01-13.webp` but their production readiness is unknown. |

### Phase 4 — Homepage enrichment

| Item | Status | Notes |
|---|---|---|
| Featured dishes (Sabores de Andalucía) | ✅ Done | `homepage.js renderHomeAndalusia()` renders top 5 dishes from andalusian-specialities category, sorted by `featured` value |
| Real hero photo | ❌ Missing | `homepage.js` checks `d.hero.image` — renders `<figure class="hero-frame">` if present, editorial fallback otherwise. Hero image field is empty in current `venue.json`. |
| Wine preview strip on homepage | ⚠️ Partial | Pairing chips on Sabores dishes link to wines. No separate wine-strip section as described in MERGE_PLAN.md Phase 4.3. |

---

## From MASTER_FOOD_SYSTEM.md — data model gaps

### High priority (affects content accuracy)

| Gap | Notes |
|---|---|
| Tuesday hours in multilingual data | MASTER_FOOD_SYSTEM.md Appendix A notes Tuesday shows `ABIERTO` in English data instead of `CERRADO TARDE`. With the migration to unified `venue.json`, the `hours[].note` field now carries translations. Verify current state before publishing. |
| Menú primeros confirmation needed | Gazpacho and Sopa de picadillo as first-course options are flagged `[UNCONFIRMED]` in MASTER_FOOD_SYSTEM.md. Current `venue.json` may contain these as primeros — needs owner confirmation before publishing. |

### Medium priority (affects feature completeness)

| Gap | Notes |
|---|---|
| `temporada` field on individual dishes | Currently `available` is a binary toggle. Seasonal dishes (gazpacho, salmorejo, sopa de ajos) are hidden/shown manually. A `temporada` select (verano/invierno/todo el año/por encargo) would enable structured seasonal logic. Requires: schema change in `venue.json`, CMS config update, JS rendering update. |
| Bar pricing separation | Dishes with dual barra/restaurante pricing embed both in a freetext `price` string (e.g., `"5,00 € (barra) / 14,00 € (restaurante)"`). `parseDishPrice()` handles display translation but the data is not machine-readable for analytics or QR menus. |
| Tapas de barra as content type | Exists operationally at the bar (croquetas 1,80 €/ud, pincho de tortilla 2,80 €, flamenquín 5,00 €). Not a separate content type. Currently embedded as price annotations within carta dishes. MASTER_FOOD_SYSTEM.md Section 2.4 defines the proposed schema. |
| Salmorejo as summer primero in menú del día | Flagged for owner confirmation. |
| Potaje de vigilia (Viernes Santo) | Flagged for owner confirmation. |

### Low priority

| Gap | Notes |
|---|---|
| Bocadillos as structured content type | 6 bocadillos exist in `bar-leon-clean` repo with prices. MASTER_FOOD_SYSTEM.md Section 2.5 defines the schema. Currently missing from `venue.json`. `carta.js` has the warning handler ready. |
| Wine list separate page | Now handled via carta.js panel tab. Separate `/vinos/` page still missing (Phase 3). |
| Vermouth / aperitivos | Referenced in `venue.json` beverages but completeness unknown. |

---

## Known data quality issues

These require verification in the current `venue.json` (not code changes).

| Issue | Source | Resolution |
|---|---|---|
| `Albayzín` spelling | MERGE_PLAN.md | ✅ Confirmed correct in current data |
| Tuesday CERRADO TARDE | MERGE_PLAN.md + MASTER_FOOD_SYSTEM.md | ⚠️ Verify in current `venue.json` hours array |
| Tarta Canadá vs. Tarta Contesa | MERGE_PLAN.md | ⚠️ Owner confirmation needed |
| Real Google Maps URL | MERGE_PLAN.md | ⚠️ Verify `venue.json social.google_maps` is not a placeholder |
| Lion SVG logo as official logo | MERGE_PLAN.md | ⚠️ `lion-logo.svg` exists in `assets/images/` and is used by both JS files. Whether this is the official logo needs owner confirmation. |

---

## Undocumented features that exist but aren't mentioned in any doc

These were found in the code but have no documentation.

| Feature | Where | Notes |
|---|---|---|
| `chalkboard` data object + rendering | `carta.js renderChalkboard()` + `venue.json.chalkboard` | Full barra chalkboard rendering with two columns and media/ración prices. Exists and works. Not mentioned in MERGE_PLAN, MASTER_FOOD_SYSTEM, or any planning doc. Not editable via any CMS UI. |
| `service_mode` flags | `venue.json.service_mode` + `carta.js renderFooter()` | Three boolean flags that control which CTA shows in the carta footer (phone call vs. WhatsApp). Not documented. Not in CMS. |
| Notice expiry date | `panel/app.js` + `venue.json.venue.notice_expiry` | Panel supports setting an expiry date after which the notice auto-hides. This field exists in the panel but has no corresponding CMS field in Decap, and is not documented anywhere. |
| `para-empezar` block | `carta.js renderParaEmpezar()` | Renders aperitivo suggestions (fino, manzanilla, vermut, alhambra reserva) from wines/beverages at the top of the bar carta tab. Feature is complete; not mentioned in any planning doc. |
| Pairing chip cross-link | `carta.js` + `homepage.js` | Clicking a pairing chip on a dish navigates to the wines tab and highlights the specific wine. Works as a cross-tab navigation feature. Not documented. |
| Stories archive / photo album | `homepage.js renderStoriesArchive()` | Slideshow of carioca photos on homepage. Uses panel-uploaded content. Feature is complete; minimal documentation. |
