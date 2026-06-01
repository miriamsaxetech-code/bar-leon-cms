# Feature: Menú del Día Editor

**Date:** 2026-06-01
**Status:** Implemented
**Owner-facing:** Yes — primary daily-use feature

---

## What this is

A new **Menú** tab in the owner panel (`/panel/`) that lets the bar owner edit the daily lunch menu directly from a smartphone, without needing Decap CMS or technical knowledge.

---

## What the owner can do

From the Menú tab:

| Field | Description | Data field |
|---|---|---|
| Menú disponible hoy | Toggle the menu on or off for today | `daily_menu.active` |
| Precio del menú | Set the menu price (e.g. 12,50) | `daily_menu.price` |
| Primeros | List of first course options, separated by · | `daily_menu.starters.es` |
| Segundos | List of second course options, separated by · | `daily_menu.seconds.es` |
| Plato del día | One dish per active day (Mon / Tue / Thu / Fri) | `daily_menu.mains[].name.es` |
| Postre | List of dessert options | `daily_menu.desserts.es` |
| Nota opcional | Seasonal or special note for the current week | `daily_menu.seasonal.es` |

Changes are saved with the existing **Guardar cambios** button at the bottom of the screen.

---

## What is not editable from the panel

The following fields exist in `data/venue.json` but are intentionally excluded from the owner panel (use Decap CMS at `/admin/` for these):

- `daily_menu.starters.en / fr` — English and French translations
- `daily_menu.seconds.en / fr`
- `daily_menu.mains[].name.en / fr`
- `daily_menu.desserts.en / fr`
- `daily_menu.seasonal.en / fr`
- `daily_menu.days[]` — which days the menu is served (Decap CMS)
- `daily_menu.service_period` — lunch window times (Decap CMS)
- `daily_menu.includes` — IVA/drinks disclaimer (Decap CMS)

---

## Architecture

No backend changes were required. The feature is entirely frontend.

**Files changed:**

| File | Change |
|---|---|
| `panel/index.html` | Added "Menú" tab button and `#tab-menu` section with all form fields |
| `panel/app.js` | Added `renderMenuDelDia()` (populates fields from state), `bindMenuDelDia()` (change handlers), wired into `renderAll()` and `bindEvents()` |
| `panel/panel.css` | Added `.menu-panel` container (alias of `.aviso-panel`), `.menu-mains-list`, `.menu-main-row`, `.menu-main-day`, `.menu-main-input` |

**Reused without modification:**
- `saveAll()` — existing save workflow; writes full `state` to `data/venue.json` via `functions/admin-save.js`
- `markDirty()` — triggers the save bar to show "Cambios sin guardar"
- `loadVenueData()` — loads `daily_menu` on panel open
- `.toggle-row`, `.toggle-wrap`, `.field-group`, `.field-label`, `.field-textarea`, `.field-input` CSS classes — all reused unchanged

---

## How the save works

1. Owner edits a field → `markDirty()` called → "Guardar cambios" button activates
2. Owner taps "Guardar cambios" → `saveAll()` POSTs full `state` (including updated `daily_menu`) to `/functions/admin-save`
3. `admin-save.js` reads current `venue.json` SHA from GitHub, writes updated JSON as a commit
4. Website re-deploys via Cloudflare Pages and renders the updated menu

---

## Fields not implemented in the plan but present in data

The `mains[]` per day (plato del día) is included in the panel. The owner sees one text input per active day (Mon / Tue / Thu / Fri). On change, the matching `mains[].name.es` entry is updated, or a new entry is pushed if missing.

---

## Decap CMS role after this feature

Decap CMS at `/admin/` is still used for:
- Editing multilingual menu content (en/fr translations)
- Changing which days the menu is served (`daily_menu.days`)
- Editing the IVA disclaimer (`daily_menu.includes`)
- Structural changes (adding dishes, wines, categories)

The owner panel handles all **operational daily updates**. Decap CMS handles **structural or multilingual changes** done occasionally.
