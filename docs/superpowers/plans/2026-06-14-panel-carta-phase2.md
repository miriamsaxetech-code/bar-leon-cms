# Panel Carta Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the Bar León data model and replace the flat "Precios" panel tab with an owner-safe "Carta" tab: global search, category accordions, read-only names, price + visibility + featured toggles, and a simple date-exception system for closures.

**Architecture:** All changes are additive migrations to `data/venue.json` plus surgical edits to `panel/app.js`, `panel/index.html`, `js/homepage.js`, and `js/carta.js`. No new dependencies, no build step. The panel already has search, grouped sections, and save/undo logic — this plan refactors the Precios tab in place rather than rebuilding from scratch.

**Tech Stack:** Vanilla JS (ES2020), no frameworks, Cloudflare Pages Functions, GitHub Contents API for saves.

---

## Files Modified

| File | What changes |
|------|-------------|
| `admin/config.yml` | Remove `whatsapp` field from Contact section |
| `data/venue.json` | Add `service_track`, `price_status`, `allergen_status`, `allergens_confirmed` to every dish; restructure `hours` from flat array to `{schedule, exceptions}`; migrate `daily_menu.starters/seconds/desserts` from dot-strings to arrays |
| `js/homepage.js` | Add `getHoursSchedule()` helper; update `isNowServiceTime()` call |
| `js/carta.js` | Same `getHoursSchedule()` helper; update `isNowServiceTime()` call |
| `panel/index.html` | Rename "Precios" tab to "Carta"; add exceptions section to Horarios tab |
| `panel/app.js` | Refactor `renderPrecios()` → `renderCarta()` with category accordions, read-only names, featured toggle; update `renderHorarios()` for new hours structure; update daily menu helpers for array format; add exceptions UI |

---

## Task 1: Remove WhatsApp from Decap CMS config

**Files:**
- Modify: `admin/config.yml:362-363`

- [ ] **Step 1: Remove the whatsapp field**

In `admin/config.yml`, find the Contact section and delete these two lines:

```yaml
              - { name: whatsapp, label: "WhatsApp", widget: string }
```

The surrounding context to locate it:
```yaml
              - { name: phone_link, label: "Enlace telefónico (tel:)", widget: string }
              - { name: email, label: "Email (opcional)", widget: string, required: false }
              # ← remove the whatsapp line here
```

After removal, the last field in the Contact section is `email`.

- [ ] **Step 2: Verify**

```bash
grep -n "whatsapp" /Users/kokonvt/Projects/bar-leon-cms/admin/config.yml
```

Expected: no output (field removed). The `contact.whatsapp` key still exists in `venue.json` with its value — it's just no longer editable via the CMS UI.

- [ ] **Step 3: Commit**

```bash
git add admin/config.yml
git commit -m "fix(admin): remove whatsapp field from Decap CMS contact form

contact.whatsapp is Kakin's personal number — must not be publicly
editable or accidentally surfaced. Value stays in venue.json as
internal-only data."
```

---

## Task 2: Add schema fields to dishes in venue.json

Adds three new fields to every dish object. These are developer/internal fields — never shown in the owner panel.

**Files:**
- Modify: `data/venue.json`

- [ ] **Step 1: Run migration script**

Create a temporary migration script (delete after use):

```bash
cat > /tmp/migrate-dishes.js << 'EOF'
const fs = require('fs');
const path = '/Users/kokonvt/Projects/bar-leon-cms/data/venue.json';
const v = JSON.parse(fs.readFileSync(path, 'utf8'));

// Add new fields to every dish
v.dishes = v.dishes.map(dish => {
  // service_track: derive from category service field if available
  const cat = (v.categories || []).find(c => c.id === dish.category_id);
  const track = cat && cat.service === 'bar' ? 'bar' : 'both';

  return {
    ...dish,
    service_track: dish.service_track || track,
    price_status: dish.price_status || 'pending',
    allergen_status: dish.allergen_status || 'pending',
    allergens_confirmed: dish.allergens_confirmed || [],
  };
});

fs.writeFileSync(path, JSON.stringify(v, null, 2));
console.log('Done. Dishes migrated:', v.dishes.length);
EOF
node /tmp/migrate-dishes.js
rm /tmp/migrate-dishes.js
```

Expected output: `Done. Dishes migrated: N` (where N is the current dish count).

- [ ] **Step 2: Mark uncertain-price dishes**

```bash
cat > /tmp/mark-uncertain.js << 'EOF'
const fs = require('fs');
const path = '/Users/kokonvt/Projects/bar-leon-cms/data/venue.json';
const v = JSON.parse(fs.readFileSync(path, 'utf8'));

// Mark dishes with known price conflicts as uncertain
const uncertain = ['ribera-de-los-molinos'];
// Mark controlled dishes — do not feature or promote
const controlled = ['callos', 'cordobes'];

v.dishes = v.dishes.map(d => {
  if (uncertain.includes(d.id)) return { ...d, price_status: 'uncertain', available: false };
  if (controlled.includes(d.id)) return { ...d, featured: false };
  return d;
});

// Same for wines
v.wines = (v.wines || []).map(w => {
  if (w.id === 'ribera-de-los-molinos') return { ...w, price_status: 'uncertain', available: false };
  return { price_status: 'pending', ...w }; // add field if missing
});

fs.writeFileSync(path, JSON.stringify(v, null, 2));
console.log('Done. Uncertain items marked.');
EOF
node /tmp/mark-uncertain.js
rm /tmp/mark-uncertain.js
```

