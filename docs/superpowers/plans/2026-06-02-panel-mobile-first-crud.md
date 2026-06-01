# Panel Mobile-First CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a centered, mobile-first owner panel with add, edit, delete, and activation controls for all editable site sections.

**Architecture:** Keep the existing no-build panel architecture. Add small pure helper functions to `panel/app.js` so CRUD behavior can be tested in Node, then wire those helpers into the current DOM renderers. Improve `panel/panel.css` around the existing class names instead of replacing the shell.

**Tech Stack:** Static HTML/CSS/JavaScript, Node `assert` tests, Cloudflare Pages Functions unchanged.

---

### Task 1: Repair Baseline Carta Test

**Files:**
- Modify: `js/carta.js`
- Verify: `tests/carta-option-a.test.mjs`

- [ ] Guard `document.head.appendChild(el)` the same way homepage JSON-LD already does.
- [ ] Run `node tests/carta-option-a.test.mjs`.
- [ ] Run all existing tests.
- [ ] Commit `test: restore carta render baseline`.

### Task 2: Add Tested Panel Data Helpers

**Files:**
- Modify: `panel/app.js`
- Create: `tests/panel-crud-helpers.test.mjs`

- [ ] Write tests for `slugifyPanelId`, `createPanelItem`, `addPanelItem`, `deletePanelItem`, `setPanelItemAvailable`, `splitPanelListText`, and `joinPanelListItems`.
- [ ] Run the new test and verify it fails because helpers are not exported.
- [ ] Add pure helper functions to `panel/app.js` and expose them on `window.__panelTestApi`.
- [ ] Run the new test and verify it passes.
- [ ] Run owner panel tests.
- [ ] Commit `feat(panel): add CRUD data helpers`.

### Task 3: Convert Prices Tab Into Catalog CRUD

**Files:**
- Modify: `panel/app.js`
- Modify: `panel/panel.css`
- Verify: `tests/panel-crud-helpers.test.mjs`

- [ ] Update `renderPrecios` to render grouped catalog sections for dishes, wines, and beverages.
- [ ] Add `+ Añadir` per group.
- [ ] Add inline name and price inputs per row.
- [ ] Add availability toggle per row.
- [ ] Add delete button per row with confirmation.
- [ ] Update CSS for centered catalog cards.
- [ ] Run helper tests and owner panel tests.
- [ ] Commit `feat(panel): add catalog item CRUD`.

### Task 4: Convert Daily Menu Fields Into Editable Lists

**Files:**
- Modify: `panel/index.html`
- Modify: `panel/app.js`
- Modify: `panel/panel.css`
- Verify: `tests/panel-crud-helpers.test.mjs`

- [ ] Replace daily menu textareas for starters, seconds, desserts, and notes with list containers.
- [ ] Render each list from the current Spanish text split on separators.
- [ ] Add item and delete item controls.
- [ ] Serialize lists back into current `daily_menu.*.es` strings with ` · ` separators.
- [ ] Preserve existing daily main per-day inputs.
- [ ] Run helper tests and owner panel tests.
- [ ] Commit `feat(panel): add daily menu list editing`.

### Task 5: Add Existing Photo Management

**Files:**
- Modify: `panel/index.html`
- Modify: `panel/app.js`
- Modify: `panel/panel.css`

- [ ] Add an existing photo list container to the Carioca tab.
- [ ] Render `state.cariocas` with preview, context, active checkbox, and delete button.
- [ ] Deleting removes the JSON entry only.
- [ ] Active toggle mutates `state.cariocas[index].active`.
- [ ] Run owner panel tests.
- [ ] Commit `feat(panel): manage existing photos`.

### Task 6: Mobile-First Centering And Polish

**Files:**
- Modify: `panel/panel.css`
- Verify manually with local server

- [ ] Center the panel shell, header, tabs, content, and save bar to a shared max width.
- [ ] Improve compact row/card spacing for narrow mobile screens.
- [ ] Keep touch targets at least 40px.
- [ ] Start `python3 -m http.server 4173` and verify `/panel/` loads.
- [ ] Run all tests and record the result.
- [ ] Commit `style(panel): center mobile editor`.
