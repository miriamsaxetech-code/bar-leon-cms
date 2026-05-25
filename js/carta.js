(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };

  const SABORES_CATEGORY_ID = 'andalusian-specialities';
  const WEB_IMAGE_BASE = '../assets/images/web/';
  const CARTA_ACCENT_IMAGES = [
    {
      src: 'bar-leon-plato-05.webp',
      alt: {
        es: 'Tomate aliñao con aceite de oliva y orégano',
        en: 'Seasoned tomato salad with olive oil and oregano',
        fr: "Salade de tomates assaisonnée à l'huile d'olive et origan",
      },
    },
    {
      src: 'bar-leon-plato-06.webp',
      alt: {
        es: 'Cazuela de cocina tradicional servida en Bar León',
        en: 'Traditional clay-pot dish served at Bar León',
        fr: 'Cazuela traditionnelle servie au Bar León',
      },
    },
  ];

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
    restaurantIntro: { es: 'La carta de mesa, separada del menú del día.', en: 'The table menu, separate from the daily menu.', fr: 'La carte de table, séparée du menu du jour.' },
    badge_recommended: { es: 'Recomendado', en: 'Recommended',   fr: 'Recommandé'         },
    badge_seasonal:    { es: 'Temporada',   en: 'Seasonal',       fr: 'Saison'             },
    badge_house:       { es: 'De la casa',  en: 'House special',  fr: 'Maison'             },
    soldout:           { es: 'Agotado hoy', en: 'Sold out today', fr: "Épuisé aujourd'hui" },
    paraEmpezarTitle:  { es: 'Para empezar',              en: 'To start',                   fr: 'Pour commencer'           },
    paraEmpezarSub:    { es: 'La barra, antes de la mesa.', en: 'The bar, before the table.', fr: 'Le comptoir, avant la table.' },
    whatsappFab:       { es: 'WhatsApp', en: 'WhatsApp', fr: 'WhatsApp' },
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

  // ─── SERVICE TIME HELPER ─────────────────────────────────────────────────────
  function isNowServiceTime(hours) {
    const now = new Date();
    const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayKey = dayKeys[now.getDay()];
    const todayEntry = (hours || []).find(h => h.day === todayKey);
    if (!todayEntry || todayEntry.status === 'closed' || !todayEntry.periods || !todayEntry.periods.length) return false;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return todayEntry.periods.some(function(p) {
      const parts = function(str) { const s = str.split(':'); return parseInt(s[0], 10) * 60 + parseInt(s[1], 10); };
      return nowMins >= parts(p.open) && nowMins < parts(p.close);
    });
  }

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

  // Translates Spanish price annotation patterns into the current language.
  // Patterns handled:
  //   "Media X / Ración Y"          → Half X / Portion Y
  //   "X (ración) / Y (unidad en barra)" → X (portion) / Y (unit at bar)
  //   "X (unidad)"                  → X (each)
  //   "X (barra) / Y (restaurante)" → X (bar) / Y (restaurant)
  //   "X / ración"                  → X / portion
  // Parses a dish price string. Returns:
  //   { type: 'simple',   display: '10,00 €' }
  //   { type: 'portions', label: 'Ración*', note: '½ 7,50 € · Ración 10,00 €' }
  function parseDishPrice(str, lang) {
    if (!str) return { type: 'simple', display: '' };

    const PORTION_TERMS = {
      es: { label: 'Ración*', half: 'Media',    full: 'Ración'   },
      en: { label: 'Portion*', half: '½',       full: 'Portion'  },
      fr: { label: 'Portion*', half: '½',       full: 'Portion'  },
    };
    const INLINE_TERMS = {
      en: { racion: 'Portion', unidad: 'each', barra: 'bar', restaurante: 'restaurant', 'unidad en barra': 'unit at bar' },
      fr: { racion: 'Portion', unidad: 'unité', barra: 'comptoir', restaurante: 'restaurant', 'unidad en barra': "à l'unité" },
    };

    const m = str.match(/^Media\s+(.+?)\s*\/\s*Raci[oó]n\s+(.+)$/i);
    if (m) {
      const T = PORTION_TERMS[lang] || PORTION_TERMS.es;
      const half = m[1].trim();
      const full = m[2].trim();
      return {
        type:  'portions',
        label: T.label,
        note:  `${T.half} ${half} · ${T.full} ${full}`,
      };
    }

    // For other annotation patterns, do inline substitution as before
    if (lang !== 'es') {
      const T = INLINE_TERMS[lang] || {};
      const localized = str
        .replace(/\(raci[oó]n\)\s*\/\s*(.+?)\(unidad en barra\)/i,
          (_, mid) => `(${T.racion}) / ${mid}(${T['unidad en barra']})`)
        .replace(/\(unidad\)/gi,       `(${T.unidad})`)
        .replace(/\(barra\)/gi,        `(${T.barra})`)
        .replace(/\(restaurante\)/gi,  `(${T.restaurante})`)
        .replace(/\/\s*raci[oó]n\b/gi, `/ ${T.racion}`);
      return { type: 'simple', display: localized };
    }

    return { type: 'simple', display: str };
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

  function injectLangBar(lang) {
    const bar = document.createElement('div');
    bar.className = 'lang-bar';
    bar.setAttribute('aria-label', 'Language / Idioma / Langue');
    bar.innerHTML = ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-bar__active">${l.toUpperCase()}</span>`
        : `<a class="lang-bar__link" href="${CARTA_LINKS[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="lang-bar__sep">·</span>');
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // ─── BADGE HELPER ─────────────────────────────────────────────────────────────
  function renderBadge(dish, lang) {
    const v = dish.featured;
    if (!v || v === false) return '';
    if (v === true || v === 'recommended') return `<span class="dish-badge dish-badge--recommended">${LABELS.badge_recommended[lang]}</span>`;
    if (v === 'seasonal') return `<span class="dish-badge dish-badge--seasonal">${LABELS.badge_seasonal[lang]}</span>`;
    if (v === 'house') return `<span class="dish-badge dish-badge--house">${LABELS.badge_house[lang]}</span>`;
    return '';
  }

  // ─── STATUS HELPER ────────────────────────────────────────────────────────────
  function getDishStatusClass(dish) {
    return dish.status === 'soldout' ? ' dish--soldout' : '';
  }

  function renderDishStatus(dish, lang) {
    if (dish.status === 'soldout') {
      return `<span class="dish-status">${LABELS.soldout[lang]}</span>`;
    }
    if (dish.status === 'seasonal') {
      const badge = renderBadge(dish, lang);
      if (!badge) return `<span class="dish-badge dish-badge--seasonal">${LABELS.badge_seasonal[lang]}</span>`;
    }
    return '';
  }

  function renderPriceSpan(dish, priceStr) {
    if (dish.status === 'soldout') return '';
    return `<span class="check-price dish-price">${priceStr}</span>`;
  }

  // ─── PAIRING CHIP HELPER ──────────────────────────────────────────────────────
  function wineTypeLabel(type, lang) {
    const labels = {
      red:    { es: 'tinto',    en: 'red wine',   fr: 'vin rouge' },
      white:  { es: 'blanco',   en: 'white wine', fr: 'vin blanc' },
      rose:   { es: 'rosado',   en: 'rosé',       fr: 'rosé' },
      sherry: { es: 'generoso', en: 'sherry',     fr: 'xérès' },
    };
    return labels[type] ? labels[type][lang] : (type || '');
  }

  function wineCultureNote(wine, lang) {
    const region = wine.region || '';
    const name = typeof wine.name === 'object' ? t(wine.name, lang) : (wine.name || '');
    const haystack = `${region} ${name} ${wine.category_id || ''}`.toLowerCase();

    if (haystack.includes('granada')) {
      return {
        es: 'vino de altura',
        en: 'beyond Rioja/Ribera',
        fr: "vin d'altitude",
      }[lang];
    }
    if (haystack.includes('manzanilla') || haystack.includes('sanlúcar')) {
      return {
        es: 'salitre de Cádiz',
        en: 'Cádiz saltiness',
        fr: 'salinité de Cadix',
      }[lang];
    }
    if (haystack.includes('jerez')) {
      return {
        es: 'crianza de solera andaluza',
        en: 'Andalusian solera tradition',
        fr: 'élevage andalou en solera',
      }[lang];
    }
    if (haystack.includes('cádiz')) {
      return {
        es: 'blanco atlántico de Cádiz',
        en: 'Atlantic white from Cádiz',
        fr: 'blanc atlantique de Cadix',
      }[lang];
    }
    if (haystack.includes('rueda')) {
      return {
        es: 'verdejo fresco de meseta',
        en: 'fresh Verdejo from Castilla',
        fr: 'verdejo frais de Castille',
      }[lang];
    }
    if (haystack.includes('rioja')) {
      return {
        es: 'clásico riojano',
        en: 'classic Rioja red',
        fr: 'classique de la Rioja',
      }[lang];
    }
    if (haystack.includes('ribera')) {
      return {
        es: 'tinto castellano',
        en: 'classic Ribera red',
        fr: 'rouge castillan',
      }[lang];
    }
    return '';
  }

  function pairingChipText(wine, lang) {
    const wineName = typeof wine.name === 'object' ? t(wine.name, lang) : wine.name;
    const type = wineTypeLabel(wine.type, lang);
    const region = wine.region || '';
    const note = wineCultureNote(wine, lang);

    if (lang === 'en' && /granada/i.test(region)) {
      return `Try a local ${type || 'wine'} · ${note} · ${wineName} · ${region}`;
    }
    return [wineName, type, region, note].filter(Boolean).join(' · ');
  }

  function renderPairingChip(dish, wines, lang) {
    const pairingText = t(dish.pairing, lang);
    if (!pairingText) return '';
    const availableWines = (wines || []).filter(w => w.available !== false);
    const matched = availableWines.find(w => {
      const wineName = typeof w.name === 'object' ? t(w.name, lang) : (w.name || '');
      return pairingText.toLowerCase().includes(wineName.toLowerCase());
    });
    if (!matched) return '';
    const wineDisplayName = typeof matched.name === 'object' ? t(matched.name, lang) : matched.name;
    const chipText = pairingChipText(matched, lang);
    return `<a class="pairing-chip" href="#wine-${matched.id}" data-wine-id="${matched.id}" data-wine-name="${wineDisplayName}">${chipText}</a>`;
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
      ? `<div class="edict-temporada-group">${t(dm.seasonal, lang).split(' · ').map(note =>
          `<p class="edict-temporada">${note.trim()}</p>`).join('')}</div>`
      : '';

    const daysStr = (dm.days || [])
      .map(d => DAY_NAMES[d] ? DAY_NAMES[d][lang] : d)
      .join(', ');
    const periodStr = dm.service_period
      ? ` · ${formatTimePeriod(dm.service_period, lang)}`
      : '';

    return `<div class="tile-frame edict">
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
      ${seasonal}
      ${desserts}
    </div>
    <div class="edict-foot">${t(nav.edict_foot, lang)}</div>
</div>`;
  }

  // ─── SPOTLIGHT: SABORES DE ANDALUCÍA ─────────────────────────────────────────
  function renderSpotlightAndalucia(dishes, categories, wines, lang) {
    const cat = (categories || []).find(c => c.id === SABORES_CATEGORY_ID);
    if (!cat) return '';
    const catName = t(cat.name, lang);
    const spotlightDishes = (dishes || []).filter(d => d.available !== false && d.category_id === SABORES_CATEGORY_ID);
    if (!spotlightDishes.length) return '';

    const cards = spotlightDishes.map(dish => {
      const badge = renderBadge(dish, lang);
      const statusHtml = renderDishStatus(dish, lang);
      const descText = t(dish.description, lang);
      const pairingChip = renderPairingChip(dish, wines, lang);
      const parsed = parseDishPrice(formatPrice(dish.price), lang);
      const priceHtml = dish.status === 'soldout' ? '' : `<span class="check-price dish-price">${parsed.label || parsed.display}</span>`;
      const priceNote = (dish.status !== 'soldout' && parsed.type === 'portions')
        ? `<p class="price-note">${parsed.note}</p>` : '';
      return `<div class="spotlight-card${getDishStatusClass(dish)}">
  ${badge}
  <span class="check-name">${t(dish.name, lang)}</span>
  ${descText ? `<p class="item-desc">${descText}</p>` : ''}
  ${priceHtml}
  ${priceNote}
  ${statusHtml}
  ${pairingChip}
</div>`;
    }).join('');

    const image = CARTA_ACCENT_IMAGES[0]; // bar-leon-plato-05.webp
    const captionSuffix = {
      es: 'Tomate aliñao, un entrante fresco y tradicional en Bar León.',
      en: 'Tomate aliñao, a fresh and traditional starter at Bar León.',
      fr: 'Tomate aliñao, une entrée fraîche et traditionnelle au Bar León.'
    }[lang];

    return `<section class="tile-bg-section home-andalusia spotlight-andalucia" style="margin-top:0;">
  <div class="tile-card">
    <div class="home-section-head">
      <p class="section-label">${LABELS.restaurantIntro[lang]}</p>
      <h2 id="home-andalusia-title" class="spotlight-andalucia__title" style="border-bottom:none;padding-bottom:0;margin-bottom:0;">${catName}</h2>
    </div>
    <div class="carta-accent-images editorial-snapshot" style="margin: 20px 0;">
      <figure class="editorial-snapshot__figure" style="box-shadow:none;border-color:rgba(28,26,23,0.12);padding:8px;">
        <img class="editorial-snapshot__img" src="${WEB_IMAGE_BASE}${image.src}" alt="${image.alt[lang]}" width="800" height="500" loading="lazy" decoding="async">
        <figcaption class="editorial-snapshot__caption" style="font-size:0.75rem;margin-top:8px;padding-top:6px;">
          ${image.alt[lang]} &mdash; ${captionSuffix}
        </figcaption>
      </figure>
    </div>
    <div class="spotlight-andalucia-inner" style="border-top:none;">
      ${cards}
    </div>
  </div>
</section>`;
  }

  function renderCarta(dishes, categories, wines, lang, service) {
    const available = (dishes || []).filter(i => i.available !== false);
    const catMap = {};
    (categories || [])
      .filter(c => (c.service || (c.type === 'food' ? 'restaurant' : 'bar')) === service)
      .filter(c => c.id !== SABORES_CATEGORY_ID)
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

    order.sort((a, b) => {
      const orderA = catMap[a] ? catMap[a].order : 999;
      const orderB = catMap[b] ? catMap[b].order : 999;
      return orderA - orderB;
    });

    const cats = order.map((catId, idx) => {
      const cat  = catMap[catId];
      const name = cat ? t(cat.name, lang) : catId;
      const list = groups[catId];

      const itemsHtml = list.map(item => {
        const badge = renderBadge(item, lang);
        const statusHtml = renderDishStatus(item, lang);
        const pairingChip = renderPairingChip(item, wines, lang);
        const parsed = parseDishPrice(formatPrice(item.price), lang);
        const priceCell = item.status === 'soldout' ? '' : `<span class="check-price dish-price">${parsed.label || parsed.display}</span>`;
        const priceNote = (item.status !== 'soldout' && parsed.type === 'portions')
          ? `<p class="price-note">${parsed.note}</p>` : '';
        return `<article class="carta-item${getDishStatusClass(item)}">
  <div class="check-row">
    ${badge ? `<div>${badge}</div>` : ''}
    <span class="check-name">${t(item.name, lang)}</span>
    <span class="check-leader" aria-hidden="true"></span>
    ${priceCell}
  </div>
  ${priceNote}
  ${t(item.description, lang) ? `<p class="item-desc">${t(item.description, lang)}</p>` : ''}
  ${statusHtml}
  ${pairingChip}
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

  // ─── PARA EMPEZAR BLOCK ───────────────────────────────────────────────────────
  function renderParaEmpezar(wines, beverages, lang) {
    const PARA_EMPEZAR_NAMES = ['fino', 'manzanilla', 'vermut', 'alhambra reserva'];
    const allItems = [...(wines || []), ...(beverages || [])].filter(i => i.available !== false);
    const matched = [];
    PARA_EMPEZAR_NAMES.forEach(function(needle) {
      if (matched.length >= 5) return;
      const found = allItems.find(function(item) {
        const name = typeof item.name === 'object' ? t(item.name, lang) : (item.name || '');
        return name.toLowerCase().includes(needle.toLowerCase());
      });
      if (found && !matched.find(m => m.id === found.id)) {
        matched.push(found);
      }
    });
    if (!matched.length) return '';

    const items = matched.map(function(item) {
      const name = typeof item.name === 'object' ? t(item.name, lang) : (item.name || '');
      let priceStr = '';
      if (item.price_glass) {
        priceStr = formatPrice(item.price_glass);
      } else if (item.price_bottle) {
        priceStr = formatPrice(item.price_bottle);
      } else {
        priceStr = item.price || '';
      }
      return `<div class="para-empezar__item">
  <span class="para-empezar__name">${name}</span>
  <span class="para-empezar__price">${priceStr}</span>
</div>`;
    }).join('');

    return `<div class="para-empezar">
  <h3 class="para-empezar__title">${LABELS.paraEmpezarTitle[lang]}</h3>
  <p class="para-empezar__sub">${LABELS.paraEmpezarSub[lang]}</p>
  <div class="para-empezar__strip">
    ${items}
  </div>
</div>`;
  }

  function renderWines(wines, beverages, dishes, categories, lang, service) {
    const hasWines = Array.isArray(wines) && wines.length > 0;
    const hasBeverages = Array.isArray(beverages) && beverages.length > 0;
    const hasDishes = Array.isArray(dishes) && dishes.length > 0;
    if (!hasWines && !hasBeverages && !hasDishes) return '';
    const catMap = {};
    (categories || [])
      .filter(c => (c.service || (c.type === 'food' ? 'restaurant' : 'bar')) === service)
      .forEach(c => { catMap[c.id] = c; });

    const groups = {};
    const order  = [];
    [...(wines || []), ...(beverages || []), ...(dishes || [])].filter(w => w && w.available !== false).forEach(item => {
      if (!catMap[item.category_id]) return;
      if (!groups[item.category_id]) {
        groups[item.category_id] = [];
        order.push(item.category_id);
      }
      groups[item.category_id].push(item);
    });

    order.sort((a, b) => {
      const orderA = catMap[a] ? catMap[a].order : 999;
      const orderB = catMap[b] ? catMap[b].order : 999;
      return orderA - orderB;
    });

    const cats = order.map((catId, idx) => {
      const cat  = catMap[catId];
      const name = cat ? t(cat.name, lang) : catId;
      const list = groups[catId];

      const itemsHtml = list.map(item => {
        const nameStr = typeof item.name === 'object' ? t(item.name, lang) : item.name;

        let priceStr = '';
        if (item.price_glass && item.price_bottle) {
          const glassLabels = { es: 'Copa', en: 'Glass', fr: 'Verre' };
          const bottleLabels = { es: 'Bot.', en: 'Bot.', fr: 'Bout.' };
          priceStr = `${glassLabels[lang]} ${formatPrice(item.price_glass)} / ${bottleLabels[lang]} ${formatPrice(item.price_bottle)}`;
        } else if (item.price_bottle) {
          priceStr = formatPrice(item.price_bottle);
        } else if (item.price_glass) {
          priceStr = formatPrice(item.price_glass);
        } else {
          priceStr = item.price || '';
        }

        const descText = t(item.description, lang);
        let extraHtml = '';
        if (item.region) {
          extraHtml = `<p class="item-desc">${item.region}</p>`;
        } else if (descText) {
          extraHtml = `<p class="item-desc">${descText}</p>`;
        }

        return `<article class="carta-item" id="wine-${item.id}">
  <div class="check-row">
    <span class="check-name">${nameStr}${item.producer ? ` <span class="item-producer">${item.producer}</span>` : ''}</span>
    <span class="check-leader" aria-hidden="true"></span>
    <span class="check-price">${priceStr}</span>
  </div>
  ${extraHtml}
</article>`;
      }).join('');

      let warningHtml = '';
      if (catId === 'bocadillos') {
        const warnings = {
          es: 'No se sirven bocadillos en el comedor',
          en: 'Sandwiches are not served in the dining room',
          fr: 'Les sandwichs ne sont pas servis en salle'
        };
        warningHtml = `<div class="bocadillos-warning">${warnings[lang]}</div>`;
      }

      return `<div class="accordion-item${idx === 0 ? ' is-open' : ''}">
  <div class="categoria-head" role="button" tabindex="0" aria-expanded="${idx === 0 ? 'true' : 'false'}">
    <h2>${name}</h2>
    <span class="accordion-icon" aria-hidden="true"></span>
  </div>
  <div class="accordion-body">
    ${warningHtml}
    ${itemsHtml}
  </div>
</div>`;
    });

    return `<div class="wrap carta-accordion">${cats.join('')}</div>`;
  }

  function renderMenuSections(d, nav, lang) {
    const serviceMode = d.service_mode || {};

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
  ${renderSpotlightAndalucia(d.dishes, d.categories, d.wines, lang)}
  ${renderCarta(d.dishes, d.categories, d.wines, lang, 'restaurant')}
</section>
<section id="panel-bar" class="menu-panel" role="tabpanel" data-panel="bar" hidden>
  <div class="wrap menu-panel-intro">
    <p class="section-label">${LABELS.bar[lang]}</p>
    <p class="menu-panel-copy">${LABELS.barIntro[lang]}</p>
  </div>
  <div class="wrap">${renderParaEmpezar(d.wines, d.beverages, lang)}</div>
  ${renderWines(d.wines, d.beverages, d.dishes, d.categories, lang, 'bar')}
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

  function scrollToWine(container, wineId) {
    if (!wineId) return;

    const barBtn = container.querySelector('.menu-switch-btn[data-panel="bar"]');
    if (barBtn) barBtn.click();

    setTimeout(function() {
      const wineEl = document.getElementById('wine-' + wineId);
      if (!wineEl) return;
      const accordion = wineEl.closest ? wineEl.closest('.accordion-item') : null;
      if (accordion && !accordion.classList.contains('is-open')) {
        const head = accordion.querySelector('.categoria-head');
        if (head) head.click();
      }
      wineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      wineEl.classList.add('is-pairing-target');
      setTimeout(function() { wineEl.classList.remove('is-pairing-target'); }, 1400);
    }, 150);
  }

  // ─── PAIRING CHIP CLICK DELEGATION ───────────────────────────────────────────
  function initPairingChips(container) {
    container.addEventListener('click', function(e) {
      const chip = e.target.closest('.pairing-chip');
      if (!chip) return;
      e.preventDefault();
      const wineId = chip.getAttribute('data-wine-id');
      scrollToWine(container, wineId);
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
    const serviceMode = d.service_mode || {};
    const inService = isNowServiceTime(d.hours);
    const whatsapp = d.contact.whatsapp ? d.contact.whatsapp.replace(/\D/g, '') : '';

    let ctaHtml;
    if (serviceMode.restaurant_open === false) {
      ctaHtml = whatsapp
        ? `<a href="https://wa.me/${whatsapp}" class="cta-btn">${t(nav.whatsapp_btn, lang) || 'Reservar por WhatsApp'}</a>`
        : '';
    } else if (inService) {
      ctaHtml = `<a href="${d.contact.phone_link}" class="cta-btn">${t(nav.call, lang)}</a>`;
    } else {
      ctaHtml = whatsapp
        ? `<a href="https://wa.me/${whatsapp}" class="cta-btn">${t(nav.whatsapp_btn, lang) || 'Reservar por WhatsApp'}</a>
<a href="${d.contact.phone_link}" class="cta-btn cta-btn--secondary">${t(nav.call, lang)}</a>`
        : `<a href="${d.contact.phone_link}" class="cta-btn">${t(nav.call, lang)}</a>`;
    }

    return `<footer class="carta-footer">
  <div class="wrap">
    <p class="carta-footer-address">${addr.neighborhood} &middot; ${addr.city} &middot; ${addr.region}<br>${t(d.venue.cuisine_tag, lang)}</p>
  </div>
  ${ctaHtml}
  <div class="wrap">
    <p class="carta-brand">${t(d.venue.name, lang)}</p>
    <a href="/admin/" class="owner-link">Acceso propietario</a>
  </div>
</footer>`;
  }

  // ─── MOBILE SERVICE CTA ───────────────────────────────────────────────────────
  function injectMobileServiceCTA(d, lang) {
    if (!d.contact) return;
    const number = d.contact.whatsapp ? d.contact.whatsapp.replace(/\D/g, '') : '';
    const inService = isNowServiceTime(d.hours);
    const fab = document.createElement('a');
    fab.className = 'mobile-service-cta';
    if (inService || !number) {
      fab.href = d.contact.phone_link;
      fab.textContent = t(d.nav && d.nav.call, lang) || 'Llamar';
    } else {
      fab.href = 'https://wa.me/' + number;
      fab.target = '_blank';
      fab.rel = 'noopener';
      fab.textContent = LABELS.whatsappFab[lang] || 'WhatsApp';
    }
    document.body.appendChild(fab);
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
      initPairingChips(app);
      injectLangBar(lang);
      injectMobileServiceCTA(d, lang);
      header.style.display = 'block';
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);

      if (window.location.hash === '#hours') {
        setTimeout(() => {
          const el = document.getElementById('hours');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else if (window.location.hash.indexOf('#wine-') === 0) {
        scrollToWine(app, window.location.hash.replace('#wine-', ''));
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
