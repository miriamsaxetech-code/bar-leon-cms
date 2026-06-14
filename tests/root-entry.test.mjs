import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const html = await fs.readFile('index.html', 'utf8');

assert.doesNotMatch(html, /http-equiv=["']refresh["']/i, 'root must not meta-refresh');
assert.doesNotMatch(html, /location\.(?:replace|href)\s*=/, 'root must not redirect with JavaScript');
assert.match(html, /hero-leon\.(?:webp|png)/, 'root must feature the recognizable Bar León azulejo sign');
assert.doesNotMatch(html, /lion-logo\.svg/, 'root must not include the lion mark');
assert.match(html, />Español</);
assert.match(html, />English</);
assert.match(html, />Français</);
assert.match(html, /href=["']\/es\/["']/);
assert.match(html, /href=["']\/en\/["']/);
assert.match(html, /href=["']\/fr\/["']/);
assert.match(html, /href=["']\/es\/carta["']/, 'root should offer a quiet direct Spanish menu link');

console.log('root identity gateway contract OK');
