/**
 * Panel de Control — Bar León
 * app.js — toda la lógica del panel de administración
 */

'use strict';

// ══════════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ══════════════════════════════════════════════════════════════

const DEVICE_KEY  = 'panel_device_token';
const SESSION_KEY = 'panel_session_token';

function getToken() {
  return localStorage.getItem(DEVICE_KEY) || sessionStorage.getItem(SESSION_KEY) || null;
}

function setToken(token, remember) {
  if (remember) {
    localStorage.setItem(DEVICE_KEY, token);
  } else {
    sessionStorage.setItem(SESSION_KEY, token);
  }
}

function clearToken() {
  localStorage.removeItem(DEVICE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

// ══════════════════════════════════════════════════════════════
// ESTADO GLOBAL
// ══════════════════════════════════════════════════════════════

let state = null; // venue.json completo, cargado en memoria
let cariocaFile = null; // archivo de imagen pendiente de subir
let dailyMenuTextDirty = false;
let lastSavedSnapshot = null; // JSON string of state before last save, for undo
let undoTimer = null;

// ══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();

  if (!token) {
    showAuthScreen();
    return;
  }

  try {
    await validateStoredToken(token);
    await loadVenueData();
    showPanel();
    renderAll();
    bindEvents();
  } catch (err) {
    if (err.status === 401) {
      clearToken();
      showAuthScreen();
    } else {
      showError('No se pudo cargar la información del restaurante. Recarga la página.');
    }
  }
});

async function validateStoredToken(token) {
  const resp = await fetch('/panel-session', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!resp.ok) {
    const err = new Error('Sesión no válida');
    err.status = resp.status;
    throw err;
  }
}

// ══════════════════════════════════════════════════════════════
// PANTALLAS
// ══════════════════════════════════════════════════════════════

function showAuthScreen() {
  document.getElementById('auth-screen').hidden = false;
  document.getElementById('panel').hidden = true;

  const form      = document.getElementById('pin-form');
  const digits    = Array.from(document.querySelectorAll('.pin-digit'));
  const submitBtn = document.getElementById('pin-submit');
  const errorEl   = document.getElementById('pin-error');

  // Auto-advance focus between PIN digit boxes
  digits.forEach((input, idx) => {
    input.addEventListener('input', () => {
      const val = input.value.replace(/\D/g, '');
      input.value = val.slice(-1); // keep only last numeric char
      if (val && idx < digits.length - 1) digits[idx + 1].focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && idx > 0) digits[idx - 1].focus();
    });
    input.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      pasted.split('').slice(0, digits.length).forEach((ch, i) => {
        if (digits[i]) digits[i].value = ch;
      });
      const next = Math.min(pasted.length, digits.length - 1);
      digits[next].focus();
    });
  });

  form.onsubmit = async e => {
    e.preventDefault();
    errorEl.hidden = true;

    const pin = digits.map(d => d.value).join('');
    if (pin.length !== 6) { digits[0].focus(); return; }

    const remember = document.getElementById('pin-remember-cb').checked;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Comprobando…';

    try {
      const resp = await fetch('/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, remember }),
      });

      let result = null;
      const contentType = resp.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        result = await resp.json();
      }

      if (resp.status === 401) {
        errorEl.hidden = false;
        digits.forEach(d => { d.value = ''; });
        digits[0].focus();
        return;
      }

      if (resp.status === 500 && result && result.error === 'missing_panel_config') {
        showError('Falta configurar el PIN del panel en Cloudflare. Avise al administrador.');
        return;
      }

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const { token } = result || {};
      setToken(token, remember);

      await loadVenueData();
      showPanel();
      renderAll();
      bindEvents();

    } catch {
      showError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  };

  // Focus first digit on load
  digits[0]?.focus();
}

function showPanel() {
  document.getElementById('auth-screen').hidden = true;
  document.getElementById('panel').hidden = false;
}

// ══════════════════════════════════════════════════════════════
// CARGA DE DATOS
// ══════════════════════════════════════════════════════════════

async function loadVenueData() {
  const res = await fetch('/data/venue.json');
  if (!res.ok) {
    const err = new Error('Error cargando venue.json');
    err.status = res.status;
    throw err;
  }
  state = await res.json();
}

// ══════════════════════════════════════════════════════════════
// NAVEGACIÓN POR PESTAÑAS
// ══════════════════════════════════════════════════════════════

function bindTabNav() {
  document.querySelectorAll('.panel-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      // Desactivar todos
      document.querySelectorAll('.panel-tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      // Activar el seleccionado
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('tab-' + tabId);
      panel.classList.add('active');
      panel.hidden = false;
    });
  });
}

// ══════════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════════════════════════

function renderAll() {
  renderCarta();
  renderHorarios();
  renderExceptions();
  renderMenuDelDia();
  renderAviso();
  renderCariocas();
  renderPizarra();
}

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
      d.deleted !== true &&
      (!q || (d.name && (d.name.es || '').toLowerCase().includes(q)))
    );
    if (q && !items.length) return;
    dishTotal += items.length;
    dishSection.appendChild(createCartaAccordion(
      cat.name && cat.name.es ? cat.name.es : cat.id,
      items,
      'dishes',
      cat.id
    ));
  });

  if (!q || dishTotal > 0) container.appendChild(dishSection);

  // SECTION: Vinos
  const wines = (state.wines || []).filter(w => {
    const name = typeof w.name === 'string' ? w.name : (w.name && w.name.es) || '';
    return w.deleted !== true && (!q || name.toLowerCase().includes(q));
  });
  if (!q || wines.length) {
    const wineSection = document.createElement('section');
    wineSection.className = 'carta-collection';
    const wineHeading = document.createElement('h2');
    wineHeading.className = 'carta-collection__title';
    wineHeading.textContent = 'Vinos';
    wineSection.appendChild(wineHeading);
    wineSection.appendChild(createCartaAccordion('Carta de vinos', wines, 'wines'));
    container.appendChild(wineSection);
  }

  // SECTION: Bebidas
  const beverages = (state.beverages || []).filter(b =>
    b.deleted !== true &&
    (!q || (b.name && (b.name.es || '').toLowerCase().includes(q)))
  );
  if (!q || beverages.length) {
    const bevSection = document.createElement('section');
    bevSection.className = 'carta-collection';
    const bevHeading = document.createElement('h2');
    bevHeading.className = 'carta-collection__title';
    bevHeading.textContent = 'Bebidas';
    bevSection.appendChild(bevHeading);
    bevSection.appendChild(createCartaAccordion('Cervezas y refrescos', beverages, 'beverages'));
    container.appendChild(bevSection);
  }

  if (!container.children.length) {
    container.innerHTML = '<p class="empty-state">No se encontraron resultados.</p>';
  }

  const papeleraContainer = document.createElement('div');
  papeleraContainer.id = 'papelera-container';
  container.appendChild(papeleraContainer);
  renderPapelera();
}

