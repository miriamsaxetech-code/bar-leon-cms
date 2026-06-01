# Redundancies — Bar León CMS

**Audit date:** 2026-06-01

---

## Critical — creates operational confusion

### R1: Two parallel CMS systems writing to the same file

`/admin/` (Decap CMS) and `/panel/` (Custom Panel) both commit to `data/venue.json` via the GitHub Contents API. Each reads the current SHA before committing; if two sessions overlap, the second one will receive a `409 Conflict` from `admin-save.js`.

**This is intentional**, but the division of responsibilities is not documented anywhere. See `02-capabilities.md` for the intended split. The risk is that a developer opening Decap while the owner is in the Panel, or vice versa, will lose the second write.

**Decision needed:** Document the intended split (owner → `/panel/`, developer → `/admin/`) in `NEXO/context/bar-leon-canonical.md` or a dedicated operations doc. This is the single most important documentation gap in the project.

---

## Medium — creates incorrect mental models for agents

### R2: NEXO context files reference the old 3-file JSON structure

`NEXO/context/stack.md` and `NEXO/README.md` still describe `data/es.json`, `data/en.json`, `data/fr.json` as separate files. These were merged into `data/venue.json`. Any agent reading these files will look for files that don't exist.

**Affects:** Any agent using NEXO context before editing data, running QA, or building for a new venue.

### R3: `docs/HANDOFF_TO_CLAUDE.md` describes a discarded architecture

Describes a Next.js App Router setup with TypeScript schemas and file-based loaders. No part of this is present in the current system. Reading it produces a completely wrong mental model.

**Affect:** Any Claude session that reads the `docs/` folder without knowing which files to skip.

---

## Medium — maintenance risk (not a runtime problem)

### R4: `parseDishPrice()` duplicated in `js/homepage.js` and `js/carta.js`

The function that translates Spanish price annotation patterns (Media X / Ración Y, etc.) into the current language exists in both files. There is a minor variation: `homepage.js` normalizes `&nbsp;` before regex matching; `carta.js` does not.

**Risk:** A change to price format logic must be applied to both files. The `&nbsp;` variation is a latent bug — the same price string will parse differently on the homepage vs. the carta page.

### R5: `isNowServiceTime()` duplicated in both JS files

Identical logic in both files. If the hours data structure changes, both files must be updated.

### R6: `wineCultureNote()` diverged between the two JS files

`homepage.js` returns `"salitre de Cádiz"` for manzanilla/sanlúcar wines. `carta.js` returns `"salinidad de Sanlúcar"`. These are different strings for the same wine. The pairing chip text will be inconsistent depending on which page the user is on.

### R7: `wineTypeLabel()` and `pairingChipText()` duplicated in both JS files

Identical across both. No divergence currently, but same maintenance risk as R5.

---

## Low — surface clutter

### R8: `data.json` in project root

Noted in `NEXO/context/stack.md` as "duplicado legacy (no usado, no borrar aún)." File exists but is not referenced by any JS, HTML, or config. Safe to delete or move to `docs/archive/` at any convenient point.

### R9: Design exploration HTML files in root

`azulejo-preview.html` and `header-hybrid-preview.html` are design iteration artifacts. Not served by any route, not referenced in production HTML. Both are untracked (`git status` shows them as `??`). Safe to move to a scratch folder or `.gitignore`.

### R10: Image file at project root

`ChatGPT Image May 25, 2026, 10_50_53 PM.png` is a large binary (~3.4MB) sitting in the project root. Untracked. Should be moved to `assets/` or added to `.gitignore`.

---

## Summary table

| ID | Description | Severity | Action |
|---|---|---|---|
| R1 | Two CMS systems — undocumented division | Critical | Document the split (no code change) |
| R2 | NEXO context references old 3-file JSON | Medium | Update `context/stack.md` and `README.md` |
| R3 | `docs/HANDOFF_TO_CLAUDE.md` — discarded Next.js arch | Medium | Delete or archive |
| R4 | `parseDishPrice()` duplicated + `&nbsp;` divergence | Medium | Fix divergence now; consolidate later |
| R5 | `isNowServiceTime()` duplicated | Medium | Consolidate when touching JS files |
| R6 | `wineCultureNote()` diverged (different strings) | Medium | Align strings now |
| R7 | `wineTypeLabel()` + `pairingChipText()` duplicated | Low | Consolidate later |
| R8 | `data.json` legacy duplicate at root | Low | Delete when convenient |
| R9 | Preview HTML files at root (untracked) | Low | Archive or `.gitignore` |
| R10 | PNG image at root (untracked) | Low | Move to assets or `.gitignore` |
