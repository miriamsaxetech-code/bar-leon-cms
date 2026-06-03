import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const PUBLIC_BASE_URL = 'https://restaurantebarleon.com';
const OLD_HOSTS = [
  ['https://www', 'barleongrx', 'com'].join('.'),
  ['https://barleongrx', 'com'].join('.'),
  `https://${['bar-leon-cms', 'pages', 'dev'].join('.')}`,
];

const HOME_ROUTES = {
  'es/index.html': '/es/',
  'en/index.html': '/en/',
  'fr/index.html': '/fr/',
};

const MENU_ROUTES = {
  'es/carta.html': '/es/carta',
  'en/menu.html': '/en/menu',
  'fr/carte.html': '/fr/carte',
};

const HOME_ALTERNATES = {
  es: '/es/',
  en: '/en/',
  fr: '/fr/',
  'x-default': '/es/',
};

const MENU_ALTERNATES = {
  es: '/es/carta',
  en: '/en/menu',
  fr: '/fr/carte',
  'x-default': '/es/carta',
};

async function read(path) {
  return fs.readFile(path, 'utf8');
}

function expectNoOldHosts(path, text) {
  for (const host of OLD_HOSTS) {
    assert.equal(text.includes(host), false, `${path} still references ${host}`);
  }
}

function expectCanonical(path, text, route) {
  assert.match(
    text,
    new RegExp(`<link rel="canonical" href="${PUBLIC_BASE_URL}${route}"\\s*/?>`),
    `${path} must self-canonicalize to ${PUBLIC_BASE_URL}${route}`,
  );
}

function expectAlternates(path, text, alternates) {
  for (const [lang, route] of Object.entries(alternates)) {
    assert.match(
      text,
      new RegExp(`<link rel="alternate" hreflang="${lang}" href="${PUBLIC_BASE_URL}${route}"\\s*/?>`),
      `${path} must include absolute ${lang} hreflang`,
    );
  }
  assert.doesNotMatch(text, /rel="alternate" hreflang="[^"]+" href="\//, `${path} has relative hreflang`);
}

function expectFallbackContent(path, text) {
  assert.match(text, /<h1[\s>]/, `${path} needs a static H1 fallback`);
  assert.match(text, /<nav[\s>]/, `${path} needs static navigation fallback`);
  assert.match(text, /C\/ Pan, 1|C\. Pan, 1/, `${path} needs static address fallback`);
  assert.match(text, /958 22 51 43|958-22-51-43/, `${path} needs static phone fallback`);
  assert.match(text, /application\/ld\+json/, `${path} needs static JSON-LD`);
}

for (const [path, route] of Object.entries(HOME_ROUTES)) {
  const html = await read(path);
  expectNoOldHosts(path, html);
  expectCanonical(path, html, route);
  expectAlternates(path, html, HOME_ALTERNATES);
  expectFallbackContent(path, html);
}

for (const [path, route] of Object.entries(MENU_ROUTES)) {
  const html = await read(path);
  expectNoOldHosts(path, html);
  expectCanonical(path, html, route);
  expectAlternates(path, html, MENU_ALTERNATES);
  expectFallbackContent(path, html);
  assert.doesNotMatch(html, /rel="canonical" href="[^"]+\.html"/, `${path} canonical must be clean`);
}

const root = await read('index.html');
expectNoOldHosts('index.html', root);
assert.doesNotMatch(root, /hreflang="x-default" href="[^"]*\/"/, 'root must not be the x-default target');

const robots = await read('robots.txt');
expectNoOldHosts('robots.txt', robots);
assert.match(robots, /^User-agent: \*$/m);
assert.match(robots, /^Allow: \/$/m);
assert.match(robots, /^Disallow: \/admin\/$/m);
assert.match(robots, /^Disallow: \/admin-quick\/$/m);
assert.match(robots, new RegExp(`^Sitemap: ${PUBLIC_BASE_URL}/sitemap\\.xml$`, 'm'));

const sitemap = await read('sitemap.xml');
expectNoOldHosts('sitemap.xml', sitemap);
for (const route of [...Object.values(HOME_ROUTES), ...Object.values(MENU_ROUTES)]) {
  assert.match(sitemap, new RegExp(`<loc>${PUBLIC_BASE_URL}${route}</loc>`), `sitemap missing ${route}`);
}
assert.doesNotMatch(sitemap, /\.html<\/loc>/, 'sitemap must not include .html canonical locs');
assert.match(sitemap, new RegExp(`hreflang="x-default" href="${PUBLIC_BASE_URL}/es/"`));
assert.match(sitemap, new RegExp(`hreflang="x-default" href="${PUBLIC_BASE_URL}/es/carta"`));

const redirects = await read('_redirects');
assert.match(redirects, /^\/\s+\/es\/\s+302$/m, 'root must redirect to /es/');

const venue = await read('data/venue.json');
expectNoOldHosts('data/venue.json', venue);
assert.match(venue, new RegExp(`"canonical": "${PUBLIC_BASE_URL}"`));

for (const scriptPath of ['js/homepage.js', 'js/carta.js']) {
  const script = await read(scriptPath);
  expectNoOldHosts(scriptPath, script);
  assert.match(script, /getPublicBaseUrl/, `${scriptPath} should use centralized public base URL helper`);
}

console.log('SEO canonical contract OK');
