# HANDOFF TO CLAUDE — Phase 1 (Low-Cost Scaffolding)

> **ARCHIVED 2026-06-03** — This document describes a Next.js App Router prototype that was explored and discarded. None of this architecture is present in the current system. The current stack is a static vanilla HTML/CSS/JS site deployed on Cloudflare Pages. See `NEXO/context/stack.md` for the current architecture.

---

## Scope Completed

- Project confirmed in `05_BUILD/web` (existing Next.js app used as base).
- Multilingual content scaffolding added:
  - `src/content/es/ui.json`
  - `src/content/en/ui.json`
  - `src/content/fr/ui.json`
- Core pages available:
  - `app/page.js` (Home)
  - `app/carta/page.js` (Carta)
  - `app/bodega/page.js` (Bodega)
  - `app/legal/page.js` (Legal)
- i18n switcher added (Spanish default via cookie fallback).
- Data layer migrated to TypeScript schemas and typed loaders for the existing JSON files in `02_DATA`.

## Architecture (Current)

- **Framework**: Next.js App Router (`app/` directory).
- **Styling**: global CSS in `app/globals.css`.
- **Language handling**:
  - Supported locales in `src/i18n/config.ts`: `es`, `en`, `fr`.
  - Default locale: `es`.
  - Runtime locale source: cookie `barleon_lang`.
  - Server helpers in `src/i18n/server.ts`.
  - UI switcher component in `app/components/language-switcher.js`.
- **Data loading**:
  - Typed schemas and parsers in `src/data/schemas.ts`.
  - File-based JSON loaders in `src/data/loaders.ts`.
  - Source of truth remains external to web app:
    - `../../02_DATA/carta.es.json`
    - `../../02_DATA/vinos.es.json`
    - `../../02_DATA/bebidas.es.json`

## Data Schemas (TypeScript)

Defined in `src/data/schemas.ts`:

- `MenuCategory<TItem>`
  - `title: string`
  - `items: TItem[]`
  - `note?: string`

- `CartaItem`
  - `name: string`
  - `description?: string`
  - `price_media?: string`
  - `price_racion?: string`
  - `price_unidad?: string`
  - `sugerencia_barra?: string`

- `VinoItem`
  - `name: string`
  - `description?: string`
  - `price_copa?: string`
  - `price_botella?: string`
  - `price_unidad?: string`

- `BebidaItem`
  - `name: string`
  - `description?: string`
  - `price_unidad?: string`

- Root schemas:
  - `CartaSchema = { categorias: MenuCategory<CartaItem>[] }`
  - `VinosSchema = { categorias: MenuCategory<VinoItem>[] }`
  - `BebidasSchema = { categorias: MenuCategory<BebidaItem>[] }`

Parsers (`parseCartaSchema`, `parseVinosSchema`, `parseBebidasSchema`) normalize unsafe JSON into typed output without inventing menu data.

## Operational Notes

- `tsconfig.json` and `next-env.d.ts` were added so TypeScript files are first-class in this scaffold.
- Existing previous routes (`/bebidas`, `/menu-del-dia`, `/galeria`, `/contacto`) remain in the repo; Phase 1 focus is the four requested pages.
- No dependency reinstall was performed.

## Suggested Next Steps (for next phase)

- Consolidate duplicate routes (`/bebidas` vs `/bodega`) depending on IA decision.
- Move inline styles from pages to reusable CSS modules or design tokens.
- Add content files per page in each locale (`src/content/{lang}/pages/*.json`) and connect all labels/texts to i18n content.
- Add basic tests for loader parsing and locale resolution.