- [ ] **Step 3: Verify structure of first dish**

```bash
node -e "
const v = require('/Users/kokonvt/Projects/bar-leon-cms/data/venue.json');
const d = v.dishes[0];
console.log('id:', d.id);
console.log('service_track:', d.service_track);
console.log('price_status:', d.price_status);
console.log('allergen_status:', d.allergen_status);
console.log('allergens_confirmed:', d.allergens_confirmed);
"
```

Expected:
```
id: tortilla-sacromonte
service_track: both
price_status: pending
allergen_status: pending
allergens_confirmed: []
```

- [ ] **Step 4: Commit**

```bash
git add data/venue.json
git commit -m "data: add service_track, price_status, allergen_status to dishes

Internal schema fields only — never shown in owner panel.
price_status defaults to 'pending' until Caki confirms each price
against the current PDF. allergen_status always 'pending' in Phase 2;
no allergen data rendered publicly until owner explicitly approves."
```

---

## Task 3: Restructure hours and update public site

Migrates `hours` from a flat array to `{schedule: [...], exceptions: []}`. Homepage and carta must be updated in the same commit.

**Files:**
- Modify: `data/venue.json`
- Modify: `js/homepage.js`
- Modify: `js/carta.js`
- Modify: `panel/app.js`

- [ ] **Step 1: Add getHoursSchedule helper to homepage.js**

In `js/homepage.js`, add this function immediately before the `isNowServiceTime` function (currently around line 130):

```js
  function getHoursSchedule(hours) {
    if (!hours) return [];
    return Array.isArray(hours) ? hours : (hours.schedule || []);
  }
```

Then update `isNowServiceTime` to use it. Replace the function body:

```js
  function isNowServiceTime(hours) {
    const schedule = getHoursSchedule(hours);
    const now = new Date();
    const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayKey = dayKeys[now.getDay()];

    // Check date exceptions first
    const exceptions = Array.isArray(hours && hours.exceptions) ? hours.exceptions : [];
    const todayISO = now.toISOString().slice(0, 10);
    const exception = exceptions.find(e => e.date === todayISO);
    if (exception) {
      if (exception.status === 'closed') return false;
      if (exception.status === 'open' && exception.periods) {
        const nowMins = now.getHours() * 60 + now.getMinutes();
        return exception.periods.some(p => {
          const mins = str => { const s = str.split(':'); return parseInt(s[0],10)*60+parseInt(s[1],10); };
          return nowMins >= mins(p.open) && nowMins < mins(p.close);
        });
      }
    }

    const todayEntry = schedule.find(h => h.day === todayKey);
    if (!todayEntry || todayEntry.status === 'closed' || !todayEntry.periods || !todayEntry.periods.length) return false;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return todayEntry.periods.some(function(p) {
      const parts = function(str) { const s = str.split(':'); return parseInt(s[0], 10) * 60 + parseInt(s[1], 10); };
      return nowMins >= parts(p.open) && nowMins < parts(p.close);
    });
  }
```

- [ ] **Step 2: Add same helper to carta.js**

In `js/carta.js`, add the same `getHoursSchedule` helper before `isNowServiceTime` (currently around line 64) and apply the same update to `isNowServiceTime`:

```js
  function getHoursSchedule(hours) {
    if (!hours) return [];
    return Array.isArray(hours) ? hours : (hours.schedule || []);
  }

  function isNowServiceTime(hours) {
    const schedule = getHoursSchedule(hours);
    const now = new Date();
    const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayKey = dayKeys[now.getDay()];

    const exceptions = Array.isArray(hours && hours.exceptions) ? hours.exceptions : [];
    const todayISO = now.toISOString().slice(0, 10);
    const exception = exceptions.find(e => e.date === todayISO);
    if (exception) {
      if (exception.status === 'closed') return false;
      if (exception.status === 'open' && exception.periods) {
        const nowMins = now.getHours() * 60 + now.getMinutes();
        return exception.periods.some(p => {
          const mins = str => { const s = str.split(':'); return parseInt(s[0],10)*60+parseInt(s[1],10); };
          return nowMins >= mins(p.open) && nowMins < mins(p.close);
        });
      }
    }

    const todayEntry = schedule.find(h => h.day === todayKey);
    if (!todayEntry || todayEntry.status === 'closed' || !todayEntry.periods || !todayEntry.periods.length) return false;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return todayEntry.periods.some(function(p) {
      const parts = function(str) { const s = str.split(':'); return parseInt(s[0], 10) * 60 + parseInt(s[1], 10); };
      return nowMins >= parts(p.open) && nowMins < parts(p.close);
    });
  }
```

- [ ] **Step 3: Update renderHorarios in panel/app.js to handle both formats**

Find `renderHorarios()` in `panel/app.js` (around line 694). Replace the line:

```js
  state.hours.forEach((dayData, index) => {
```

with:

```js
  const schedule = Array.isArray(state.hours) ? state.hours : (state.hours.schedule || []);
  schedule.forEach((dayData, index) => {
```

Also find where `state.hours[index].status` and `state.hours[index].periods` are written. Replace with `schedule[index]`:

```js
    const toggle = createToggle(
      `hours-toggle-${index}`,
      dayData.status !== 'closed',
      (checked) => {
        schedule[index].status = checked ? 'open' : 'closed';
        renderHorarios();
        markDirty();
      }
    );
```

