# CMS & Admin Capabilities — Bar León

**Audit date:** 2026-06-01

The system has **two parallel admin interfaces** for editing `data/venue.json`. They serve different operators and different use cases.

---

## System A: Decap CMS (`/admin/`)

Full-schema editor. Desktop-first. Requires GitHub collaborator access.

### What it can edit

| Section | Fields |
|---|---|
| Menú del día | active toggle, price, days, service_period, starters, seconds, mains (daily rotation), desserts, includes, seasonal note |
| Carta (dishes) | available, status (available/soldout/seasonal), name (ES/EN/FR), price, category_id, description (ES/EN/FR), pairing (ES/EN/FR), featured badge, internal ID |
| Vinos | available, category_id, name, producer, region, type, price_bottle, price_glass, ID |
| Bebidas | available, category_id, name (ES/EN/FR), price, ID |
| Horarios | day, status (open/partial/closed), periods (open/close times), note (ES/EN/FR) |
| Venue info | slug, name/full_name/tagline/cuisine/cuisine_tag (ES/EN/FR), founding_year, notice (ES/EN/FR), currency, primary_language, active_languages |
| Service mode | menu_del_dia, restaurant_open, bar_open booleans |
| Contact | address (all fields), phone, phone_link, whatsapp, email |
| Social links | instagram, facebook, tripadvisor, google_maps, google_reviews, x |
| SEO | title/description/keywords (ES/EN/FR), canonical URL, og_image |
| Hero | image upload, alt text (ES/EN/FR), focal_point |
| Categories | id, name (ES/EN/FR), type (food/wine/drink), service (restaurant/bar), order |
| Navigation strings | All nav UI labels (ES/EN/FR): menu, hours, call, back, daily_menu, edict_header, edict_foot, whatsapp_btn, tabs |
| Cariocas | image upload (to assets/images/cariocas/), caption (ES/EN/FR), context, active |

### What it does NOT cover (gaps in config.yml)

| Key in venue.json | Status |
|---|---|
| `chalkboard` | ❌ Not in config.yml — barra chalkboard data cannot be edited via Decap |
| `service_mode` | ❌ Not in config.yml — boolean service flags cannot be toggled via Decap |

### Limitations

- **Mobile UX is poor.** Editing a single dish price requires: Open CMS → navigate to Carta → find dish in long list → expand → change price → save. Not usable under service conditions.
- **No notice expiry date.** The `notice` object has no expiry field in Decap's schema (though `notice_expiry` exists in venue.json via the custom panel).
- **Translations are not linked.** Editing ES content does not trigger EN/FR updates. The operator must manually keep three language objects in sync.
- **Preview renderer** exists as an inline script in `admin/index.html` (tested by `tests/admin-preview.test.mjs`).
- **GitHub commits on every save.** This is a feature (version history) and a limitation (no draft/staging).

---

## System B: Custom Panel (`/panel/`)

Mobile-first owner tool. Four tabs. Covers the highest-frequency edits only.

### What it can edit

**Tab: Precios**
- All dishes, wines, and beverages listed with inline price editing
- Real-time search by name
- Wine prices show bottle vs. glass distinction
- Changes are held in memory until "Guardar cambios" is clicked
- All three content types (dishes, wines, beverages) in one searchable list

**Tab: Horarios**
- Toggle each day open (any periods) or closed
- Add/remove time periods per day (open/close time inputs)
- Deleting all periods auto-sets status to closed

**Tab: Aviso**
- Enable/disable notice toggle
- ES/EN/FR text areas for the notice message
- Optional expiry date — notice auto-hides after this date (handled by the web front-end, not the server)

**Tab: Archivo (Carioca)**
- Upload photo (JPG, WebP, PNG — max 10MB, HEIC rejected)
- Auto-resizes images >1MB to max 1200px wide (canvas API, saved as JPEG at 0.85 quality)
- Drag-and-drop support
- 3-language caption fields
- Context selector (homepage / historia / archive)
- Active toggle
- Photos uploaded directly to `assets/images/cariocas/` via GitHub Contents API before the main save

### What the Panel does NOT cover

| Missing | Impact |
|---|---|
| Menú del día content | Owner cannot change primeros, segundos, daily specials, or price without Decap |
| Dish toggle (available/soldout) | Owner cannot mark a dish as soldout or hide it — must use Decap |
| Service mode flags | `restaurant_open` / `bar_open` flags not in panel (also not in Decap — see gap above) |
| Multilingual nav strings | Requires Decap or direct JSON edit |
| Venue info, contact, social | Requires Decap or direct JSON edit |
| SEO fields | Requires Decap or direct JSON edit |
| Hero image | Requires Decap or direct JSON edit |

### Technical behaviour

- Token stored in `sessionStorage` (not `localStorage`) — cleared on tab close
- `beforeunload` warning if dirty
- 409 conflict detection from `admin-save.js` — shows user-facing error message
- Commits to GitHub with message: `"chore(panel): update venue.json via admin panel"`
- Carioca images commit with message: `"chore(panel): upload carioca image"`

---

## Division of responsibilities (intended)

| Who | When | Uses |
|---|---|---|
| Owner (non-technical) | Daily/weekly — prices, hours, notice, photos | Custom Panel (`/panel/`) |
| Developer / Assistant | Schema changes, translations, new content types | Decap CMS (`/admin/`) or direct JSON edit |

This division is implied by the code but not yet documented anywhere in the project. See `06-next-action.md`.
