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

async function renderHomepageWithVenue(venue, lang = 'es') {
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
  body.appendChild = function appendChild(child) {
    this.children.push(child);
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
    querySelector() {
      return null;
    },
  };

  const source = await fs.readFile('js/homepage.js', 'utf8');
  const context = {
    console,
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

  return elements.homepage.innerHTML;
}

const panelSource = await fs.readFile('panel/app.js', 'utf8');
assert.match(panelSource, /fetch\('\/pin-login'/);
assert.match(panelSource, /fetch\('\/panel-session'/);
assert.match(panelSource, /fetch\('\/upload-image'/);
assert.match(panelSource, /fetch\('\/admin-save'/);
assert.doesNotMatch(panelSource, /\/functions\/(?:pin-login|upload-image|admin-save)/);
assert.match(panelSource, /validateStoredToken/);
assert.match(panelSource, /syncDailyMenuFallbackTranslations/);

const baseVenue = JSON.parse(await fs.readFile('data/venue.json', 'utf8'));
baseVenue.cariocas = [];
baseVenue.venue.notice = {
  es: 'Aviso de prueba QA',
  en: 'QA notice',
  fr: 'Avis QA',
};

const inactiveVenue = structuredClone(baseVenue);
inactiveVenue.venue.notice_active = false;
delete inactiveVenue.venue.notice_expiry;
assert.doesNotMatch(await renderHomepageWithVenue(inactiveVenue, 'es'), /Aviso de prueba QA/);

const expiredVenue = structuredClone(baseVenue);
expiredVenue.venue.notice_active = true;
expiredVenue.venue.notice_expiry = '2000-01-01';
assert.doesNotMatch(await renderHomepageWithVenue(expiredVenue, 'es'), /Aviso de prueba QA/);

const activeVenue = structuredClone(baseVenue);
activeVenue.venue.notice_active = true;
activeVenue.venue.notice_expiry = '2999-01-01';
assert.match(await renderHomepageWithVenue(activeVenue, 'en'), /QA notice/);

const uploadSource = await fs.readFile('functions/upload-image.js', 'utf8');
assert.match(uploadSource, /image\/jpeg/);
assert.match(uploadSource, /image\/png/);
assert.match(uploadSource, /image\/webp/);
assert.match(uploadSource, /MAX_UPLOAD_BYTES/);
assert.match(uploadSource, /mimeToExtension/);
assert.match(uploadSource, /Content-Type': 'application\/json'/);

const pinLogin = await import(`../functions/pin-login.js?test=${Date.now()}`);
const missingConfigResponse = await pinLogin.onRequestPost({
  request: new Request('https://restaurantebarleon.com/pin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: '000000', remember: true }),
  }),
  env: { PANEL_PIN: '000000' },
});
assert.equal(missingConfigResponse.status, 500);
assert.equal(missingConfigResponse.headers.get('Content-Type'), 'application/json');
assert.deepEqual(await missingConfigResponse.json(), { ok: false, error: 'missing_panel_config' });

const gitignore = await fs.readFile('.gitignore', 'utf8');
assert.match(gitignore, /^\.dev\.vars$/m);

console.log('owner panel fixes OK');