And the add-period handler:
```js
      addBtn.addEventListener('click', () => {
        schedule[index].periods.push({ open: '13:00', close: '16:00' });
        renderHorarios();
        markDirty();
      });
```

And in `createPeriodRow`, the `open`/`close` write-back lambdas must also use `schedule[index]`:
```js
  const openInput  = createTimeInput(period.open,  val => {
    schedule[dayIndex].periods[pIndex].open = val;
    markDirty();
  });
  const closeInput = createTimeInput(period.close, val => {
    schedule[dayIndex].periods[pIndex].close = val;
    markDirty();
  });
```

Note: `createPeriodRow` receives `dayIndex` and `pIndex` as arguments — those come from `schedule.forEach`, so they already reference the correct array. No structural change needed to the function signature.

- [ ] **Step 4: Migrate venue.json hours**

```bash
cat > /tmp/migrate-hours.js << 'EOF'
const fs = require('fs');
const path = '/Users/kokonvt/Projects/bar-leon-cms/data/venue.json';
const v = JSON.parse(fs.readFileSync(path, 'utf8'));

if (Array.isArray(v.hours)) {
  v.hours = { schedule: v.hours, exceptions: [] };
  console.log('Migrated hours to {schedule, exceptions}');
} else {
  console.log('Hours already in new format, skipping.');
}

fs.writeFileSync(path, JSON.stringify(v, null, 2));
EOF
node /tmp/migrate-hours.js
rm /tmp/migrate-hours.js
```

- [ ] **Step 5: Verify**

```bash
node -e "
const v = require('/Users/kokonvt/Projects/bar-leon-cms/data/venue.json');
console.log('hours is array:', Array.isArray(v.hours));
console.log('hours.schedule length:', v.hours.schedule.length);
console.log('hours.exceptions:', v.hours.exceptions);
console.log('first schedule entry:', v.hours.schedule[0].day, v.hours.schedule[0].status);
"
```

Expected:
```
hours is array: false
hours.schedule length: 7
hours.exceptions: []
first schedule entry: monday open
```

- [ ] **Step 6: Commit**

```bash
git add data/venue.json js/homepage.js js/carta.js panel/app.js
git commit -m "feat: restructure hours to {schedule, exceptions} with backward compat

hours flat array → {schedule, exceptions:[]}. homepage.js, carta.js,
and panel/app.js all use getHoursSchedule() helper that handles both
old array format and new object format. exceptions array is empty for
now; owner UI to add entries comes in a later task."
```

---

## Task 4: Migrate daily menu dot-strings to arrays

**Files:**
- Modify: `data/venue.json`
- Modify: `panel/app.js`

The fields `daily_menu.starters`, `seconds`, and `desserts` move from `{es: "A · B · C"}` to `{es: ["A", "B", "C"]}`. The `seasonal` field is editorial narrative text — it stays as a string.

- [ ] **Step 1: Migrate venue.json**

```bash
cat > /tmp/migrate-daily-menu.js << 'EOF'
const fs = require('fs');
const path = '/Users/kokonvt/Projects/bar-leon-cms/data/venue.json';
const v = JSON.parse(fs.readFileSync(path, 'utf8'));

const m = v.daily_menu;
const fields = ['starters', 'seconds', 'desserts'];
const langs = ['es', 'en', 'fr'];

fields.forEach(field => {
  if (!m[field]) return;
  langs.forEach(lang => {
    const val = m[field][lang];
    if (typeof val === 'string' && val.includes('·')) {
      m[field][lang] = val.split(/\s*·\s*/).map(s => s.trim()).filter(Boolean);
    } else if (typeof val === 'string' && val.trim()) {
      m[field][lang] = [val.trim()];
    } else if (!Array.isArray(val)) {
      m[field][lang] = [];
    }
  });
  console.log(field, 'es items:', m[field].es.length);
});

fs.writeFileSync(path, JSON.stringify(v, null, 2));
console.log('Daily menu migration complete.');
EOF
node /tmp/migrate-daily-menu.js
rm /tmp/migrate-daily-menu.js
```

Expected output:
```
starters es items: 5
seconds es items: 6
desserts es items: 4
Daily menu migration complete.
```

- [ ] **Step 2: Update getDailyMenuItems to handle arrays**

In `panel/app.js`, replace `getDailyMenuItems`:

```js
function getDailyMenuItems(field) {
  const data = ensureDailyMenuField(field);
  const val = data.es;
  if (Array.isArray(val)) return [...val];
  return splitPanelListText(val || ''); // backward compat for any old string data
}
```

Replace `setDailyMenuItems`:

```js
function setDailyMenuItems(field, items) {
  const data = ensureDailyMenuField(field);
  data.es = items.filter(Boolean); // always write as array
  markDailyMenuTextDirty();
}
```

- [ ] **Step 3: Update syncDailyMenuFallbackTranslations for arrays**

Replace `copySpanishFallback`:

```js
function copySpanishFallback(field) {
  if (!field || typeof field !== 'object') return;
  const es = field.es;
  // Handle both array and string formats
  if (Array.isArray(es)) {
    if (!Array.isArray(field.en) || !field.en.length) field.en = [...es];
    if (!Array.isArray(field.fr) || !field.fr.length) field.fr = [...es];
  } else {
    const str = typeof es === 'string' ? es.trim() : '';
    if (!field.en) field.en = str;
    if (!field.fr) field.fr = str;
  }
}
```

- [ ] **Step 4: Verify daily menu renders correctly**

