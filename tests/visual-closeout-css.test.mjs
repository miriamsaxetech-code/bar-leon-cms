import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const css = await fs.readFile('css/style.css', 'utf8');

assert.match(css, /--cream:\s*#faf7ef/i);
assert.match(css, /--cobalt:\s*#1d4d85/i);
assert.match(css, /--copper-green:\s*#[0-9a-f]{6}/i);
assert.match(css, /--granate:\s*#a93226/i);
assert.match(css, /\.container--hero\s*\{[^}]*max-width:\s*1080px/is);
assert.match(css, /\.container--documentary\s*\{[^}]*max-width:\s*880px/is);
assert.match(css, /\.container--reading\s*\{[^}]*max-width:\s*680px/is);
assert.match(css, /\.container--menu\s*\{[^}]*max-width:\s*880px/is);
assert.doesNotMatch(css, /overflow-x:\s*hidden/i, 'horizontal overflow must be solved rather than masked');
assert.doesNotMatch(css, /Courier New|font-family:\s*Courier/i, 'prices must use the approved functional typeface');
assert.doesNotMatch(css, /2026-07-12 VISUAL PASS/, 'the temporary 112-line patch must be integrated and removed');
assert.match(css, /:focus-visible/);
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

console.log('visual closeout CSS contract OK');
