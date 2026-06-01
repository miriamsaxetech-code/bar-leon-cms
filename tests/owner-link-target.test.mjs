import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

for (const file of ['js/homepage.js', 'js/carta.js']) {
  const source = await fs.readFile(file, 'utf8');
  assert.match(source, /href="\/panel\/" class="owner-link"/, `${file} should link owner access to /panel/`);
  assert.doesNotMatch(source, /href="\/admin\/" class="owner-link"/, `${file} should not send owners to /admin/`);
}

console.log('owner link target OK');
