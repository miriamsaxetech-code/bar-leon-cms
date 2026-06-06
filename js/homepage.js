(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta', en: '/en/menu', fr: '/fr/carte' };
  const WEB_IMAGE_BASE = '../assets/images/web/';

  const HOME_FOOD_IMAGES = [
    {
      src: 'bar-leon-plato-02.webp',
      alt: {
        es: 'Cazuela tradicional servida en barro en Bar León',
        en: 'Traditional clay-pot dish served at Bar León',
        fr: 'Plat traditionnel servi en cazuela de terre cuite au Bar León',
      },
    },
    {
      src: 'bar-leon-plato-03.webp',
      alt: {
        es: 'Plato de arroz de la casa con copa de vino en la barra',
        en: 'House rice dish with a glass of wine at the bar',
        fr: 'Plat de riz maison avec un verre de vin au comptoir',
      },
    },
    {
      src: 'bar-leon-plato-04.webp',
      alt: {
        es: 'Habas con jamón y huevo, cocina granadina de temporada',
        en: 'Broad beans with ham and egg, seasonal Granada cooking',
        fr: 'Fèves au jambon et œuf, cuisine grenadine de saison',
      },
    },
  ];

  const LABELS = {
    dailyMenu:    { es: 'Menú del Día', en: 'Daily Menu', fr: 'Menu du Jour' },
    dailyKicker:  { es: 'Hoy se mira primero', en: 'Start here today', fr: "Aujourd'hui, on commence ici" },
    starters:     { es: 'Primeros', en: 'First course', fr: 'Entrées' },
    seconds:      { es: 'Segundos', en: 'Second course', fr: 'Plats' },
    daily:        { es: 'Plato del día', en: 'Daily special', fr: 'Plat du jour' },
    desserts:     { es: 'Postre', en: 'Dessert', fr: 'Dessert' },
    fullMenu:     { es: 'Ver carta completa', en: 'View full menu', fr: 'Voir la carte' },
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
    const dishes = (d.dishes || [])
      .filter(dish => dish.available !== false && dish.category_id === 'andalusian-specialities')
      .sort((a, b) => {
        const rank = v => v === true || v === 'recommended' ? 0 : v === 'house' ? 1 : v === 'seasonal' ? 2 : 3;
        return rank(a.featured) - rank(b.featured);
      })
      .slice(0, 6);
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

  function renderHomeFoodGallery(lang) {
    const image = HOME_FOOD_IMAGES[0];
    const captionSuffix = {
      es: 'Cocina y barra tradicional del León.',
      en: 'Traditional cooking and counter at Bar León.',
      fr: 'Cuisine traditionnelle et comptoir du León.'
    }[lang];
    return `<section class="home-food-gallery editorial-snapshot" aria-label="${LABELS.andalusia[lang]}">
  <figure class="editorial-snapshot__figure">
    <img class="editorial-snapshot__img" src="${WEB_IMAGE_BASE}${image.src}" alt="${image.alt[lang]}" width="800" height="500" loading="lazy" decoding="async">
    <figcaption class="editorial-snapshot__caption">
      ${image.alt[lang]} &mdash; ${captionSuffix}
    </figcaption>
  </figure>
</section>`;
  }

  function renderStoriesArchive(d, lang) {
    const activeItems = (d.cariocas || []).filter(entry => {
      const context = entry.context || 'homepage';
      return entry.active && (context === 'homepage' || context === 'archive' || context === 'historia' || context === 'stories') && (entry.image || entry.src);
    });
    if (!activeItems.length) return '';

    const slidesHtml = activeItems.map((item, idx) => {
      const image = item.image || item.src;
      const caption = t(item.caption, lang);
      return `<div class="album-slide${idx === 0 ? ' is-active' : ''}" data-slide-index="${idx}">
  <div class="photo-corners">
    <span class="corner corner--tl"></span>
    <span class="corner corner--tr"></span>
    <span class="corner corner--bl"></span>
    <span class="corner corner--br"></span>
    <img src="${image}" alt="${caption || LABELS.stories[lang]}" loading="lazy">
  </div>
  ${caption ? `<figcaption class="album-caption">${caption}</figcaption>` : ''}
</div>`;
    }).join('\n');

    return `<section class="stories-archive" aria-labelledby="stories-archive-title">
  <div class="home-section-head">
    <p class="section-label">${LABELS.storiesSub[lang]}</p>
    <h2 id="stories-archive-title">${LABELS.stories[lang]}</h2>
  </div>
  <div class="album-container">
    <div class="album-slides">
      ${slidesHtml}
    </div>
    <div class="album-nav">
      <button class="album-btn album-btn--prev" aria-label="Anterior">&larr; Anterior</button>
      <span class="album-counter"><span class="album-counter__current">1</span> / <span class="album-counter__total">${activeItems.length}</span></span>
      <button class="album-btn album-btn--next" aria-label="Siguiente">Siguiente &rarr;</button>
    </div>
  </div>
</section>`;
  }

  // ─── SOCIAL MEDIA LINKS ───────────────────────────────────────────────────────
  function renderSocialLinks(social) {
    const platforms = [
      { key: 'instagram',   label: 'Instagram'   },
      { key: 'facebook',    label: 'Facebook'    },
      { key: 'tripadvisor', label: 'TripAdvisor' },
      { key: 'x',          label: 'X'           },
    ];
    const links = platforms
      .filter(p => social && social[p.key])
      .map(p => `<a class="social-link" href="${social[p.key]}" target="_blank" rel="noopener">${p.label}</a>`);
    if (!links.length) return '';
    return `<div class="social-strip">${links.join('<span class="social-sep"> · </span>')}</div>`;
  }

  // ─── MOBILE SERVICE CTA ───────────────────────────────────────────────────────
  function injectMobileServiceCTA(d, lang) {
    if (!d.contact) return;
    const fab = document.createElement('a');
    fab.className = 'mobile-service-cta';
    fab.href = d.contact.phone_link;
    fab.textContent = LABELS.call[lang];
    document.body.appendChild(fab);

    // Show FAB only after the primary CTA block scrolls out of view.
    const anchor = document.querySelector('.qr-actions');
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

  function renderOrderingGuide(d, lang, cartaUrl) {
    const og = d.ordering_guide;
    if (!og || !og.items || !og.items.length) return '';
    const items = og.items.map(function(item) {
      return `<dt class="ordering-guide__term">${t(item.term, lang)}</dt>
<dd class="ordering-guide__def">${t(item.def, lang)}</dd>`;
    }).join('');
    return `<section class="ordering-guide" aria-labelledby="ordering-guide-title">
  <h2 id="ordering-guide-title">${t(og.title, lang)}</h2>
  <p class="ordering-guide__intro">${t(og.intro, lang)}</p>
  <dl class="ordering-guide__list">${items}</dl>
</section>`;
  }

  function renderWineEditorial(d, lang, cartaUrl) {
    const we = d.wine_editorial;
    if (!we) return '';

    const wines = (d.wines || []).filter(function(w) { return w.available !== false; });
    const featured = (we.featured_wine_ids || [])
      .map(function(id) { return wines.find(function(w) { return w.id === id; }); })
      .filter(Boolean);
    if (!featured.length) return '';

    const bodegaAnchor = '#la-bodega';
    const wineCards = featured.map(function(wine) {
      const name = t(wine.name, lang);
      const region = t(wine.region, lang);
      const note = wineCultureNote(wine, lang);
      const glass = wine.price_glass ? wine.price_glass.toFixed(2).replace('.', ',') + '&nbsp;€' : '';
      return `<a class="wine-editorial__card" href="${cartaUrl}#wine-${wine.id}">
  <span class="wine-editorial__name">${name}</span>
  <span class="wine-editorial__region">${region}</span>
  ${note ? `<span class="wine-editorial__note">${note}</span>` : ''}
  ${glass ? `<span class="wine-editorial__glass">${glass} copa</span>` : ''}
</a>`;
    }).join('');

    return `<section class="wine-editorial" aria-labelledby="wine-editorial-title">
  <div class="wine-editorial__head">
    <h2 id="wine-editorial-title">${t(we.title, lang)}</h2>
    <p class="wine-editorial__intro">${t(we.intro, lang)}</p>
  </div>
  <div class="wine-editorial__cards">${wineCards}</div>
  <a class="wine-editorial__cta" href="${cartaUrl}${bodegaAnchor}">${t(we.cta, lang)} →</a>
</section>`;
  }

  function renderCanaEditorial(d, lang) {
    const ce = d.cana_editorial;
    if (!ce) return '';
    const title = t(ce.title, lang);
    const body = t(ce.body, lang);
    if (!body || !body.trim()) return '';
    const paragraphs = body.split('\n').filter(function(p) { return p.trim(); })
      .map(function(p) { return `<p>${p.trim()}</p>`; }).join('');
    return `<section class="cana-editorial" aria-labelledby="cana-title">
  <h2 id="cana-title">${title}</h2>
  <div class="cana-editorial__text">${paragraphs}</div>
</section>`;
  }

  function renderMalaFolla(lang) {
    const content = {
      es: {
        title: 'La mala follá (explicada para forasteros)',
        body: [
          'No es mala educación.',
          'Es decir lo justo. No sonreír por protocolo. No elogiar sin motivo. No hacer de cada pregunta una performance.',
          'Cuando el camarero sirve sin preguntarte si todo está bien cada tres minutos, eso es respeto. Cuando la respuesta es seca pero honesta, eso también es respeto.',
          'Llevas décadas viniendo a por eso, aunque no lo sepas todavía.'
        ]
      },
      en: {
        title: 'The Granada character (explained for outsiders)',
        body: [
          'It is not rudeness.',
          'It is saying what needs to be said. Not smiling on command. Not praising without reason.',
          'When the waiter serves you without asking if everything is okay every three minutes, that is respect. When the answer is dry but honest, that is also respect.',
          'You have been coming back for decades because of it, even if you did not know it yet.'
        ]
      },
      fr: {
        title: 'Le caractère grenadin (expliqué aux étrangers)',
        body: [
          "Ce n'est pas de l'impolitesse.",
          "C'est dire l'essentiel. Ne pas sourire par protocole. Ne pas élogier sans raison.",
          "Quand le serveur vous sert sans vous demander si tout va bien toutes les trois minutes, c'est du respect. Quand la réponse est sèche mais honnête, c'est aussi du respect.",
          "Vous revenez ici depuis des décennies à cause de ça, même si vous ne le saviez pas encore."
        ]
      }
    }[lang];
    if (!content) return '';
    const paragraphs = content.body.map(function(p) { return `<p>${p}</p>`; }).join('');
    return `<section class="mala-folla" aria-labelledby="mala-folla-title">
  <h2 id="mala-folla-title">${content.title}</h2>
  <div class="mala-folla__text">${paragraphs}</div>
</section>`;
  }

  function render(d, lang) {
    const phoneLink    = d.contact.phone_link;
    const phoneDisplay = formatPhoneDisplay(d.contact.phone);
    const cartaUrl     = CARTA_LINKS[lang];
    const nav          = d.nav;
    const inService    = isNowServiceTime(d.hours);

    const aviso = renderNotice(d.venue, lang);

    const since = { es: 'Desde 1959', en: 'Since 1959', fr: 'Depuis 1959' }[lang];
    const directionsLabel = { es: 'Encontrarnos en Plaza Nueva', en: 'Find us on Plaza Nueva', fr: 'Nous trouver Plaza Nueva' }[lang];
    const reviewsLabel    = { es: 'Léanos en Google', en: 'Read us on Google', fr: 'Lire les avis' }[lang];

    const mapsUrl    = d.social.google_maps;
    const reviewsUrl = d.social.google_reviews;

    const trustStrip = `
<div class="trust-strip">
  <a href="${mapsUrl}" target="_blank" rel="noopener" class="trust-item">↗ ${directionsLabel}</a>
  <span class="trust-sep"> · </span>
  <a href="${reviewsUrl}" target="_blank" rel="noopener" class="trust-item">★ ${reviewsLabel}</a>
</div>`;

    const addr = d.contact.address;

    // Ubicación & Reseñas variables de idioma
    const locationTitle = { es: 'Dónde estamos', en: 'Where to find us', fr: 'Où nous trouver' }[lang];
    const friendsLabel  = { es: 'No se sienta cliente, somos amigos', en: "Don't feel like a customer, we are friends", fr: 'Ne vous sentez pas client, nous sommes des amis' }[lang];

    const mapCopy = {
      es: 'Calle Pan, 1 — en la puerta entre Plaza Nueva, el Albaicín y la Alhambra. Si se pierde aquí, ya es por gusto.',
      en: 'Calle Pan, 1 — at the gateway between Plaza Nueva, the Albaicín and the Alhambra. If you get lost, it is by choice.',
      fr: "Calle Pan, 1 — à la porte entre la Plaza Nueva, l'Albaicín et l'Alhambra. Si vous vous perdez, c'est que vous le voulez bien."
    }[lang];

    const reviewCopy = {
      es: 'Si ha comido a gusto, déjenos una reseña buena. Si no, nos lo dice en la barra y lo arreglamos como personas.',
      en: 'If you enjoyed your meal, please leave us a good review. If not, tell us at the bar and we will make it right.',
      fr: 'Si vous avez aimé, laissez-nous un avis positif. Sinon, dites-le nous au comptoir et nous le réglerons ensemble.'
    }[lang];

    const tileAlt = d.logo && d.logo.alt ? t(d.logo.alt, lang) : t(d.venue.full_name, lang);
    const logoSrc = d.logo && d.logo.image ? d.logo.image : '../assets/images/web/azulejo-leon.webp';

    const qrActionLabels = {
      restaurant: { es: 'Carta restaurante', en: 'Restaurant menu', fr: 'Carte restaurant' },
      bar:        { es: 'Carta barra',       en: 'Bar menu',        fr: 'Carte bar'        },
      beverages:  { es: 'Bebidas',           en: 'Drinks',          fr: 'Boissons'         },
      wines:      { es: 'Bodega',            en: 'Wine cellar',     fr: 'Cave à vins'      },
      daily:      { es: 'Menú del día',      en: 'Daily menu',      fr: 'Menu du jour'     },
    };

    const qrActions = `
<nav class="qr-actions" aria-label="${{ es: 'Acceso rápido', en: 'Quick access', fr: 'Accès rapide' }[lang]}">
  <a href="${cartaUrl}#restaurant" class="qr-btn qr-btn--primary">${qrActionLabels.restaurant[lang]}</a>
  <div class="qr-actions__row">
    <a href="${cartaUrl}#bar" class="qr-btn">${qrActionLabels.bar[lang]}</a>
    <a href="${cartaUrl}#beverages" class="qr-btn">${qrActionLabels.beverages[lang]}</a>
  </div>
  <a href="${cartaUrl}#daily" class="qr-btn">${qrActionLabels.daily[lang]}</a>
  <a href="${phoneLink}" class="qr-btn qr-btn--call">${LABELS.call[lang]}</a>
</nav>`;

    const locationBlock = `
<section class="location-section">
  <p class="section-label">${locationTitle}</p>
  <div class="location-grid">
    <div class="location-map">
      <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-3.5985%2C37.1755%2C-3.5945%2C37.1785&amp;layer=mapnik&amp;marker=37.17698%2C-3.59653" width="100%" height="250" style="border:0;" loading="lazy" aria-label="OpenStreetMap"></iframe>
    </div>
    <div class="location-info">
      <p class="location-friends">"${friendsLabel}"</p>
      <p class="location-copy">${mapCopy}</p>
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="location-link">↗ ${directionsLabel}</a>
      <hr class="location-sep" />
      <p class="review-copy">${reviewCopy}</p>
      <a href="${reviewsUrl}" target="_blank" rel="noopener" class="location-link">★ ${reviewsLabel}</a>
    </div>
  </div>
</section>`;

    return `<div class="wrap">
  <div class="brand-header">
    <img class="brand-logo" src="../assets/images/lion-logo.svg" alt="Bar León" fetchpriority="high" width="110" height="169" />
    <h1 class="brand-name">Bar León</h1>
  </div>
  <div class="brand-since">
    <picture>
      <source srcset="${logoSrc}" type="image/webp">
      <img class="brand-since__stamp" src="${logoSrc.replace('.webp', '.png')}" alt="" width="42" height="27" loading="eager" />
    </picture>
    <span class="brand-since__text">&#8212;&thinsp;${since}&thinsp;&#8212;</span>
  </div>
  <p class="site-location">
    <span class="site-location__place">${addr.neighborhood} &middot; ${addr.city}</span>
  </p>
  <div class="site-status-container">
    <a href="${cartaUrl}#hours" class="status-pill ${inService ? 'status-pill--open' : 'status-pill--closed'}">
      <span class="status-pill__dot"></span>
      ${inService ? LABELS.statusOpen[lang] : LABELS.statusClosed[lang]}
    </a>
  </div>
  ${aviso}
  ${qrActions}
  ${trustStrip}
  <div class="home-main-grid">
    ${renderHomeDailyMenu(d, lang, cartaUrl)}
    ${renderHomeAndalusia(d, lang, cartaUrl)}
  </div>
  ${renderHistoria(lang)}
  ${renderOrderingGuide(d, lang, cartaUrl)}
  ${renderMalaFolla(lang)}
  ${renderCanaEditorial(d, lang)}
  ${renderWineEditorial(d, lang, cartaUrl)}
  ${renderHomeFoodGallery(lang)}
  ${renderSocialLinks(d.social)}
  ${locationBlock}
  ${renderStoriesArchive(d, lang)}
  <div class="tile-frame">
    <blockquote>
      "${t(d.venue.tagline, lang)}"
    </blockquote>
    <cite>${t(d.venue.name, lang)} &middot; ${addr.street} &middot; ${addr.city}</cite>
  </div>
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
      '.editorial-snapshot, .hero-frame, .caricature-block, .trust-strip, .location-section, .social-strip'
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
      injectLangBar(lang, HOME_LINKS);
      injectMobileServiceCTA(d, lang);
      initDailyMenuAccordion(app);
      initStoriesAlbum(app);
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
