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
    this._innerHTML = '';
    this.textContent = '';
    this.href = '';
    this.className = '';
    this.target = '';
    this.rel = '';
    this.style = {};
    this.children = [];
    this.classList = new ClassListStub();
  }

  set innerHTML(val) {
    this._innerHTML = val;
    // Simple regex to extract href attributes and simulate child elements
    const matches = val.matchAll(/href="([^"]+)"/g);
    for (const match of matches) {
      const child = new ElementStub('a');
      child.href = match[1];
      this.children.push(child);
    }
  }

  get innerHTML() {
    return this._innerHTML;
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
    querySelector() { return null; },
  };

  const venue = JSON.parse(await fs.readFile('data/venue.json', 'utf8'));
  if (!options.withArchive) venue.cariocas = [];
  if (options.homepageCarioca && venue.cariocas[0]) {
    venue.cariocas[0].context = 'homepage';
  }
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
assert.match(lunch.html, /home-hero__lion/);
assert.doesNotMatch(lunch.html, /home-hero__azulejo|azulejo-leon\.(?:webp|png)/);
assert.match(lunch.html, /home-cta-nav/);
assert.match(lunch.html, /loading="lazy"/);
assert.match(lunch.html, /home-hero__place/);
assert.doesNotMatch(lunch.html, /class="call-number"/);
assert.match(lunch.html, /home-cta-btn--call/);
assert.doesNotMatch(lunch.html, />\+34 958 22 51 43<\/a>/);
assert.doesNotMatch(lunch.html, /hemeroteca/i);
assert.ok(lunch.html.indexOf('home-cta-nav') < lunch.html.indexOf('home-andalusia'), 'CTA group must appear before food');
assert.ok(lunch.html.indexOf('home-cta-nav') < lunch.html.indexOf('historia-leon'), 'CTA group must appear before history');
assert.ok(lunch.body.children.some(el => el.className === 'mobile-service-cta' && el.children.some(child => child.href === 'tel:+34958225143')));

const afterHours = await renderHomepageAt('2026-05-25T18:30:00+02:00');
assert.ok(afterHours.body.children.some(el => el.className === 'mobile-service-cta' && el.children.some(child => child.href === 'tel:+34958225143')));

const withHomepageCarioca = await renderHomepageAt('2026-05-25T13:30:00+02:00', 'es');
assert.doesNotMatch(withHomepageCarioca.html, /carioca-slot/);
assert.match(withHomepageCarioca.html, /class="status-pill status-pill--open"/);
assert.match(withHomepageCarioca.html, /Estamos abiertos/);

const english = await renderHomepageAt('2026-05-25T13:30:00+02:00', 'en');
assert.match(english.html, /home-hero__place[\s\S]{0,60}Since 1959/);
assert.match(english.html, /home-cta-btn--call/);
assert.match(english.html, /We are open/);
assert.match(english.html, /Try a local red wine/);
assert.match(english.html, /beyond Rioja\/Ribera/);
assert.match(english.html, /D\.O\.P\.\s*Granada|D\.O\.\s*Granada/);
assert.doesNotMatch(english.html, /local Granada/);
assert.doesNotMatch(english.html, /Pairs with/);

const french = await renderHomepageAt('2026-05-25T13:30:00+02:00', 'fr');
assert.match(french.html, /home-hero__place[\s\S]{0,60}Depuis 1959/);
assert.match(french.html, /home-cta-btn--call/);
assert.match(french.html, /Nous sommes ouverts/);

console.log('homepage evolution render OK');