function renderPapelera() {
  const container = document.getElementById('papelera-container');
  if (!container || !state) return;
  container.innerHTML = '';

  const deleted = [];
  ['dishes', 'wines', 'beverages'].forEach(col => {
    (state[col] || []).filter(x => x.deleted === true).forEach(item => {
      deleted.push({ item, collection: col });
    });
  });

  const details = document.createElement('details');
  details.className = 'carta-papelera';

  const summary = document.createElement('summary');
  summary.className = 'carta-papelera__summary';
  summary.innerHTML = `<span>Papelera</span><span class="carta-accordion__count">${deleted.length}</span>`;
  details.appendChild(summary);

  if (!deleted.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state empty-state--compact';
    empty.textContent = 'La papelera está vacía.';
    details.appendChild(empty);
  }

  deleted.forEach(({ item, collection }) => {
    const row = document.createElement('div');
    row.className = 'papelera-row';
    row.dataset.id = item.id;
    row.dataset.collection = collection;

    const name = document.createElement('span');
    name.className = 'papelera-row__name';
    name.textContent = getPanelItemName(item);
    row.appendChild(name);

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'btn--ghost btn--small';
    restoreBtn.textContent = 'Restaurar';
    restoreBtn.dataset.papeleraAction = 'restore';
    row.appendChild(restoreBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn--ghost btn--small papelera-row__delete-btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.dataset.papeleraAction = 'delete';
    row.appendChild(deleteBtn);

    details.appendChild(row);
  });

  container.appendChild(details);
}

function createCartaAccordion(label, items, collection, categoryId) {
  const details = document.createElement('details');
  details.className = 'carta-accordion';

  const summary = document.createElement('summary');
  summary.className = 'carta-accordion__summary';
  summary.innerHTML = `<span class="carta-accordion__label">${label}</span><span class="carta-accordion__count">${items.length}</span>`;
  details.appendChild(summary);

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state empty-state--compact';
    empty.textContent = 'Sin elementos en esta sección.';
    details.appendChild(empty);
  } else {
    items.forEach(item => details.appendChild(createCartaCard(item, collection)));
  }

  // ── Inline add form ─────────────────────────────────
  const addForm = document.createElement('form');
  addForm.className = 'carta-add-form';
  addForm.noValidate = true;
  addForm.dataset.collection = collection;
  if (categoryId) addForm.dataset.categoryId = categoryId;

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'carta-add-form__name field-input';
  nameInput.placeholder = 'Nombre (en español)';
  nameInput.required = true;
  addForm.appendChild(nameInput);

  if (collection === 'wines') {
    const gInput = document.createElement('input');
    gInput.type = 'text'; gInput.inputMode = 'decimal';
    gInput.className = 'carta-add-form__price field-input';
    gInput.placeholder = 'Copa';
    gInput.dataset.priceField = 'price_glass';
    addForm.appendChild(gInput);

    const bInput = document.createElement('input');
    bInput.type = 'text'; bInput.inputMode = 'decimal';
    bInput.className = 'carta-add-form__price field-input';
    bInput.placeholder = 'Botella';
    bInput.dataset.priceField = 'price_bottle';
    addForm.appendChild(bInput);
  } else {
    const priceInput = document.createElement('input');
    priceInput.type = 'text';
    priceInput.className = 'carta-add-form__price field-input';
    priceInput.placeholder = 'Precio';
    priceInput.dataset.priceField = 'price';
    addForm.appendChild(priceInput);
  }

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn--primary btn--small';
  submitBtn.textContent = '+ Añadir';
  addForm.appendChild(submitBtn);

  const addError = document.createElement('p');
  addError.className = 'carta-add-form__error';
  addError.hidden = true;
  addForm.appendChild(addError);

  details.appendChild(addForm);

  return details;
}

function createCartaCard(item, collection) {
  const card = document.createElement('article');
  card.className = 'carta-card';
  card.dataset.collection = collection;
  card.dataset.id = item.id;

  // Name — editable
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'carta-card__name-input';
  nameInput.value = getPanelItemName(item);
  nameInput.dataset.cartaAction = 'name';
  nameInput.setAttribute('aria-label', 'Nombre');
  card.appendChild(nameInput);

  // Price — editable
  const priceWrap = document.createElement('div');
  priceWrap.className = 'carta-card__price-wrap';

  if (collection === 'wines') {
    [['price_glass', 'Copa'], ['price_bottle', 'Botella']].forEach(([field, label]) => {
      const lbl = document.createElement('label');
      lbl.className = 'carta-price-label';
      lbl.textContent = label + ' ';
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.className = 'carta-card__price-input';
      input.value = formatPanelEuro(item[field]).replace(' €', '');
      input.dataset.cartaAction = 'price';
      input.dataset.field = field;
      input.setAttribute('aria-label', label + ' de ' + getPanelItemName(item));
      lbl.appendChild(input);
      priceWrap.appendChild(lbl);
    });
  } else {
    const lbl = document.createElement('label');
    lbl.className = 'carta-price-label';
    lbl.textContent = 'Precio ';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'carta-card__price-input';
    input.value = item.price || '';
    input.dataset.cartaAction = 'price';
    input.dataset.field = 'price';
    input.setAttribute('aria-label', 'Precio de ' + getPanelItemName(item));
    lbl.appendChild(input);
    priceWrap.appendChild(lbl);
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
  visibleCheck.setAttribute('aria-label', 'Visible — ' + getPanelItemName(item));
  const visibleSpan = document.createElement('span');
  visibleSpan.textContent = item.available !== false ? 'Visible' : 'Oculto';
  visibleCheck.addEventListener('change', () => {
    visibleSpan.textContent = visibleCheck.checked ? 'Visible' : 'Oculto';
  });
  visibleRow.appendChild(visibleCheck);
  visibleRow.appendChild(visibleSpan);
  card.appendChild(visibleRow);

  // Featured toggle — ONLY shown when item already has a featured value
  if (item.featured && item.featured !== false) {
    const featuredRow = document.createElement('label');
    featuredRow.className = 'carta-card__toggle-row carta-card__toggle-row--featured';
    const featuredCheck = document.createElement('input');
    featuredCheck.type = 'checkbox';
    featuredCheck.className = 'carta-card__toggle';
    featuredCheck.checked = true;
    featuredCheck.dataset.cartaAction = 'featured';
    featuredCheck.dataset.featuredOriginal = String(item.featured);
    featuredCheck.setAttribute('aria-label', 'Destacado — ' + getPanelItemName(item));
    const featuredSpan = document.createElement('span');
    featuredSpan.textContent = 'Destacado';
    featuredRow.appendChild(featuredCheck);
    featuredRow.appendChild(featuredSpan);
    card.appendChild(featuredRow);
  }

  // Category reassignment — dishes and beverages only
  if (collection !== 'wines' && state && state.categories) {
    const colCatType = collection === 'dishes' ? 'food' : 'drink';
    const eligible = state.categories.filter(c => c.type === colCatType);
    if (eligible.length > 1) {
      const catRow = document.createElement('label');
      catRow.className = 'carta-card__cat-row';
      const catSelect = document.createElement('select');
      catSelect.className = 'field-select carta-card__cat-select';
      catSelect.dataset.cartaAction = 'category';
      eligible.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name && cat.name.es ? cat.name.es : cat.id;
        if (cat.id === item.category_id) opt.selected = true;
        catSelect.appendChild(opt);
      });
      catRow.appendChild(catSelect);
      card.appendChild(catRow);
    }
  }

  // Validation slot
  const validation = document.createElement('p');
  validation.className = 'carta-card__validation';
  validation.hidden = true;
  card.appendChild(validation);

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'carta-card__actions';
  const dupBtn = document.createElement('button');
  dupBtn.type = 'button';
  dupBtn.className = 'btn--ghost btn--small';
  dupBtn.dataset.cartaAction = 'duplicate';
  dupBtn.textContent = 'Duplicar';
  const trashBtn = document.createElement('button');
  trashBtn.type = 'button';
  trashBtn.className = 'btn--ghost btn--small carta-card__trash-btn';
  trashBtn.dataset.cartaAction = 'trash';
  trashBtn.textContent = 'Enviar a papelera';
  actions.appendChild(dupBtn);
  actions.appendChild(trashBtn);
  card.appendChild(actions);

  return card;
}

