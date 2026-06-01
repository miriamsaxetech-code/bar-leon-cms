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
  // Carioca: solo bindings, no tiene datos preexistentes para renderizar
}

// ══════════════════════════════════════════════════════════════
// TAB: PRECIOS
// ══════════════════════════════════════════════════════════════

function renderPrecios(filter) {
  const container = document.getElementById('precios-list');
  if (!container || !state) return;

  const q = (filter || '').toLowerCase().trim();

  // Agrupar platos por tipo de categoría
  const categories  = state.categories || [];
  const dishes      = state.dishes || [];
  const wines       = state.wines || [];
  const beverages   = state.beverages || [];

  // Mapas rápidos
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c; });

  // Agrupar dishes por tipo de categoría
  const groups = {
    food: { label: 'Platos', items: [] },
    wine: { label: 'Vinos', items: [] },
    drink: { label: 'Bebidas', items: [] },
  };

  dishes.forEach(d => {
    const cat = catMap[d.category_id];
    const type = cat ? cat.type : 'food';
    const name = (d.name && d.name.es) ? d.name.es : d.id;
    if (q && !name.toLowerCase().includes(q)) return;
    const group = groups[type] || groups.food;
    group.items.push({ ...d, _type: 'dish', _priceField: 'price', _catName: cat ? cat.name.es : '' });
  });

  wines.forEach(w => {
    const name = typeof w.name === 'object' ? (w.name.es || w.id) : (w.name || w.id);
    if (q && !name.toLowerCase().includes(q)) return;
    groups.wine.items.push({
      ...w,
      name: { es: name },
      _type: 'wine',
      _priceField: w.price_bottle ? 'price_bottle' : 'price_glass',
    });
  });

  beverages.forEach(b => {
    const name = (b.name && b.name.es) ? b.name.es : b.id;
    if (q && !name.toLowerCase().includes(q)) return;
    groups.drink.items.push({ ...b, _type: 'beverage', _priceField: 'price' });
  });

  container.innerHTML = '';

  Object.values(groups).forEach(group => {
    if (group.items.length === 0) return;

    const heading = document.createElement('div');
    heading.className = 'price-group-heading';
    heading.textContent = group.label;
    container.appendChild(heading);

    group.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'price-row';
      row.dataset.id = item.id;

      const nameEl = document.createElement('span');
      nameEl.className = 'price-row__name';
      nameEl.textContent = item.name && item.name.es ? item.name.es : item.id;

      const priceBtn = document.createElement('button');
      priceBtn.className = 'price-row__price';
      priceBtn.dataset.id = item.id;
      priceBtn.dataset.type = item._type;
      priceBtn.dataset.field = item._priceField;
      priceBtn.setAttribute('aria-label', `Editar precio de ${nameEl.textContent}`);
      priceBtn.textContent = getPanelPriceDisplay(item);

      row.appendChild(nameEl);
      row.appendChild(priceBtn);
      container.appendChild(row);
    });
  });

  if (container.children.length === 0) {
    container.innerHTML = '<p class="empty-state">No se encontraron resultados.</p>';
  }
}

