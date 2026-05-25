# Carta Option A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Option A selector for `Menú del día / Restaurante / Barra`.

**Architecture:** Keep the static vanilla JS setup. `data/venue.json` marks category ownership, `js/carta.js` renders three top-level sections, and `css/style.css` styles the selector and panels.

**Tech Stack:** HTML, CSS, vanilla JavaScript, JSON, Node smoke test.

---

### Task 1: Render Option A Structure

**Files:**
- Create: `tests/carta-option-a.test.mjs`
- Modify: `data/venue.json`
- Modify: `js/carta.js`
- Modify: `css/style.css`

- [ ] Add a failing Node smoke test that renders `js/carta.js` with stubbed DOM/fetch and asserts the carta includes `.menu-switch`, three buttons, three panels, restaurant categories, and bar categories.
- [ ] Add `service: "restaurant"` to food categories and `service: "bar"` to wine/drink categories in `data/venue.json`.
- [ ] Refactor `js/carta.js` so `renderMenuDia`, `renderCarta`, and `renderWines` are wrapped by top-level panels.
- [ ] Add click and keyboard behavior for `.menu-switch` buttons.
- [ ] Style `.menu-switch`, `.menu-panel`, and section intro/photo elements in `css/style.css`.
- [ ] Run the smoke test and syntax checks.