function bindCartaEdit() {
  const searchInput = document.getElementById('search-carta');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderCarta(searchInput.value));
  }

  const container = document.getElementById('carta-list');
  if (!container) return;

  container.addEventListener('change', e => {
    const card = e.target.closest('.carta-card');
    if (!card) return;
    const collection = card.dataset.collection;
    const id = card.dataset.id;
    const item = Array.isArray(state[collection])
      ? state[collection].find(x => x.id === id)
      : null;
    if (!item) return;

    const action = e.target.dataset.cartaAction;
    const validation = card.querySelector('.carta-card__validation');

    if (action === 'price') {
      const field = e.target.dataset.field;
      const raw = e.target.value.trim();
      if (!raw) {
        validation.textContent = 'El precio no puede estar vacío.';
        validation.hidden = false;
        return;
      }
      if (item.price_status === 'uncertain') {
        validation.textContent = 'Este precio necesita confirmación — contacta con el administrador.';
        validation.hidden = false;
        return;
      }
      validation.hidden = true;
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

    if (action === 'name') {
      const raw = e.target.value.trim();
      if (!raw) {
        validation.textContent = 'El nombre no puede estar vacío.';
        validation.hidden = false;
        return;
      }
      validation.hidden = true;
      if (item.name && typeof item.name === 'object') {
        item.name.es = raw;
      } else {
        item.name = raw;
      }
      markDirty();
    }

    if (action === 'category') {
      item.category_id = e.target.value;
      markDirty();
      renderCarta(document.getElementById('search-carta')?.value || '');
    }
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-carta-action]');
    if (!btn) return;
    const card = btn.closest('.carta-card');
    if (!card) return;
    const { collection, id } = card.dataset;
    const action = btn.dataset.cartaAction;

    if (action === 'duplicate') {
      if (duplicatePanelItem(state, collection, id)) {
        markDirty();
        renderCarta(document.getElementById('search-carta')?.value || '');
      }
      return;
    }

    if (action === 'trash') {
      softDeletePanelItem(state, collection, id);
      markDirty();
      renderCarta(document.getElementById('search-carta')?.value || '');
      if (typeof renderPapelera === 'function') renderPapelera();
      return;
    }
  });

  const cartaList = document.getElementById('carta-list');
  if (cartaList) {
    cartaList.addEventListener('click', e => {
      const btn = e.target.closest('[data-papelera-action]');
      if (!btn) return;
      const row = btn.closest('.papelera-row');
      if (!row) return;
      const { collection, id } = row.dataset;
      const action = btn.dataset.papeleraAction;

      if (action === 'restore') {
        restorePanelItem(state, collection, id);
        markDirty();
        renderCarta(document.getElementById('search-carta')?.value || '');
        return;
      }

      if (action === 'delete') {
        if (!btn.dataset.confirmPending) {
          btn.dataset.confirmPending = '1';
          btn.textContent = '¿Confirmar?';
          btn.classList.add('papelera-row__delete-btn--confirm');
          setTimeout(() => {
            if (btn.dataset.confirmPending) {
              delete btn.dataset.confirmPending;
              btn.textContent = 'Eliminar';
              btn.classList.remove('papelera-row__delete-btn--confirm');
            }
          }, 4000);
          return;
        }
        hardDeletePanelItem(state, collection, id);
        markDirty();
        renderCarta(document.getElementById('search-carta')?.value || '');
      }
    });
  }

  container.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target.closest('.carta-add-form');
    if (!form) return;
    const collection = form.dataset.collection;

    const nameEl = form.querySelector('.carta-add-form__name');
    const name = (nameEl?.value || '').trim();
    if (!name) {
      const err = form.querySelector('.carta-add-form__error');
      if (err) { err.textContent = 'El nombre es obligatorio.'; err.hidden = false; }
      nameEl?.focus();
      return;
    }

    const values = { name, category_id: form.dataset.categoryId || '' };
    form.querySelectorAll('[data-price-field]').forEach(el => {
      values[el.dataset.priceField] = el.value.trim();
    });

    const existingIds = (state[collection] || []).map(x => x.id);
    const newItem = createPanelItem(collection, values, existingIds);
    newItem.available = false; // owner must explicitly mark visible before publication
    newItem.featured = false;
    addPanelItem(state, collection, newItem);
    markDirty();

    form.reset();
    const err = form.querySelector('.carta-add-form__error');
    if (err) err.hidden = true;

    renderCarta(document.getElementById('search-carta')?.value || '');
  });
}

function getPanelItemName(item) {
  if (!item) return '';
  if (item.name && typeof item.name === 'object') return item.name.es || item.id || '';
  return item.name || item.id || '';
}

function getPanelCollectionItem(collection, id) {
  return Array.isArray(state && state[collection])
    ? state[collection].find(item => item.id === id)
    : null;
}

function formatPanelEuro(value) {
  if (typeof value === 'number') return value.toFixed(2).replace('.', ',') + ' €';
  return value || '';
}

