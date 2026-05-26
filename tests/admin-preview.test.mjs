import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function toImmutable(value) {
  if (Array.isArray(value)) {
    return {
      get(index) {
        return toImmutable(value[index]);
      },
      toJS() {
        return value;
      },
    };
  }

  if (value && typeof value === 'object') {
    return {
      get(key) {
        return toImmutable(value[key]);
      },
      getIn(path) {
        return toImmutable(path.reduce((current, key) => current && current[key], value));
      },
      toJS() {
        return value;
      },
    };
  }

  return value;
}

const html = await fs.readFile('admin/index.html', 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>\s*<\/body>/)?.[1];
assert.ok(script, 'admin preview script should exist');

const venue = JSON.parse(await fs.readFile('data/venue.json', 'utf8'));
let PreviewBarLeon;

const context = {
  console,
  window: {},
  h(tag, props, ...children) {
    return { tag, props, children };
  },
  CMS: {
    h: undefined,
    Immutable: {
      Map() {
        return toImmutable({});
      },
      List() {
        return toImmutable([]);
      },
    },
    registerPreviewStyle() {},
    registerPreviewTemplate(name, component) {
      if (name === 'venue') PreviewBarLeon = component;
    },
  },
};

context.window = context;
vm.createContext(context);
vm.runInContext(script, context);

assert.equal(typeof PreviewBarLeon, 'function');
const preview = PreviewBarLeon({
  entry: {
    getIn(path) {
      assert.deepEqual(Array.from(path), ['data']);
      return toImmutable(venue);
    },
  },
});

assert.equal(preview.tag, 'div');
assert.ok(
  JSON.stringify(preview).includes('Menú del día'),
  'admin preview should render the daily menu section'
);

console.log('admin preview render OK');
