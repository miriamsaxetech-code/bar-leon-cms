import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

class ElementStub {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.style = {};
    this.children = [];
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  }

  querySelectorAll() {
    return [];
  }

  querySelector() {
    return null;
  }

  addEventListener() {}

  setAttribute(name, value) {
    this[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
}

const elements = {
  loader: new ElementStub('loader'),
  'carta-header': new ElementStub('carta-header'),
  'carta-nav': new ElementStub('carta-nav'),
  'carta-body': new ElementStub('carta-body'),
};

const documentStub = {
  body: new ElementStub('body'),
  createElement() {
    return new ElementStub();
  },
  getElementById(id) {
    return elements[id] || new ElementStub(id);
  },
};

documentStub.body.firstChild = null;
documentStub.body.insertBefore = function insertBefore(child) {
  this.firstChild = child;
  return child;
};
documentStub.body.appendChild = function appendChild(child) {
  this.children.push(child);
  return child;
};

const venue = JSON.parse(await fs.readFile('data/venue.json', 'utf8'));
const contractCategory = venue.categories.find(category =>
  category.type === 'food' && category.id !== 'andalusian-specialities'
);
const contractTemplate = venue.dishes.find(dish => dish.category_id === contractCategory.id);

venue.dishes.forEach(dish => {
  dish.allergens = [];
  dish.allergens_confirmed = [];
  dish.allergen_status = 'pending';
});

venue.dishes.push(
  {
    ...structuredClone(contractTemplate),
    id: 'contract-pending-visible',
    category_id: contractCategory.id,
    name: { es: 'CONTRATO PENDING VISIBLE', en: 'PENDING CONTRACT VISIBLE', fr: 'CONTRAT PENDING VISIBLE' },
    available: true,
    price_status: 'pending',
    allergens: [],
    allergens_confirmed: [],
    allergen_status: 'pending',
  },
  {
    ...structuredClone(contractTemplate),
    id: 'contract-uncertain-hidden',
    category_id: contractCategory.id,
    name: { es: 'CONTRATO UNCERTAIN OCULTO', en: 'UNCERTAIN CONTRACT HIDDEN', fr: 'CONTRAT UNCERTAIN MASQUÉ' },
    available: true,
    price_status: 'uncertain',
    allergens: [],
    allergens_confirmed: [],
    allergen_status: 'pending',
  },
  {
    ...structuredClone(contractTemplate),
    id: 'contract-disabled-hidden',
    category_id: contractCategory.id,
    name: { es: 'CONTRATO DESACTIVADO OCULTO', en: 'DISABLED CONTRACT HIDDEN', fr: 'CONTRAT DÉSACTIVÉ MASQUÉ' },
    available: false,
    price_status: 'confirmed',
    allergens: [],
    allergens_confirmed: [],
    allergen_status: 'pending',
  },
  {
    ...structuredClone(contractTemplate),
    id: 'contract-allergens-unconfirmed',
    category_id: contractCategory.id,
    name: { es: 'ALÉRGENOS SIN CONFIRMAR', en: 'UNCONFIRMED ALLERGENS', fr: 'ALLERGÈNES NON CONFIRMÉS' },
    available: true,
    price_status: 'confirmed',
    allergens: ['gluten', 'eggs'],
    allergens_confirmed: [],
    allergen_status: 'pending',
  },
  {
    ...structuredClone(contractTemplate),
    id: 'contract-allergens-confirmed',
    category_id: contractCategory.id,
    name: { es: 'ALÉRGENOS CONFIRMADOS', en: 'CONFIRMED ALLERGENS', fr: 'ALLERGÈNES CONFIRMÉS' },
    available: true,
    price_status: 'confirmed',
    allergens: ['gluten', 'eggs'],
    allergens_confirmed: ['gluten'],
    allergen_status: 'confirmed',
  },
);
const source = await fs.readFile('js/carta.js', 'utf8');

const context = {
  console,
  document: documentStub,
  setTimeout(fn) {
    fn();
  },
  window: {
    location: { pathname: '/es/carta.html', hash: '' },
  },
  fetch: async () => ({
    ok: true,
    json: async () => venue,
  }),
};

vm.createContext(context);
vm.runInContext(source, context);
await new Promise(resolve => setImmediate(resolve));

const html = elements['carta-body'].innerHTML;

assert.match(html, /class="menu-switch/);
assert.match(html, /class="carta-section-nav/);
assert.match(html, /class="menu-switch-btn is-active"[^>]*data-panel="restaurant"/);
assert.match(html, /id="panel-restaurant" class="menu-panel is-active"/);
assert.match(html, /id="panel-bar" class="menu-panel"[^>]*hidden/);
assert.match(html, /data-panel="daily"/);
assert.match(html, /data-panel="restaurant"/);
assert.match(html, /data-panel="bar"/);
assert.match(html, /id="panel-daily"/);
assert.match(html, /id="panel-restaurant"/);
assert.match(html, /id="panel-bar"/);
assert.match(html, /Menú del Día/);
assert.match(html, /Restaurante/);
assert.match(html, /Barra y raciones/);
assert.match(html, /Bebidas y vinos/);
assert.match(html, /Viernes de Cuaresma: Potaje de vigilia/);
assert.match(html, /plato sin carne de la tradición de vigilia/);
assert.match(html, /Olla de San Antón/);
assert.match(html, /habas secas, habichuelas y cerdo de matanza/);
assert.match(html, /Carne de caza típica de la sierra/);
assert.ok(html.indexOf('Viernes:') < html.indexOf('Viernes en verano'));
assert.ok(html.indexOf('Viernes en verano') < html.indexOf('Viernes de Cuaresma'));
assert.ok(html.indexOf('Viernes de Cuaresma') < html.indexOf('Olla de San Antón'));
assert.ok(html.indexOf('Olla de San Antón') < html.indexOf('Postre', html.indexOf('Olla de San Antón')));
assert.match(html, /Sabores de Andalucía/);
assert.match(html, /class="menu-category/);
assert.doesNotMatch(html, /carta-accent-images|bar-leon-plato-|chalkboard-menu|pairing-chip|accordion-item/);
assert.match(html, /Vinos de Granada/);
assert.match(html, /Cervezas/);
assert.match(html, /allergen-list/);
assert.match(html, /GLU/);
assert.doesNotMatch(html, /HUE/);
assert.equal((html.match(/allergen-list/g) || []).length, 2, 'one wrapper and one label for the sole confirmed allergen list');
assert.match(html, /CONTRATO PENDING VISIBLE/, 'pending items remain public');
assert.doesNotMatch(html, /CONTRATO UNCERTAIN OCULTO/, 'uncertain items remain hidden');
assert.doesNotMatch(html, /CONTRATO DESACTIVADO OCULTO/, 'disabled items remain hidden');
assert.match(html, /ALÉRGENOS SIN CONFIRMAR/, 'the item remains visible while its unconfirmed allergens stay hidden');
assert.match(html, /ALÉRGENOS CONFIRMADOS[\s\S]*?GLU/, 'only explicitly confirmed allergen ids render');
assert.match(html, /class="category-note"[^>]*>Por encargo · Mínimo 2 raciones/, 'the rice category note renders once at category level');
assert.equal(
  (html.match(/Por encargo/g) || []).length,
  1,
  'the "por encargo" notice is not repeated inside each paella item description'
);
assert.match(html, /D\.O\. Granada|D\.O\. Jerez|D\.O\. Manzanilla-Sanlúcar/);
assert.doesNotMatch(html, /vino granadino|local Granada|vin local de Grenade/);
assert.doesNotMatch(html, /Marida con|Pairs with|S'accorde avec/);
assert.doesNotMatch(html, /🍷/);
assert.match(elements['carta-nav'].innerHTML, /carta-header-title/);
const mobileActions = documentStub.body.children.find(child => child.className === 'mobile-service-cta');
assert.ok(mobileActions, 'mobile service actions are injected');
assert.match(mobileActions.innerHTML, /tel:\+34958225143/);
assert.match(mobileActions.innerHTML, /href="#hours"/);
assert.match(mobileActions.innerHTML, /href="#top"/);

console.log('carta option A render OK');