function parsePanelEuro(value) {
  const normalized = String(value).replace(/[^\d,.]/g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : value;
}

function slugifyPanelId(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

function uniquePanelId(baseId, existingIds) {
  const ids = existingIds instanceof Set ? existingIds : new Set(existingIds || []);
  if (!ids.has(baseId)) return baseId;
  let i = 2;
  while (ids.has(`${baseId}-${i}`)) i += 1;
  return `${baseId}-${i}`;
}

function createPanelItem(collection, values, existingIds) {
  const name = String(values && values.name ? values.name : '').trim();
  const id = uniquePanelId(slugifyPanelId(name), existingIds);
  const nameField = { es: name, en: '', fr: '' };

  if (collection === 'wines') {
    return {
      id,
      name: nameField,
      type: values.type || '',
      region: values.region || '',
      price_glass: parsePanelEuro(values.price_glass || values.price || ''),
      price_bottle: parsePanelEuro(values.price_bottle || ''),
      price_status: 'pending',
      available: true,
      allergens: [],
    };
  }

  if (collection === 'beverages') {
    return {
      id,
      name: nameField,
      price: values.price || '',
      category_id: values.category_id || '',
      price_status: 'pending',
      available: true,
      allergens: [],
    };
  }

  return {
    id,
    name: nameField,
    description: { es: '', en: '', fr: '' },
    price: values.price || '',
    category_id: values.category_id || '',
    price_status: 'pending',
    allergen_status: 'pending',
    allergens_confirmed: [],
    available: true,
    allergens: [],
  };
}

function addPanelItem(panelState, collection, item) {
  if (!panelState[collection]) panelState[collection] = [];
  panelState[collection].push(item);
  return item;
}

function deletePanelItem(panelState, collection, id) {
  if (!Array.isArray(panelState[collection])) return false;
  const before = panelState[collection].length;
  panelState[collection] = panelState[collection].filter(item => item.id !== id);
  return panelState[collection].length !== before;
}

function setPanelItemAvailable(panelState, collection, id, available) {
  const item = Array.isArray(panelState[collection])
    ? panelState[collection].find(entry => entry.id === id)
    : null;
  if (!item) return false;
  item.available = available;
  return true;
}

function softDeletePanelItem(panelState, collection, id) {
  const item = (panelState[collection] || []).find(x => x.id === id);
  if (!item) return false;
  item.deleted = true;
  item.available = false;
  return true;
}

function restorePanelItem(panelState, collection, id) {
  const item = (panelState[collection] || []).find(x => x.id === id);
  if (!item) return false;
  delete item.deleted;
  item.available = false; // restored items stay hidden; owner must explicitly make visible
  return true;
}

function hardDeletePanelItem(panelState, collection, id) {
  return deletePanelItem(panelState, collection, id);
}

function duplicatePanelItem(panelState, collection, id) {
  const arr = panelState[collection] || [];
  const original = arr.find(x => x.id === id);
  if (!original) return null;
  const existingIds = arr.map(x => x.id);
  const copy = JSON.parse(JSON.stringify(original));
  delete copy.deleted;
  copy.available = false; // must be explicitly made visible before publication
  copy.featured = false;
  const baseName = getPanelItemName(original);
  copy.id = uniquePanelId(slugifyPanelId(baseName + '-copia'), existingIds);
  if (copy.name && typeof copy.name === 'object') {
    copy.name = { es: (copy.name.es || '') + ' (copia)', en: copy.name.en || '', fr: copy.name.fr || '' };
  } else {
    copy.name = String(copy.name || '') + ' (copia)';
  }
  panelState[collection].push(copy);
  return copy;
}

function validateState(panelState) {
  const errors = [];
  const allIds = [];
  const catTypeMap = {};
  (panelState.categories || []).forEach(c => { catTypeMap[c.id] = c.type; });
  const validCatIds = new Set(Object.keys(catTypeMap));
  const colCatType = { dishes: 'food', wines: 'wine', beverages: 'drink' };

  ['dishes', 'wines', 'beverages'].forEach(col => {
    (panelState[col] || []).forEach(item => {
      if (allIds.includes(item.id)) {
        errors.push(`ID duplicado: "${item.id}" en ${col}`);
      } else {
        allIds.push(item.id);
      }
      const name = getPanelItemName(item);
      if (!name) errors.push(`Elemento sin nombre en ${col} (id: ${item.id || '?'})`);
      if (col === 'wines') {
        if (!item.price_glass && !item.price_bottle)
          errors.push(`Vino sin precio (id: ${item.id})`);
      } else {
        if (!item.price) errors.push(`Sin precio (id: ${item.id}) en ${col}`);
      }
      if (item.category_id) {
        if (!validCatIds.has(item.category_id)) {
          errors.push(`Categoría inexistente "${item.category_id}" (id: ${item.id})`);
        } else if (catTypeMap[item.category_id] !== colCatType[col]) {
          errors.push(`Categoría de tipo incorrecto para ${col} (id: ${item.id})`);
        }
      }
    });
  });
  return errors.length ? { ok: false, errors } : { ok: true, errors: [] };
}

function setPanelItemAllergen(panelState, collection, id, allergenId, present) {
  const item = Array.isArray(panelState[collection])
    ? panelState[collection].find(entry => entry.id === id)
    : null;
  if (!item || !allergenId) return false;
  if (!Array.isArray(item.allergens)) item.allergens = [];
  const next = new Set(item.allergens);
  if (present) next.add(allergenId);
  else next.delete(allergenId);
  item.allergens = Array.from(next);
  return true;
}

function splitPanelListText(value) {
  return String(value || '')
    .split(/\s*·\s*|\n+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function joinPanelListItems(items) {
  return (items || [])
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .join(' · ');
}

function updatePanelPrice(type, id, field, value) {
  if (!state) return;
  const collections = {
    dish: state.dishes || [],
    wine: state.wines || [],
    beverage: state.beverages || [],
  };
  const item = (collections[type] || []).find(entry => entry.id === id);
  if (!item) return;
  item[field] = type === 'wine' ? parsePanelEuro(value) : value;
}

// ══════════════════════════════════════════════════════════════
// TAB: HORARIOS
// ══════════════════════════════════════════════════════════════

const DAY_NAMES = {
  monday:    'Lunes',
  tuesday:   'Martes',
  wednesday: 'Miércoles',
  thursday:  'Jueves',
  friday:    'Viernes',
  saturday:  'Sábado',
  sunday:    'Domingo',
};

function renderHorarios() {
  const container = document.getElementById('horarios-list');
  if (!container || !state || !state.hours) return;

  container.innerHTML = '';

  const schedule = Array.isArray(state.hours) ? state.hours : (state.hours.schedule || []);
  schedule.forEach((dayData, index) => {
    const card = document.createElement('div');
    card.className = 'hours-card';
    card.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'hours-card__header';

    const dayName = document.createElement('span');
    dayName.className = 'hours-card__day';
    dayName.textContent = DAY_NAMES[dayData.day] || dayData.day;

    const toggle = createToggle(
      `hours-toggle-${index}`,
      dayData.status !== 'closed',
      (checked) => {
        schedule[index].status = checked ? 'open' : 'closed';
        renderHorarios();
        markDirty();
      }
    );

    header.appendChild(dayName);
    header.appendChild(toggle);
    card.appendChild(header);

    if (dayData.status !== 'closed') {
      const periodsWrap = document.createElement('div');
      periodsWrap.className = 'hours-periods';

      (dayData.periods || []).forEach((period, pIndex) => {
        const periodRow = createPeriodRow(schedule, index, pIndex, period);
        periodsWrap.appendChild(periodRow);
      });

      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn--ghost btn--small hours-add-period';
      addBtn.textContent = '+ Añadir franja horaria';
      addBtn.addEventListener('click', () => {
        schedule[index].periods.push({ open: '13:00', close: '16:00' });
        renderHorarios();
        markDirty();
      });

      periodsWrap.appendChild(addBtn);
      card.appendChild(periodsWrap);
    }

    container.appendChild(card);
  });
}

function createPeriodRow(schedule, dayIndex, pIndex, period) {
  const row = document.createElement('div');
  row.className = 'period-row';

  const openInput  = createTimeInput(period.open,  val => {
    schedule[dayIndex].periods[pIndex].open = val;
    markDirty();
  });
  const sep = document.createElement('span');
  sep.className = 'period-sep';
  sep.textContent = '—';
  const closeInput = createTimeInput(period.close, val => {
    schedule[dayIndex].periods[pIndex].close = val;
    markDirty();
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'period-remove';
  removeBtn.setAttribute('aria-label', 'Eliminar esta franja');
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => {
    schedule[dayIndex].periods.splice(pIndex, 1);
    if (schedule[dayIndex].periods.length === 0) {
      schedule[dayIndex].status = 'closed';
    }
    renderHorarios();
    markDirty();
  });

  row.appendChild(openInput);
  row.appendChild(sep);
  row.appendChild(closeInput);
  row.appendChild(removeBtn);
  return row;
}

function createTimeInput(value, onChange) {
  const input = document.createElement('input');
  input.type = 'time';
  input.value = value || '';
  input.className = 'time-input';
  input.addEventListener('change', () => onChange(input.value));
  return input;
}

// ── Excepciones de horario ────────────────────────────────────

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

  // Date picker
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'field-input exception-date';
  dateInput.value = exc.date || '';
  dateInput.setAttribute('aria-label', 'Fecha de la excepción');
  dateInput.addEventListener('change', () => {
    const liveIndex = parseInt(row.dataset.index, 10);
    const newDate = dateInput.value;
    const duplicate = state.hours.exceptions.some((e, i) => i !== liveIndex && e.date === newDate);
    if (duplicate) {
      showError('Ya existe una excepción para esa fecha. Elige otra fecha.');
      dateInput.value = state.hours.exceptions[liveIndex].date || ''; // revert
      return;
    }
    state.hours.exceptions[liveIndex].date = newDate;
    markDirty();
  });

  // Status select
  const statusSelect = document.createElement('select');
  statusSelect.className = 'field-select exception-status';
  statusSelect.setAttribute('aria-label', 'Estado de la excepción');
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
    const liveIndex = parseInt(row.dataset.index, 10);
    state.hours.exceptions[liveIndex].status = statusSelect.value;
    if (statusSelect.value === 'open' && !Array.isArray(state.hours.exceptions[liveIndex].periods)) {
      state.hours.exceptions[liveIndex].periods = [{ open: '13:00', close: '16:00' }];
    }
    renderExceptions();
    markDirty();
  });

  // Label input (Spanish only)
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'field-input exception-label';
  labelInput.placeholder = 'Motivo (ej: Feria de Granada)';
  labelInput.value = exc.label && exc.label.es ? exc.label.es : '';
  labelInput.setAttribute('aria-label', 'Motivo del cierre o apertura especial');
  labelInput.addEventListener('change', () => {
    const liveIndex = parseInt(row.dataset.index, 10);
    if (!state.hours.exceptions[liveIndex].label) state.hours.exceptions[liveIndex].label = {};
    state.hours.exceptions[liveIndex].label.es = labelInput.value.trim();
    markDirty();
  });

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'exception-remove';
  removeBtn.textContent = '✕';
  removeBtn.setAttribute('aria-label', 'Eliminar esta excepción');
  removeBtn.addEventListener('click', () => {
    const liveIndex = parseInt(row.dataset.index, 10);
    state.hours.exceptions.splice(liveIndex, 1);
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
        // Validate close > open
        const p = state.hours.exceptions[index].periods[pIndex];
        if (p.close && p.close <= val) {
          showError('La hora de cierre debe ser posterior a la de apertura.');
        }
        markDirty();
      });
      const sep = document.createElement('span');
      sep.className = 'period-sep';
      sep.textContent = '—';
      const closeInput = createTimeInput(period.close, val => {
        const p = state.hours.exceptions[index].periods[pIndex];
        if (p.open && val <= p.open) {
          showError('La hora de cierre debe ser posterior a la de apertura.');
        }
        state.hours.exceptions[index].periods[pIndex].close = val;
        markDirty();
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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().slice(0, 10);

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

// ══════════════════════════════════════════════════════════════
// TAB: MENÚ DEL DÍA
// ══════════════════════════════════════════════════════════════

function renderMenuDelDia() {
  if (!state) return;
  const m = state.daily_menu || {};

  const activeEl   = document.getElementById('menu-active');
  const priceEl    = document.getElementById('menu-price');
  const mainsList  = document.getElementById('menu-mains-list');

  if (activeEl)   activeEl.checked    = m.active === true;
  if (priceEl)    priceEl.value       = m.price != null ? Number(m.price).toFixed(2).replace('.', ',') : '';

  renderDailyMenuList('starters', 'menu-starters-list', 'Añadir primero');
  renderDailyMenuList('seconds', 'menu-seconds-list', 'Añadir segundo');
  renderDailyMenuList('desserts', 'menu-desserts-list', 'Añadir postre');
  renderDailyMenuList('seasonal', 'menu-seasonal-list', 'Añadir nota');

  if (!mainsList) return;
  mainsList.innerHTML = '';
  const days = Array.isArray(m.days) ? m.days : [];
  const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const todayKey = dayKeys[new Date().getDay()];

  days.forEach(day => {
    const existing = Array.isArray(m.mains)
      ? m.mains.find(x => x.day === day)
      : null;

    const isToday = (day === todayKey);
    const row = document.createElement('div');
    row.className = 'menu-main-row' + (isToday ? ' menu-main-row--today' : '');

    const label = document.createElement('span');
    label.className = 'menu-main-day';
    label.textContent = (DAY_NAMES[day] || day) + (isToday ? ' (hoy)' : '');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'field-input menu-main-input';
    input.value = (existing && existing.name && existing.name.es) || '';
    input.placeholder = 'Plato del día';
    input.dataset.day = day;
    input.setAttribute('aria-label', `Plato del día ${DAY_NAMES[day] || day}`);

    input.addEventListener('change', () => {
      if (!state.daily_menu.mains) state.daily_menu.mains = [];
      const entry = state.daily_menu.mains.find(x => x.day === day);
      if (entry) {
        entry.name.es = input.value.trim();
      } else {
        state.daily_menu.mains.push({ day, name: { es: input.value.trim(), en: '', fr: '' } });
      }
      markDailyMenuTextDirty();
    });

    row.appendChild(label);
    row.appendChild(input);
    mainsList.appendChild(row);
  });
}

function ensureDailyMenuField(field) {
  if (!state.daily_menu) state.daily_menu = {};
  if (!state.daily_menu[field] || typeof state.daily_menu[field] !== 'object') {
    state.daily_menu[field] = { es: '', en: '', fr: '' };
  }
  return state.daily_menu[field];
}

function getDailyMenuItems(field) {
  const data = ensureDailyMenuField(field);
  const val = data.es;
  if (Array.isArray(val)) return [...val];
  return splitPanelListText(val || ''); // backward compat
}

function setDailyMenuItems(field, items) {
  const data = ensureDailyMenuField(field);
  data.es = items.filter(Boolean); // always write as array
  markDailyMenuTextDirty();
}

function renderDailyMenuList(field, containerId, addLabel) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = getDailyMenuItems(field);
  container.innerHTML = '';

  const rows = document.createElement('div');
  rows.className = 'daily-edit-list__rows';

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state empty-state--compact';
    empty.textContent = 'Sin elementos.';
    rows.appendChild(empty);
  }

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'daily-edit-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'field-input daily-edit-input';
    input.value = item;
    input.dataset.menuAction = 'update';
    input.dataset.menuField = field;
    input.dataset.index = String(index);
    input.setAttribute('aria-label', item || 'Elemento del menú');

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'daily-edit-delete';
    remove.dataset.menuAction = 'delete';
    remove.dataset.menuField = field;
    remove.dataset.index = String(index);
    remove.textContent = 'Borrar';

    row.appendChild(input);
    row.appendChild(remove);
    rows.appendChild(row);
  });

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'btn btn--ghost btn--small daily-edit-add';
  add.dataset.menuAction = 'add';
  add.dataset.menuField = field;
  add.textContent = `+ ${addLabel}`;

  container.appendChild(rows);
  container.appendChild(add);
}

function bindMenuDelDia() {
  const fields = [
    {
      id: 'menu-active',
      event: 'change',
      handler: e => {
        if (!state.daily_menu) state.daily_menu = {};
        state.daily_menu.active = e.target.checked;
        markDirty();
      },
    },
    {
      id: 'menu-price',
      event: 'change',
      handler: e => {
        if (!state.daily_menu) state.daily_menu = {};
        const raw = e.target.value.replace(',', '.').replace(/[^\d.]/g, '');
        const num = parseFloat(raw);
        state.daily_menu.price = isFinite(num) ? num : state.daily_menu.price;
        markDirty();
      },
    },
  ];

  fields.forEach(({ id, event, handler }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  });

  const menuPanel = document.querySelector('.menu-panel');
  if (!menuPanel) return;

  menuPanel.addEventListener('click', e => {
    const control = e.target.closest('[data-menu-action]');
    if (!control) return;
    const action = control.dataset.menuAction;
    const field = control.dataset.menuField;
    if (!field) return;

    const items = getDailyMenuItems(field);
    if (action === 'add') {
      const value = window.prompt('Nuevo elemento:');
      if (!value || !value.trim()) return;
      items.push(value.trim());
      setDailyMenuItems(field, items);
      renderMenuDelDia();
    }

    if (action === 'delete') {
      const index = Number(control.dataset.index);
      if (!Number.isInteger(index)) return;
      items.splice(index, 1);
      setDailyMenuItems(field, items);
      renderMenuDelDia();
    }
  });

  menuPanel.addEventListener('change', e => {
    const input = e.target.closest('[data-menu-action="update"]');
    if (!input) return;
    const field = input.dataset.menuField;
    const index = Number(input.dataset.index);
    if (!field || !Number.isInteger(index)) return;
    const items = getDailyMenuItems(field);
    items[index] = input.value.trim();
    setDailyMenuItems(field, items);
  });
}

function copySpanishFallback(field) {
  if (!field || typeof field !== 'object') return;
  const es = field.es;
  if (Array.isArray(es)) {
    if (!Array.isArray(field.en) || !field.en.length) field.en = [...es];
    if (!Array.isArray(field.fr) || !field.fr.length) field.fr = [...es];
  } else {
    const str = typeof es === 'string' ? es.trim() : '';
    if (!field.en) field.en = str;
    if (!field.fr) field.fr = str;
  }
}

function syncDailyMenuFallbackTranslations() {
  if (!state || !state.daily_menu) return;
  const m = state.daily_menu;

  copySpanishFallback(m.starters);
  copySpanishFallback(m.seconds);
  copySpanishFallback(m.desserts);
  copySpanishFallback(m.seasonal);

  if (Array.isArray(m.mains)) {
    m.mains.forEach(entry => copySpanishFallback(entry && entry.name));
  }
}

// ══════════════════════════════════════════════════════════════
// TAB: AVISO
// ══════════════════════════════════════════════════════════════

function renderAviso() {
  if (!state) return;

  const notice = state.venue && state.venue.notice ? state.venue.notice : {};
  const active = state.venue && state.venue.notice_active ? state.venue.notice_active : false;
  const expiry = state.venue && state.venue.notice_expiry ? state.venue.notice_expiry : '';

  const activeToggle = document.getElementById('aviso-active');
  if (activeToggle) activeToggle.checked = active;

  const textEs = document.getElementById('aviso-texto-es');
  const textEn = document.getElementById('aviso-texto-en');
  const textFr = document.getElementById('aviso-texto-fr');
  const expiryInput = document.getElementById('aviso-expiry');

  if (textEs)    textEs.value    = notice.es || '';
  if (textEn)    textEn.value    = notice.en || '';
  if (textFr)    textFr.value    = notice.fr || '';
  if (expiryInput) expiryInput.value = expiry;
}

function bindAvisoEvents() {
  const fields = [
    { id: 'aviso-active',   handler: e => {
      if (!state.venue) state.venue = {};
      state.venue.notice_active = e.target.checked;
      markDirty();
    }},
    { id: 'aviso-texto-es',  handler: e => {
      if (!state.venue) state.venue = {};
      if (!state.venue.notice) state.venue.notice = {};
      state.venue.notice.es = e.target.value;
      markDirty();
    }},
    { id: 'aviso-texto-en',  handler: e => {
      if (!state.venue) state.venue = {};
      if (!state.venue.notice) state.venue.notice = {};
      state.venue.notice.en = e.target.value;
      markDirty();
    }},
    { id: 'aviso-texto-fr',  handler: e => {
      if (!state.venue) state.venue = {};
      if (!state.venue.notice) state.venue.notice = {};
      state.venue.notice.fr = e.target.value;
      markDirty();
    }},
    { id: 'aviso-expiry', handler: e => {
      if (!state.venue) state.venue = {};
      state.venue.notice_expiry = e.target.value;
      markDirty();
    }},
  ];

  fields.forEach(({ id, handler }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', handler);
  });
}

// ══════════════════════════════════════════════════════════════
// TAB: CARIOCA
// ══════════════════════════════════════════════════════════════

function bindCariocaEvents() {
  const fileInput   = document.getElementById('carioca-file');
  const removeBtn   = document.getElementById('carioca-remove');
  const uploadArea  = document.getElementById('upload-area');

  if (!fileInput) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // Rechazar HEIC
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heif') {
      showError('Usa una foto de tu carrete (no de la cámara directamente). Toca "Elegir foto" y selecciona desde el álbum.');
      fileInput.value = '';
      return;
    }

    // Límite de tamaño: 10 MB antes de redimensionar
    if (file.size > 10 * 1024 * 1024) {
      showError('La imagen es demasiado grande (máximo 10 MB).');
      fileInput.value = '';
      return;
    }

    try {
      const resized = await resizeImage(file);
      cariocaFile = resized;
      showCariocaPreview(resized);
      markDirty();
      const reminder = document.getElementById('save-bar-reminder');
      if (reminder) reminder.hidden = false;
    } catch (err) {
      showError('No se pudo procesar la imagen. Prueba con otro archivo.');
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      cariocaFile = null;
      fileInput.value = '';
      const previewWrap = document.getElementById('carioca-preview-wrap');
      if (previewWrap) previewWrap.hidden = true;
      const reminder = document.getElementById('save-bar-reminder');
      if (reminder) reminder.hidden = true;
    });
  }

  // Arrastrar y soltar sobre la zona de carga
  if (uploadArea) {
    uploadArea.addEventListener('dragover', e => {
      e.preventDefault();
      uploadArea.classList.add('upload-area--over');
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('upload-area--over');
    });
    uploadArea.addEventListener('drop', e => {
      e.preventDefault();
      uploadArea.classList.remove('upload-area--over');
      const file = e.dataTransfer.files[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
  }

  const list = document.getElementById('cariocas-list');
  if (list) {
    list.addEventListener('change', e => {
      const input = e.target.closest('[data-carioca-action="active"]');
      if (!input || !Array.isArray(state.cariocas)) return;
      const index = Number(input.dataset.index);
      if (!Number.isInteger(index) || !state.cariocas[index]) return;
      state.cariocas[index].active = input.checked;
      markDirty();
    });

    list.addEventListener('click', e => {
      const btn = e.target.closest('[data-carioca-action="delete"]');
      if (!btn || !Array.isArray(state.cariocas)) return;
      const index = Number(btn.dataset.index);
      const item = state.cariocas[index];
      if (!item) return;
      const caption = item.caption && item.caption.es ? item.caption.es : item.id;
      if (!window.confirm(`¿Borrar la foto "${caption}" del panel?`)) return;
      state.cariocas.splice(index, 1);
      renderCariocas();
      markDirty();
    });
  }
}

function renderCariocas() {
  const container = document.getElementById('cariocas-list');
  if (!container || !state) return;

  const items = Array.isArray(state.cariocas) ? state.cariocas : [];
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<p class="empty-state empty-state--compact">No hay fotos publicadas todavía.</p>';
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement('article');
    row.className = 'carioca-item';

    const image = document.createElement('img');
    image.className = 'carioca-item__img';
    image.src = normalizePanelImagePath(item.image || item.src || '');
    image.alt = item.caption && item.caption.es ? item.caption.es : 'Foto de Bar León';
    image.loading = 'lazy';

    const body = document.createElement('div');
    body.className = 'carioca-item__body';
    const caption = document.createElement('p');
    caption.className = 'carioca-item__caption';
    caption.textContent = item.caption && item.caption.es ? item.caption.es : item.id || 'Foto sin descripción';
    const meta = document.createElement('p');
    meta.className = 'carioca-item__meta';
    meta.textContent = item.context ? `Sección: ${item.context}` : 'Sin sección';
    body.appendChild(caption);
    body.appendChild(meta);

    const controls = document.createElement('div');
    controls.className = 'carioca-item__controls';

    const activeLabel = document.createElement('label');
    activeLabel.className = 'catalog-active';
    activeLabel.innerHTML = '<span>Visible</span>';
    const active = document.createElement('input');
    active.type = 'checkbox';
    active.checked = item.active !== false;
    active.dataset.cariocaAction = 'active';
    active.dataset.index = String(index);
    activeLabel.appendChild(active);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'catalog-delete';
    del.dataset.cariocaAction = 'delete';
    del.dataset.index = String(index);
    del.textContent = 'Borrar';

    controls.appendChild(activeLabel);
    controls.appendChild(del);

    row.appendChild(image);
    row.appendChild(body);
    row.appendChild(controls);
    container.appendChild(row);
  });
}

