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
  renderPrecios();
  renderHorarios();
  renderMenuDelDia();
  renderAviso();
  renderCariocas();
}

// ══════════════════════════════════════════════════════════════
// TAB: PRECIOS
// ══════════════════════════════════════════════════════════════

function renderPrecios(filter) {
  const container = document.getElementById('precios-list');
  if (!container || !state) return;

  const q = (filter || '').toLowerCase().trim();
  container.innerHTML = '';

  getCatalogGroups().forEach(group => {
    const allItems = Array.isArray(state[group.collection]) ? state[group.collection] : [];
    const items = allItems.filter(item => {
      const name = getPanelItemName(item);
      return !q || name.toLowerCase().includes(q);
    });

    const section = document.createElement('section');
    section.className = 'catalog-section';
    section.dataset.collection = group.collection;

    const header = document.createElement('div');
    header.className = 'catalog-section__header';
    header.innerHTML = `<div>
      <h2 class="catalog-section__title">${group.label}</h2>
      <p class="catalog-section__count">${items.length} elementos</p>
    </div>`;

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--ghost btn--small catalog-add-btn';
    addBtn.dataset.action = 'add';
    addBtn.dataset.collection = group.collection;
    addBtn.textContent = '+ Añadir';
    addBtn.setAttribute('aria-label', `Añadir en ${group.label}`);
    header.appendChild(addBtn);
    section.appendChild(header);

    const list = document.createElement('div');
    list.className = 'catalog-list';

    if (items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state empty-state--compact';
      empty.textContent = q ? 'No hay resultados en esta sección.' : 'Todavía no hay elementos.';
      list.appendChild(empty);
    }

    items.forEach(item => {
      list.appendChild(createCatalogRow(group, item));
    });

    section.appendChild(list);
    container.appendChild(section);
  });

  if (container.children.length === 0) {
    container.innerHTML = '<p class="empty-state">No se encontraron resultados.</p>';
  }
}

