(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta', en: '/en/menu', fr: '/fr/carte' };
  const WEB_IMAGE_BASE = '../assets/images/web/';


  const LABELS = {
    dailyMenu:          { es: 'Menú del Día',       en: 'Daily Menu',        fr: 'Menu du Jour'          },
    dailyKicker:        { es: 'Hoy se mira primero', en: 'Start here today', fr: "Aujourd'hui, on commence ici" },
    starters:           { es: 'Primeros',            en: 'First course',     fr: 'Entrées'               },
    seconds:            { es: 'Segundos',            en: 'Second course',    fr: 'Plats'                 },
    daily:              { es: 'Plato del día',       en: 'Daily special',    fr: 'Plat du jour'          },
    desserts:           { es: 'Postre',              en: 'Dessert',          fr: 'Dessert'               },
    fullMenu:           { es: 'Ver carta completa',  en: 'View full menu',   fr: 'Voir la carte'         },
    andalusia:          { es: 'Sabores de Andalucía', en: 'Flavors of Andalusia', fr: "Saveurs d'Andalousie" },
    andalusiaSub:       { es: 'Platos de casa, guiso y barra granadina.', en: 'House dishes, stews, and Granada bar classics.', fr: 'Plats maison, mijotés et comptoir grenadin.' },
    stories:            { es: 'Historias del León',  en: 'Stories of León',  fr: 'Histoires du León'     },
    storiesSub:         { es: 'Archivo familiar y memoria de barra. Solo material real del León.', en: 'Family archive and bar memory. Only real León material.', fr: 'Archives familiales et mémoire du comptoir. Uniquement du matériel réel du León.' },
    call:               { es: 'Llamar',              en: 'Call',             fr: 'Appeler'               },
    statusOpen:         { es: 'Estamos abiertos',    en: 'We are open',      fr: 'Nous sommes ouverts'   },
    statusClosed:       { es: 'Cerrado',             en: 'Closed',           fr: 'Fermé'                 },
    recommended:        { es: 'Recomendado',         en: 'Recommended',      fr: 'Recommandé'            },
    seasonal:           { es: 'Temporada',           en: 'Seasonal',         fr: 'Saison'                },
    house:              { es: 'De la casa',          en: 'House specialty',  fr: 'Spécialité maison'     },
    cartaRestaurante:   { es: 'Carta restaurante',   en: 'Restaurant menu',  fr: 'Menu restaurant'       },
    cartaBarra:         { es: 'Carta barra',         en: 'Bar menu',         fr: 'Menu du bar'           },
    menuDia:            { es: 'Menú del día',        en: 'Daily menu',       fr: 'Menu du jour'          },
    horasHoy:           { es: 'Hoy',                 en: 'Today',            fr: "Aujourd'hui"           },
    cerradoHoy:         { es: 'Cerrado hoy',         en: 'Closed today',     fr: "Fermé aujourd'hui"     },
    directions:         { es: 'Cómo llegar',         en: 'Directions',       fr: 'Itinéraire'            },
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
    if (typeof price === 'number') return price.toFixed(2).replace('.', ',') + '&nbsp;€';
    return (price || '').replace(/\s€/g, '&nbsp;€');
  }

  function parseDishPrice(str, lang) {
    if (!str) return { type: 'simple', display: '' };

    // Normalize non-breaking spaces for regex matching
    const cleanStr = str.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');

    const PORTION_TERMS = {
      es: { label: 'Ración*', half: 'Media',    full: 'Ración'   },
      en: { label: 'Portion*', half: '½',       full: 'Portion'  },
      fr: { label: 'Portion*', half: '½',       full: 'Portion'  },
    };
    const INLINE_TERMS = {
      en: { racion: 'Portion', unidad: 'each', barra: 'bar', restaurante: 'restaurant', 'unidad en barra': 'unit at bar' },
      fr: { racion: 'Portion', unidad: 'unité', barra: 'comptoir', restaurante: 'restaurant', 'unidad en barra': "à l'unité" },
    };

    const m = cleanStr.match(/^Media\s+(.+?)\s*\/\s*Raci[oó]n\s+(.+)$/i);
    if (m) {
      const T = PORTION_TERMS[lang] || PORTION_TERMS.es;
      const half = m[1].trim().replace(/\s/g, '&nbsp;');
      const full = m[2].trim().replace(/\s/g, '&nbsp;');
      return {
        type:  'portions',
        label: T.label,
        note:  `${T.half} ${half} · ${T.full} ${full}`,
      };
    }

    if (lang !== 'es') {
      const T = INLINE_TERMS[lang] || {};
      const localized = cleanStr
        .replace(/\(raci[oó]n\)\s*\/\s*(.+?)\(unidad en barra\)/i,
          (_, mid) => `(${T.racion}) / ${mid}(${T['unidad en barra']})`)
        .replace(/\(unidad\)/gi,       `(${T.unidad})`)
        .replace(/\(barra\)/gi,        `(${T.barra})`)
        .replace(/\(restaurante\)/gi,  `(${T.restaurante})`)
        .replace(/\/\s*raci[oó]n\b/gi, `/ ${T.racion}`)
        .replace(/\s/g, '&nbsp;');
      return { type: 'simple', display: localized };
    }

    return { type: 'simple', display: str };
  }

  function formatPhoneDisplay(phone) {
    const digits = (phone || '').replace(/\D/g, '');
    if (digits === '34958225143') return '(+34) 958-22-51-43';
    return phone || '';
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

  function langSelector(lang, links) {
    return ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-active">${l.toUpperCase()}</span>`
        : `<a href="${links[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="sep"> · </span>');
  }

  function injectLangBar(lang, links) {
    const bar = document.createElement('div');
    bar.className = 'lang-bar';
    bar.setAttribute('aria-label', 'Language / Idioma / Langue');
    bar.innerHTML = ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-bar__active">${l.toUpperCase()}</span>`
        : `<a class="lang-bar__link" href="${links[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="lang-bar__sep">·</span>');
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function injectSiteNav(lang, links, cartaUrl) {
    const cartaLabel    = { es: 'Carta',    en: 'Menu',    fr: 'Carte'   }[lang];
    const historiaLabel = { es: 'Historia', en: 'History', fr: 'Histoire'}[lang];
    const contactoLabel = { es: 'Contacto', en: 'Contact', fr: 'Contact' }[lang];
    const langItems = ['es', 'en', 'fr'].map(function(l) {
      return l === lang
        ? `<span class="site-top-nav__lang-active">${l.toUpperCase()}</span>`
        : `<a class="site-top-nav__lang-link" href="${links[l]}">${l.toUpperCase()}</a>`;
    }).join('<span class="site-top-nav__lang-sep" aria-hidden="true">·</span>');

    const nav = document.createElement('nav');
    nav.className = 'site-top-nav';
    nav.setAttribute('aria-label', { es: 'Navegación principal', en: 'Main navigation', fr: 'Navigation principale' }[lang]);
    nav.innerHTML = `<div class="site-top-nav__inner">
  <a class="site-top-nav__brand" href="${links[lang]}">
    <img src="../assets/images/lion-logo.svg" alt="" width="24" height="37" aria-hidden="true" class="site-top-nav__lion" />
    <span class="site-top-nav__name">Bar León</span>
  </a>
  <ul class="site-top-nav__links" role="list">
    <li><a class="site-top-nav__link" href="${cartaUrl}">${cartaLabel}</a></li>
    <li><a class="site-top-nav__link" href="#historia">${historiaLabel}</a></li>
    <li><a class="site-top-nav__link" href="#contacto">${contactoLabel}</a></li>
  </ul>
  <div class="site-top-nav__langs" aria-label="Language / Idioma / Langue">${langItems}</div>
</div>`;
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function renderBadge() { return ''; }

  function findWineForPairing(pairingText, wines, lang) {
    if (!pairingText) return null;
    return (wines || []).filter(w => w.available !== false).find(w => {
      const wineName = typeof w.name === 'object' ? t(w.name, lang) : (w.name || '');
      return wineName && pairingText.toLowerCase().includes(wineName.toLowerCase());
    }) || null;
  }

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

  function renderPairingChip(dish, wines, lang, cartaUrl) {
    const pairingText = t(dish.pairing, lang);
    const wine = findWineForPairing(pairingText, wines, lang);
    if (!wine) return '';
    return `<a class="pairing-chip" href="${cartaUrl}#wine-${wine.id}" data-wine-id="${wine.id}">${pairingChipText(wine, lang)}</a>`;
  }

  function renderBeerPairingChip(dish, beverages, lang, cartaUrl) {
    const beerId = dish.beer_pairing;
    if (!beerId) return '';
    const beer = (beverages || []).find(b => b.id === beerId && b.available !== false);
    if (!beer) return '';
    const beerName = typeof beer.name === 'object' ? t(beer.name, lang) : (beer.name || '');
    const label = { es: `Cerveza · ${beerName}`, en: `Beer · ${beerName}`, fr: `Bière · ${beerName}` }[lang] || beerName;
    return `<a class="beer-chip" href="${cartaUrl}#bebidas">${label}</a>`;
  }

  function splitList(str) {
    return (str || '').split(' · ').map(s => s.trim()).filter(Boolean);
  }

  function isDailyMenuToday(dm) {
    if (!dm || !dm.active || !dm.days) return false;
    const now = new Date();
    const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayKey = dayKeys[now.getDay()];
    return dm.days.includes(todayKey);
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function renderNotice(venue, lang) {
    if (!venue || venue.notice_active !== true) return '';
    const notice = t(venue.notice, lang).trim();
    if (!notice) return '';
    const expiry = venue.notice_expiry || '';
    if (expiry && expiry < localDateKey(new Date())) return '';
    return `<p class="aviso">${notice}</p>`;
  }

  function renderHomeDailyMenu(d, lang, cartaUrl) {
    const dm = d.daily_menu;
    if (!dm || !dm.active) return '';

    const days   = (dm.days || []).map(function(day) { return DAY_NAMES[day] ? DAY_NAMES[day][lang] : day; }).join(', ');
    const period = dm.service_period ? `${dm.service_period.open}–${dm.service_period.close}` : '';

    const superLabel = { es: 'DE LUNES A VIERNES', en: 'MONDAY TO FRIDAY', fr: 'DU LUNDI AU VENDREDI' }[lang];
    const ctaLabel   = { es: 'VER MENÚ COMPLETO →', en: 'VIEW FULL MENU →', fr: 'VOIR LE MENU →' }[lang];
    const noteText   = t(dm.includes, lang);

    function accordionPanel(label, items, isOpen) {
      if (!items.length) return '';
      const listItems = items.map(function(item) { return `<li class="pizarra-accordion-list-item">${item}</li>`; }).join('');
      return `<div class="pizarra-accordion-item${isOpen ? ' is-open' : ''}">
  <button class="pizarra-accordion-btn" aria-expanded="${isOpen ? 'true' : 'false'}">
    <span>${label}</span><span class="pizarra-accordion-icon" aria-hidden="true"></span>
  </button>
  <div class="pizarra-accordion-body">
    <ul class="pizarra-accordion-list">${listItems}</ul>
  </div>
</div>`;
    }

    const starterItems = splitList(t(dm.starters, lang));
    const secondItems  = splitList(t(dm.seconds, lang));
    const dessertItems = splitList(t(dm.desserts, lang));

    return `<section class="pizarra-nueva" aria-labelledby="pizarra-nueva-title">
  <div class="pizarra-nueva__left">
    <img class="pizarra-nueva__lion" src="../assets/images/lion-logo.svg" alt="" width="48" height="74" aria-hidden="true" />
    <p class="pizarra-nueva__super">${superLabel}</p>
    <h2 id="pizarra-nueva-title" class="pizarra-nueva__title">${LABELS.dailyMenu[lang]}</h2>
    <p class="pizarra-nueva__price">${formatPrice(dm.price)}</p>
    <p class="pizarra-nueva__days">${days}</p>
    <p class="pizarra-nueva__time">${period}</p>
    <p class="pizarra-nueva__note">${noteText}</p>
  </div>
  <div class="pizarra-nueva__right">
    <div class="pizarra-nueva__accordions">
      ${accordionPanel(LABELS.starters[lang], starterItems, true)}
      ${accordionPanel(LABELS.seconds[lang], secondItems, false)}
      ${accordionPanel(LABELS.desserts[lang], dessertItems, false)}
    </div>
    <a class="pizarra-nueva__cta" href="${cartaUrl}#daily">${ctaLabel}</a>
  </div>
</section>`;
  }

  function renderSabores(d, lang, cartaUrl) {
    const DISH_LABELS = {
      'rinones-al-jerez':       { es: 'LA CASA',      en: 'HOUSE',       fr: 'MAISON'     },
      'carne-de-monte':         { es: 'DE MONTE ★',   en: 'MOUNTAIN ★',  fr: 'MONTAGNE ★' },
      'tortilla-sacromonte':    { es: 'GRANADA',       en: 'GRANADA',     fr: 'GRANADA'    },
      'cordobes':               { es: 'DE LA SIERRA',  en: 'SIERRA',      fr: 'SIERRA'     },
      'champinones-con-gambas': { es: 'DE LA BARRA',   en: 'BAR TAPA',    fr: 'COMPTOIR'   },
      'habas-jamon-iberico':    { es: 'LA HUERTA',     en: 'GARDEN',      fr: 'POTAGER'    },
    };

    var byId = {};
    (d.dishes || []).forEach(function(dish) { byId[dish.id] = dish; });
    const dishes = (d.home_featured_ids || [])
      .map(function(id) { return byId[id]; })
      .filter(function(dish) { return dish && dish.available !== false; });

    if (!dishes.length) return '';

    const kicker   = { es: 'PLATOS DE CASA · GUISO · BARRA GRANADINA', en: 'HOUSE DISHES · STEWS · GRANADA BAR', fr: 'PLATS MAISON · MIJOTÉS · COMPTOIR' }[lang];
    const ctaLabel = { es: 'VER CARTA COMPLETA', en: 'VIEW FULL MENU', fr: 'VOIR LA CARTE COMPLÈTE' }[lang];

    function dishCard(dish) {
      const label = (DISH_LABELS[dish.id] && DISH_LABELS[dish.id][lang]) || '';
      const name  = t(dish.name, lang);
      let desc = t(dish.description, lang);
      if (dish.id === 'habas-jamon-iberico') {
        desc = desc.split('. ').filter(function(s) {
          return !/temporada|seasonal|saison/i.test(s);
        }).join('. ').trim();
        if (desc && !desc.endsWith('.')) desc += '.';
      }
      const parsed = parseDishPrice(formatPrice(dish.price), lang);
      const priceHtml = parsed.type === 'portions'
        ? `<span class="sabores-price sabores-price--portions">${parsed.note}</span>`
        : `<span class="sabores-price">${parsed.display}</span>`;
      const pairingText = t(dish.pairing, lang);
      const pairingHtml = pairingText
        ? `<div class="sabores-pills"><span class="sabores-pill">${pairingText.split('—')[0].trim()}</span></div>`
        : '';
      return `<article class="sabores-dish">
  <div class="sabores-label">${label}</div>
  <div class="sabores-name-row">
    <h3 class="sabores-name">${name}</h3>
    ${priceHtml}
  </div>
  <p class="sabores-desc">${desc}</p>
  ${pairingHtml}
</article>`;
    }

    const left  = dishes.slice(0, 3).map(dishCard).join('');
    const right = dishes.slice(3).map(dishCard).join('');

    return `<section class="home-sabores" aria-labelledby="sabores-title">
  <div class="sabores-header">
    <p class="sabores-kicker">${kicker}</p>
    <h2 id="sabores-title" class="sabores-title">${LABELS.andalusia[lang]}</h2>
    <div class="sabores-rule"><span class="sabores-rule-pointer">◆</span></div>
  </div>
  <div class="sabores-grid">
    <div class="sabores-col">${left}</div>
    <div class="sabores-col">${right}</div>
  </div>
  <div class="sabores-footer">
    <a class="sabores-cta-btn" href="${cartaUrl}">${ctaLabel} →</a>
  </div>
</section>`;
  }


  // ─── MOBILE SERVICE CTA ───────────────────────────────────────────────────────
  function injectMobileServiceCTA(d, lang) {
    if (!d.contact) return;
    const fab = document.createElement('a');
    fab.className = 'mobile-service-cta';
    fab.href = d.contact.phone_link;
    fab.textContent = LABELS.call[lang];
    document.body.appendChild(fab);

    // Show FAB only after the hero tile scrolls out of view.
    const anchor = document.querySelector('.home-tile-wrap');
    if (anchor && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        function(entries) { fab.classList.toggle('is-visible', !entries[0].isIntersecting); },
        { threshold: 0 }
      );
      obs.observe(anchor);
    } else {
      fab.classList.add('is-visible');
    }
  }

  function renderHistoria(lang) {
    const since = { es: 'Desde 1959', en: 'Since 1959', fr: 'Depuis 1959' }[lang];
    const lines = {
      es: [
        'Tres generaciones después, seguimos sirviendo Granada en la mesa.',
        'En 2009 celebramos el 50 aniversario cobrando en pesetas.',
        'No era nostalgia. Era memoria compartida.'
      ],
      en: [
        'Three generations later, we are still serving Granada on the table.',
        'In 2009 we celebrated our 50th anniversary charging in pesetas.',
        'It was not nostalgia. It was shared memory.'
      ],
      fr: [
        'Trois générations plus tard, nous servons toujours Grenade à table.',
        'En 2009, nous avons fêté notre 50e anniversaire en facturant en pesetas.',
        "Ce n'était pas de la nostalgie. C'était une mémoire partagée."
      ]
    }[lang] || [];
    const paragraphs = lines.map(function(p) { return `<p>${p}</p>`; }).join('');
    return `<section class="historia-leon" aria-labelledby="historia-title">
  <h2 id="historia-title" class="historia-year">${since}</h2>
  <div class="historia-leon__text">${paragraphs}</div>
</section>`;
  }


  function renderPracticalInfo(d, lang) {
    const addr = d.contact.address;
    const mapsUrl = d.social.google_maps;

    const now = new Date();
    const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayKey = dayKeys[now.getDay()];
    const todayEntry = (d.hours || []).find(function(h) { return h.day === todayKey; });

    let hoursText;
    if (todayEntry && todayEntry.status !== 'closed' && todayEntry.periods && todayEntry.periods.length) {
      hoursText = todayEntry.periods.map(function(p) { return formatTimePeriod(p, lang); }).join(', ');
    } else {
      hoursText = LABELS.cerradoHoy[lang];
    }

    return `<div class="home-practical-info">
  <span class="practical-info__hours"><strong>${LABELS.horasHoy[lang]}:</strong> ${hoursText}</span>
  <span class="practical-info__sep" aria-hidden="true">·</span>
  <span class="practical-info__addr">${addr.street}, ${addr.neighborhood}</span>
  <span class="practical-info__sep" aria-hidden="true">·</span>
  <a href="${mapsUrl}" target="_blank" rel="noopener" class="practical-info__directions">${LABELS.directions[lang]} ↗</a>
</div>`;
  }

  function renderWineEditorial(d, lang, cartaUrl) {
    const we = d.wine_editorial;
    if (!we) return '';

    const title    = t(we.title, lang);
    const intro    = t(we.intro, lang);
    const ctaText  = t(we.cta, lang);
    const winesUrl = cartaUrl + '#wines';

    const featuredIds = we.featured_wine_ids || [];
    const byId = {};
    (d.wines || []).forEach(function(w) { byId[w.id] = w; });
    const wines = featuredIds
      .map(function(id) { return byId[id]; })
      .filter(function(w) { return w && w.available !== false; })
      .slice(0, 3);

    const wineCards = wines.map(function(w) {
      const name   = typeof w.name   === 'object' ? t(w.name,   lang) : (w.name   || '');
      const region = typeof w.region === 'object' ? t(w.region, lang) : (w.region || '');
      const note   = wineCultureNote(w, lang);
      return `<a class="wine-editorial__card" href="${winesUrl}">
  <span class="wine-editorial__name">${name}</span>
  <span class="wine-editorial__region">${region}</span>
  ${note ? `<span class="wine-editorial__note">${note}</span>` : ''}
</a>`;
    }).join('');

    const introParas = intro.split('\n\n').filter(Boolean)
      .map(function(p) { return `<p>${p}</p>`; }).join('');

    return `<section class="wine-editorial" aria-labelledby="wine-editorial-title">
  <div class="wine-editorial__head">
    <h2 id="wine-editorial-title">${title}</h2>
    <div class="wine-editorial__intro">${introParas}</div>
  </div>
  ${wines.length ? `<div class="wine-editorial__cards">${wineCards}</div>` : ''}
  <a class="wine-editorial__cta" href="${winesUrl}">${ctaText} →</a>
</section>`;
  }

  function renderHeroTile(d, lang, cartaUrl, inService) {
    const tileAlt     = { es: 'Restaurante Bar León — Granada', en: 'Restaurante Bar León — Granada', fr: 'Restaurante Bar León — Grenade' }[lang];
    const statusLabel = inService ? LABELS.statusOpen[lang] : LABELS.statusClosed[lang];
    const statusClass = inService ? 'status-badge--open' : 'status-badge--closed';
    return `<div class="home-tile-wrap">
  <div class="home-tile-frame">
    <picture>
      <source srcset="../assets/images/web/azulejo-leon.webp" type="image/webp">
      <img class="home-tile-img" src="../assets/images/web/azulejo-leon.png" alt="${tileAlt}"
           width="994" height="646" fetchpriority="high" />
    </picture>
  </div>
  <div class="home-tile-badge">
    <a href="${cartaUrl}#hours" class="status-badge ${statusClass}">
      <span class="status-badge__dot" aria-hidden="true"></span>
      ${statusLabel}
    </a>
  </div>
</div>`;
  }

  function renderHomeCTA(lang, cartaUrl, phoneLink) {
    const quickAccess = { es: 'Acceso rápido', en: 'Quick access', fr: 'Accès rapide' }[lang];
    return `<nav class="home-cta-nav" aria-label="${quickAccess}">
  <a href="${cartaUrl}" class="home-cta-btn home-cta-btn--carta">${LABELS.cartaRestaurante[lang]}</a>
  <a href="${cartaUrl}#bar" class="home-cta-btn home-cta-btn--carta">${LABELS.cartaBarra[lang]}</a>
  <a href="${cartaUrl}#daily" class="home-cta-btn home-cta-btn--carta">${LABELS.menuDia[lang]}</a>
  <a href="${phoneLink}" class="home-cta-btn home-cta-btn--call">${LABELS.call[lang]}</a>
</nav>`;
  }

  function render(d, lang) {
    const phoneLink = d.contact.phone_link;
    const cartaUrl  = CARTA_LINKS[lang];
    const inService = isNowServiceTime(d.hours);
    const aviso     = renderNotice(d.venue, lang);
    const mapsUrl   = d.social.google_maps;
    const addr      = d.contact.address;

    const locationTitle   = { es: 'Dónde estamos', en: 'Where to find us', fr: 'Où nous trouver' }[lang];
    const directionsLabel = { es: 'Encontrarnos en Plaza Nueva', en: 'Find us on Plaza Nueva', fr: 'Nous trouver Plaza Nueva' }[lang];

    const mapBlock = `
<section class="location-section">
  <p class="section-label">${locationTitle}</p>
  <div class="location-map">
    <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-3.5985%2C37.1755%2C-3.5945%2C37.1785&amp;layer=mapnik&amp;marker=37.17698%2C-3.59653" width="100%" height="250" style="border:0;" loading="lazy" aria-label="OpenStreetMap"></iframe>
  </div>
  <div class="location-info" style="margin-top:12px;">
    <a href="${mapsUrl}" target="_blank" rel="noopener" class="location-link">↗ ${directionsLabel}</a>
  </div>
</section>`;

    return `<div class="wrap">
  ${renderHeroTile(d, lang, cartaUrl, inService)}
  ${aviso}
  ${renderSabores(d, lang, cartaUrl)}
  ${renderHomeDailyMenu(d, lang, cartaUrl)}
  <div id="historia">${renderHistoria(lang)}</div>
  <section id="contacto" class="location-contacto">
    ${mapBlock}
    ${renderPracticalInfo(d, lang)}
  </section>
  <div class="footer-separator">❖</div>
  <div class="homepage-footer">
    <div class="homepage-footer-inner">
      <p class="address">${addr.neighborhood} &middot; ${addr.city} &middot; ${addr.region}<br>${t(d.venue.cuisine_tag, lang)}</p>
      <div class="lang-selector" aria-label="Language">${langSelector(lang, HOME_LINKS)}</div>
    </div>
    <div class="owner-access">
      <a href="/panel/" class="owner-link">Acceso propietario</a>
    </div>
  </div>
</div>`;
  }

  function initDailyMenuAccordion(root) {
    root.querySelectorAll('.home-daily-menu .accordion-item').forEach(function(item) {
      const btn  = item.querySelector('.dm-section-head');
      const body = item.querySelector('.accordion-body');
      if (!btn || !body) return;

      if (item.classList.contains('is-open')) {
        body.style.maxHeight = body.scrollHeight + 'px';
      }

      btn.addEventListener('click', function() {
        const isOpen = item.classList.contains('is-open');
        root.querySelectorAll('.home-daily-menu .accordion-item.is-open').forEach(function(other) {
          other.classList.remove('is-open');
          other.querySelector('.accordion-body').style.maxHeight = '0';
          other.querySelector('.dm-section-head').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initPizarraAccordion(root) {
    root.querySelectorAll('.pizarra-nueva .pizarra-accordion-item').forEach(function(item) {
      const btn  = item.querySelector('.pizarra-accordion-btn');
      const body = item.querySelector('.pizarra-accordion-body');
      if (!btn || !body) return;

      if (item.classList.contains('is-open')) {
        body.style.maxHeight = body.scrollHeight + 'px';
      }

      btn.addEventListener('click', function() {
        const isOpen = item.classList.contains('is-open');
        root.querySelectorAll('.pizarra-nueva .pizarra-accordion-item.is-open').forEach(function(other) {
          other.classList.remove('is-open');
          other.querySelector('.pizarra-accordion-body').style.maxHeight = '0';
          other.querySelector('.pizarra-accordion-btn').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initStoriesAlbum(root) {
    if (typeof root.querySelector !== 'function') return;
    const container = root.querySelector('.stories-archive');
    if (!container) return;

    const slides = container.querySelectorAll('.album-slide');
    const prevBtn = container.querySelector('.album-btn--prev');
    const nextBtn = container.querySelector('.album-btn--next');
    const currentCounter = container.querySelector('.album-counter__current');
    if (!slides.length || !prevBtn || !nextBtn || !currentCounter) return;

    let currentIndex = 0;

    function showSlide(index) {
      slides[currentIndex].classList.remove('is-active');
      currentIndex = (index + slides.length) % slides.length;
      slides[currentIndex].classList.add('is-active');
      currentCounter.textContent = currentIndex + 1;
    }

    prevBtn.addEventListener('click', function() {
      showSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function() {
      showSlide(currentIndex + 1);
    });
  }

  function initReveal(root) {
    if (!window.IntersectionObserver) return;
    const els = root.querySelectorAll(
      '.editorial-snapshot, .hero-frame, .caricature-block, .location-section'
    );
    const io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) { el.classList.add('reveal'); io.observe(el); });
  }

  function buildOpeningHours(hours) {
    const CODE = { monday:'Mo', tuesday:'Tu', wednesday:'We', thursday:'Th', friday:'Fr', saturday:'Sa', sunday:'Su' };
    const result = [];
    (hours || []).forEach(function(h) {
      if (h.status === 'closed' || !h.periods || !h.periods.length) return;
      const code = CODE[h.day];
      if (!code) return;
      h.periods.forEach(function(p) { result.push(code + ' ' + p.open + '-' + p.close); });
    });
    return result;
  }

  function getPublicBaseUrl(d) {
    return (d.seo && (d.seo.public_base_url || d.seo.canonical)) || 'https://restaurantebarleon.com';
  }

  function injectRestaurantJsonLd(d, lang) {
    const BASE = getPublicBaseUrl(d);
    const CARTA = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };

    const cuisineBase = d.venue && d.venue.cuisine ? (d.venue.cuisine[lang] || d.venue.cuisine.es) : 'Traditional Andalusian';
    const cuisineLists = {
      es: [cuisineBase, 'Cocina andaluza', 'Taberna', 'Casquería', 'Vinos de Granada'],
      en: [cuisineBase, 'Andalusian cuisine', 'Tavern', 'Offal dishes', 'Granada wines'],
      fr: [cuisineBase, 'Cuisine andalouse', 'Taverne', 'Abats', 'Vins de Grenade'],
    };

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'Restaurante Bar León',
      url: BASE,
      description: d.seo && d.seo.description ? (d.seo.description[lang] || d.seo.description.es) : '',
      foundingDate: d.venue && d.venue.founding_year ? String(d.venue.founding_year) : '1959',
      servesCuisine: cuisineLists[lang] || cuisineLists.es,
      priceRange: '€',
      hasMenu: BASE + (CARTA[lang] || CARTA.es),
      telephone: d.contact && d.contact.phone ? d.contact.phone : '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: d.contact.address.street,
        addressLocality: d.contact.address.city,
        postalCode: d.contact.address.postal_code,
        addressRegion: d.contact.address.region,
        addressCountry: d.contact.address.country,
      },
      openingHours: buildOpeningHours(d.hours),
      image: BASE + '/assets/images/og.png',
      sameAs: [d.social && d.social.instagram, d.social && d.social.facebook].filter(Boolean),
    };
    if (d.social && d.social.google_maps) schema.hasMap = d.social.google_maps;

    function injectScript(obj, id) {
      const el = (id && document.getElementById(id)) || document.createElement('script');
      if (id) el.id = id;
      el.type = 'application/ld+json';
      el.textContent = JSON.stringify(obj);
      if (document.head && !el.parentNode) document.head.appendChild(el);
    }

    injectScript(schema, 'restaurant-jsonld');

    if (d.faq && d.faq.length) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: d.faq.map(function(item) {
          return {
            '@type': 'Question',
            name: t(item.question, lang),
            acceptedAnswer: { '@type': 'Answer', text: t(item.answer, lang) },
          };
        }),
      };
      injectScript(faqSchema, 'faq-jsonld');
    }
  }

  async function init() {
    const lang   = getLang();
    const loader = document.getElementById('loader');
    const app    = document.getElementById('homepage');

    try {
      const res = await fetch('../data/venue.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();

      injectRestaurantJsonLd(d, lang);
      app.innerHTML = render(d, lang);
      injectSiteNav(lang, HOME_LINKS, CARTA_LINKS[lang]);
      injectMobileServiceCTA(d, lang);
      initPizarraAccordion(app);
      initDailyMenuAccordion(app);
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);
      initReveal(app);
    } catch (err) {
      const errMsg = {
        es: 'Error al cargar. Por favor, recarga la p&aacute;gina.',
        en: 'Error loading page. Please reload.',
        fr: 'Erreur de chargement. Veuillez recharger la page.'
      }[lang] || 'Error al cargar. Por favor, recarga la p&aacute;gina.';
      loader.innerHTML = `<span style="color:#1D4D85;font-family:Georgia,serif;font-size:0.9rem;padding:0 24px;text-align:center;display:block;">${errMsg}</span>`;
      console.error('Bar León:', err);
    }
  }

  init();
}());
