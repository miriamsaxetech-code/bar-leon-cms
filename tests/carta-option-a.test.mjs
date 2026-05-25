import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

class ElementStub {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.style = {};
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
  return child;
};

const venue = JSON.parse(await fs.readFile('data/venue.json', 'utf8'));
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

assert.match(html, /class="menu-switch"/);
assert.match(html, /data-panel="daily"/);
assert.match(html, /data-panel="restaurant"/);
assert.match(html, /data-panel="bar"/);
assert.match(html, /id="panel-daily"/);
assert.match(html, /id="panel-restaurant"/);
assert.match(html, /id="panel-bar"/);
assert.match(html, /Menú del Día/);
assert.match(html, /Carta Restaurante/);
assert.match(html, /Carta Barra/);
assert.match(html, /Viernes de Cuaresma: Potaje de vigilia/);
assert.match(html, /plato sin carne de la tradición de vigilia/);
assert.match(html, /Olla de San Antón/);
assert.match(html, /habas secas, habichuelas y cerdo de matanza/);
assert.match(html, /Carne de caza típica de zonas de sierra como Jaén/);
assert.ok(html.indexOf('Viernes:') < html.indexOf('Viernes en verano'));
assert.ok(html.indexOf('Viernes en verano') < html.indexOf('Viernes de Cuaresma'));
assert.ok(html.indexOf('Viernes de Cuaresma') < html.indexOf('Olla de San Antón'));
assert.ok(html.indexOf('Olla de San Antón') < html.indexOf('Postre'));
assert.match(html, /Sabores de Andalucía/);
assert.match(html, /carta-accent-images/);
assert.match(html, /bar-leon-plato-05\.webp/);
assert.match(html, /loading="lazy"/);
assert.match(html, /Vinos de Granada/);
assert.match(html, /Cervezas/);
assert.match(html, /pairing-chip/);
assert.match(html, /vino de altura|crianza de solera andaluza|salitre de Cádiz/);
assert.match(html, /D\.O\. Granada|D\.O\. Jerez|D\.O\. Manzanilla-Sanlúcar/);
assert.doesNotMatch(html, /vino granadino|local Granada|vin local de Grenade/);
assert.doesNotMatch(html, /Marida con|Pairs with|S'accorde avec/);
assert.doesNotMatch(html, /🍷/);

console.log('carta option A render OK');