// Edición inline de precios
function bindPreciosEdit() {
  const list = document.getElementById('precios-list');
  if (!list) return;

  list.addEventListener('click', e => {
    const btn = e.target.closest('.price-row__price');
    if (!btn || btn.tagName === 'INPUT') return;

    const dishId = btn.dataset.id;
    const itemType = btn.dataset.type || 'dish';
    const priceField = btn.dataset.field || 'price';

    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.value = btn.textContent.trim();
    input.className = 'price-input';
    input.setAttribute('aria-label', 'Precio');

    btn.replaceWith(input);
    input.focus();
    input.select();

    function commit() {
      const newVal = input.value.trim() || btn.textContent.trim();
      updatePanelPrice(itemType, dishId, priceField, newVal);
      // Restaurar botón
      const newBtn = document.createElement('button');
      newBtn.className = 'price-row__price';
      newBtn.dataset.id = dishId;
      newBtn.dataset.type = itemType;
      newBtn.dataset.field = priceField;
      newBtn.setAttribute('aria-label', `Editar precio de ${dishId}`);
      newBtn.textContent = newVal;
      input.replaceWith(newBtn);
      markDirty();
    }

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = btn.textContent; input.blur(); }
    });
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
  const startersEl = document.getElementById('menu-starters');
  const secondsEl  = document.getElementById('menu-seconds');
  const dessertsEl = document.getElementById('menu-desserts');
  const seasonalEl = document.getElementById('menu-seasonal');
  const mainsList  = document.getElementById('menu-mains-list');

  if (activeEl)   activeEl.checked    = m.active === true;
  if (priceEl)    priceEl.value       = m.price != null ? Number(m.price).toFixed(2).replace('.', ',') : '';
  if (startersEl) startersEl.value    = (m.starters && m.starters.es) || '';
  if (secondsEl)  secondsEl.value     = (m.seconds  && m.seconds.es)  || '';
  if (dessertsEl) dessertsEl.value    = (m.desserts && m.desserts.es) || '';
  if (seasonalEl) seasonalEl.value    = (m.seasonal && m.seasonal.es) || '';

  if (!mainsList) return;
  mainsList.innerHTML = '';
  const days = Array.isArray(m.days) ? m.days : [];
  days.forEach(day => {
    const existing = Array.isArray(m.mains)
      ? m.mains.find(x => x.day === day)
      : null;

    const row = document.createElement('div');
    row.className = 'menu-main-row';

    const label = document.createElement('span');
    label.className = 'menu-main-day';
    label.textContent = DAY_NAMES[day] || day;

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
    {
      id: 'menu-starters',
      event: 'change',
      handler: e => {
        if (!state.daily_menu) state.daily_menu = {};
        if (!state.daily_menu.starters) state.daily_menu.starters = {};
        state.daily_menu.starters.es = e.target.value;
        markDailyMenuTextDirty();
      },
    },
    {
      id: 'menu-seconds',
      event: 'change',
      handler: e => {
        if (!state.daily_menu) state.daily_menu = {};
        if (!state.daily_menu.seconds) state.daily_menu.seconds = {};
        state.daily_menu.seconds.es = e.target.value;
        markDailyMenuTextDirty();
      },
    },
    {
      id: 'menu-desserts',
      event: 'change',
      handler: e => {
        if (!state.daily_menu) state.daily_menu = {};
        if (!state.daily_menu.desserts) state.daily_menu.desserts = {};
        state.daily_menu.desserts.es = e.target.value;
        markDailyMenuTextDirty();
      },
    },
    {
      id: 'menu-seasonal',
      event: 'change',
      handler: e => {
        if (!state.daily_menu) state.daily_menu = {};
        if (!state.daily_menu.seasonal) state.daily_menu.seasonal = {};
        state.daily_menu.seasonal.es = e.target.value;
        markDailyMenuTextDirty();
      },
    },
  ];

  fields.forEach(({ id, event, handler }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
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
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
      showError('El formato HEIC no es compatible. Por favor convierte la foto a JPG o PNG antes de subirla.');
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

  const saveBtn    = document.getElementById('save-btn');
  const statusEl   = document.getElementById('save-status');

  if (saveBtn)  { saveBtn.disabled = true; saveBtn.textContent = 'Guardando…'; }
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

    } catch (err) {
      showError('No se pudo subir la imagen. Comprueba tu conexión e inténtalo de nuevo.');
      if (saveBtn)  { saveBtn.disabled = false; saveBtn.textContent = 'Guardar cambios'; }
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
      if (saveBtn)  { saveBtn.disabled = false; saveBtn.textContent = 'Guardar cambios'; }
      return;
    }

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    dirty = false;
    dailyMenuTextDirty = false;
    if (statusEl) statusEl.textContent = '✓ Guardado';
    if (saveBtn)  { saveBtn.textContent = 'Guardar cambios'; saveBtn.disabled = false; }

    // Limpiar el mensaje de confirmación después de 4 s
    setTimeout(() => {
      if (statusEl && statusEl.textContent === '✓ Guardado') {
        statusEl.textContent = '';
      }
    }, 4000);

  } catch {
    showError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
    if (saveBtn)  { saveBtn.disabled = false; saveBtn.textContent = 'Guardar cambios'; }
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
