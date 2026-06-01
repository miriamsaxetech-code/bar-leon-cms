# Architecture — Bar León CMS

**Audit date:** 2026-06-01

---

## Deployment topology

```
GitHub repo: miriamsaxetech-code/bar-leon-cms (branch: main)
  └── Cloudflare Pages (auto-deploy on push, no build command)
        ├── Static site — HTML + CSS + JS (vanilla, no framework)
        ├── /admin/     — Decap CMS 3.0.0 (pinned)
        ├── /panel/     — Custom admin panel (bespoke)
        └── /functions/ — Cloudflare Pages Functions (3 files)
```

No build step. No Node runtime in production. Cloudflare edge caching included on free tier.

---

## File structure (verified)

```
/
├── index.html              — Language router (navigator.language → /es/ /en/ /fr/)
├── _headers                — Cloudflare security headers (CSP, HSTS, X-Frame, etc.)
├── robots.txt              — noindex on /admin/
├── data/
│   └── venue.json          — Single source of truth (117KB, 16 top-level keys)
├── css/
│   └── style.css           — Unified design system (homepage + carta)
├── js/
│   ├── homepage.js         — ~740 LOC IIFE. Renders homepage from venue.json
│   └── carta.js            — ~1025 LOC IIFE. Renders carta, menú, vinos, horarios
├── es/ en/ fr/
│   ├── index.html          — Homepage shell (loads homepage.js)
│   └── carta.html / menu.html / carte.html — Carta shell (loads carta.js)
├── admin/
│   ├── index.html          — Decap CMS loader + inline preview renderer
│   └── config.yml          — CMS schema (~550 LOC)
├── panel/
│   ├── index.html          — Custom panel UI (4 tabs)
│   ├── app.js              — Panel logic (~847 LOC)
│   └── panel.css           — Panel styles
├── functions/
│   ├── auth.js             — GitHub OAuth redirect (→ GitHub login page)
│   ├── callback.js         — OAuth token exchange (dual flow: Decap popup + panel redirect)
│   └── admin-save.js       — POST: receive venue.json, commit via GitHub Contents API
├── assets/
│   ├── images/web/         — 6 food plate images (webp+png), barra, tomate aliñao (all present)
│   ├── images/cariocas/    — Panel-uploaded photos (7 files, timestamp-named)
│   ├── images/lion-logo.svg
│   ├── images/header-leon.* / hero-leon.*
│   ├── images/leon1-8.jpeg — Historical/reference photos
│   └── images/ref_01-13.webp
├── tests/
│   ├── admin-preview.test.mjs
│   ├── carta-option-a.test.mjs
│   └── homepage-evolution.test.mjs
├── NEXO/                   — Hospitality OS (agents, checklists, context, templates, delivery)
├── docs/                   — Planning, content governance, and audit docs
└── SECURITY.md             — Security posture and risk register
```

---

## Data model — venue.json

`data/venue.json` is the **sole runtime data source**. Both JS engines fetch it at page load. Both CMS systems write to it via the GitHub Contents API.

| Top-level key | Contents |
|---|---|
| `_schema` | `"nexo-horeca-universal-venue-v1"` — version pin |
| `venue` | Name, full_name, tagline, cuisine, cuisine_tag, notice, slug, founding_year, currency, primary_language, active_languages, service_mode |
| `contact` | address (structured: street, neighborhood, postal_code, city, region, country), phone, phone_link, whatsapp, email |
| `social` | instagram, facebook, tripadvisor, google_maps, google_reviews, x |
| `chalkboard` | group1[], group2[] — barra items with media/ración prices per language |
| `seo` | title, description, keywords (ES/EN/FR each), canonical, og_image |
| `hero` | image, alt (ES/EN/FR), focal_point |
| `hours` | Array[7]: day, status (open/partial/closed), periods[], note |
| `daily_menu` | active, price, days[], service_period, starters, seconds, mains[], desserts, includes, seasonal |
| `categories` | Array: id, name (ES/EN/FR), type (food/wine/drink), service (restaurant/bar), order |
| `dishes` | Array: id, available, status, name (ES/EN/FR), price, category_id, description (ES/EN/FR), pairing (ES/EN/FR), featured |
| `wines` | Array: id, available, category_id, name, producer, region, type, price_bottle, price_glass |
| `beverages` | Array: id, available, category_id, name (ES/EN/FR), price |
| `nav` | UI strings (ES/EN/FR): menu, hours, call, back, daily_menu, edict_header, edict_foot, whatsapp_btn, tab_daily/restaurant/bar |
| `cariocas` | Array: id, image path, caption (ES/EN/FR), context, active, added_at |
| `service_mode` | menu_del_dia, restaurant_open, bar_open (booleans) |

**Important:** This schema replaced 3 separate language files (`data/es.json`, `data/en.json`, `data/fr.json`). Any docs or agents that reference those file paths are stale.

---

## Authentication architecture

Two CMS systems share the same OAuth infrastructure:

```
Decap CMS (/admin/)
  → popup window → /functions/auth → github.com/login/oauth/authorize
  → /functions/callback → postMessage({ token }) → Decap opens

Custom Panel (/panel/)
  → full redirect → /functions/auth?state=return:/panel/
  → github.com/login/oauth/authorize
  → /functions/callback → redirect /panel/#token=xxx
  → panel picks up token from URL hash → stores in sessionStorage
```

Both paths require `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as Cloudflare Pages env vars.

The `admin-save.js` function uses a separate `GITHUB_TOKEN` (PAT with repo write access) to commit changes to the repo. It verifies the user's OAuth token against `api.github.com/user` before accepting any write.

---

## JS engine architecture

Both `homepage.js` and `carta.js` follow the same pattern:

1. Self-invoking IIFE — no global pollution
2. `getLang()` — reads language from URL path (`/es/`, `/en/`, `/fr/`)
3. `fetch('../data/venue.json')` — single data fetch on init
4. `render(d, lang)` — builds full HTML string from data
5. Injects into DOM (`#homepage` or `#carta-body`)
6. Runs progressive enhancement: accordions, menu switch tabs, album slider, IntersectionObserver reveals, mobile CTA injection

Key shared capabilities (duplicated between files — see `04-redundancies.md`):
- `parseDishPrice(str, lang)` — translates ES price annotation patterns to current language
- `isNowServiceTime(hours)` — real-time open/closed detection
- `wineTypeLabel()`, `wineCultureNote()`, `pairingChipText()` — wine UI helpers
- `langSelector()` / `injectLangBar()` — language switcher

---

## NEXO system structure

`NEXO/` contains the portable hospitality website OS extracted from this project:

```
NEXO/
├── OPERATING_SYSTEM.md     — 9-phase workflow (Intake → Maintenance)
├── README.md               — Context file index
├── future-roadmap.md       — Automation priorities and risks
├── reusability-audit.md    — Venue-specific vs. system reusable classification
├── agents/                 — 10 agent specs (builder, research, qa, webcopy, etc.)
├── checklists/             — 6 checklists (pre-launch, security, cms, mobile-qa, etc.)
├── context/                — 7 persistent context files for agents
├── templates/              — 9 template files (intake, brief, qa-report, etc.)
└── delivery/               — 5 owner-facing docs (guide, cms usage, backup, etc.)
```

NEXO is fully reusable for future venues. Bar León is the reference implementation.