Open the panel locally (`wrangler pages dev`) and navigate to the Menú del Día tab. Confirm:
- Primeros shows 5 items (Gazpacho, Sopa de picadillo, Ensalada de la casa, Entremeses variados, Salmorejo)
- Segundos shows 6 items
- Postres shows 4 items
- Each item is editable, addable, deletable
- Saving and reloading preserves the array format

- [ ] **Step 5: Commit**

```bash
git add data/venue.json panel/app.js
git commit -m "feat: migrate daily menu starters/seconds/desserts from dot-strings to arrays

getDailyMenuItems/setDailyMenuItems now read/write arrays. Backward compat
for any legacy string values via splitPanelListText fallback.
seasonal field left as narrative string — not a list."
```

---

## Task 5: Refactor Precios tab → Carta tab with category accordions

This is the main owner UX change. The flat "Precios" list becomes a "Carta" tab with:
- Global search across dishes, wines, beverages
- Category accordions within the Platos section (using `state.categories`)
- Item cards: read-only name, price field, visible toggle, featured toggle (only if item.featured is truthy)
- Allergen selector, category selector, add/delete buttons removed from owner view

**Files:**
- Modify: `panel/index.html`
- Modify: `panel/app.js`
- Modify: `panel/panel.css`

### 5a: Rename tab in HTML

- [ ] **Step 1: Update tab button and panel**

In `panel/index.html`, change the "Precios" tab button to "Carta" and update its search placeholder:

```html
      <button class="panel-tab active" data-tab="carta" role="tab" aria-selected="true" aria-controls="tab-carta">Carta</button>
```

Change the panel ID from `tab-precios` to `tab-carta`:

```html
      <!-- TAB: CARTA -->
      <div id="tab-carta" class="tab-panel active" role="tabpanel">
        <div class="tab-search">
          <input
            id="search-carta"
            type="search"
            placeholder="Buscar plato, bebida o vino…"
            class="search-input"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          >
        </div>
        <div id="carta-list" class="carta-list"></div>
      </div>
```

Remove the old `tab-precios` div and its `precios-list` div entirely.

### 5b: Replace renderPrecios with renderCarta

- [ ] **Step 2: Replace renderPrecios and createCatalogRow in app.js**

Remove the functions: `renderPrecios`, `createCatalogRow`, `createCategorySelect`, `createAllergenSelector`, `addCatalogItem`, `bindPreciosEdit`, and `getCatalogGroups`.

Add these replacements:

