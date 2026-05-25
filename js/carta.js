(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };

  const LABELS = {
    starters:   { es: 'Primeros',       en: 'First course',  fr: 'Entrées'  },
    seconds:    { es: 'Segundos',       en: 'Second course', fr: 'Plats'    },
    daily:      { es: 'Plato del día',  en: 'Daily special', fr: 'Plat du jour' },
    desserts:   { es: 'Postre',         en: 'Dessert',       fr: 'Dessert'  },
    closed:     { es: 'Cerrado',        en: 'Closed',        fr: 'Fermé'    },
    dailyMenu:  { es: 'Menú del Día',   en: 'Daily Menu',    fr: 'Menu du Jour' },
    restaurant: { es: 'Carta Restaurante', en: 'Restaurant Menu', fr: 'Carte Restaurant' },
    bar:        { es: 'Carta Barra',    en: 'Bar Menu',      fr: 'Carte Bar' },
    barIntro:   { es: 'Para barra, vinos y bebidas. Sin ceremonia, que aquí se viene a gusto.', en: 'Bar, wines and drinks. Simple, direct, and easy.', fr: 'Bar, vins et boissons. Simple et direct.' },
    restaurantIntro: { es: 'La carta de mesa, separada del menú del día.', en: 'The table menu, separate from the daily menu.', fr: 'La carte de table, séparée du menu du jour.' }
  };

  const DAY_NAMES = {
    monday:    { es: 'Lunes',     en: 'Monday',    fr: 'Lundi'    },
    tuesday:   { es: 'Martes',    en: 'Tuesday',   fr: 'Mardi'    },
    wednesday: { es: 'Miércoles', en: 'Wednesday', fr: 'Mercredi' },
    thursday:  { es: 'Jueves',    en: 'Thursday',  fr: 'Jeudi'    },
    friday:    { es: 'Viernes',   en: 'Friday',    fr: 'Vendredi' },
    saturday:  { es: 'Sábado',    en: 'Saturday',  fr: 'Samedi'   },
    sunday:    { es: 'Domingo',   en: 'Sunday',    fr: 'Dimanche' }
  };

  function getLang() {
    const m = window.location.pathname.match(/\/(es|en|fr)\//);
    return m ? m[1] : 'es';
  }

  function t(field, lang) {
    if (!field || typeof field === 'string') return field || '';
    return field[lang] || field.es || '';
  }

  function formatPrice(price) {
    if (typeof price === 'number') {
      return price.toFixed(2).replace('.', ',') + ' €';
    }
    return price || '';
  }

  function formatTimePeriod(period, lang) {
    const sep = lang === 'fr' ? 'h' : ':';
    function fmt(t) {
      const [h, m] = t.split(':');
      return lang === 'fr' ? `${h}h${m}` : t;
    }
    return `${fmt(period.open)}–${fmt(period.close)}`;
  }

  function langSelector(lang) {
    return ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-active">${l.toUpperCase()}</span>`
        : `<a href="${CARTA_LINKS[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="sep"> · </span>');
  }

  function renderMenuDia(dm, nav, lang) {
    if (!dm || !dm.active) return '';

    function asList(str) {
      return `<ul class="edict-platos">${str.split(' · ').map(s =>
        `<li>${s.trim()}</li>`).join('')}</ul>`;
    }

    const starters = t(dm.starters, lang)
      ? `<p class="edict-section-label">${LABELS.starters[lang]}</p>${asList(t(dm.starters, lang))}`
      : '';

    const seconds = t(dm.seconds, lang)
      ? `<p class="edict-section-label">${LABELS.seconds[lang]}</p>${asList(t(dm.seconds, lang))}`
      : '';

    const mains = (dm.mains && dm.mains.length)
      ? `<p class="edict-section-label">${LABELS.daily[lang]}</p>
<ul class="edict-platos">${dm.mains.map(p => {
          const day = DAY_NAMES[p.day] ? DAY_NAMES[p.day][lang] : p.day;
          return `<li><strong>${day}:</strong> ${t(p.name, lang)}</li>`;
        }).join('')}</ul>`
      : '';

    const desserts = t(dm.desserts, lang)
      ? `<p class="edict-section-label">${LABELS.desserts[lang]}</p>${asList(t(dm.desserts, lang))}`
      : '';

    const seasonal = t(dm.seasonal, lang)
      ? `<p class="edict-temporada">${t(dm.seasonal, lang)}</p>`
      : '';

    const daysStr = (dm.days || [])
      .map(d => DAY_NAMES[d] ? DAY_NAMES[d][lang] : d)
      .join(', ');
    const periodStr = dm.service_period
      ? ` · ${formatTimePeriod(dm.service_period, lang)}`
      : '';

    return `<div class="edict">
    <div class="edict-head">
      <h2>${t(nav.edict_header, lang)}</h2>
      <p class="edict-title">${t(nav.daily_menu, lang)}</p>
      <span class="edict-price">${formatPrice(dm.price)}</span>
      <p class="edict-dias">${daysStr}${periodStr}</p>
    </div>
    <div class="edict-body">
      <p class="edict-condiciones">${t(dm.includes, lang)}</p>
      ${starters}
      ${seconds}
      ${mains}
      ${desserts}
      ${seasonal}
    </div>
    <div class="edict-foot">${t(nav.edict_foot, lang)}</div>
</div>`;
  }

  function renderCarta(dishes, categories, lang, service) {
    const available = (dishes || []).filter(i => i.available !== false);
    const catMap = {};
    (categories || [])
      .filter(c => (c.service || (c.type === 'food' ? 'restaurant' : 'bar')) === service)
      .forEach(c => { catMap[c.id] = c; });

    const groups = {};
    const order  = [];
    available.forEach(i => {
      if (!catMap[i.category_id]) return;
      if (!groups[i.category_id]) {
        groups[i.category_id] = [];
        order.push(i.category_id);
      }
      groups[i.category_id].push(i);
    });

    const cats = order.map((catId, idx) => {
      const cat  = catMap[catId];
      const name = cat ? t(cat.name, lang) : catId;
      const list = groups[catId];

      const itemsHtml = list.map(item => {
        const pairing = t(item.pairing, lang);
        return `<article class="carta-item">
  <div class="check-row">
    <span class="check-name">${t(item.name, lang)}</span>
    <span class="check-leader" aria-hidden="true"></span>
    <span class="check-price">${formatPrice(item.price)}</span>
  </div>
  ${t(item.description, lang) ? `<p class="item-desc">${t(item.description, lang)}</p>` : ''}
  ${pairing ? `<p class="item-maridaje">${pairing}</p>` : ''}
</article>`;
      }).join('');

      return `<div class="accordion-item${idx === 0 ? ' is-open' : ''}">
  <div class="categoria-head" role="button" tabindex="0" aria-expanded="${idx === 0 ? 'true' : 'false'}">
    <h2>${name}</h2>
    <span class="accordion-icon" aria-hidden="true"></span>
  </div>
  <div class="accordion-body">${itemsHtml}</div>
</div>`;
    });

    return `<div class="wrap carta-accordion">${cats.join('')}</div>`;
  }

  function renderWines(wines, beverages, categories, lang, service) {
    const hasWines = Array.isArray(wines) && wines.length > 0;
    const hasBeverages = Array.isArray(beverages) && beverages.length > 0;
    if (!hasWines && !hasBeverages) return '';
    const catMap = {};
    (categories || [])
      .filter(c => (c.service || (c.type === 'food' ? 'restaurant' : 'bar')) === service)
      .forEach(c => { catMap[c.id] = c; });

    const groups = {};
    const order  = [];
    [...(wines || []), ...(beverages || [])].filter(w => w && w.available !== false).forEach(item => {
      if (!catMap[item.category_id]) return;
      if (!groups[item.category_id]) {
        groups[item.category_id] = [];
        order.push(item.category_id);
      }
      groups[item.category_id].push(item);
    });

    const cats = order.map((catId, idx) => {
      const cat  = catMap[catId];
      const name = cat ? t(cat.name, lang) : catId;
      const list = groups[catId];

      const itemsHtml = list.map(item => {
        const nameStr = typeof item.name === 'object' ? t(item.name, lang) : item.name;
        const price   = item.price_bottle
          ? formatPrice(item.price_bottle)
          : item.price_glass
            ? formatPrice(item.price_glass)
            : item.price || '';
        return `<article class="carta-item">
  <div class="check-row">
    <span class="check-name">${nameStr}${item.producer ? ` <span class="item-producer">${item.producer}</span>` : ''}</span>
    <span class="check-leader" aria-hidden="true"></span>
    <span class="check-price">${price}</span>
  </div>
  ${item.region ? `<p class="item-desc">${item.region}</p>` : ''}
</article>`;
      }).join('');

      return `<div class="accordion-item">
  <div class="categoria-head" role="button" tabindex="0" aria-expanded="false">
    <h2>${name}</h2>
    <span class="accordion-icon" aria-hidden="true"></span>
  </div>
  <div class="accordion-body">${itemsHtml}</div>
</div>`;
    });

    return `<div class="wrap carta-accordion">${cats.join('')}</div>`;
  }

  function renderMenuSections(d, nav, lang) {
    return `<div class="wrap menu-switch-wrap">
  <div class="menu-switch" role="tablist" aria-label="${t(nav.menu, lang)}">
    <button type="button" class="menu-switch-btn is-active" role="tab" aria-selected="true" aria-controls="panel-daily" data-panel="daily">${LABELS.dailyMenu[lang]}</button>
    <button type="button" class="menu-switch-btn" role="tab" aria-selected="false" aria-controls="panel-restaurant" data-panel="restaurant">${LABELS.restaurant[lang]}</button>
    <button type="button" class="menu-switch-btn" role="tab" aria-selected="false" aria-controls="panel-bar" data-panel="bar">${LABELS.bar[lang]}</button>
  </div>
</div>
<section id="panel-daily" class="menu-panel is-active" role="tabpanel" data-panel="daily">
  <div class="wrap menu-panel-inner">${renderMenuDia(d.daily_menu, nav, lang)}</div>
</section>
<section id="panel-restaurant" class="menu-panel" role="tabpanel" data-panel="restaurant" hidden>
  <div class="wrap menu-panel-intro">
    <p class="section-label">${LABELS.restaurant[lang]}</p>
    <p class="menu-panel-copy">${LABELS.restaurantIntro[lang]}</p>
  </div>
  ${renderCarta(d.dishes, d.categories, lang, 'restaurant')}
</section>
<section id="panel-bar" class="menu-panel" role="tabpanel" data-panel="bar" hidden>
  <div class="wrap menu-panel-intro">
    <p class="section-label">${LABELS.bar[lang]}</p>
    <p class="menu-panel-copy">${LABELS.barIntro[lang]}</p>
  </div>
  ${renderWines(d.wines, d.beverages, d.categories, lang, 'bar')}
</section>`;
  }

  function refreshOpenAccordions(root) {
    root.querySelectorAll('.accordion-item.is-open .accordion-body').forEach(body => {
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  }

  function initMenuSwitch(container) {
    const buttons = Array.from(container.querySelectorAll('.menu-switch-btn'));
    const panels = Array.from(container.querySelectorAll('.menu-panel'));

    function activate(button) {
      const target = button.getAttribute('data-panel');

      buttons.forEach(btn => {
        const active = btn === button;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });

      panels.forEach(panel => {
        const active = panel.getAttribute('data-panel') === target;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
        if (active) refreshOpenAccordions(panel);
      });
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button));
      button.addEventListener('keydown', e => {
        const last = buttons.length - 1;
        let next = null;
        if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
        if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
        if (next === null) return;
        e.preventDefault();
        buttons[next].focus();
        activate(buttons[next]);
      });
    });
  }

  function initAccordions(container) {
    container.querySelectorAll('.accordion-item').forEach((item, idx) => {
      const head = item.querySelector('.categoria-head');
      const body = item.querySelector('.accordion-body');

      if (item.classList.contains('is-open')) body.style.maxHeight = body.scrollHeight + 'px';

      head.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
        head.setAttribute('aria-expanded', String(!isOpen));
        body.style.maxHeight = isOpen ? '0' : body.scrollHeight + 'px';
      });

      head.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); head.click(); }
      });
    });
  }

  function renderHorarios(hours, nav, lang) {
    const cells = hours.map(h => {
      const closed  = h.status === 'closed' || h.status === 'partial';
      const cls     = closed ? ' h-cerrado' : '';
      const dayName = DAY_NAMES[h.day] ? DAY_NAMES[h.day][lang] : h.day;
      let detail;
      if (h.status === 'closed') {
        detail = LABELS.closed[lang];
      } else if (h.periods && h.periods.length) {
        detail = h.periods.map(p => formatTimePeriod(p, lang)).join(' / ');
        if (h.note) detail += ` (${t(h.note, lang)})`;
      } else {
        detail = '';
      }
      return `<div class="h-dia${cls}">${dayName}</div>
<div class="h-det${cls}">${detail}</div>`;
    }).join('');

    return `<div class="wrap" id="hours">
  <p class="section-label">${t(nav.hours, lang)}</p>
  <div class="horarios-grid" role="table" aria-label="${t(nav.hours, lang)} Bar León">${cells}</div>
</div>`;
  }

  function renderFooter(d, nav, lang) {
    const addr = d.contact.address;
    return `<footer class="carta-footer">
  <div class="wrap">
    <p class="carta-footer-address">${addr.neighborhood} &middot; ${addr.city} &middot; ${addr.region}<br>${t(d.venue.cuisine_tag, lang)}</p>
  </div>
  <a href="${d.contact.phone_link}" class="cta-btn">${t(nav.call, lang)}</a>
  <div class="wrap">
    <p class="carta-brand">${t(d.venue.name, lang)}</p>
    <a href="/admin/" class="owner-link">Acceso propietario</a>
  </div>
</footer>`;
  }

  async function init() {
    const lang      = getLang();
    const loader    = document.getElementById('loader');
    const header    = document.getElementById('carta-header');
    const headerNav = document.getElementById('carta-nav');
    const app       = document.getElementById('carta-body');

    try {
      const res = await fetch('../data/venue.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();

      const nav = d.nav;

      headerNav.innerHTML = `<div class="carta-header-left">
  <a href="${HOME_LINKS[lang]}" class="carta-back">${t(nav.back, lang)}</a>
</div>
<div class="carta-header-center" style="display: flex; align-items: center; gap: 8px; justify-content: center;">
  <img src="../assets/images/lion-logo.svg" class="header-logo" alt="" />
  <span class="carta-bar-name">${t(d.venue.name, lang)}</span>
</div>
<div class="carta-header-right">
  <div class="carta-lang-selector" aria-label="Language">${langSelector(lang)}</div>
</div>`;

      app.innerHTML = [
        renderMenuSections(d, nav, lang),
        '<div class="wrap"><hr class="divider" /></div>',
        renderHorarios(d.hours, nav, lang),
        renderFooter(d, nav, lang),
      ].join('\n');

      initAccordions(app);
      initMenuSwitch(app);
      header.style.display = 'block';
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);

      if (window.location.hash === '#hours') {
        setTimeout(() => {
          const el = document.getElementById('hours');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      const errMsg = {
        es: 'Error al cargar. Por favor, recarga la p&aacute;gina.',
        en: 'Error loading page. Please reload.',
        fr: 'Erreur de chargement. Veuillez recharger la page.'
      }[lang] || 'Error al cargar. Por favor, recarga la p&aacute;gina.';
      loader.innerHTML = `<span style="color:#7A1C1C;font-family:Georgia,serif;font-size:0.9rem;padding:0 24px;text-align:center;display:block;">${errMsg}</span>`;
      console.error('Bar León:', err);
    }
  }

  init();
}());
