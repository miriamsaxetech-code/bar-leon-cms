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

  function isPublicItem(item) {
    return Boolean(item)
      && item.available !== false
      && item.deleted !== true
      && item.price_status !== 'uncertain';
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

  function findWineForPairing(pairingText, wines, lang) {
    if (!pairingText) return null;
    return (wines || []).filter(isPublicItem).find(w => {
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
    const beer = (beverages || []).find(b => b.id === beerId && isPublicItem(b));
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

    return `<section class="home-daily-menu home-card container--reading" aria-labelledby="home-daily-title">
  <div class="home-daily-menu__wrap">
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
    const signature = [
      { id: 'habas-jamon-iberico', image: 'bar-leon-habas.webp' },
      { id: 'callos', image: 'bar-leon-callos.webp' },
      { id: 'sesos', image: 'bar-leon-sesos.webp' },
    ];
    const byId = {};
    (d.dishes || []).forEach(function(dish) { byId[dish.id] = dish; });
    const dishes = signature
      .map(function(entry) {
        const dish = byId[entry.id];
        return isPublicItem(dish) ? { dish: dish, image: entry.image } : null;
      })
      .filter(Boolean);
    if (!dishes.length) return '';

    return `<section class="signature-dishes container--documentary" aria-labelledby="home-andalusia-title">
    <div class="home-section-head">
      <p class="section-label">${LABELS.andalusiaSub[lang]}</p>
      <h2 id="home-andalusia-title">${LABELS.andalusia[lang]}</h2>
    </div>
    <div class="signature-dishes__grid">
      ${dishes.map(entry => {
        const dish = entry.dish;
        const parsed = parseDishPrice(formatPrice(dish.price), lang);
        const price = parsed.type === 'portions' ? parsed.note : parsed.display;
        return `<article class="signature-dish">
          <img class="signature-dish__image" src="${WEB_IMAGE_BASE}${entry.image}" alt="${t(dish.name, lang)}" width="800" height="600" loading="lazy" decoding="async" />
          <div class="signature-dish__body">
            <h3>${t(dish.name, lang)}</h3>
            <span class="signature-dish__price">${price}</span>
          </div>
        </article>`;
      }).join('')}
    </div>
    <a class="home-text-link" href="${cartaUrl}">${LABELS.fullMenu[lang]}</a>
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
    bar.id = 'home-mobile-cta';
    bar.className = 'mobile-service-cta';
    bar.setAttribute('aria-label', LABELS_CTA.carta[lang]);
    const iconBook = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    const iconPhone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    const iconPin  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    bar.innerHTML =
      `<a class="mobile-cta-btn" href="${cartaUrl}"><span class="mobile-cta-icon">${iconBook}</span><span>${LABELS_CTA.carta[lang]}</span></a>` +
      `<a class="mobile-cta-btn mobile-cta-btn--primary" href="${phoneLink}"><span class="mobile-cta-icon">${iconPhone}</span><span>${LABELS_CTA.call[lang]}</span></a>` +
      `<a class="mobile-cta-btn" href="${mapsUrl}" target="_blank" rel="noopener noreferrer"><span class="mobile-cta-icon">${iconPin}</span><span>${LABELS_CTA.directions[lang]}</span></a>`;
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
    const caricatureAlt = { es: 'Caricatura histórica conservada por Bar León', en: 'Historic caricature preserved by Bar León', fr: 'Caricature historique conservée par Bar León' }[lang];
    const interiorAlt = { es: 'Interior histórico del Bar León con el retrato del fundador', en: 'Historic Bar León interior with the founder portrait', fr: "Intérieur historique du Bar León avec le portrait du fondateur" }[lang];
    return `<section class="historia-leon container--documentary" aria-labelledby="historia-title">
  <div class="historia-leon__copy container--reading">
    <h2 id="historia-title" class="historia-year">${since}</h2>
    <div class="historia-leon__text">${paragraphs}</div>
  </div>
  <div class="doc-strip">
    <figure class="doc-strip__photo doc-strip__photo--square">
      <img src="${WEB_IMAGE_BASE}bar-leon-archivo-caricatura.webp" alt="${caricatureAlt}" width="900" height="900" loading="lazy" decoding="async" />
    </figure>
    <figure class="doc-strip__photo doc-strip__photo--portrait">
      <img src="${WEB_IMAGE_BASE}bar-leon-archivo-fundador.webp" alt="${interiorAlt}" width="900" height="1200" loading="lazy" decoding="async" />
    </figure>
  </div>
</section>`;
  }


  function renderHeroTile(d, lang, cartaUrl, inService) {
    const since    = { es: 'Desde 1959', en: 'Since 1959', fr: 'Depuis 1959' }[lang];
    const addr     = d.contact.address;
    const heroAlt = {
      es: 'Mural cerámico original del Restaurante Bar León en Granada',
      en: 'Original ceramic mural of Restaurante Bar León in Granada',
      fr: 'Fresque en céramique originale du Restaurante Bar León à Grenade',
    }[lang];
    return `<header class="site-header container--hero">
  <a class="site-header__brand" href="${HOME_LINKS[lang]}">Bar León</a>
  <div class="lang-selector" aria-label="Language / Idioma / Langue">${langSelector(lang, HOME_LINKS)}</div>
</header>
<section class="home-hero container--hero" aria-labelledby="home-title">
  <figure class="home-hero__media">
    <img src="${WEB_IMAGE_BASE}bar-leon-hero-fajalauza.webp" alt="${heroAlt}" width="1280" height="720" fetchpriority="high" decoding="async" />
  </figure>
  <div class="home-hero__masthead">
    <p class="home-hero__eyebrow">Restaurante Bar León</p>
    <h1 id="home-title" class="home-hero__name">Bar León</h1>
    <p class="home-hero__place">${since} &middot; ${addr.neighborhood} &middot; ${addr.city}</p>
    <a href="${cartaUrl}#hours" class="status-pill ${inService ? 'status-pill--open' : 'status-pill--closed'}">
      <span class="status-pill__dot"></span>
      ${inService ? LABELS.statusOpen[lang] : LABELS.statusClosed[lang]}
    </a>
  </div>
</section>`;
  }

  function renderHomeCTA(lang, cartaUrl, phoneLink) {
    const quickAccess = { es: 'Acceso rápido', en: 'Quick access', fr: 'Accès rapide' }[lang];
    const primaryLabel = { es: 'Ver la carta', en: LABELS.fullMenu.en, fr: LABELS.fullMenu.fr }[lang];
    const lblRestaurante = { es: 'Restaurante', en: 'Restaurant', fr: 'Restaurant' }[lang];
    const lblBarra       = { es: 'Carta barra',       en: 'Bar menu',        fr: 'Carte comptoir'   }[lang];
    const lblBebidas     = { es: 'Bebidas',            en: 'Drinks',          fr: 'Boissons'         }[lang];
    const lblDiario      = { es: 'Menú del día',       en: 'Daily menu',      fr: 'Menu du jour'     }[lang];
    return `<nav class="home-cta-nav container--reading" aria-label="${quickAccess}">
  <a href="${cartaUrl}" class="home-cta-btn home-cta-btn--primary">${primaryLabel}</a>
  <div class="home-quick-links">
    <a href="${cartaUrl}#restaurant" class="home-quick-link">${lblRestaurante}</a>
    <a href="${cartaUrl}#bar" class="home-quick-link">${lblBarra}</a>
    <a href="${cartaUrl}#beverages" class="home-quick-link">${lblBebidas}</a>
    <a href="${cartaUrl}#daily" class="home-quick-link">${lblDiario}</a>
    <a href="${phoneLink}" class="home-quick-link home-quick-link--call">${LABELS.call[lang]}</a>
  </div>
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
    const facadeAlt = {
      es: 'Fachada del Restaurante Bar León y su panel cerámico',
      en: 'Restaurante Bar León facade and ceramic sign',
      fr: 'Façade du Restaurante Bar León et son panneau en céramique',
    }[lang];
    const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayKey = dayKeys[new Date().getDay()];
    const today = getHoursSchedule(d.hours).find(entry => entry.day === todayKey);
    const todayHours = !today || today.status === 'closed' || !today.periods || !today.periods.length
      ? LABELS.statusClosed[lang]
      : today.periods.map(period => formatTimePeriod(period, lang)).join(' / ');

    const locationBlock = `
<section class="location-section container--documentary" aria-labelledby="location-title">
  <div class="location-grid">
    <figure class="location-photo">
      <img src="${WEB_IMAGE_BASE}bar-leon-fachada.webp" alt="${facadeAlt}" width="800" height="1000" loading="lazy" decoding="async" />
    </figure>
    <div class="location-info">
      <p class="section-label">${locationTitle}</p>
      <h2 id="location-title">${addr.neighborhood} &middot; ${addr.city}</h2>
      <p class="location-address">${addr.street} &middot; ${addr.neighborhood} &middot; ${addr.city}</p>
      <p class="location-hours"><strong>${DAY_NAMES[todayKey][lang]}:</strong> ${todayHours}</p>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="location-link">${directionsLabel}</a>
    </div>
  </div>
</section>`;

    return `${renderHeroTile(d, lang, cartaUrl, inService)}
  ${aviso ? `<div class="container--reading">${aviso}</div>` : ''}
  ${renderHomeCTA(lang, cartaUrl, phoneLink)}
  ${renderHomeAndalusia(d, lang, cartaUrl)}
  ${renderHomeDailyMenu(d, lang, cartaUrl)}
  ${renderHistoria(lang)}
  ${locationBlock}
  <footer class="homepage-footer container--hero">
    <div class="homepage-footer-inner">
      <p class="address">${addr.neighborhood} &middot; ${addr.city} &middot; ${addr.region}<br>${t(d.venue.cuisine_tag, lang)}</p>
      <div class="lang-selector" aria-label="Language">${langSelector(lang, HOME_LINKS)}</div>
    </div>
    <div class="owner-access">
      <a href="/panel/" class="owner-link">Acceso propietario</a>
    </div>
  </footer>`;
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

  function initReveal(root) {
    if (!window.IntersectionObserver) return;
    const els = root.querySelectorAll(
      '.editorial-snapshot, .hero-frame, .caricature-block, .location-section, .tile-frame, .tile-card, .home-daily-menu__foot, .warm-divider'
    );
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
      image: BASE + '/assets/images/web/bar-leon-hero-fajalauza.webp',
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
      injectMobileServiceCTA(d, lang);
      initDailyMenuAccordion(app);
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);
      initReveal(app);
    } catch (err) {
      const errMsg = {
        es: 'No se pudo cargar la información actualizada.',
        en: 'We could not load the latest information.',
        fr: "Impossible de charger les informations actuelles."
      }[lang] || 'No se pudo cargar la información actualizada.';
      const retryLabel = { es: 'Reintentar', en: 'Retry', fr: 'Réessayer' }[lang] || 'Reintentar';
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
      console.error('Bar León:', err);
    }
  }

  init();
}());
