import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

class ClassListStub {
  add() {}
  remove() {}
  toggle() {}
  contains() { return false; }
}

class ElementStub {
  constructor(tag = 'div', id = '') {
    this.tag = tag;
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.href = '';
    this.className = '';
    this.target = '';
    this.rel = '';
    this.style = {};
    this.children = [];
    this.classList = new ClassListStub();
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  querySelectorAll() {
    return [];
  }
}

async function renderHomepageAt(dateIso, lang = 'es', options = {}) {
  const elements = {
    loader: new ElementStub('div', 'loader'),
    homepage: new ElementStub('main', 'homepage'),
  };

  const body = new ElementStub('body');
  body.firstChild = null;
  body.insertBefore = function insertBefore(child) {
    this.children.unshift(child);
    this.firstChild = child;
    return child;
  };

  const documentStub = {
    body,
    createElement(tag) {
      return new ElementStub(tag);
    },
    getElementById(id) {
      return elements[id] || new ElementStub('div', id);
    },
  };

  const venue = JSON.parse(await fs.readFile('data/venue.json', 'utf8'));
  if (!options.withArchive) venue.cariocas = [];
  const source = await fs.readFile('js/homepage.js', 'utf8');
  const fixedNow = new Date(dateIso);

  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [fixedNow.getTime()]));
    }

    static now() {
      return fixedNow.getTime();
    }
  }

  const context = {
    console,
    Date: FixedDate,
    document: documentStub,
    localStorage: { getItem() { return null; } },
    location: { replace() {} },
    setTimeout(fn) {
      fn();
    },
    window: {
      location: { pathname: `/${lang}/` },
    },
    fetch: async () => ({
      ok: true,
      json: async () => venue,
    }),
  };

  vm.createContext(context);
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));

  return { html: elements.homepage.innerHTML, body };
}

const lunch = await renderHomepageAt('2026-05-25T13:30:00+02:00');
assert.match(lunch.html, /home-daily-menu/);
assert.match(lunch.html, /Menú del Día/);
assert.match(lunch.html, /12,50&nbsp;€/);
assert.match(lunch.html, /Viernes en verano: Arroz a la cubana/);
assert.match(lunch.html, /Potaje de vigilia/);
assert.match(lunch.html, /plato sin carne de la tradición de vigilia/);
assert.match(lunch.html, /Olla de San Antón/);
assert.match(lunch.html, /habas secas, habichuelas y cerdo de matanza/);
assert.match(lunch.html, /home-andalusia/);
assert.match(lunch.html, /Sabores de Andalucía/);
assert.match(lunch.html, /site-location__place/);
assert.match(lunch.html, /site-location__since/);
assert.doesNotMatch(lunch.html, /class="call-number"/);
assert.match(lunch.html, /class="phone-link">\(\+34\) 958-22-51-43<\/a>/);
assert.doesNotMatch(lunch.html, />\+34 958 22 51 43<\/a>/);
assert.doesNotMatch(lunch.html, /hemeroteca/i);
assert.ok(lunch.body.children.some(el => el.className === 'mobile-service-cta' && el.href === 'tel:+34958225143'));

const afterHours = await renderHomepageAt('2026-05-25T18:30:00+02:00');
assert.ok(afterHours.body.children.some(el => el.className === 'mobile-service-cta' && el.href === 'https://wa.me/34696948630'));

const withArchive = await renderHomepageAt('2026-05-25T13:30:00+02:00', 'es', { withArchive: true });
assert.match(withArchive.html, /Stories of León/);
assert.match(withArchive.html, /header-leon\.webp/);
assert.match(withArchive.html, /tres generaciones sosteniendo una barra granadina/);

const english = await renderHomepageAt('2026-05-25T13:30:00+02:00', 'en');
assert.match(english.html, /site-location__since">Since 1959/);
assert.match(english.html, /class="call-label">Call<\/span>/);
assert.match(english.html, /Try local Granada red wine/);
assert.match(english.html, /beyond Rioja\/Ribera/);
assert.match(english.html, /D\.O\. Granada/);
assert.doesNotMatch(english.html, /Pairs with/);

const french = await renderHomepageAt('2026-05-25T13:30:00+02:00', 'fr');
assert.match(french.html, /site-location__since">Depuis 1959/);
assert.match(french.html, /class="call-label">Appeler<\/span>/);

console.log('homepage evolution render OK');
