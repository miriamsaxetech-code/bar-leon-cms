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
}

const elements = {
  loader: new ElementStub('loader'),
  'carta-header': new ElementStub('carta-header'),
  'carta-nav': new ElementStub('carta-nav'),
  'carta-body': new ElementStub('carta-body'),
};

const documentStub = {
  getElementById(id) {
    return elements[id] || new ElementStub(id);
  },
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
assert.match(html, /Sabores de Andalucía/);
assert.match(html, /Vinos de Granada/);
assert.match(html, /Cervezas/);

console.log('carta option A render OK');