```js
// ══════════════════════════════════════════════════════════════
// TAB: CARTA
// ══════════════════════════════════════════════════════════════

function renderCarta(filter) {
  const container = document.getElementById('carta-list');
  if (!container || !state) return;

  const q = (filter || '').toLowerCase().trim();
  container.innerHTML = '';

  // SECTION: Platos — grouped by category
  const foodCategories = (state.categories || [])
    .filter(cat => cat.type === 'food')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const dishSection = document.createElement('section');
  dishSection.className = 'carta-collection';

  const dishHeading = document.createElement('h2');
  dishHeading.className = 'carta-collection__title';
  dishHeading.textContent = 'Platos';
  dishSection.appendChild(dishHeading);

  let dishTotal = 0;
  foodCategories.forEach(cat => {
    const items = (state.dishes || []).filter(d =>
      d.category_id === cat.id &&
      (!q || (d.name && (d.name.es || '').toLowerCase().includes(q)))
    );
    if (!items.length && q) return; // hide empty categories during search
    dishTotal += items.length;

    const accordion = createCartaAccordion(
      cat.name && cat.name.es ? cat.name.es : cat.id,
      items,
      'dishes'
    );
    dishSection.appendChild(accordion);
  });

  if (!q || dishTotal > 0) container.appendChild(dishSection);

  // SECTION: Vinos — flat (categories are wine-type, not editorially meaningful here)
  const wines = (state.wines || []).filter(w =>
    !q || (typeof w.name === 'string'
      ? w.name.toLowerCase().includes(q)
      : (w.name && (w.name.es || w.name || '')).toLowerCase().includes(q))
  );

  if (!q || wines.length) {
    const wineSection = document.createElement('section');
    wineSection.className = 'carta-collection';
    const wineHeading = document.createElement('h2');
    wineHeading.className = 'carta-collection__title';
    wineHeading.textContent = 'Vinos';
    wineSection.appendChild(wineHeading);
    const wineAccordion = createCartaAccordion('Carta de vinos', wines, 'wines');
    wineSection.appendChild(wineAccordion);
    container.appendChild(wineSection);
  }

  // SECTION: Bebidas
  const beverages = (state.beverages || []).filter(b =>
    !q || (b.name && (b.name.es || '').toLowerCase().includes(q))
  );

  if (!q || beverages.length) {
    const bevSection = document.createElement('section');
    bevSection.className = 'carta-collection';
    const bevHeading = document.createElement('h2');
    bevHeading.className = 'carta-collection__title';
    bevHeading.textContent = 'Bebidas';
    bevSection.appendChild(bevHeading);
    const bevAccordion = createCartaAccordion('Cervezas y refrescos', beverages, 'beverages');
    bevSection.appendChild(bevAccordion);
    container.appendChild(bevSection);
  }

  if (!container.children.length) {
    container.innerHTML = '<p class="empty-state">No se encontraron resultados.</p>';
  }
}

function createCartaAccordion(label, items, collection) {
  const details = document.createElement('details');
  details.className = 'carta-accordion';
  if (items.length > 0) details.open = false; // collapsed by default

  const summary = document.createElement('summary');
  summary.className = 'carta-accordion__summary';
  summary.innerHTML = `
    <span class="carta-accordion__label">${label}</span>
    <span class="carta-accordion__count">${items.length}</span>
  `;
  details.appendChild(summary);

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state empty-state--compact';
    empty.textContent = 'Sin platos en esta sección.';
    details.appendChild(empty);
    return details;
  }

  items.forEach(item => {
    details.appendChild(createCartaCard(item, collection));
  });

  return details;
}

function createCartaCard(item, collection) {
  const card = document.createElement('article');
  card.className = 'carta-card';
  card.dataset.collection = collection;
  card.dataset.id = item.id;

  // Name — read-only
  const name = document.createElement('span');
  name.className = 'carta-card__name';
  name.textContent = getPanelItemName(item);
  card.appendChild(name);

  // Price — editable
  const priceWrap = document.createElement('div');
  priceWrap.className = 'carta-card__price-wrap';

  if (collection === 'wines') {
    // Two price fields: copa and botella
    ['price_glass', 'price_bottle'].forEach(field => {
      const label = field === 'price_glass' ? 'Copa' : 'Botella';
      const priceLabel = document.createElement('label');
      priceLabel.className = 'carta-price-label';
      priceLabel.textContent = label + ' ';
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.className = 'carta-card__price-input';
      input.value = formatPanelEuro(item[field]).replace(' €', '');
      input.dataset.cartaAction = 'price';
      input.dataset.field = field;
      input.setAttribute('aria-label', `${label} de ${getPanelItemName(item)}`);
      priceLabel.appendChild(input);
      priceWrap.appendChild(priceLabel);
    });
  } else {
    const priceLabel = document.createElement('label');
    priceLabel.className = 'carta-price-label';
    priceLabel.textContent = 'Precio ';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'carta-card__price-input';
    input.value = item.price || '';
    input.dataset.cartaAction = 'price';
    input.dataset.field = 'price';
    input.setAttribute('aria-label', `Precio de ${getPanelItemName(item)}`);
    priceLabel.appendChild(input);
    priceWrap.appendChild(priceLabel);
  }
  card.appendChild(priceWrap);

  // Visible toggle
  const visibleRow = document.createElement('label');
  visibleRow.className = 'carta-card__toggle-row';
  const visibleCheck = document.createElement('input');
  visibleCheck.type = 'checkbox';
  visibleCheck.className = 'carta-card__toggle';
  visibleCheck.checked = item.available !== false;
  visibleCheck.dataset.cartaAction = 'available';
  visibleCheck.setAttribute('aria-label', `Visible en carta — ${getPanelItemName(item)}`);
  const visibleLabel = document.createElement('span');
  visibleLabel.textContent = item.available !== false ? 'Visible' : 'Oculto';
  visibleCheck.addEventListener('change', () => {
    visibleLabel.textContent = visibleCheck.checked ? 'Visible' : 'Oculto';
  });
  visibleRow.appendChild(visibleCheck);
  visibleRow.appendChild(visibleLabel);
  card.appendChild(visibleRow);

  // Featured toggle — only shown if item currently has a featured value
  if (item.featured && item.featured !== false) {
    const featuredOriginal = item.featured;
    const featuredRow = document.createElement('label');
    featuredRow.className = 'carta-card__toggle-row carta-card__toggle-row--featured';
    const featuredCheck = document.createElement('input');
    featuredCheck.type = 'checkbox';
    featuredCheck.className = 'carta-card__toggle';
    featuredCheck.checked = true; // it has a value, so it's featured
    featuredCheck.dataset.cartaAction = 'featured';
    featuredCheck.dataset.featuredOriginal = featuredOriginal;
    featuredCheck.setAttribute('aria-label', `Destacado — ${getPanelItemName(item)}`);
    const featuredLabel = document.createElement('span');
    featuredLabel.textContent = 'Destacado';
    featuredRow.appendChild(featuredCheck);
    featuredRow.appendChild(featuredLabel);
    card.appendChild(featuredRow);
  }

  // Validation message slot
  const validation = document.createElement('p');
  validation.className = 'carta-card__validation';
  validation.hidden = true;
  card.appendChild(validation);

  return card;
}

function bindCartaEdit() {
  const container = document.getElementById('carta-list');
  if (!container) return;

  // Search
  const searchInput = document.getElementById('search-carta');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderCarta(searchInput.value));
  }

  // Card interactions (event delegation)
  container.addEventListener('change', e => {
    const card = e.target.closest('.carta-card');
    if (!card) return;

    const collection = card.dataset.collection;
    const id = card.dataset.id;
    const item = getCartaItem(collection, id);
    if (!item) return;

    const action = e.target.dataset.cartaAction;
    const validation = card.querySelector('.carta-card__validation');

    if (action === 'price') {
      const field = e.target.dataset.field;
      const raw = e.target.value.trim();

      if (!raw) {
        showCartaValidation(validation, 'El precio no puede estar vacío.');
        return;
      }
      if (item.price_status === 'uncertain') {
        showCartaValidation(validation, 'Este precio necesita confirmación — contacta con el administrador.');
        return;
      }
      hideCartaValidation(validation);

      if (collection === 'wines') {
        item[field] = parsePanelEuro(raw);
      } else {
        item[field || 'price'] = raw;
      }
      markDirty();
    }

    if (action === 'available') {
      item.available = e.target.checked;
      markDirty();
    }

    if (action === 'featured') {
      const original = e.target.dataset.featuredOriginal;
      item.featured = e.target.checked ? original : false;
      markDirty();
    }
  });
}

function getCartaItem(collection, id) {
  return Array.isArray(state && state[collection])
    ? state[collection].find(i => i.id === id)
    : null;
}

function showCartaValidation(el, message) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function hideCartaValidation(el) {
  if (!el) return;
  el.hidden = true;
}
```

