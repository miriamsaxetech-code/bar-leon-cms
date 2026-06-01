# Documentation State — Bar León CMS

**Audit date:** 2026-06-01

---

## Authoritative — current and operative

These files are accurate and should be read before any implementation work.

| File | Purpose | Read before |
|---|---|---|
| `NEXO/context/bar-leon-canonical.md` | Design system, tone, palette, UX principles. Source of truth for identity decisions. | Any UI change |
| `NEXO/context/legacy-decisions.md` | Architecture choices that survived multiple iterations with the reasoning behind each. | Any stack or structural change |
| `docs/MASTER_FOOD_SYSTEM.md` | Complete gastronomic governance: data model, operational rules, translation philosophy, CMS strategy. Most authoritative content doc. Updated 2026-05-25. | Any content or schema change |
| `docs/MERGE_PLAN.md` | 4-phase plan to consolidate 3 competing prototypes into this repo. Tracks what has been done and what is pending. Updated 2026-05-25. | Any new feature work |
| `docs/MASTER_BAR_LEON_SOURCE_OF_TRUTH.md` | Cross-repo content audit: full menu, wines, hours, brand, and documented contradictions. Updated 2026-03-03. | Any content population task |
| `SECURITY.md` | Security posture, active headers, backup procedure, risk register. | Any deploy or infrastructure change |
| `NEXO/OPERATING_SYSTEM.md` | 9-phase hospitality OS (Intake through Maintenance). Phase map for all project work. | Any new venue project |
| `NEXO/future-roadmap.md` | Automation priorities, bottlenecks, scale risks. | Any automation or tooling decision |
| `NEXO/reusability-audit.md` | Classification of venue-specific vs. NEXO-system code. | Before extracting system for next venue |
| `docs/PROJECT_RULES.md` | 5 operative rules (Albayzín spelling, Llamar button, no invented data, no duplication, kebab-case images). | Always |

---

## Stale — contains inaccurate information

These files have not been updated since the data model migration from 3 JSON files to `venue.json`. Reading them without this context will cause errors.

### `NEXO/context/stack.md`

**Problem:** File structure diagram shows `data/es.json`, `data/en.json`, `data/fr.json` as separate files. These were merged into `data/venue.json`. The architecture section also lists Decap CMS fields that correspond to the old schema.

**Fix needed:** Update the file structure diagram and the "Archivos editables" list to reflect `data/venue.json`.

### `NEXO/README.md`

**Problem:** Contains a "Corrección urgente pendiente" note: `data/es.json → contact.address says 'Albaicín'`. That file no longer exists.

**Fix needed:** Remove the correction note or replace with current known data issues.

### `docs/HANDOFF_TO_CLAUDE.md`

**Problem:** Describes a discarded Next.js App Router architecture with TypeScript schemas (`src/data/schemas.ts`), file-based loaders (`src/data/loaders.ts`), and cookie-based i18n. None of this exists in the current system. This is the most dangerous stale doc — any agent reading it will work from a completely wrong mental model.

**Fix needed:** Delete or move to `docs/archive/`. The architectural decisions from this era are already captured in `NEXO/context/legacy-decisions.md`.

---

## Historical — valid as archive, not as operational reference

These files contain accurate historical information but reference external repositories or absolute paths that don't exist on all machines.

| File | Issue |
|---|---|
| `docs/BAR_LEON_MASTER_HANDOFF.md` | References files at `/Users/kokonvt/Projects/Restaurante-Leon/`, `/Users/kokonvt/Projects/Restaurante-Leónv2/` etc. Useful for understanding content provenance; not executable as instructions. |
| `docs/deep-research-leon.md` | Historical research. Accurate but precedes current build. |
| `docs/deep-research-hemeroteca-leon.md` | Press research. Accurate but precedes current build. |

---

## Not individually audited

The following files exist but were not read in this audit. They should be reviewed before the next major work session.

| File | Location | Likely status |
|---|---|---|
| `docs/consolidation_plan.md` | `docs/` | Possibly superseded by MERGE_PLAN.md |
| `docs/copy-leon-optimized.md` | `docs/` | May contain current web copy |
| `NEXO/context/canonical-components.md` | `NEXO/context/` | Likely current |
| `NEXO/context/cleanup-plan.md` | `NEXO/context/` | May reference resolved or pending tasks |
| `NEXO/context/legacy-audit.md` | `NEXO/context/` | Context for agents |
| `NEXO/context/project-timeline.md` | `NEXO/context/` | Timeline — may be stale |

---

## NEXO agents, checklists, templates, delivery

Not individually audited. Assumed to follow `NEXO/OPERATING_SYSTEM.md` phases and to be generally current.

**10 agent specs** in `NEXO/agents/`:
builder, imageprompter, launch-manager, legacy-extractor, menu-extractor, qa, quickfix, research, security, webcopy

**6 checklists** in `NEXO/checklists/`:
cms, mobile-qa, owner-handoff, pre-build, pre-launch, security

**9 templates** in `NEXO/templates/`:
client-brief, deployment-report, launch-checklist, maintenance-notes, menu-extraction, multilingual-content, owner-handoff, qa-report, venue-intake

**5 delivery docs** in `NEXO/delivery/`:
backup-procedure, cms-usage-guide, domain-transfer, emergency-rollback, owner-guide, update-workflow

---

## Tests

Three test files in `tests/`. No CI configuration found (no `.github/workflows/` directory).

| File | What it tests | Notes |
|---|---|---|
| `tests/admin-preview.test.mjs` | Decap CMS preview renderer (inline script in `admin/index.html`) | Fragile — tightly coupled to admin HTML structure; reads `data/venue.json` live |
| `tests/carta-option-a.test.mjs` | Not individually read | Likely tests carta rendering |
| `tests/homepage-evolution.test.mjs` | Not individually read | Likely tests homepage rendering |

Tests use Node's built-in `node:assert`, `node:fs/promises`, and `node:vm`. No test runner dependency required — run with `node tests/*.mjs`.