function getCatalogGroups() {
  return [
    { collection: 'dishes', label: 'Platos', priceFields: ['price'], categories: 'food' },
    { collection: 'wines', label: 'Vinos', priceFields: ['price_glass', 'price_bottle'] },
    { collection: 'beverages', label: 'Bebidas', priceFields: ['price'], categories: 'drink' },
  ];
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

function createCatalogRow(group, item) {
  const row = document.createElement('article');
  row.className = 'catalog-row';
  row.dataset.collection = group.collection;
  row.dataset.id = item.id;

  const main = document.createElement('div');
  main.className = 'catalog-row__main';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'field-input catalog-name-input';
  nameInput.value = getPanelItemName(item);
  nameInput.dataset.action = 'name';
  nameInput.dataset.collection = group.collection;
  nameInput.dataset.id = item.id;
  nameInput.setAttribute('aria-label', 'Nombre');
  main.appendChild(nameInput);

  if (group.categories) {
    main.appendChild(createCategorySelect(group, item));
  }

  const prices = document.createElement('div');
  prices.className = 'catalog-row__prices';
  group.priceFields.forEach(field => {
    const wrap = document.createElement('label');
    wrap.className = 'catalog-price-field';
    const label = field === 'price_bottle' ? 'Botella' : field === 'price_glass' ? 'Copa' : 'Precio';
    wrap.innerHTML = `<span>${label}</span>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.className = 'field-input catalog-price-input';
    input.value = formatPanelEuro(item[field]).replace(' €', '');
    input.dataset.action = 'price';
    input.dataset.collection = group.collection;
    input.dataset.id = item.id;
    input.dataset.field = field;
    input.setAttribute('aria-label', label);
    wrap.appendChild(input);
    prices.appendChild(wrap);
  });
  main.appendChild(prices);

  const actions = document.createElement('div');
  actions.className = 'catalog-row__actions';

  const activeLabel = document.createElement('label');
  activeLabel.className = 'catalog-active';
  activeLabel.innerHTML = '<span>Visible</span>';
  const active = document.createElement('input');
  active.type = 'checkbox';
  active.checked = item.available !== false;
  active.dataset.action = 'available';
  active.dataset.collection = group.collection;
  active.dataset.id = item.id;
  activeLabel.appendChild(active);
  actions.appendChild(activeLabel);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'catalog-delete';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.dataset.collection = group.collection;
  deleteBtn.dataset.id = item.id;
  deleteBtn.textContent = 'Borrar';
  deleteBtn.setAttribute('aria-label', `Borrar ${getPanelItemName(item)}`);
  actions.appendChild(deleteBtn);

  row.appendChild(main);
  row.appendChild(actions);
  return row;
}

function createCategorySelect(group, item) {
  const select = document.createElement('select');
  select.className = 'field-select catalog-category-select';
  select.dataset.action = 'category';
  select.dataset.collection = group.collection;
  select.dataset.id = item.id;
  select.setAttribute('aria-label', 'Categoría');

  const categories = (state.categories || []).filter(cat => {
    if (!group.categories) return false;
    if (group.categories === 'food') return cat.type === 'food' || !cat.type;
    return cat.type === group.categories;
  });

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name && cat.name.es ? cat.name.es : cat.id;
    option.selected = item.category_id === cat.id;
    select.appendChild(option);
  });

  return select;
}

function bindPreciosEdit() {
  const list = document.getElementById('precios-list');
  if (!list) return;

  list.addEventListener('click', e => {
    const addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) {
      addCatalogItem(addBtn.dataset.collection);
      return;
    }

    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (!deleteBtn) return;

    const item = getPanelCollectionItem(deleteBtn.dataset.collection, deleteBtn.dataset.id);
    const name = getPanelItemName(item);
    if (!window.confirm(`¿Borrar "${name}"?`)) return;
    if (deletePanelItem(state, deleteBtn.dataset.collection, deleteBtn.dataset.id)) {
      renderPrecios(document.getElementById('search-precios')?.value || '');
      markDirty();
    }
  });

  list.addEventListener('change', e => {
    const target = e.target;
    const action = target.dataset.action;
    const collection = target.dataset.collection;
    const id = target.dataset.id;
    if (!action || !collection || !id) return;

    const item = getPanelCollectionItem(collection, id);
    if (!item) return;

    if (action === 'name') {
      if (!item.name || typeof item.name !== 'object') item.name = { es: '', en: '', fr: '' };
      item.name.es = target.value.trim();
    } else if (action === 'price') {
      item[target.dataset.field] = collection === 'wines' ? parsePanelEuro(target.value) : target.value.trim();
    } else if (action === 'category') {
      item.category_id = target.value;
    } else if (action === 'available') {
      item.available = target.checked;
    }
    markDirty();
  });

  // Búsqueda en tiempo real
  const searchInput = document.getElementById('search-precios');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderPrecios(searchInput.value);
      // Re-bind (el contenedor se reemplaza)
    });
  }
}

function addCatalogItem(collection) {
  const group = getCatalogGroups().find(g => g.collection === collection);
  if (!group) return;

  const name = window.prompt(`Nombre para ${group.label.toLowerCase()}:`);
  if (!name || !name.trim()) {
    showError('Escribe un nombre para añadir el elemento.');
    return;
  }

  const price = window.prompt('Precio inicial (opcional):') || '';
  const existingIds = new Set((state[collection] || []).map(item => item.id));
  const firstCategory = group.categories
    ? (state.categories || []).find(cat => group.categories === 'food' ? (cat.type === 'food' || !cat.type) : cat.type === group.categories)
    : null;

  const item = createPanelItem(collection, {
    name: name.trim(),
    price,
    price_glass: collection === 'wines' ? price : '',
    category_id: firstCategory ? firstCategory.id : '',
  }, existingIds);

  addPanelItem(state, collection, item);
  renderPrecios(document.getElementById('search-precios')?.value || '');
  markDirty();
}

function getPanelPriceDisplay(item) {
  if (item._type === 'wine') {
    const label = item._priceField === 'price_bottle' ? 'Bot.' : 'Copa';
    const value = item[item._priceField];
    return value ? `${label} ${formatPanelEuro(value)}` : '—';
  }
  return item.price || '—';
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
      available: true,
    };
  }

  if (collection === 'beverages') {
    return {
      id,
      name: nameField,
      price: values.price || '',
      category_id: values.category_id || '',
      available: true,
    };
  }

  return {
    id,
    name: nameField,
    description: { es: '', en: '', fr: '' },
    price: values.price || '',
    category_id: values.category_id || '',
    available: true,
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

  state.hours.forEach((dayData, index) => {
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
        state.hours[index].status = checked ? 'open' : 'closed';
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
        const periodRow = createPeriodRow(index, pIndex, period);
        periodsWrap.appendChild(periodRow);
      });

      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn--ghost btn--small hours-add-period';
      addBtn.textContent = '+ Añadir franja horaria';
      addBtn.addEventListener('click', () => {
        state.hours[index].periods.push({ open: '13:00', close: '16:00' });
        renderHorarios();
        markDirty();
      });

      periodsWrap.appendChild(addBtn);
      card.appendChild(periodsWrap);
    }

    container.appendChild(card);
  });
}

function createPeriodRow(dayIndex, pIndex, period) {
  const row = document.createElement('div');
  row.className = 'period-row';

  const openInput  = createTimeInput(period.open,  val => {
    state.hours[dayIndex].periods[pIndex].open = val;
    markDirty();
  });
  const sep = document.createElement('span');
  sep.className = 'period-sep';
  sep.textContent = '—';
  const closeInput = createTimeInput(period.close, val => {
    state.hours[dayIndex].periods[pIndex].close = val;
    markDirty();
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'period-remove';
  removeBtn.setAttribute('aria-label', 'Eliminar esta franja');
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => {
    state.hours[dayIndex].periods.splice(pIndex, 1);
    if (state.hours[dayIndex].periods.length === 0) {
      state.hours[dayIndex].status = 'closed';
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
  return splitPanelListText(data.es || '');
}

function setDailyMenuItems(field, items) {
  const data = ensureDailyMenuField(field);
  data.es = joinPanelListItems(items);
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
  const es = typeof field.es === 'string' ? field.es.trim() : '';
  field.en = es;
  field.fr = es;
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
      showError('La información del restaurante fue modificada mientras trabajabas. Recarga el panel y vuelve a hacer tus cambios.');
      if (saveBtn)  { saveBtn.disabled = false; saveBtn.textContent = 'Publicar en la web'; }
      return;
    }

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    dirty = false;
    dailyMenuTextDirty = false;
    if (statusEl) statusEl.textContent = '✓ Publicado. Tu web se actualizará en unos 30 segundos.';
    if (saveBtn)  { saveBtn.textContent = 'Publicar en la web'; saveBtn.disabled = false; }

    // Show undo button for 60 seconds
    if (undoBtn) {
      undoBtn.hidden = false;
      undoBtn.disabled = false;
      undoBtn.textContent = 'Deshacer';
      undoTimer = setTimeout(() => { undoBtn.hidden = true; }, 60000);
    }

    // Clear the confirmation message after 6 s
    setTimeout(() => {
      if (statusEl && statusEl.textContent === '✓ Publicado. Tu web se actualizará en unos 30 segundos.') {
        statusEl.textContent = '';
      }
    }, 6000);

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
  bindPreciosEdit();
  bindMenuDelDia();
  bindAvisoEvents();
  bindCariocaEvents();

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
    splitPanelListText,
    joinPanelListItems,
  };
}