function normalizePanelImagePath(path) {
  return String(path || '').replace(/^\.\.\//, '/');
}

function showCariocaPreview(file) {
  const previewWrap = document.getElementById('carioca-preview-wrap');
  const preview = document.getElementById('carioca-preview');
  if (!previewWrap || !preview) return;

  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.onload = () => URL.revokeObjectURL(url);
  previewWrap.hidden = false;
}

// Redimensiona imágenes mayores de 1 MB a max 1200 px de ancho
async function resizeImage(file, maxWidth = 1200, maxBytes = 1024 * 1024) {
  if (file.size <= maxBytes) return file;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, maxWidth / img.width);
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) { reject(new Error('canvas.toBlob falló')); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error al cargar imagen')); };
    img.src = url;
  });
}

// Sube la imagen al servidor y devuelve la ruta relativa
async function uploadCariocaImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);

  const resp = await fetch('/upload-image', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Error subiendo imagen: ${errText}`);
  }

  const { path } = await resp.json();
  return path;
}

// Construye un objeto carioca a partir del formulario
function buildCariocaFromForm(imagePath) {
  return {
    id: `carioca-${Date.now()}`,
    image: imagePath,
    caption: {
      es: document.getElementById('carioca-caption-es')?.value.trim() || '',
      en: document.getElementById('carioca-caption-en')?.value.trim() || '',
      fr: document.getElementById('carioca-caption-fr')?.value.trim() || '',
    },
    context:  document.getElementById('carioca-context')?.value || 'homepage',
    active:   document.getElementById('carioca-active')?.checked ?? true,
    added_at: new Date().toISOString().slice(0, 10),
  };
}

// ══════════════════════════════════════════════════════════════
// TAB: PIZARRA (CARTA BARRA)
// ══════════════════════════════════════════════════════════════

const PIZARRA_GROUPS = [
  { key: 'group1', label: 'Grupo 1 — Carnes y casquería' },
  { key: 'group2', label: 'Grupo 2 — Pescados y verduras' },
];

function renderPizarra() {
  const container = document.getElementById('pizarra-list');
  if (!container || !state) return;

  const cb = state.chalkboard || {};
  container.innerHTML = '';

  PIZARRA_GROUPS.forEach(({ key, label }) => {
    const items = Array.isArray(cb[key]) ? cb[key] : [];

    const section = document.createElement('section');
    section.className = 'catalog-section';
    section.dataset.pizarraGroup = key;

    const header = document.createElement('div');
    header.className = 'catalog-section__header';
    header.innerHTML = `<div>
      <h2 class="catalog-section__title">${label}</h2>
      <p class="catalog-section__count">${items.length} platos</p>
    </div>`;

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--ghost btn--small catalog-add-btn';
    addBtn.dataset.pizarraAction = 'add';
    addBtn.dataset.group = key;
    addBtn.textContent = '+ Añadir';
    addBtn.setAttribute('aria-label', `Añadir plato en ${label}`);
    header.appendChild(addBtn);
    section.appendChild(header);

    const list = document.createElement('div');
    list.className = 'catalog-list';

    if (items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state empty-state--compact';
      empty.textContent = 'Todavía no hay platos en este grupo.';
      list.appendChild(empty);
    }

    items.forEach((item, idx) => {
      list.appendChild(createPizarraRow(key, item, idx));
    });

    section.appendChild(list);
    container.appendChild(section);
  });
}

function createPizarraRow(groupKey, item, idx) {
  const row = document.createElement('div');
  row.className = 'pizarra-row';
  row.dataset.group = groupKey;
  row.dataset.idx = String(idx);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'field-input pizarra-name-input';
  nameInput.value = item.es || '';
  nameInput.dataset.pizarraAction = 'name';
  nameInput.dataset.group = groupKey;
  nameInput.dataset.idx = String(idx);
  nameInput.setAttribute('aria-label', 'Nombre del plato');
  nameInput.placeholder = 'Nombre del plato';

  const prices = document.createElement('div');
  prices.className = 'pizarra-row__prices';

  const mediaLabel = document.createElement('label');
  mediaLabel.className = 'pizarra-price-label';
  mediaLabel.innerHTML = '<span>½ Media</span>';
  const mediaInput = document.createElement('input');
  mediaInput.type = 'text';
  mediaInput.className = 'field-input pizarra-price-input';
  mediaInput.value = item.media || '';
  mediaInput.dataset.pizarraAction = 'media';
  mediaInput.dataset.group = groupKey;
  mediaInput.dataset.idx = String(idx);
  mediaInput.setAttribute('aria-label', 'Precio media');
  mediaInput.placeholder = '—';
  mediaLabel.appendChild(mediaInput);

  const racionLabel = document.createElement('label');
  racionLabel.className = 'pizarra-price-label';
  racionLabel.innerHTML = '<span>Ración</span>';
  const racionInput = document.createElement('input');
  racionInput.type = 'text';
  racionInput.className = 'field-input pizarra-price-input';
  racionInput.value = item.racion || '';
  racionInput.dataset.pizarraAction = 'racion';
  racionInput.dataset.group = groupKey;
  racionInput.dataset.idx = String(idx);
  racionInput.setAttribute('aria-label', 'Precio ración');
  racionInput.placeholder = '—';
  racionLabel.appendChild(racionInput);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'catalog-delete';
  deleteBtn.dataset.pizarraAction = 'delete';
  deleteBtn.dataset.group = groupKey;
  deleteBtn.dataset.idx = String(idx);
  deleteBtn.textContent = 'Borrar';
  deleteBtn.setAttribute('aria-label', `Borrar ${item.es || 'plato'}`);

  prices.appendChild(mediaLabel);
  prices.appendChild(racionLabel);
  prices.appendChild(deleteBtn);

  row.appendChild(nameInput);
  row.appendChild(prices);
  return row;
}

function bindPizarraEvents() {
  const container = document.getElementById('pizarra-list');
  if (!container) return;

  container.addEventListener('input', e => {
    const el = e.target;
    const action = el.dataset.pizarraAction;
    if (!action) return;

    const group = el.dataset.group;
    const idx = parseInt(el.dataset.idx, 10);
    if (!state.chalkboard || !Array.isArray(state.chalkboard[group])) return;
    const item = state.chalkboard[group][idx];
    if (!item) return;

    if (action === 'name') {
      item.es = el.value;
    } else if (action === 'media') {
      item.media = el.value.trim() || null;
    } else if (action === 'racion') {
      item.racion = el.value.trim() || null;
    }
    markDirty();
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-pizarra-action]');
    if (!btn || btn.tagName === 'INPUT') return;

    const action = btn.dataset.pizarraAction;
    const group = btn.dataset.group;

    if (action === 'add') {
      if (!state.chalkboard) state.chalkboard = { group1: [], group2: [] };
      if (!Array.isArray(state.chalkboard[group])) state.chalkboard[group] = [];
      state.chalkboard[group].push({ es: '', en: '', fr: '', media: null, racion: null });
      renderPizarra();
      markDirty();
      const section = container.querySelector(`[data-pizarra-group="${group}"]`);
      const newInput = section && section.querySelector('.pizarra-row:last-child .pizarra-name-input');
      if (newInput) newInput.focus();
      return;
    }

    if (action === 'delete') {
      const idx = parseInt(btn.dataset.idx, 10);
      const itemName = (state.chalkboard[group] || [])[idx]?.es || 'este plato';
      if (!confirm(`¿Eliminar "${itemName}"?`)) return;
      state.chalkboard[group].splice(idx, 1);
      renderPizarra();
      markDirty();
    }
  });
}

// ══════════════════════════════════════════════════════════════
// GUARDAR
// ══════════════════════════════════════════════════════════════

let dirty = false;

function markDirty() {
  dirty = true;
  const statusEl = document.getElementById('save-status');
  if (statusEl) statusEl.textContent = 'Cambios sin guardar';
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.disabled = false;
  // Hide undo once new edits are made — the snapshot is stale
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) undoBtn.hidden = true;
  if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
}

function markDailyMenuTextDirty() {
  dailyMenuTextDirty = true;
  markDirty();
}

async function saveAll() {
  const token = getToken();
  if (!token) {
    clearToken();
    showAuthScreen();
    return;
  }

  // E. Advertencia antes de publicar un aviso vacío
  const avisoActive = document.getElementById('aviso-active')?.checked;
  const avisoTextoEs = document.getElementById('aviso-texto-es')?.value.trim();
  if (avisoActive && !avisoTextoEs) {
    const confirmSave = confirm('El aviso está activado pero no tiene texto en español. ¿Quieres publicarlo igualmente?');
    if (!confirmSave) return;
  }

  // F. Advertencia si menú está activado pero vacío
  const menuActive = document.getElementById('menu-active')?.checked;
  const starters = document.getElementById('menu-starters')?.value.trim();
  const seconds = document.getElementById('menu-seconds')?.value.trim();
  const desserts = document.getElementById('menu-desserts')?.value.trim();
  const mains = Array.from(document.querySelectorAll('.menu-main-input')).map(input => input.value.trim()).filter(Boolean);
  if (menuActive && !starters && !seconds && !desserts && mains.length === 0) {
    const confirmSave = confirm('El menú del día está activado pero no tiene contenido. ¿Quieres publicarlo igualmente?');
    if (!confirmSave) return;
  }

  const saveBtn    = document.getElementById('save-btn');
  const statusEl   = document.getElementById('save-status');
  const undoBtn    = document.getElementById('undo-btn');

  // Capture snapshot before overwriting, for undo
  lastSavedSnapshot = JSON.stringify(state);

  // Hide undo during save
  if (undoBtn) undoBtn.hidden = true;
  if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }

  if (saveBtn)  { saveBtn.disabled = true; saveBtn.textContent = 'Publicando…'; }
  if (statusEl) statusEl.textContent = '';

  // Si hay imagen carioca pendiente, subirla primero
  if (cariocaFile) {
    try {
      const statusMsg = document.getElementById('carioca-upload-status');
      if (statusMsg) { statusMsg.textContent = 'Subiendo imagen…'; statusMsg.hidden = false; }

      const imagePath = await uploadCariocaImage(cariocaFile, token);
      const newCarioca = buildCariocaFromForm(imagePath);

      // Añadir al array de cariocas en state (crearlo si no existe)
      if (!state.cariocas) state.cariocas = [];
      state.cariocas.unshift(newCarioca);

      cariocaFile = null;
      document.getElementById('carioca-file').value = '';
      const previewWrap = document.getElementById('carioca-preview-wrap');
      if (previewWrap) previewWrap.hidden = true;
      if (statusMsg)   { statusMsg.textContent = ''; statusMsg.hidden = true; }
      
      const reminder = document.getElementById('save-bar-reminder');
      if (reminder) reminder.hidden = true;

    } catch (err) {
      showError('No se pudo subir la imagen. Comprueba tu conexión e inténtalo de nuevo.');
      if (saveBtn)  { saveBtn.disabled = false; saveBtn.textContent = 'Publicar en la web'; }
      if (statusEl) statusEl.textContent = '';
      return;
    }
  }

  if (dailyMenuTextDirty) {
    syncDailyMenuFallbackTranslations();
  }

  // Enviar el JSON completo a admin-save
  try {
    const resp = await fetch('/admin-save', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    if (resp.status === 401) {
      clearToken();
      showAuthScreen();
      showError('Tu sesión ha caducado. Vuelve a iniciar sesión.');
      return;
    }

    if (resp.status === 409) {
      showError('Alguien más guardó cambios mientras editabas. Recarga la página y vuelve a intentarlo. Tus cambios no se han perdido — están en el panel hasta que recargues.');
      if (saveBtn)  { saveBtn.disabled = false; saveBtn.textContent = 'Publicar en la web'; }
      return;
    }

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    dirty = false;
    dailyMenuTextDirty = false;

    const now = new Date();
    const hhmm = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (statusEl) {
      statusEl.textContent = `Guardado a las ${hhmm}`;
      statusEl.style.display = 'inline';
    }
    if (saveBtn)  { saveBtn.textContent = 'Publicar en la web'; saveBtn.disabled = false; }

    // Show undo button for 60 seconds
    if (undoBtn) {
      undoBtn.hidden = false;
      undoBtn.disabled = false;
      undoBtn.textContent = 'Deshacer';
      undoTimer = setTimeout(() => { undoBtn.hidden = true; }, 60000);
    }

  } catch {
    showError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
    if (saveBtn)  { saveBtn.disabled = false; saveBtn.textContent = 'Publicar en la web'; }
    if (statusEl) statusEl.textContent = '';
  }
}

// ══════════════════════════════════════════════════════════════
// COMPONENTES REUTILIZABLES
// ══════════════════════════════════════════════════════════════

function createToggle(id, checked, onChange) {
  const label = document.createElement('label');
  label.className = 'toggle-wrap';
  label.htmlFor = id;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.checked = checked;
  input.className = 'toggle-input';
  input.setAttribute('role', 'switch');

  const thumb = document.createElement('span');
  thumb.className = 'toggle-thumb';
  thumb.setAttribute('aria-hidden', 'true');

  input.addEventListener('change', () => onChange(input.checked));

  label.appendChild(input);
  label.appendChild(thumb);
  return label;
}

// ══════════════════════════════════════════════════════════════
// TOAST DE ERROR
// ══════════════════════════════════════════════════════════════

let toastTimer = null;

function showError(msg) {
  const toast = document.getElementById('error-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  toast.classList.add('error-toast--visible');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('error-toast--visible');
    toast.hidden = true;
  }, 6000);
}

// ══════════════════════════════════════════════════════════════
// BINDING GLOBAL
// ══════════════════════════════════════════════════════════════

function bindEvents() {
  bindTabNav();
  bindCartaEdit();
  bindExceptions();
  bindMenuDelDia();
  bindAvisoEvents();
  bindCariocaEvents();
  bindPizarraEvents();

  // Botón Guardar
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveAll);

  // Botón Deshacer
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.addEventListener('click', async () => {
      if (!lastSavedSnapshot) return;
      undoBtn.disabled = true;
      undoBtn.textContent = 'Deshaciendo…';
      try {
        const token = getToken();
        if (!token) { clearToken(); showAuthScreen(); return; }
        const resp = await fetch('/admin-save', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: lastSavedSnapshot,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        location.reload();
      } catch {
        showError('No se pudo deshacer. Recarga el panel e inténtalo de nuevo.');
        undoBtn.disabled = false;
        undoBtn.textContent = 'Deshacer';
      }
    });
  }

  // Botón Cerrar sesión
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      location.reload();
    });
  }

  // Advertir si hay cambios sin guardar al salir
  window.addEventListener('beforeunload', e => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '¿Seguro que quieres salir? Tienes cambios sin guardar.';
    }
  });
}

if (typeof window !== 'undefined') {
  window.__panelTestApi = {
    slugifyPanelId,
    createPanelItem,
    addPanelItem,
    deletePanelItem,
    setPanelItemAvailable,
    softDeletePanelItem,
    restorePanelItem,
    hardDeletePanelItem,
    duplicatePanelItem,
    validateState,
    setPanelItemAllergen,
    splitPanelListText,
    joinPanelListItems,
  };
}