- [ ] **Step 3: Update renderAll and bindEvents to use Carta**

In `renderAll()`, replace `renderPrecios()` with `renderCarta()`:

```js
function renderAll() {
  renderCarta();
  renderHorarios();
  renderMenuDelDia();
  renderAviso();
  renderCariocas();
  renderPizarra();
}
```

In `bindEvents()`, replace `bindPreciosEdit()` with `bindCartaEdit()`.

- [ ] **Step 4: Add Carta CSS to panel.css**

Add these rules to `panel/panel.css` (append at end):

```css
/* ══════════════════════════════════════════════════════════════
   TAB: CARTA
   ══════════════════════════════════════════════════════════════ */

.carta-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.carta-collection {
  margin-bottom: 8px;
}

.carta-collection__title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-2);
  padding: 12px 16px 4px;
  margin: 0;
}

.carta-accordion {
  border-bottom: 1px solid var(--border);
}

.carta-accordion__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  list-style: none;
  user-select: none;
  -webkit-user-select: none;
  background: var(--bg);
}

.carta-accordion__summary::-webkit-details-marker { display: none; }

.carta-accordion__summary::after {
  content: '›';
  display: inline-block;
  font-size: 1.1rem;
  color: var(--ink-2);
  transition: transform 0.15s;
  margin-left: 8px;
}

details[open] .carta-accordion__summary::after {
  transform: rotate(90deg);
}

.carta-accordion__label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
}

.carta-accordion__count {
  font-size: 0.8rem;
  color: var(--ink-2);
  background: var(--bg-2);
  padding: 2px 8px;
  border-radius: 20px;
}

/* ── Item card ───────────────────────────────────────────────── */

.carta-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--white);
}

.carta-card:last-child {
  border-bottom: none;
}

.carta-card__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
}

.carta-card__price-wrap {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.carta-price-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--ink-2);
}

.carta-card__price-input {
  width: 100px;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: var(--font);
  background: var(--bg);
  color: var(--ink);
}

.carta-card__price-input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.carta-card__toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--ink-2);
  cursor: pointer;
}

.carta-card__toggle-row--featured {
  color: var(--error-bg);
}

.carta-card__toggle {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}

.carta-card__validation {
  font-size: 0.8rem;
  color: var(--error-bg);
  margin: 0;
  padding: 4px 0;
}
```

- [ ] **Step 5: Verify panel UI**

Run locally:
```bash
cd /Users/kokonvt/Projects/bar-leon-cms && wrangler pages dev . --port 8788
```

Open `http://localhost:8788/panel/`. After PIN login:
- Tab says "Carta" (not "Precios")
- Search box says "Buscar plato, bebida o vino…"
- Three sections: Platos / Vinos / Bebidas
- Within Platos: category accordions (e.g., "Sabores de Andalucía", "Entrantes y raciones")
- Expanding an accordion shows item cards
- Each card: name (not editable), price field, Visible toggle, Destacado toggle (only on featured items)
- No allergen selector, no category dropdown, no Add/Delete buttons
- Searching "riñon" shows Riñones al Jerez under its category, no other results
- Changing a price and clicking "Publicar en la web" saves correctly

- [ ] **Step 6: Commit**

```bash
git add panel/index.html panel/app.js panel/panel.css
git commit -m "feat(panel): replace Precios tab with Carta — category accordions, read-only names

Owner sees: name (read-only), price, visible toggle, featured toggle
(only when already set). No allergen selector, no category select,
no add/delete. Category accordions within Platos from venue.json
categories. Global search across dishes, wines, beverages."
```

---

## Task 6: Add hours exceptions UI

Adds a simple dated list at the bottom of the Horarios tab for closures and special openings.

**Files:**
- Modify: `panel/index.html`
- Modify: `panel/app.js`
- Modify: `panel/panel.css`

- [ ] **Step 1: Add exceptions section to Horarios tab in index.html**

After the `horarios-list` div inside `tab-horarios`, add:

```html
        <div class="exceptions-section">
          <div class="exceptions-header">
            <h3 class="exceptions-title">Cierres y aperturas especiales</h3>
            <button type="button" id="add-exception-btn" class="btn btn--ghost btn--small">+ Añadir excepción</button>
          </div>
          <div id="exceptions-list" class="exceptions-list"></div>
        </div>
```

- [ ] **Step 2: Add renderExceptions and bindExceptions in app.js**

Add after `renderHorarios`:

