# Bar León CMS — Architecture Reference

Single source of truth for how the CMS works. Covers authentication, data flow, Cloudflare Functions, the panel UI contract, and what the owner can edit. Use this before any redesign, refactor, or new feature to avoid breaking existing integrations.

---

## 1. Panel Architecture

The admin panel is a self-contained static SPA with no build step.

```
panel/
  index.html   — full UI markup; single HTML file, no templates
  app.js       — all logic (auth, data loading, rendering, save)
  panel.css    — all styling
```

The panel loads at `/panel/` (Cloudflare Pages serves the directory). It is not linked from the public site — access is by direct URL.

### Boot sequence

1. `DOMContentLoaded` fires in `app.js`
2. Check `localStorage` for a saved token → verify expiry
3. If valid: hide `#auth-screen`, show `#panel`, load venue data, render all tabs
4. If missing/expired: show `#auth-screen`, wait for PIN submission

### Tab system

Five tabs: **Precios**, **Horarios**, **Menú del Día**, **Aviso**, **Carioca**.

Each tab button carries `data-tab="<name>"`. Each tab panel has `id="tab-<name>"`. On click, JS removes `.active` from all tabs and panels, adds `.active` to the selected pair, and toggles the `hidden` attribute.

---

## 2. Authentication Flow

```
Owner enters 6-digit PIN
        │
        ▼
POST /functions/pin-login
  body: { pin, remember }
  env:  PANEL_PIN, PANEL_SECRET
        │
        ├─ PIN mismatch → 401 (constant-time comparison)
        │
        └─ PIN correct →
             sign HMAC-SHA-256 token
             payload: { exp }
             token format: base64(payload).base64(signature)
             TTL: 4h (session) or 30d (remember device)
             return: { token }
        │
        ▼
app.js stores token in localStorage
panel becomes visible
        │
        ▼
All subsequent write requests:
  Authorization: Bearer <token>
        │
        ▼
Cloudflare Function (admin-save / upload-image)
  verifyPanelToken(token, PANEL_SECRET)
    → decode payload → check exp → verify HMAC signature
    → reject if expired or signature invalid
```

**No cookies. No OAuth for the owner.** The GitHub OAuth flow (`/auth`, `/callback`) is legacy Decap CMS scaffolding — not used by the panel.

**Env vars required:**

| Var | Used by |
|-----|---------|
| `PANEL_PIN` | `pin-login.js` — the PIN itself |
| `PANEL_SECRET` | `pin-login.js`, `admin-save.js`, `upload-image.js` — HMAC key |
| `GITHUB_TOKEN` | `admin-save.js`, `upload-image.js` — PAT with repo write |
| `GITHUB_CLIENT_ID` | `auth.js` — Decap CMS only, not panel |
| `GITHUB_CLIENT_SECRET` | `callback.js` — Decap CMS only, not panel |

---

## 3. Save Flow

```
Owner edits fields in panel → app.js maintains in-memory state object
        │
        ▼
Owner clicks "Guardar cambios" (#save-btn)
        │
        ▼
app.js assembles full venue.json payload from in-memory state
        │
        ▼
POST /functions/admin-save
  Authorization: Bearer <token>
  Content-Type: application/json
  body: full venue.json object
        │
        ▼
admin-save.js:
  1. Verify token
  2. GET current file SHA from GitHub Contents API
     GET /repos/miriamsaxetech-code/bar-leon-cms/contents/data/venue.json
  3. PUT updated content (base64) with SHA + commit message
     "chore(panel): update venue.json via admin panel"
        │
        ├─ 409 Conflict → SHA mismatch (concurrent edit) → surface error to user
        │
        └─ 200 → commit created on `main` branch
                  Cloudflare Pages auto-deploys (webhook)
                  Public site serves updated data within ~30s
```

**There is no staging layer.** Every save is a live commit to `main`.

---

## 4. Image Upload Flow (Carioca tab)

```
Owner selects image file
        │
        ▼
app.js client-side validation:
  - Reject HEIC/HEIF
  - Reject > 5 MB
  - Resize to max 1200px via <canvas> → JPEG 0.85 quality
        │
        ▼
POST /functions/upload-image
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
  fields: image (File), filename (unused — server generates name)
        │
        ▼
upload-image.js:
  - Verify token
  - Generate filename: carioca-{Date.now()}.jpg
  - PUT to GitHub Contents API
    path: assets/images/cariocas/{filename}
  - Return: { ok: true, path: "/assets/images/cariocas/{filename}" }
        │
        ▼
app.js stores returned path in in-memory state
Image is committed to repo immediately
Path is saved to venue.json on next "Guardar cambios"
```

---

## 5. Data Flow

```
data/venue.json (GitHub, branch: main)
        │
        ├──► Cloudflare Pages builds/deploys public site
        │    js/homepage.js reads it at runtime (fetch)
        │    js/carta.js reads it at runtime (fetch)
        │
        └──► panel/app.js fetches it at login time
             Owner edits → in-memory state
             Save → writes back to data/venue.json via GitHub API
```

