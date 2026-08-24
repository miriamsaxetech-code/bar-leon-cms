import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

class ElementStub {
  constructor(id = '') {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.className = '';
    this.href = '';
    this.style = {};
    this.children = [];
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  }

  appendChild(child) { this.children.push(child); return child; }
  insertBefore(child) { this.children.unshift(child); return child; }
  setAttribute(name, value) { this[name] = value; }
  addEventListener() {}
  querySelectorAll() { return []; }
  querySelector() { return null; }
}

const venue = JSON.parse(await fs.readFile('data/venue.json', 'utf8'));
const homepageSource = await fs.readFile('js/homepage.js', 'utf8');
const cartaSource = await fs.readFile('js/carta.js', 'utf8');

function makeDocument(ids) {
  const elements = Object.fromEntries(ids.map(id => [id, new ElementStub(id)]));
  const body = new ElementStub('body');
  body.firstChild = null;
  return {
    elements,
    document: {
      body,
      createElement() { return new ElementStub(); },
      getElementById(id) { return elements[id] || new ElementStub(id); },
      querySelector() { return null; },
    },
  };
}

async function execute(source, pathname, ids) {
  const state = makeDocument(ids);
  const context = {
    console,
    document: state.document,
    localStorage: { getItem() { return null; } },
    location: { replace() {} },
    setTimeout(fn) { fn(); },
    window: { location: { pathname, hash: '' } },
    fetch: async () => ({ ok: true, json: async () => structuredClone(venue) }),
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return state;
}

const locales = [
  { lang: 'es', home: '/es/', menu: '/es/carta.html', menuLink: '/es/carta', menuTitle: 'Carta', primary: 'Ver la carta' },
  { lang: 'en', home: '/en/', menu: '/en/menu.html', menuLink: '/en/menu', menuTitle: 'Menu', primary: 'View full menu' },
  { lang: 'fr', home: '/fr/', menu: '/fr/carte.html', menuLink: '/fr/carte', menuTitle: 'Carte', primary: 'Consultez la carte' },
];

for (const locale of locales) {
  const home = await execute(homepageSource, locale.home, ['loader', 'homepage']);
  const homeHtml = home.elements.homepage.innerHTML;
  assert.match(homeHtml, new RegExp(`href="${locale.menuLink}"[^>]*home-cta-btn--primary[^>]*>${locale.primary}<`));
  assert.match(homeHtml, /href="tel:\+34958225143"/);
  assert.match(homeHtml, /https:\/\/maps\.app\.goo\.gl\//);
  assert.match(homeHtml, /bar-leon-hero-fajalauza\.webp/);

  const carta = await execute(cartaSource, locale.menu, ['loader', 'carta-header', 'carta-nav', 'carta-body']);
  assert.match(carta.elements['carta-nav'].innerHTML, new RegExp(`carta-header-title">${locale.menuTitle}<`));
  assert.match(carta.elements['carta-body'].innerHTML, /data-panel="restaurant"/);
  assert.match(carta.elements['carta-body'].innerHTML, /data-panel="bar"/);
  assert.match(carta.elements['carta-body'].innerHTML, /data-panel="beverages"/);
  assert.match(carta.elements['carta-body'].innerHTML, /id="hours"/);
  const actions = carta.document.body.children.find(child => child.className === 'mobile-service-cta');
  assert.ok(actions);
  assert.match(actions.innerHTML, /href="tel:\+34958225143"/);
  assert.match(actions.innerHTML, /href="#hours"/);
  assert.match(actions.innerHTML, /href="#top"/);
}

console.log('public closeout ES/EN/FR runtime contract OK');
