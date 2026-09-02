(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta', en: '/en/menu', fr: '/fr/carte' };

  const LABELS = {
    starters:   { es: 'Primeros',       en: 'First course',  fr: 'Entrées'  },
    seconds:    { es: 'Segundos',       en: 'Second course', fr: 'Plats'    },
    daily:      { es: 'Plato del día',  en: 'Daily special', fr: 'Plat du jour' },
    desserts:   { es: 'Postre',         en: 'Dessert',       fr: 'Dessert'  },
    closed:     { es: 'Cerrado',        en: 'Closed',        fr: 'Fermé'    },
    dailyMenu:  { es: 'Menú del Día',   en: 'Daily menu',    fr: 'Menu du jour' },
    restaurant: { es: 'Restaurante', en: 'Restaurant menu', fr: 'Carte restaurant' },
    bar:        { es: 'Barra y raciones', en: 'Bar menu', fr: 'Carte comptoir' },
    barIntro:   { es: 'Lo que sale de la barra. Sin ceremonia.', en: 'Straight from the bar. No fuss.', fr: 'Ce qui sort du comptoir. Sans cérémonie.' },
    beverages:  { es: 'Bebidas y vinos', en: 'Drinks', fr: 'Boissons' },
    beveragesIntro: { es: 'Cervezas, refrescos, licores y selección de vinos.', en: 'Beers, soft drinks, spirits and wine selection.', fr: 'Bières, boissons sans alcool, spiritueux et sélection de vins.' },
    restaurantIntro: { es: 'La carta de mesa, separada del menú del día.', en: 'The table menu, separate from the daily menu.', fr: 'La carte de table, séparée du menu du jour.' },
    wines:      { es: 'La Bodega',      en: 'The Cellar',    fr: 'La Cave' },
    winesIntro: { es: 'Nuestra selección de vinos. D.O. Granada por delante, acompañados de los grandes clásicos de la península.', en: 'Our wine selection. Local D.O. Granada first, alongside classic Spanish appellations.', fr: 'Notre sélection de vins. Les vins de Grenade en priorité, accompagnés des grands classiques espagnols.' },
    badge_recommended: { es: 'Recomendado', en: 'Recommended',   fr: 'Recommandé'         },
    badge_seasonal:    { es: 'Temporada',   en: 'Seasonal',       fr: 'Saison'             },
    badge_house:       { es: 'De la casa',  en: 'House special',  fr: 'Maison'             },
    badge_local:       { es: 'Granada',     en: 'Granada',        fr: 'Grenade'            },
    soldout:           { es: 'Agotado hoy', en: 'Sold out today', fr: "Épuisé aujourd'hui" },
    paraEmpezarTitle:  { es: 'Para empezar',              en: 'To start',                   fr: 'Pour commencer'           },
    paraEmpezarSub:    { es: 'La barra, antes de la mesa.', en: 'The bar, before the table.', fr: 'Le comptoir, avant la table.' },
    statusOpen:        { es: 'Estamos abiertos', en: 'We are open', fr: 'Nous sommes ouverts' },
    statusClosed:      { es: 'Cerrado', en: 'Closed', fr: 'Fermé' },
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
  function getHoursSchedule(hours) {
    if (!hours) return [];
    return Array.isArray(hours) ? hours : (hours.schedule || []);
  }

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

  function isPublicItem(item) {
    return Boolean(item)
      && item.available !== false
      && item.deleted !== true
      && item.price_status !== 'uncertain';
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

    const cleanStr = str.replace(/&nbsp;/g, ' ').replace(/ /g, ' ');

    const m = cleanStr.match(/^Media\s+(.+?)\s*\/\s*Raci[oó]n\s+(.+)$/i);
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
      const localized = cleanStr
        .replace(/\(raci[oó]n\)\s*\/\s*(.+?)\(unidad en barra\)/i,
          (_, mid) => `(${T.racion}) / ${mid}(${T['unidad en barra']})`)
        .replace(/\(unidad\)/gi,       `(${T.unidad})`)
        .replace(/\(barra\)/gi,        `(${T.barra})`)
        .replace(/\(restaurante\)/gi,  `(${T.restaurante})`)
        .replace(/\/\s*raci[oó]n\b/gi, `/ ${T.racion}`);
      return { type: 'simple', display: localized };
    }

    return { type: 'simple', display: cleanStr };
  }

  function formatTimePeriod(period, lang) {
    function to12Hour(timeStr) {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }

    function toFrench(timeStr) {
      const parts = timeStr.split(':');
      return `${parts[0]}h${parts[1]}`;
    }

    if (lang === 'en') {
      return `${to12Hour(period.open)} – ${to12Hour(period.close)}`;
    } else if (lang === 'fr') {
      return `${toFrench(period.open)} à ${toFrench(period.close)}`;
    } else {
      return `${period.open} a ${period.close}`;
    }
  }

  function langSelector(lang) {
    return ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-active">${l.toUpperCase()}</span>`
        : `<a href="${CARTA_LINKS[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="sep"> · </span>');
  }

  // ─── BADGE HELPER ─────────────────────────────────────────────────────────────
  function renderBadge(dish, lang) {
    const v = dish.featured;
    if (!v || v === false) return '';
    if (v === true || v === 'recommended') return `<span class="dish-badge dish-badge--recommended">${LABELS.badge_recommended[lang]}</span>`;
    if (v === 'seasonal') return `<span class="dish-badge dish-badge--seasonal">${LABELS.badge_seasonal[lang]}</span>`;
    if (v === 'house') return `<span class="dish-badge dish-badge--house">${LABELS.badge_house[lang]}</span>`;
    if (v === 'local') return `<span class="dish-badge dish-badge--local">${LABELS.badge_local[lang]}</span>`;
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
    const region = typeof wine.region === 'object' ? t(wine.region, lang) : (wine.region || '');
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
        es: 'salinidad de Sanlúcar',
        en: 'salty Sanlúcar character',
        fr: 'salinité de Sanlúcar',
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
    const region = typeof wine.region === 'object' ? t(wine.region, lang) : (wine.region || '');
    const note = wineCultureNote(wine, lang);

    if (lang === 'en' && /granada/i.test(region)) {
      return `Try a local ${type || 'wine'} · ${note} · ${wineName} · ${region}`;
    }
    return [wineName, type, region, note].filter(Boolean).join(' · ');
  }

  function renderPairingChip(dish, wines, lang) {
    const pairingText = t(dish.pairing, lang);
    if (!pairingText) return '';
    const availableWines = (wines || []).filter(isPublicItem);
    const matched = availableWines.find(w => {
      const wineName = typeof w.name === 'object' ? t(w.name, lang) : (w.name || '');
      return pairingText.toLowerCase().includes(wineName.toLowerCase());
    });
    if (!matched) return '';
    const wineDisplayName = typeof matched.name === 'object' ? t(matched.name, lang) : matched.name;
    const chipText = pairingChipText(matched, lang);
    return `<a class="pairing-chip" href="#wine-${matched.id}" data-wine-id="${matched.id}" data-wine-name="${wineDisplayName}">${chipText}</a>`;
  }

  function renderAllergens(item, allergens, lang) {
    if (!item || item.allergen_status !== 'confirmed') return '';
    const confirmed = new Set(Array.isArray(item.allergens_confirmed) ? item.allergens_confirmed : []);
    const ids = Array.isArray(item.allergens)
      ? item.allergens.filter(id => confirmed.has(id))
      : [];
    if (!ids.length || !Array.isArray(allergens)) return '';
    const labels = ids.map(id => {
      const def = allergens.find(a => a.id === id);
      if (!def) return '';
      const text = def.label ? t(def.label, lang) : id;
      const short = def.short ? t(def.short, lang) : text;
      return `<span class="allergen-chip" title="${text}">${short}</span>`;
    }).filter(Boolean).join('');
    if (!labels) return '';
    const lead = { es: 'Alérgenos', en: 'Allergens', fr: 'Allergènes' }[lang] || 'Alérgenos';
    return `<div class="allergen-list" aria-label="${lead}"><span class="allergen-list__label">${lead}</span>${labels}</div>`;
  }

  function renderMenuDia(dm, nav, lang) {
    if (!dm || !dm.active) return '';

    function asList(str) {
      const items = Array.isArray(str) ? str : String(str).split(' · ');
      return `<ul class="edict-platos">${items.map(s =>
        `<li>${String(s).trim()}</li>`).join('')}</ul>`;
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

    return `<div class="edict home-card">
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

  function renderCarta(dishes, categories, wines, allergens, lang, service) {
    const available = (dishes || []).filter(isPublicItem);
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

    order.sort((a, b) => {
      const orderA = catMap[a] ? catMap[a].order : 999;
      const orderB = catMap[b] ? catMap[b].order : 999;
      return orderA - orderB;
    });

    const cats = order.map((catId, idx) => {
      const cat  = catMap[catId];
      const name = cat ? t(cat.name, lang) : catId;
      const note = cat && cat.notes ? t(cat.notes, lang) : '';
      const list = groups[catId];

      const itemsHtml = list.map(item => {
        const badge = renderBadge(item, lang);
        const statusHtml = renderDishStatus(item, lang);
        const allergensHtml = renderAllergens(item, allergens, lang);
        const parsed = parseDishPrice(formatPrice(item.price), lang);
        const priceCell = item.status === 'soldout' ? '' : `<span class="check-price dish-price">${parsed.display || parsed.label}</span>`;
        const priceNote = (item.status !== 'soldout' && parsed.type === 'portions')
          ? `<p class="price-note">${parsed.note}</p>` : '';
        return `<article class="carta-item${getDishStatusClass(item)}">
  <div class="check-row">
    <div class="check-copy">
      <span class="check-name">${t(item.name, lang)}</span>
      ${badge}
    </div>
    ${priceCell}
  </div>
  ${priceNote}
  ${t(item.description, lang) ? `<p class="item-desc">${t(item.description, lang)}</p>` : ''}
  ${statusHtml}
  ${allergensHtml}
</article>`;
      }).join('');

      return `<section class="menu-category" aria-labelledby="category-${catId}">
  <h2 id="category-${catId}" class="categoria-head">${name}</h2>
  ${note ? `<p class="category-note">${note}</p>` : ''}
  <div class="menu-category__items">${itemsHtml}</div>
</section>`;
    });

    return `<div class="container--menu carta-list">${cats.join('')}</div>`;
  }

  // ─── PARA EMPEZAR BLOCK ───────────────────────────────────────────────────────
  function renderParaEmpezar(wines, beverages, lang) {
    const PARA_EMPEZAR_NAMES = ['fino', 'manzanilla', 'vermut', 'alhambra reserva'];
    const allItems = [...(wines || []), ...(beverages || [])].filter(isPublicItem);
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

  function renderWines(wines, beverages, dishes, categories, allergens, lang, service, excludeType, includeType) {
    const hasWines = Array.isArray(wines) && wines.length > 0;
    const hasBeverages = Array.isArray(beverages) && beverages.length > 0;
    const hasDishes = Array.isArray(dishes) && dishes.length > 0;
    if (!hasWines && !hasBeverages && !hasDishes) return '';
    const catMap = {};
    (categories || [])
      .filter(c => (c.service || (c.type === 'food' ? 'restaurant' : 'bar')) === service)
      .filter(c => {
        if (excludeType && c.type === excludeType) return false;
        if (includeType && c.type !== includeType) return false;
        return true;
      })
      .forEach(c => { catMap[c.id] = c; });

    const groups = {};
    const order  = [];
    [...(wines || []), ...(beverages || []), ...(dishes || [])].filter(isPublicItem).forEach(item => {
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
        const regionStr = typeof item.region === 'object' ? t(item.region, lang) : item.region;
        let extraHtml = '';
        if (regionStr || descText) {
          const parts = [regionStr, descText].filter(Boolean);
          extraHtml = `<p class="item-desc">${parts.join(' · ')}</p>`;
        }

        const showProducer = item.producer && !nameStr.toLowerCase().includes(item.producer.toLowerCase());
        const producerHtml = showProducer ? ` <span class="item-producer">${item.producer}</span>` : '';

        const itemBadge = renderBadge(item, lang);
        const allergensHtml = renderAllergens(item, allergens, lang);
        return `<article class="carta-item" id="wine-${item.id}">
  <div class="check-row">
    <div class="check-copy"><span class="check-name">${nameStr}${producerHtml}</span>${itemBadge}</div>
    <span class="check-price">${priceStr}</span>
  </div>
  ${extraHtml}
  ${allergensHtml}
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

      return `<section class="menu-category" aria-labelledby="category-${catId}">
  <h2 id="category-${catId}" class="categoria-head">${name}</h2>
  <div class="menu-category__items">
    ${warningHtml}
    ${itemsHtml}
  </div>
</section>`;
    });

    return `<div class="container--menu carta-list">${cats.join('')}</div>`;
  }

  function renderChalkboard(d, lang) {
    const cb = d.chalkboard;
    if (!cb || !cb.group1 || !cb.group2) return '';

    const mediaLabel  = { es: 'media (€)', en: 'half (€)',   fr: 'demi (€)'   }[lang] || 'media (€)';
    const racionLabel = { es: 'ración (€)', en: 'full (€)',   fr: 'ration (€)' }[lang] || 'ración (€)';

    function formatChalkboardPrice(val) {
      if (!val || val === '—') return '—';
      val = val.trim();
      if (/^\d+([.,]\d+)?$/.test(val)) {
        return val + ' €';
      }
      if (val.toLowerCase().includes('unid')) {
        const num = val.replace(/[^\d,.]/g, '');
        return num + ' €/ud';
      }
      return val;
    }

    function rowHtml(item) {
      const name  = item[lang] || item.es || '';
      const media = formatChalkboardPrice(item.media);
      const racion = formatChalkboardPrice(item.racion);
      return `<div class="chalkboard-row">
  <span class="chalkboard-name">${name}</span>
  <span class="chalkboard-media">${media}</span>
  <span class="chalkboard-racion">${racion}</span>
</div>`;
    }

    const g1 = (cb.group1 || []).map(rowHtml).join('');
    const g2 = (cb.group2 || []).map(rowHtml).join('');

    const headerRow = `<div class="chalkboard-row chalkboard-col-header">
  <span class="chalkboard-name"></span>
  <span class="chalkboard-media">${mediaLabel}</span>
  <span class="chalkboard-racion">${racionLabel}</span>
</div>`;

    const subtitle = {
      es: 'Albayzín · Granada',
      en: 'Albayzín · Granada',
      fr: 'Albayzín · Grenade',
    }[lang];

    return `<div class="container--menu">
  <section class="barra-chalkboard home-card" aria-label="${LABELS.bar[lang]}">
    <div class="chalkboard-header">
      <div class="chalkboard-title">Bar Le&oacute;n &mdash; Desde 1959</div>
      <div class="chalkboard-subtitle">${subtitle}</div>
    </div>
    <div class="chalkboard-body">
      <div class="chalkboard-group">
        ${headerRow}
        ${g1}
      </div>
      <div class="chalkboard-vsep" aria-hidden="true"></div>
      <div class="chalkboard-group">
        ${headerRow}
        ${g2}
      </div>
    </div>
  </section>
</div>`;
  }

  function renderMenuSections(d, nav, lang) {
    return `<div class="carta-section-nav">
  <div class="container--menu menu-switch-wrap">
  <div class="menu-switch menu-switch--four" role="tablist" aria-label="${t(nav.menu, lang)}">
    <button type="button" class="menu-switch-btn is-active" role="tab" aria-selected="true" aria-controls="panel-restaurant" data-panel="restaurant">${LABELS.restaurant[lang]}</button>
    <button type="button" class="menu-switch-btn" role="tab" aria-selected="false" aria-controls="panel-bar" data-panel="bar">${LABELS.bar[lang]}</button>
    <button type="button" class="menu-switch-btn" role="tab" aria-selected="false" aria-controls="panel-beverages" data-panel="beverages">${LABELS.beverages[lang]}</button>
    <button type="button" class="menu-switch-btn menu-switch-btn--secondary" role="tab" aria-selected="false" aria-controls="panel-daily" data-panel="daily">${LABELS.dailyMenu[lang]}</button>
  </div>
</div>
</div>
<section id="panel-restaurant" class="menu-panel is-active" role="tabpanel" data-panel="restaurant">
  <div class="container--menu menu-panel-intro">
    <p class="section-label">${LABELS.restaurant[lang]}</p>
    <p class="menu-panel-copy">${LABELS.restaurantIntro[lang]}</p>
  </div>
  ${renderCarta(d.dishes, d.categories, d.wines, d.allergens, lang, 'restaurant')}
</section>
<section id="panel-bar" class="menu-panel" role="tabpanel" data-panel="bar" hidden>
  <div class="container--menu menu-panel-intro">
    <p class="section-label">${LABELS.bar[lang]}</p>
    <p class="menu-panel-copy">${LABELS.barIntro[lang]}</p>
  </div>
  ${renderChalkboard(d, lang)}
  ${renderCarta(d.dishes, d.categories, d.wines, d.allergens, lang, 'bar')}
</section>
<section id="panel-beverages" class="menu-panel" role="tabpanel" data-panel="beverages" hidden>
  <div class="container--menu menu-panel-intro">
    <p class="section-label">${LABELS.beverages[lang]}</p>
    <p class="menu-panel-copy">${LABELS.beveragesIntro[lang]}</p>
  </div>
  ${renderWines(d.wines, d.beverages, null, d.categories, d.allergens, lang, 'bar', null, null)}
</section>
<section id="panel-daily" class="menu-panel" role="tabpanel" data-panel="daily" hidden>
  <div class="container--reading menu-panel-inner">${renderMenuDia(d.daily_menu, nav, lang)}</div>
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

    const beveragesBtn = container.querySelector('.menu-switch-btn[data-panel="beverages"]');
    if (beveragesBtn) beveragesBtn.click();

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
    const cells = getHoursSchedule(hours).map(h => {
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

    return `<section class="container--menu hours-section" id="hours">
  <p class="section-label">${t(nav.hours, lang)}</p>
  <div class="horarios-grid" role="table" aria-label="${t(nav.hours, lang)} Bar León">${cells}</div>
</section>`;
  }

  function renderFooter(d, nav, lang) {
    const addr = d.contact.address;
    const ctaHtml = `<a href="${d.contact.phone_link}" class="cta-btn">${t(nav.call, lang) || 'Llamar'}</a>`;

    return `<footer class="carta-footer">
  <div class="container--menu">
    <p class="carta-footer-address">${addr.neighborhood} &middot; ${addr.city} &middot; ${addr.region}<br>${t(d.venue.cuisine_tag, lang)}</p>
  </div>
  ${ctaHtml}
  <div class="container--menu">
    <p class="carta-brand">${t(d.venue.name, lang)}</p>
    <a href="/panel/" class="owner-link">Acceso propietario</a>
  </div>
</footer>`;
  }

  // ─── MOBILE SERVICE CTA ───────────────────────────────────────────────────────
  function injectMobileServiceCTA(d, lang) {
    if (!d.contact) return;
    const labels = {
      hours: { es: 'Horario', en: 'Hours', fr: 'Horaires' },
      top: { es: 'Arriba', en: 'Top', fr: 'Haut' },
    };
    const bar = document.createElement('nav');
    bar.className = 'mobile-service-cta';
    bar.setAttribute('aria-label', t(d.nav && d.nav.menu, lang) || 'Carta');
    bar.innerHTML = `<a href="${d.contact.phone_link}">${t(d.nav && d.nav.call, lang) || 'Llamar'}</a>
<a href="#hours">${labels.hours[lang]}</a>
<a href="#top">${labels.top[lang]}</a>`;
    document.body.appendChild(bar);
  }

  function initReveal(root) {
    if (!window.IntersectionObserver) return;
    const els = root.querySelectorAll('.editorial-snapshot, .caricature-block, .categoria-head, .wine-region-block');
    const io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', (Math.min(i, 5) * 0.08) + 's');
      io.observe(el);
    });
  }

  function getPublicBaseUrl(d) {
    return (d.seo && (d.seo.public_base_url || d.seo.canonical)) || 'https://restaurantebarleon.com';
  }

  function injectMenuJsonLd(d, lang) {
    const BASE = getPublicBaseUrl(d);
    const MENU_PATH = { es: '/es/carta', en: '/en/menu', fr: '/fr/carte' };
    const foodCats = (d.categories || []).filter(c => c.type === 'food');
    const dishes   = (d.dishes || []).filter(isPublicItem);

    const menuSections = foodCats.map(cat => {
      const items = dishes
        .filter(dish => dish.category_id === cat.id)
        .map(dish => {
          const entry = {
            '@type': 'MenuItem',
            name: dish.name ? (dish.name[lang] || dish.name.es) : '',
          };
          if (dish.description) entry.description = dish.description[lang] || dish.description.es;
          if (dish.price) {
            const raw = String(dish.price).replace(/[^\d,\.]/g, '').replace(',', '.');
            if (raw) entry.offers = { '@type': 'Offer', price: raw, priceCurrency: 'EUR' };
          }
          return entry;
        })
        .filter(e => e.name);
      return { '@type': 'MenuSection', name: cat.name ? (cat.name[lang] || cat.name.es) : cat.id, hasMenuItem: items };
    }).filter(s => s.hasMenuItem.length > 0);

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Restaurant',
          name: 'Restaurante Bar León',
          url: BASE,
          hasMenu: BASE + '/es/carta',
        },
        {
          '@type': 'Menu',
          '@id': BASE + '/es/carta',
          url: BASE + (MENU_PATH[lang] || MENU_PATH.es),
          name: { es: 'Carta', en: 'Menu', fr: 'Carte' }[lang] || 'Carta',
          hasMenuSection: menuSections,
        },
      ],
    };
    const el = document.getElementById && document.getElementById('menu-jsonld') || document.createElement('script');
    el.id = 'menu-jsonld';
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(schema);
    if (document.head && !el.parentNode) {
      document.head.appendChild(el);
    }
  }

  async function init() {
    const lang      = getLang();
    const loader    = document.getElementById('loader');
    const header    = document.getElementById('carta-header');
    const headerNav = document.getElementById('carta-nav');
    const app       = document.getElementById('carta-body');

    if (loader) {
      loader.textContent = { es: 'Cargando carta…', en: 'Loading menu…', fr: 'Chargement…' }[lang] || 'Cargando carta…';
    }

    try {
      const res = await fetch('../data/venue.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();

      injectMenuJsonLd(d, lang);
      const nav = d.nav;

      headerNav.innerHTML = `<a href="${HOME_LINKS[lang]}" class="carta-back">${t(nav.back, lang)}</a>
<strong class="carta-header-title">${t(nav.menu, lang)}</strong>
<div class="carta-header-right">
  <div class="carta-lang-selector" aria-label="Language">${langSelector(lang)}</div>
</div>`;

      app.innerHTML = [
        renderMenuSections(d, nav, lang),
        '<div class="container--menu"><hr class="divider" /></div>',
        renderHorarios(d.hours, nav, lang),
        renderFooter(d, nav, lang),
      ].join('\n');

      initMenuSwitch(app);
      initReveal(app);
      injectMobileServiceCTA(d, lang);
      header.style.display = 'block';
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);

      // Hash-based panel activation (e.g. /es/carta#restaurant)
      let hashPanel = window.location.hash.replace('#', '');
      if (hashPanel && hashPanel !== 'hours') {
        if (hashPanel === 'wines') hashPanel = 'beverages';
        const panelBtn = app.querySelector(`.menu-switch-btn[data-panel="${hashPanel}"]`);
        if (panelBtn) panelBtn.click();
      }

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
        es: 'No se pudo cargar la carta actualizada.',
        en: 'We could not load the current menu.',
        fr: 'Impossible de charger la carte actuelle.'
      }[lang] || 'No se pudo cargar la carta actualizada.';
      const retryLabel = { es: 'Reintentar', en: 'Retry', fr: 'Réessayer' }[lang] || 'Reintentar';
      if (loader) {
        loader.classList.add('loader--error');
        loader.textContent = '';
        const msg = document.createElement('span');
        msg.textContent = errMsg;
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'loader-retry';
        retryBtn.textContent = retryLabel;
        retryBtn.addEventListener('click', function () { window.location.reload(); });
        loader.appendChild(msg);
        loader.appendChild(retryBtn);
      }
      if (header) header.style.display = 'block';
      if (app) app.style.display = 'block';
      console.error('Bar León:', err);
    }
  }

  init();
}());