`venue.json` is both the **database** and the **deployment trigger**. Every commit to `main` triggers a Cloudflare Pages deploy.

---

## 6. Cloudflare Functions

All functions live in `functions/` and are Cloudflare Pages Functions (Edge Workers).

| File | Route | Method | Purpose |
|------|-------|--------|---------|
| `pin-login.js` | `/functions/pin-login` | POST | Validate PIN, return signed token |
| `admin-save.js` | `/functions/admin-save` | POST | Commit venue.json to GitHub |
| `upload-image.js` | `/functions/upload-image` | POST | Upload image to GitHub, return path |
| `auth.js` | `/auth` | GET | Redirect to GitHub OAuth (Decap CMS — legacy) |
| `callback.js` | `/callback` | GET | Exchange OAuth code for token (Decap CMS — legacy) |

All write functions share the same `verifyPanelToken` pattern: split token at `.`, decode base64 payload, check `exp`, verify HMAC-SHA-256 signature against `PANEL_SECRET`.

---

## 7. JSON Source of Truth — `data/venue.json`

Schema identifier: `"_schema": "nexo-horeca-universal-venue-v1"`

Top-level keys and editability:

| Key | Panel editable | Description |
|-----|---------------|-------------|
| `venue` | No (except `notice`) | Venue identity, tagline, languages |
| `venue.notice` | Yes (Aviso tab) | Multilingual banner text |
| `contact` | No | Address, phone, WhatsApp |
| `social` | No | Instagram, Facebook, Google Maps links |
| `chalkboard` | Yes (Precios tab) | Blackboard dishes — `group1`, `group2` |
| `seo` | No | Title, description, keywords, OG image |
| `hero` | No | Hero image path and alt text |
| `hours` | Yes (Horarios tab) | Array of 7 day objects |
| `hours[].day` | Key (not editable) | `"monday"` … `"sunday"` |
| `hours[].status` | Yes | `"open"`, `"closed"`, `"partial"` |
| `hours[].periods` | Yes | Array of `{ open, close }` time strings |
| `menu_del_dia` | Yes (Menú tab) | Daily menu content and toggle |
| `menu_del_dia.active` | Yes | Show/hide daily menu on public site |
| `menu_del_dia.price` | Yes | Price string (e.g. `"13,50 €"`) |
| `menu_del_dia.starters` | Yes | Free-text starters |
| `menu_del_dia.seconds` | Yes | Free-text second courses |
| `menu_del_dia.mains` | Yes | Per-day mains object |
| `menu_del_dia.desserts` | Yes | Free-text desserts |
| `menu_del_dia.seasonal` | Yes | Optional seasonal note |
| `carioca` | Yes (Carioca tab) | Archive/gallery image entries |
| `carioca[].active` | Yes | Show/hide on homepage |
| `carioca[].context` | Yes | Placement: `"homepage"`, etc. |
| `carioca[].path` | Yes (set by upload) | Relative path to image |
| `carioca[].caption` | Yes | Multilingual caption |

**Price format in `chalkboard`:** Each dish has `media` and `racion` string fields (e.g. `"9,00"`). Wines have `price_bottle` and `price_glass`. Beverages have `price`. The panel edits these in-place.

---

## 8. Owner-Editable Features (Panel Tabs)

What the owner can change without touching code:

### Precios (Prices)
- Edit `media` and `racion` prices for chalkboard dishes (group1, group2)
- Edit wine bottle/glass prices
- Edit beverage prices
- Inline click-to-edit — no form submission per item

### Horarios (Opening Hours)
- Toggle each day open/closed
- Add or remove time periods per day
- Edit open/close times

### Menú del Día
- Toggle daily menu active/inactive
- Set price
- Edit starters, second courses, daily mains (per weekday), desserts, seasonal note

### Aviso (Notice Banner)
- Toggle banner visible/hidden on public site
- Edit text in Spanish, English, French
- Set expiry date (panel reads `aviso-expiry` but public site enforces it)

### Carioca (Photo Archive)
- Upload a new photo (JPEG, PNG — HEIC rejected, max 5 MB)
- Set caption in three languages
- Set context (placement on site)
- Toggle visibility
- Remove current photo

---

## 9. UI Safe Zones — What JS Requires

### Locked IDs (never rename in HTML)

These are queried by `getElementById` in `app.js`. Renaming silently breaks functionality.

**Auth:**
`auth-screen`, `panel`, `pin-form`, `pin-submit`, `pin-error`, `pin-remember-cb`

**Precios tab:**
`precios-list`, `search-precios`

**Horarios tab:**
`horarios-list`

**Menú tab:**
`menu-active`, `menu-price`, `menu-starters`, `menu-seconds`, `menu-desserts`, `menu-seasonal`, `menu-mains-list`

**Aviso tab:**
`aviso-active`, `aviso-texto-es`, `aviso-texto-en`, `aviso-texto-fr`, `aviso-expiry`

