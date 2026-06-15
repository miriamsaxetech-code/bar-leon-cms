(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta', en: '/en/menu', fr: '/fr/carte' };
  const WEB_IMAGE_BASE = '../assets/images/web/';


  const LABELS = {
    dailyMenu:    { es: 'Menú del Día', en: 'Daily Menu', fr: 'Menu du Jour' },
    dailyKicker:  { es: 'Hoy se mira primero', en: 'Start here today', fr: "Aujourd'hui, on commence ici" },
    starters:     { es: 'Primeros', en: 'First course', fr: 'Entrées' },
    seconds:      { es: 'Segundos', en: 'Second course', fr: 'Plats' },
    daily:        { es: 'Plato del día', en: 'Daily special', fr: 'Plat du jour' },
    desserts:     { es: 'Postre', en: 'Dessert', fr: 'Dessert' },
    fullMenu:     { es: 'Consulte la carta completa', en: 'View full menu', fr: 'Consultez la carte' },
    andalusia:    { es: 'Sabores de Andalucía', en: 'Flavors of Andalusia', fr: "Saveurs d'Andalousie" },
    andalusiaSub: { es: 'Platos de casa, guiso y barra granadina.', en: 'House dishes, stews, and Granada bar classics.', fr: 'Plats maison, mijotés et comptoir grenadin.' },
    stories:      { es: 'Historias del León', en: 'Stories of León', fr: 'Histoires du León' },
    storiesSub:   { es: 'Archivo familiar y memoria de barra. Solo material real del León.', en: 'Family archive and bar memory. Only real León material.', fr: 'Archives familiales et mémoire du comptoir. Uniquement du matériel réel du León.' },
    call:         { es: 'Llamar', en: 'Call', fr: 'Appeler' },
    statusOpen:   { es: 'Estamos abiertos', en: 'We are open', fr: 'Nous sommes ouverts' },
    statusClosed: { es: 'Cerrado', en: 'Closed', fr: 'Fermé' },
    recommended:  { es: 'Recomendado', en: 'Recommended', fr: 'Recommandé' },
    seasonal:     { es: 'Temporada', en: 'Seasonal', fr: 'Saison' },
    house:        { es: 'De la casa', en: 'House specialty', fr: 'Spécialité maison' },
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

  function renderBadge() { return ''; }

  function findWineForPairing(pairingText, wines, lang) {
    if (!pairingText) return null;
    return (wines || []).filter(w => w.available !== false && w.deleted !== true).find(w => {
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
    const beer = (beverages || []).find(b => b.id === beerId && b.available !== false && b.deleted !== true);
    if (!beer) return '';
    const beerName = typeof beer.name === 'object' ? t(beer.name, lang) : (beer.name || '');
    const label = { es: `Cerveza · ${beerName}`, en: `Beer · ${beerName}`, fr: `Bière · ${beerName}` }[lang] || beerName;
    return `<a class="beer-chip" href="${cartaUrl}#bebidas">${label}</a>`;
  }

  function splitList(str) {
    if (Array.isArray(str)) return str.filter(Boolean);
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

    const isMenuToday = isDailyMenuToday(dm);
    let kickerText = '';
    if (isMenuToday) {
      kickerText = LABELS.dailyKicker[lang];
    } else {
      kickerText = {
        es: 'Disponible de lunes a viernes',
        en: 'Available Monday to Friday',
        fr: 'Disponible du lundi au vendredi'
      }[lang] || 'Disponible de lunes a viernes';
    }

    const days = (dm.days || [])
      .map(day => DAY_NAMES[day] ? DAY_NAMES[day][lang] : day)
      .join(', ');
    const period = dm.service_period ? formatTimePeriod(dm.service_period, lang) : '';

    function renderAccordionGroup(label, values, open) {
      if (!values.length) return '';
      const items = values.map(item => `<li>${item}</li>`).join('');
      return `<div class="accordion-item${open ? ' is-open' : ''}">
  <button class="dm-section-head" aria-expanded="${open ? 'true' : 'false'}">
    <span>${label}</span>
    <span class="accordion-icon" aria-hidden="true"></span>
  </button>
  <div class="accordion-body">
    <ul class="home-daily-menu__group-list">${items}</ul>
  </div>
</div>`;
    }

    const mains = (dm.mains || []).map(item => {
      const day = DAY_NAMES[item.day] ? DAY_NAMES[item.day][lang] : item.day;
      return `<strong>${day}:</strong> ${t(item.name, lang)}`;
    });
    const seasonal = splitList(t(dm.seasonal, lang)).map(note => `<em>${note}</em>`);

    return `<section class="chalkboard-menu pizarra-dia home-daily-menu" aria-labelledby="home-daily-title">
  <div class="pizarra-dia__wrap">
    <div class="home-daily-menu__head">
      <p class="section-label">${kickerText}</p>
      <div>
        <h2 id="home-daily-title">${LABELS.dailyMenu[lang]}</h2>
        <p class="home-daily-menu__meta">${days}${period ? ` · ${period}` : ''}</p>
      </div>
      <span class="home-daily-menu__price">${formatPrice(dm.price)}</span>
    </div>
    <div class="home-daily-menu__body">
      ${renderAccordionGroup(LABELS.starters[lang], splitList(t(dm.starters, lang)), true)}
      ${renderAccordionGroup(LABELS.seconds[lang], splitList(t(dm.seconds, lang)), false)}
      ${renderAccordionGroup(LABELS.daily[lang], mains.concat(seasonal), false)}
      ${renderAccordionGroup(LABELS.desserts[lang], splitList(t(dm.desserts, lang)), false)}
    </div>
    <div class="home-daily-menu__foot">
      <p>${t(dm.includes, lang)}</p>
      <a href="${cartaUrl}">${LABELS.fullMenu[lang]}</a>
    </div>
  </div>
</section>`;
  }

  function renderHomeAndalusia(d, lang, cartaUrl) {
    var dishes;
    if (d.home_featured_ids && d.home_featured_ids.length) {
      var byId = {};
      (d.dishes || []).forEach(function(dish) { byId[dish.id] = dish; });
      dishes = d.home_featured_ids
        .map(function(id) { return byId[id]; })
        .filter(function(dish) { return dish && dish.available !== false && dish.deleted !== true; });
    } else {
      dishes = (d.dishes || [])
        .filter(function(dish) { return dish.available !== false && dish.deleted !== true && dish.category_id === 'andalusian-specialities' && dish.featured; })
        .sort(function(a, b) {
          var rank = function(v) { return v === true || v === 'recommended' ? 0 : v === 'house' ? 1 : v === 'seasonal' ? 2 : 3; };
          return rank(a.featured) - rank(b.featured);
        })
        .slice(0, 6);
    }
    if (!dishes.length) return '';

    return `<section class="tile-bg-section home-andalusia" aria-labelledby="home-andalusia-title">
  <div class="tile-card">
    <div class="home-section-head">
      <p class="section-label">${LABELS.andalusiaSub[lang]}</p>
      <h2 id="home-andalusia-title">${LABELS.andalusia[lang]}</h2>
    </div>
    <div class="home-andalusia__list">
      ${dishes.map(dish => {
        const parsed = parseDishPrice(formatPrice(dish.price), lang);
        const priceHtml = parsed.type === 'portions' ? '' : `<span class="home-andalusia__price">${parsed.display}</span>`;
        const priceNoteHtml = parsed.type === 'portions' ? `<p class="price-note">${parsed.note}</p>` : '';
        return `<article class="home-andalusia__item">
          <div class="home-andalusia__main">
            ${renderBadge(dish, lang)}
            <h3>${t(dish.name, lang)}</h3>
            <p>${t(dish.description, lang)}</p>
            ${renderPairingChip(dish, d.wines, lang, cartaUrl)}
            ${renderBeerPairingChip(dish, d.beverages, lang, cartaUrl)}
            ${priceNoteHtml}
          </div>
          ${priceHtml}
        </article>`;
      }).join('')}
    </div>
    <a class="home-text-link" href="${cartaUrl}">${LABELS.fullMenu[lang]}</a>
  </div>
</section>`;
  }


  // ─── MOBILE SERVICE CTA ───────────────────────────────────────────────────────
  function injectMobileServiceCTA(d, lang) {
    if (!d.contact) return;
    const LABELS_CTA = {
      carta:      { es: 'Carta',       en: 'Menu',       fr: 'Carte'      },
      call:       { es: 'Llamar',      en: 'Call',       fr: 'Appeler'    },
      directions: { es: 'Cómo llegar', en: 'Directions', fr: 'Itinéraire' },
    };
    const cartaUrl  = CARTA_LINKS[lang];
    const mapsUrl   = (d.social && d.social.google_maps) || '#';
    const phoneLink = d.contact.phone_link;

    const bar = document.createElement('nav');
    bar.className = 'mobile-service-cta';
    bar.setAttribute('aria-label', LABELS_CTA.carta[lang]);
    bar.innerHTML =
      `<a class="mobile-cta-btn" href="${cartaUrl}">${LABELS_CTA.carta[lang]}</a>` +
      `<a class="mobile-cta-btn mobile-cta-btn--primary" href="${phoneLink}">${LABELS_CTA.call[lang]}</a>` +
      `<a class="mobile-cta-btn" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${LABELS_CTA.directions[lang]}</a>`;
    document.body.appendChild(bar);

    const anchor = document.querySelector('.home-cta-nav');
    if (anchor && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        function(entries) { bar.classList.toggle('is-visible', !entries[0].isIntersecting); },
        { threshold: 0 }
      );
      obs.observe(anchor);
    } else {
      bar.classList.add('is-visible');
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
    const barraAlt  = { es: 'La barra del Bar León', en: 'Bar León counter', fr: 'Le comptoir du Bar León' }[lang];
    const pinchAlt  = { es: 'Pinchos de tortilla en Bar León', en: 'Tortilla pinchos at Bar León', fr: 'Pinchos de tortilla au Bar León' }[lang];
    return `<section class="historia-leon" aria-labelledby="historia-title">
  <h2 id="historia-title" class="historia-year">${since}</h2>
  <div class="historia-leon__text">${paragraphs}</div>
  <div class="doc-strip" aria-hidden="true">
    <div class="doc-strip__photo">
      <picture>
        <source srcset="${WEB_IMAGE_BASE}leon-barra.webp" type="image/webp" />
        <img src="${WEB_IMAGE_BASE}leon-barra.png" alt="${barraAlt}" width="654" height="490" loading="lazy" />
      </picture>
    </div>
    <div class="doc-strip__photo">
      <picture>
        <source srcset="${WEB_IMAGE_BASE}leon-pinchodetortilla.webp" type="image/webp" />
        <img src="${WEB_IMAGE_BASE}leon-pinchodetortilla.png" alt="${pinchAlt}" width="654" height="490" loading="lazy" />
      </picture>
    </div>
  </div>
</section>`;
  }


  function renderHeroTile(d, lang, cartaUrl, inService) {
    const since    = { es: 'Desde 1959', en: 'Since 1959', fr: 'Depuis 1959' }[lang];
    const addr     = d.contact.address;
    return `<div class="home-hero">
  <div class="home-hero__masthead">
    <img class="home-hero__lion" src="../assets/images/lion-logo.svg" alt="Bar León"
         width="140" height="215" fetchpriority="high" />
    <h1 class="home-hero__name">Bar León</h1>
    <p class="home-hero__place">${since} &middot; ${addr.neighborhood} &middot; ${addr.city}</p>
  </div>
  <div class="site-status-container">
    <a href="${cartaUrl}#hours" class="status-pill ${inService ? 'status-pill--open' : 'status-pill--closed'}">
      <span class="status-pill__dot"></span>
      ${inService ? LABELS.statusOpen[lang] : LABELS.statusClosed[lang]}
    </a>
  </div>
</div>`;
  }

  function renderHomeCTA(lang, cartaUrl, phoneLink) {
    const quickAccess = { es: 'Acceso rápido', en: 'Quick access', fr: 'Accès rapide' }[lang];
    const lblRestaurante = { es: 'Carta restaurante', en: 'Restaurant menu', fr: 'Carte restaurant' }[lang];
    const lblBarra       = { es: 'Carta barra',       en: 'Bar menu',        fr: 'Carte comptoir'   }[lang];
    const lblBebidas     = { es: 'Bebidas',            en: 'Drinks',          fr: 'Boissons'         }[lang];
    const lblDiario      = { es: 'Menú del día',       en: 'Daily menu',      fr: 'Menu du jour'     }[lang];
    return `<nav class="home-cta-nav" aria-label="${quickAccess}">
  <a href="${cartaUrl}#restaurant" class="home-cta-btn home-cta-btn--primary">${lblRestaurante}</a>
  <div class="home-cta-row">
    <a href="${cartaUrl}#bar"       class="home-cta-btn home-cta-btn--secondary">${lblBarra}</a>
    <a href="${cartaUrl}#beverages" class="home-cta-btn home-cta-btn--secondary">${lblBebidas}</a>
  </div>
  <a href="${cartaUrl}#daily" class="home-cta-btn home-cta-btn--secondary home-cta-btn--daily">${lblDiario}</a>
  <a href="${phoneLink}"      class="home-cta-btn home-cta-btn--call">${LABELS.call[lang]}</a>
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
    const directionsLabel = { es: 'Encuéntrenos en Plaza Nueva', en: 'Find us on Plaza Nueva', fr: 'Retrouvez-nous Plaza Nueva' }[lang];

    const locationBlock = `
<section class="location-section">
  <p class="section-label">${locationTitle}</p>
  <div class="location-grid">
    <div class="location-map">
      <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-3.5985%2C37.1755%2C-3.5945%2C37.1785&amp;layer=mapnik&amp;marker=37.17698%2C-3.59653" width="100%" height="250" style="border:0;" loading="lazy" aria-label="OpenStreetMap"></iframe>
    </div>
    <div class="location-info">
      <p class="location-address">${addr.street} &middot; ${addr.neighborhood} &middot; ${addr.city}</p>
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="location-link">↗ ${directionsLabel}</a>
    </div>
  </div>
</section>`;

    return `<div class="wrap">
  ${renderHeroTile(d, lang, cartaUrl, inService)}
  ${aviso}
  ${renderHomeCTA(lang, cartaUrl, phoneLink)}
  ${renderHomeAndalusia(d, lang, cartaUrl)}
  ${renderHomeDailyMenu(d, lang, cartaUrl)}
  ${renderHistoria(lang)}
  ${locationBlock}
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
    getHoursSchedule(hours).forEach(function(h) {
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

    injectScript({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Restaurante Bar León',
      url: BASE,
      inLanguage: lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-GB',
    }, 'website-jsonld');

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
      injectLangBar(lang, HOME_LINKS);
      injectMobileServiceCTA(d, lang);
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