```js
function renderExceptions() {
  const container = document.getElementById('exceptions-list');
  if (!container || !state) return;

  const hours = state.hours;
  if (!hours || Array.isArray(hours)) return; // old format, skip
  const exceptions = Array.isArray(hours.exceptions) ? hours.exceptions : [];

  container.innerHTML = '';

  if (!exceptions.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state empty-state--compact';
    empty.textContent = 'Sin excepciones. Añade un cierre especial o apertura extraordinaria.';
    container.appendChild(empty);
    return;
  }

  exceptions.forEach((exc, index) => {
    container.appendChild(createExceptionRow(exc, index));
  });
}

function createExceptionRow(exc, index) {
  const row = document.createElement('div');
  row.className = 'exception-row';
  row.dataset.index = index;

  // Date
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'field-input exception-date';
  dateInput.value = exc.date || '';
  dateInput.setAttribute('aria-label', 'Fecha');
  dateInput.addEventListener('change', () => {
    state.hours.exceptions[index].date = dateInput.value;
    markDirty();
  });

  // Status
  const statusSelect = document.createElement('select');
  statusSelect.className = 'field-select exception-status';
  statusSelect.setAttribute('aria-label', 'Estado');
  [
    { value: 'closed', label: 'Cerrado' },
    { value: 'open',   label: 'Apertura especial' },
  ].forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    option.selected = exc.status === opt.value;
    statusSelect.appendChild(option);
  });
  statusSelect.addEventListener('change', () => {
    state.hours.exceptions[index].status = statusSelect.value;
    renderExceptions();
    markDirty();
  });

  // Label (Spanish only — owner writes in Spanish)
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'field-input exception-label';
  labelInput.placeholder = 'Motivo (ej: Feria de Granada)';
  labelInput.value = exc.label && exc.label.es ? exc.label.es : '';
  labelInput.setAttribute('aria-label', 'Motivo del cierre o apertura');
  labelInput.addEventListener('change', () => {
    if (!state.hours.exceptions[index].label) state.hours.exceptions[index].label = {};
    state.hours.exceptions[index].label.es = labelInput.value.trim();
    markDirty();
  });

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'exception-remove';
  removeBtn.textContent = '✕';
  removeBtn.setAttribute('aria-label', 'Eliminar esta excepción');
  removeBtn.addEventListener('click', () => {
    state.hours.exceptions.splice(index, 1);
    renderExceptions();
    markDirty();
  });

  row.appendChild(dateInput);
  row.appendChild(statusSelect);
  row.appendChild(labelInput);
  row.appendChild(removeBtn);

  // If open: show period inputs
  if (exc.status === 'open') {
    const periods = Array.isArray(exc.periods) ? exc.periods : [{ open: '13:00', close: '16:00' }];
    if (!Array.isArray(exc.periods)) state.hours.exceptions[index].periods = periods;

    const periodsDiv = document.createElement('div');
    periodsDiv.className = 'exception-periods';
    periods.forEach((period, pIndex) => {
      const periodRow = document.createElement('div');
      periodRow.className = 'period-row';

      const openInput = createTimeInput(period.open, val => {
        state.hours.exceptions[index].periods[pIndex].open = val;
        markDirty();
      });
      const sep = document.createElement('span');
      sep.className = 'period-sep';
      sep.textContent = '—';
      const closeInput = createTimeInput(period.close, val => {
        state.hours.exceptions[index].periods[pIndex].close = val;
        markDirty();
      });

      // Validate close > open
      [openInput, closeInput].forEach(input => {
        input.addEventListener('change', () => {
          const exc_periods = state.hours.exceptions[index].periods;
          const p = exc_periods[pIndex];
          if (p && p.open && p.close && p.close <= p.open) {
            showError('La hora de cierre debe ser posterior a la de apertura.');
          }
        });
      });

      periodRow.appendChild(openInput);
      periodRow.appendChild(sep);
      periodRow.appendChild(closeInput);
      periodsDiv.appendChild(periodRow);
    });
    row.appendChild(periodsDiv);
  }

  return row;
}

function bindExceptions() {
  const addBtn = document.getElementById('add-exception-btn');
  if (!addBtn) return;
  addBtn.addEventListener('click', () => {
    if (!state.hours || Array.isArray(state.hours)) return;
    if (!Array.isArray(state.hours.exceptions)) state.hours.exceptions = [];

    // Default date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().slice(0, 10);

    // Guard: no duplicate dates
    if (state.hours.exceptions.some(e => e.date === iso)) {
      showError('Ya existe una excepción para esa fecha. Elige otra fecha.');
      return;
    }

    state.hours.exceptions.push({
      date: iso,
      status: 'closed',
      label: { es: '' },
    });
    renderExceptions();
    markDirty();
  });
}
```

- [ ] **Step 3: Update renderAll and bindEvents**

In `renderAll()`, add `renderExceptions()` after `renderHorarios()`:

```js
function renderAll() {
  renderCarta();
  renderHorarios();
  renderExceptions();
  renderMenuDelDia();
  renderAviso();
  renderCariocas();
  renderPizarra();
}
```

In `bindEvents()`, add `bindExceptions()` after `bindHorarios()` (wherever that is called).

- [ ] **Step 4: Add exceptions CSS to panel.css**

```css
/* ── Exceptions ──────────────────────────────────────────────── */

.exceptions-section {
  padding: 16px 0 8px;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}

.exceptions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
}

.exceptions-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-2);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.exceptions-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exception-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg-2);
  border-radius: var(--radius-sm);
  margin: 0 8px;
  position: relative;
}

.exception-date {
  width: auto;
  font-size: 0.9rem;
}

.exception-status {
  font-size: 0.9rem;
}

.exception-label {
  font-size: 0.9rem;
}

.exception-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--ink-2);
  padding: 4px;
  line-height: 1;
}

.exception-remove:hover { color: var(--error-bg); }

.exception-periods {
  padding-top: 4px;
  border-top: 1px solid var(--border);
}
```

- [ ] **Step 5: Verify exceptions UI**