**Carioca tab:**
`carioca-file`, `carioca-remove`, `upload-area`, `carioca-preview-wrap`, `carioca-preview`, `carioca-caption-es`, `carioca-caption-en`, `carioca-caption-fr`, `carioca-context`, `carioca-upload-status`

**Global:**
`save-status`, `save-btn`, `logout-btn`, `error-toast`

**Dynamic ID patterns (generated by JS at runtime):**
`tab-{tabId}` (e.g. `tab-precios`), `hours-toggle-{index}`

---

### Locked Classes (never rename in HTML or CSS)

Classes referenced by `querySelector` / `querySelectorAll` or assigned by `createElement` in `app.js`.

**Auth:** `.pin-digit`

**Tab system:** `.panel-tab`, `.tab-panel`

**Precios (JS-created):** `.price-row`, `.price-row__name`, `.price-row__price`, `.price-input`, `.price-group-heading`

**Horarios (JS-created):** `.hours-card`, `.hours-card__header`, `.hours-card__day`, `.hours-periods`, `.hours-add-period`, `.period-row`, `.period-sep`, `.period-remove`, `.time-input`

**Menú (JS-created):** `.menu-main-row`, `.menu-main-day`, `.menu-main-input`, `.field-input`

**Toggle component (JS-created):** `.toggle-wrap`, `.toggle-input`, `.toggle-thumb`

**Upload:** `.upload-area--over`

**Global state:** `.active`, `.error-toast--visible`

**Button variants used in JS-created elements:** `.btn`, `.btn--ghost`, `.btn--small`

---

### Locked Data Attributes

| Attribute | Values | Used on |
|-----------|--------|---------|
| `data-tab` | `precios`, `horarios`, `menu`, `aviso`, `carioca` | `.panel-tab` buttons |
| `data-id` | item ID string | `.price-row`, `.price-row__price` button |
| `data-type` | `dish`, `wine`, `beverage` | `.price-row__price` button |
| `data-field` | `price`, `price_bottle`, `price_glass`, `racion`, `media` | `.price-row__price` button |
| `data-index` | `0`–`6` | `.hours-card` |
| `data-day` | `monday`–`sunday` | `.menu-main-input` |

---

### Safe Zones (purely visual — free to restyle or rename)

These elements have no JS queries, listeners, or property reads.

- `.auth-logo`, `.auth-title`, `.auth-subtitle`, `.auth-card`
- `.panel-header`, `.panel-header__title`, `.panel-header__right`
- `.panel-content` (wrapper only)
- `.field-label`, `.field-hint`, `.field-textarea`, `.field-select`
- `.panel-save-bar` (the bar container — its children are locked)
- `.tab-search` (container — child `#search-precios` is locked)
- `.aviso-panel`, `.carioca-panel`, `.menu-panel` (section wrappers)
- `.toggle-row`, `.toggle-row__label` (layout wrappers — inner `.toggle-input` is locked)
- All `<label>`, `<h2>`, `<p>` text content inside `.field-group`
- `panel.css` — all visual styling is safe to change as long as class names are not removed
- ARIA labels and role attributes — safe to improve

---

### State Conventions JS Depends On

| Pattern | Mechanism | Effect |
|---------|-----------|--------|
| Active tab | `.active` class + `hidden` attribute | Tab switching |
| Auth state | `hidden` attribute on `#auth-screen` / `#panel` | Login/logout |
| Drag hover | `.upload-area--over` class | Upload drag feedback |
| PIN error | `hidden` attribute on `#pin-error` | Error visibility |
| Preview | `hidden` attribute on `#carioca-preview-wrap` | Image preview show/hide |
| Toast | `.error-toast--visible` class | Error display |
| Save feedback | `.textContent` on `#save-status`, `#save-btn` | Button/status text |

---

## 10. Future Reusable Template Notes

The JSON schema is intentionally generic. The key `"_schema": "nexo-horeca-universal-venue-v1"` was designed for multi-venue reuse.

**What would change per venue:**
- `venue.slug` — used as identifier
- `contact`, `social`, `seo`, `hero` — venue-specific
- `chalkboard` groups — menu structure may differ
- `hours` — same structure, different values

**What stays identical:**
- All Cloudflare Functions (zero venue-specific logic — `OWNER`, `REPO`, `PATH` in `admin-save.js` and `upload-image.js` would need to be env vars)
- `panel/app.js` logic — all field IDs map directly to JSON keys
- Token system — fully portable

**To adapt for a new venue:**
1. Fork repo, update `OWNER`/`REPO` constants in `admin-save.js` and `upload-image.js` (or move to env vars)
2. Seed a new `data/venue.json` with the venue's data
3. Set `PANEL_PIN`, `PANEL_SECRET`, `GITHUB_TOKEN` in Cloudflare Pages env
4. Panel UI works without any changes

**Hardcoded repo references** (would need to be env vars for a true multi-tenant system):
- `admin-save.js` line 41–44: `OWNER`, `REPO`, `PATH`, `BRANCH`
- `upload-image.js` line 6–8: `OWNER`, `REPO`, `BRANCH`
