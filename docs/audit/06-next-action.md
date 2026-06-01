# Recommended Next Actions — Bar León CMS

**Audit date:** 2026-06-01

## Decision framework

For every recommendation, three options are evaluated:
- **Reuse** — use what already exists unchanged
- **Extend** — add to what exists without replacing it
- **Replace** — rebuild (requires clear justification)

**Default: Reuse.** Do not create new code when existing code covers the need. Do not replace working systems. Search `.superpowers/`, `NEXO/`, `docs/`, `panel/`, `tests/`, and `js/` before writing anything new.

---

## Priority 1 — Documentation fixes (no code changes)

These create the most agent confusion and take the least time to fix.

### 1.1 Update `NEXO/context/stack.md`

**Problem:** File structure diagram shows `data/es.json`, `data/en.json`, `data/fr.json`. Reality is `data/venue.json`.

**Decision:**
- ~~Replace~~ — don't rewrite the whole file
- **Extend** — update the file structure block and the "Archivos editables" list only
- Keep all architecture decisions and reasoning intact

### 1.2 Archive `docs/HANDOFF_TO_CLAUDE.md`

**Problem:** Describes a discarded Next.js architecture. Misleads any agent reading `docs/`.

**Decision:**
- ~~Reuse~~ — content is wrong, not reusable
- ~~Extend~~ — content is entirely about a dead system
- **Replace with archive** — move to `docs/archive/HANDOFF_TO_CLAUDE.md` (keeps history without polluting active docs)

### 1.3 Fix `NEXO/README.md` correction note

**Problem:** "Corrección urgente pendiente" references `data/es.json` which no longer exists.

**Decision:**
- **Extend** — remove the obsolete correction note; optionally add a current known issue if one exists

### 1.4 Document the two-CMS split

**Problem:** `/admin/` and `/panel/` both write to `venue.json` but the division of responsibilities is implicit, not documented.

**Decision:**
- **Extend** — add a "CMS Access" section to `NEXO/context/bar-leon-canonical.md` defining:
  - `/panel/` → owner daily tasks (prices, hours, notice, photos)
  - `/admin/` → full schema editing (developer/assistant)

---

## Priority 2 — Fix active divergences in production code

These affect what users see right now.

### 2.1 Align `wineCultureNote()` for manzanilla between the two JS files

**Problem:** `homepage.js` returns `"salitre de Cádiz"` for manzanilla. `carta.js` returns `"salinidad de Sanlúcar"`. A pairing chip for the same wine shows different text depending on which page the user is on.

