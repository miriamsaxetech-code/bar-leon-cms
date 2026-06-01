import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile('panel/app.js', 'utf8');

const context = {
  console,
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  document: {
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll() { return []; },
  },
  window: {
    addEventListener() {},
  },
  fetch() {},
};

vm.createContext(context);
vm.runInContext(source, context);

const api = context.window.__panelTestApi;

assert.equal(api.slugifyPanelId('  Olla de San Antón  '), 'olla-de-san-anton');
assert.equal(api.slugifyPanelId('Café con leche'), 'cafe-con-leche');

const dish = api.createPanelItem('dishes', {
  name: 'Tapa Nueva',
  price: '6,50',
  category_id: 'tapas',
}, new Set(['tapa-nueva']));
assert.equal(dish.id, 'tapa-nueva-2');
assert.equal(JSON.stringify(dish.name), JSON.stringify({ es: 'Tapa Nueva', en: '', fr: '' }));
assert.equal(dish.price, '6,50');
assert.equal(dish.category_id, 'tapas');
assert.equal(dish.available, true);
assert.equal(JSON.stringify(dish.allergens), JSON.stringify([]));

const wine = api.createPanelItem('wines', {
  name: 'Vino Nuevo',
  price_glass: '3,50',
  price_bottle: '18,00',
}, new Set());
assert.equal(wine.id, 'vino-nuevo');
assert.equal(wine.price_glass, 3.5);
assert.equal(wine.price_bottle, 18);

const state = { dishes: [], wines: [wine], beverages: [] };
api.addPanelItem(state, 'dishes', dish);
assert.equal(state.dishes.length, 1);
assert.equal(state.dishes[0].id, 'tapa-nueva-2');

api.setPanelItemAvailable(state, 'dishes', 'tapa-nueva-2', false);
assert.equal(state.dishes[0].available, false);

api.setPanelItemAllergen(state, 'dishes', 'tapa-nueva-2', 'gluten', true);
api.setPanelItemAllergen(state, 'dishes', 'tapa-nueva-2', 'milk', true);
assert.equal(JSON.stringify(state.dishes[0].allergens), JSON.stringify(['gluten', 'milk']));

api.setPanelItemAllergen(state, 'dishes', 'tapa-nueva-2', 'gluten', false);
assert.equal(JSON.stringify(state.dishes[0].allergens), JSON.stringify(['milk']));

api.deletePanelItem(state, 'dishes', 'tapa-nueva-2');
assert.equal(state.dishes.length, 0);

assert.equal(
  JSON.stringify(api.splitPanelListText(`Gazpacho · Salmorejo
Ensalada`)),
  JSON.stringify(['Gazpacho', 'Salmorejo', 'Ensalada'])
);
assert.equal(api.joinPanelListItems(['Gazpacho', '', ' Salmorejo ']), 'Gazpacho · Salmorejo');

console.log('panel CRUD helpers OK');
