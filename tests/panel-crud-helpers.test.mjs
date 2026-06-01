import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// Minimal DOM stub — helpers are pure and need no real DOM
const documentStub = {
  getElementById() { return null; },
  createElement() { return { style: {}, classList: { add() {}, remove() {} }, addEventListener() {} }; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  body: { appendChild() {}, insertBefore() {}, firstChild: null },
};

const source = await fs.readFile('panel/app.js', 'utf8');

const context = {
  console,
  document: documentStub,
  window: {},
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  fetch: async () => ({ ok: false }),
  setTimeout() {},
  clearTimeout() {},
};

vm.createContext(context);
vm.runInContext(source, context);

const api = context.window.__panelTestApi;
assert.ok(api, '__panelTestApi not exposed on window');

const {
  slugifyPanelId,
  createPanelItem,
  addPanelItem,
  deletePanelItem,
  setPanelItemAvailable,
  splitPanelListText,
  joinPanelListItems,
} = api;

// ── slugifyPanelId ────────────────────────────────────────────────────────────

{
  const slug = slugifyPanelId('Tortilla del Sacromonte');
  assert.match(slug, /^[a-z0-9-]+$/, 'slug must be lowercase kebab');
  assert.ok(slug.startsWith('tortilla'), 'slug starts with normalized name');
}

{
  // Two calls with same name produce different slugs (timestamp suffix)
  const a = slugifyPanelId('Callos');
  const b = slugifyPanelId('Callos');
  // They MAY collide in same ms, but must at minimum be valid slugs
  assert.match(a, /^[a-z0-9-]+$/);
  assert.match(b, /^[a-z0-9-]+$/);
}

{
  // Slug must not collide with an existing id list
  const existing = [{ id: 'callos' }, { id: 'callos-1' }];
  const slug = slugifyPanelId('Callos', existing);
  assert.notEqual(slug, 'callos');
  assert.notEqual(slug, 'callos-1');
}

// ── createPanelItem ───────────────────────────────────────────────────────────

{
  const item = createPanelItem('dish', 'Berenjenas fritas', 'frituras');
  assert.equal(typeof item.id, 'string', 'item must have an id');
  assert.ok(item.id.length > 0, 'id must not be empty');
  assert.equal(item.name.es, 'Berenjenas fritas');
  assert.equal(item.name.en, '');
  assert.equal(item.name.fr, '');
  assert.equal(item.category_id, 'frituras');
  assert.equal(item.available, true);
  assert.equal(typeof item.price, 'string');
}

{
  const wine = createPanelItem('wine', 'Vino nuevo', 'granada-wines');
  assert.equal(wine.name.es, 'Vino nuevo');
  assert.equal(wine.name.en, '');
  assert.equal(wine.name.fr, '');
  assert.equal(wine.category_id, 'granada-wines');
  assert.equal(wine.available, true);
}

{
  const bev = createPanelItem('beverage', 'Agua tónica', 'soft-drinks');
  assert.equal(bev.name.es, 'Agua tónica');
  assert.equal(bev.available, true);
}

// ── addPanelItem ──────────────────────────────────────────────────────────────

{
  const state = { dishes: [{ id: 'existing', name: { es: 'Uno' } }], wines: [], beverages: [] };
  const newDish = createPanelItem('dish', 'Dos', 'sopas');
  addPanelItem(state, 'dish', newDish);
  assert.equal(state.dishes.length, 2);
  assert.equal(state.dishes[1].name.es, 'Dos');
}

{
  const state = { dishes: [], wines: [{ id: 'w1', name: { es: 'Vino viejo' } }], beverages: [] };
  const newWine = createPanelItem('wine', 'Vino fresco', 'rioja');
  addPanelItem(state, 'wine', newWine);
  assert.equal(state.wines.length, 2);
  assert.equal(state.wines[1].name.es, 'Vino fresco');
}

{
  const state = { dishes: [], wines: [], beverages: [] };
  const bev = createPanelItem('beverage', 'Tónica', 'soft-drinks');
  addPanelItem(state, 'beverage', bev);
  assert.equal(state.beverages.length, 1);
}

// ── deletePanelItem ───────────────────────────────────────────────────────────

{
  const state = {
    dishes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    wines: [],
    beverages: [],
  };
  deletePanelItem(state, 'dish', 'b');
  assert.equal(state.dishes.length, 2);
  assert.ok(!state.dishes.find(d => d.id === 'b'), 'deleted item must be gone');
  assert.ok(state.dishes.find(d => d.id === 'a'), 'other items remain');
  assert.ok(state.dishes.find(d => d.id === 'c'), 'other items remain');
}

{
  const state = { dishes: [], wines: [{ id: 'w1' }, { id: 'w2' }], beverages: [] };
  deletePanelItem(state, 'wine', 'w1');
  assert.equal(state.wines.length, 1);
  assert.equal(state.wines[0].id, 'w2');
}

{
  // Deleting a non-existent id is a no-op
  const state = { dishes: [{ id: 'x' }], wines: [], beverages: [] };
  deletePanelItem(state, 'dish', 'does-not-exist');
  assert.equal(state.dishes.length, 1);
}

// ── setPanelItemAvailable ─────────────────────────────────────────────────────

{
  const state = { dishes: [{ id: 'd1', available: true }], wines: [], beverages: [] };
  setPanelItemAvailable(state, 'dish', 'd1', false);
  assert.equal(state.dishes[0].available, false);
  setPanelItemAvailable(state, 'dish', 'd1', true);
  assert.equal(state.dishes[0].available, true);
}

{
  const state = { dishes: [], wines: [{ id: 'w1', available: true }], beverages: [] };
  setPanelItemAvailable(state, 'wine', 'w1', false);
  assert.equal(state.wines[0].available, false);
}

{
  const state = { dishes: [], wines: [], beverages: [{ id: 'b1', available: false }] };
  setPanelItemAvailable(state, 'beverage', 'b1', true);
  assert.equal(state.beverages[0].available, true);
}

// ── splitPanelListText ────────────────────────────────────────────────────────

{
  const items = splitPanelListText('Gazpacho · Salmorejo · Ajoblanco');
  assert.equal(items.length, 3);
  assert.equal(items[0], 'Gazpacho');
  assert.equal(items[1], 'Salmorejo');
  assert.equal(items[2], 'Ajoblanco');
}

{
  assert.equal(splitPanelListText('').length, 0);
  assert.equal(splitPanelListText(null).length, 0);
  assert.equal(splitPanelListText(undefined).length, 0);
}

{
  // Single item — no separator
  const items = splitPanelListText('Gazpacho');
  assert.equal(items.length, 1);
  assert.equal(items[0], 'Gazpacho');
}

// ── joinPanelListItems ────────────────────────────────────────────────────────

{
  const text = joinPanelListItems(['Gazpacho', 'Salmorejo', 'Ajoblanco']);
  assert.equal(text, 'Gazpacho · Salmorejo · Ajoblanco');
}

{
  assert.equal(joinPanelListItems([]), '');
  assert.equal(joinPanelListItems(['Solo']), 'Solo');
}

{
  // Round-trip: split → join should be lossless for valid input
  const original = 'Primero · Segundo · Postre';
  assert.equal(joinPanelListItems(splitPanelListText(original)), original);
}

console.log('panel CRUD helpers OK');