**Decision:**
- ~~Replace~~ — don't extract to a shared module yet (that's a larger refactor)
- **Extend** — pick one canonical string and apply it to both files. Canonical answer: `"salinidad de Sanlúcar"` (more specific, matches the wine's actual origin). One-line change in `homepage.js`.

### 2.2 Fix `parseDishPrice()` `&nbsp;` divergence

**Problem:** `homepage.js` normalizes `&nbsp;` before regex matching; `carta.js` does not. Same price string may parse differently between pages.

**Decision:**
- **Extend** — add the same `cleanStr` normalization to `carta.js parseDishPrice()`. One addition to match what `homepage.js` already does.

---

## Priority 3 — Add missing CMS fields

Two fields exist in `venue.json` and are actively rendered but cannot be edited via any CMS UI.

### 3.1 `chalkboard` in `admin/config.yml`

**Problem:** `venue.json.chalkboard` is rendered by `carta.js renderChalkboard()` as the barra tab price display. No CMS collection exists. Owner cannot edit barra chalkboard prices.

**Decision:**
- ~~Replace~~ — chalkboard data structure is working
- **Extend** — add a `chalkboard` collection to `admin/config.yml`. Reuse the existing widget patterns (list of objects with language-keyed strings, number fields for media/ración). No JS changes needed.

### 3.2 `service_mode` in `admin/config.yml`

**Problem:** `venue.json.service_mode` (3 booleans) controls CTA rendering in `carta.js`. Not in Decap or the custom panel.

**Decision:**
- **Extend** — add `service_mode` as a nested object in the existing `venue` collection in `admin/config.yml`. Three boolean widgets. Low complexity. Alternatively, add it to the Custom Panel as a fourth toggle in the Aviso tab (higher owner visibility). Panel is the better home for operational on/off flags.

---

## Priority 4 — Verify data quality (owner verification needed)

These require a conversation with the owner, not code changes.

| Item | What to verify |
|---|---|
| Menú primeros | Confirm: are Gazpacho and Sopa de picadillo currently offered as first-course options? |
| Tuesday hours | Confirm: Tuesday is lunch only (13:00–16:00). Verify this is correctly reflected in `venue.json.hours` for all language display contexts. |
| Tarta Canadá / Tarta Contesa | Confirm the correct product name. |
| Google Maps link | Verify `social.google_maps` in `venue.json` is a real, working link. |
| Lion logo | Confirm `lion-logo.svg` is the official logo to use publicly. |
| Bocadillos | Confirm which items and prices are current. Confirm serving rules (bar only, lunch only?). |

---

## Priority 5 — Hero photo (blocked on asset migration)

The homepage editorial fallback is functional. The real façade photo exists in `bar-leon-clean` repo but has not been migrated.

**Decision:**
- **Reuse** — `homepage.js` already handles `d.hero.image` — the rendering logic is done
- **Extend** — the only task is: add the photo to `assets/images/hero/`, then set `venue.json.hero.image` to the path
- No code change required

---

## Priority 6 — Phase 3 pages (new routes)

These are genuinely new but should reuse maximum existing infrastructure.

### `/vinos/` page

**Decision:**
- **Reuse** — `carta.js renderWines()` already renders the full wine list with copa/botella pricing, producers, pairing notes, and accordion UI. All wine data is in `venue.json`.
- **Extend** — create an HTML shell (`es/vinos.html`, `en/wines.html`, `fr/vins.html`) that loads `carta.js`. The wine tab in the carta already has the right rendering. The new pages just need their own HTML shells pointing to the same JS.
- Add entries in `admin/config.yml nav` for the vinos page links.

### `/contacto/` page

**Decision:**
- **Reuse** — `homepage.js` already has `locationBlock` with OpenStreetMap iframe, Google Maps link, address, and review CTA. This is 90% of what a contact page needs.
- **Extend** — extract or duplicate the `locationBlock` + `renderHorarios()` into a contact shell. Or render it inline in a new contact HTML that loads a minimal version of `homepage.js`.

### `/historia/` page

**Decision:**
- **Reuse** — copy in `docs/MASTER_BAR_LEON_SOURCE_OF_TRUTH.md` (validated history section) and `docs/MASTER_FOOD_SYSTEM.md` identity section
- **Extend** — create HTML shell + simple render function. Consider adding historia content to `venue.json` so it's CMS-editable. `NEXO/reusability-audit.md` lists "Historia timeline" as pending.

---

## Do NOT rebuild or replace

| System | Reason |
|---|---|
| `js/homepage.js` | Complete and working. Extend via `venue.json` schema only. |
| `js/carta.js` | Complete and working. Has full menu/wine/bar/horarios rendering. |
| `css/style.css` | Frozen per `bar-leon-canonical.md`. |
| `functions/auth.js`, `callback.js`, `admin-save.js` | Working correctly. No changes needed. |
| Decap CMS setup (`admin/`) | Working. Only add missing collections. |
| Custom Panel (`panel/`) | Complete for its scope. Extend if needed. |
| `data/venue.json` schema | Stable. Add fields carefully; don't restructure. |

---

## Undocumented features to document (not build)

These exist, work, and are not mentioned in any planning doc. They should be noted in `bar-leon-canonical.md` or `NEXO/context/canonical-components.md` so agents know to use them instead of building new ones.

| Feature | Location | What to document |
|---|---|---|
| Chalkboard barra display | `carta.js renderChalkboard()` + `venue.json.chalkboard` | What it is, how to populate it |
| `service_mode` flags | `venue.json.service_mode` + `carta.js renderFooter()` | What each flag does to the CTA |
| Notice expiry date | `panel/app.js` + `venue.json.venue.notice_expiry` | How to set it; that it's panel-only |
| Para empezar block | `carta.js renderParaEmpezar()` | How it selects items; how to add to it |
| Pairing chip cross-navigation | `carta.js initPairingChips()` | That this exists and how it works |
| Stories archive / photo album | `homepage.js renderStoriesArchive()` | Carioca upload → homepage display flow |