Open panel → Horarios tab. Scroll below the weekly schedule:
- "Cierres y aperturas especiales" heading with "+ Añadir excepción" button
- Clicking "+ Añadir excepción" adds a row with tomorrow's date, "Cerrado" status, and a label input
- Changing status to "Apertura especial" shows time period inputs
- Clicking ✕ removes the row
- Saving publishes to venue.json as `hours.exceptions[{date, status, label, periods?}]`
- Adding a duplicate date shows error message

- [ ] **Step 6: Commit**

```bash
git add panel/index.html panel/app.js panel/panel.css
git commit -m "feat(panel): add hours exceptions UI for closures and special openings

Simple list of dated exceptions below weekly schedule. Owner sets:
date, closed/open, label (Spanish only). Open exceptions show time
period inputs. Duplicate-date guard and close-after-open validation.
Data writes to hours.exceptions[] in venue.json."
```

---

## Task 7: Pending changes counter and review summary

Surfaces how many fields have changed before the owner hits "Publicar".

**Files:**
- Modify: `panel/app.js`
- Modify: `panel/panel.css`

- [ ] **Step 1: Track individual changes**

In `panel/app.js`, add a `pendingChanges` Set above `state`:

```js
const pendingChanges = new Set(); // tracks what has been changed
```

Update `markDirty()` to also update the counter. Find `markDirty` (search for it) and update it to call `updatePendingCounter()`:

```js
function markDirty() {
  // (existing dirty-state logic stays unchanged)
  updatePendingCounter();
}

function updatePendingCounter() {
  const saveBtn = document.getElementById('save-btn');
  if (!saveBtn) return;
  // The panel doesn't track individual changes granularly yet;
  // show "Cambios sin guardar" when dirty, nothing when clean.
  // A precise count requires deeper change tracking — deferred to a future task.
  // For now, "Publicar en la web" already indicates there are pending changes.
}
```

Note: granular "N cambios" tracking requires diffing state against original which is beyond Phase 2 scope. The existing save bar + dirty flag is sufficient for Phase 2. Keep the existing save bar behavior unchanged.

- [ ] **Step 2: Add last-save timestamp to panel footer**

In `panel/app.js`, find the successful save handler (the `admin-save` POST success path). After the success toast, add:

```js
// After successful save
const now = new Date();
const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const saveStatus = document.getElementById('save-status');
if (saveStatus) saveStatus.textContent = `Guardado a las ${timeStr}`;
```

- [ ] **Step 3: Improve 409 conflict dialog**

Find the 409 error handling in the save function. Replace any generic error with:

```js
if (resp.status === 409) {
  showError('Alguien más guardó cambios mientras editabas. Recarga la página y vuelve a intentarlo. Tus cambios no se han perdido — están en el panel hasta que recargues.');
  return;
}
```

- [ ] **Step 4: Commit**

```bash
git add panel/app.js panel/panel.css
git commit -m "feat(panel): add last-save timestamp and improved 409 conflict message

Shows 'Guardado a las HH:MM' after successful publish.
409 conflict error now explains what happened and what to do,
in plain Spanish for the owner."
```

---

## Verification Checklist

After all tasks are complete:

```bash
# 1. No whatsapp in Decap form
grep "whatsapp" /Users/kokonvt/Projects/bar-leon-cms/admin/config.yml
# Expected: no output

# 2. Dish schema fields present
node -e "
const v = require('./data/venue.json');
const d = v.dishes[0];
['service_track','price_status','allergen_status','allergens_confirmed'].forEach(f =>
  console.log(f + ':', d[f])
);
"

# 3. Hours structure
node -e "
const v = require('./data/venue.json');
console.log('Array:', Array.isArray(v.hours));
console.log('schedule:', v.hours.schedule.length, 'days');
console.log('exceptions:', v.hours.exceptions.length);
"

# 4. Daily menu arrays
node -e "
const v = require('./data/venue.json');
const m = v.daily_menu;
console.log('starters.es is array:', Array.isArray(m.starters.es));
console.log('starters.es count:', m.starters.es.length);
console.log('seconds.es is array:', Array.isArray(m.seconds.es));
console.log('desserts.es is array:', Array.isArray(m.desserts.es));
"

# 5. Public site renders correctly
wrangler pages dev . --port 8788
# Open http://localhost:8788/es/ — homepage loads, status pill works
# Open http://localhost:8788/es/carta — menu loads, all tabs render

# 6. Panel functional tests
# - Login with PIN
# - Carta tab: search "riñon" → shows Riñones al Jerez only
# - Expand "Sabores de Andalucía" → see dishes
# - Change a price → save → reload → price persists
# - Toggle a dish to Oculto → save → reload → available: false
# - Horarios: add exception for a future date → save → reload → exception persists
# - Menú del Día: add a starter item → save → reload → array preserved
```

---

## Constraints Reminder

- Owner panel exposes only: name (read-only), price, visible toggle, featured toggle (only when already set)
- Never shown in owner panel: IDs, category_id, allergens, service_track, price_status, schema fields, translations
- Allergens: catalog exists in venue.json, NOT rendered publicly until owner explicitly approves in a future phase
- Featured: owner can turn OFF featured status; cannot set a new featured value (developer-only via Decap)
- Callos: `featured: false` enforced in Task 2; do not promote
- Cordobés: marked `available: false` in Task 2; do not surface
- Bar León brand tokens only: `#1D4D85`, `#7A1C1C`, `#F5EFE0`, León Display for headings only
