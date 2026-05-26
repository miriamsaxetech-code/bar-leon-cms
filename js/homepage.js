(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };
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
    stories:      { es: 'Stories of León', en: 'Stories of León', fr: 'Stories of León' },
    storiesSub:   { es: 'Archivo familiar y memoria de barra. Solo material real del León.', en: 'Family archive and bar memory. Only real León material.', fr: 'Archives familiales et mémoire du comptoir. Uniquement du matériel réel du León.' },
    call:         { es: 'Llamar', en: 'Call', fr: 'Appeler' },
    whatsapp:     { es: 'WhatsApp', en: 'WhatsApp', fr: 'WhatsApp' },
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

  function renderBadge(dish, lang) {
    const v = dish.featured;
    if (!v || v === false) return '';
    if (v === true || v === 'recommended') return `<span class="dish-badge dish-badge--recommended">${LABELS.recommended[lang]}</span>`;
    if (v === 'seasonal') return `<span class="dish-badge dish-badge--seasonal">${LABELS.seasonal[lang]}</span>`;
    if (v === 'house') return `<span class="dish-badge dish-badge--house">${LABELS.house[lang]}</span>`;
    return '';
  }

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

  function splitList(str) {
    return (str || '').split(' · ').map(s => s.trim()).filter(Boolean);
  }

  function renderHomeDailyMenu(d, lang, cartaUrl) {
    const dm = d.daily_menu;
    if (!dm || !dm.active) return '';

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

    return `<section class="tile-frame home-daily-menu" aria-labelledby="home-daily-title">
  <div class="home-daily-menu__head">
    <p class="section-label">${LABELS.dailyKicker[lang]}</p>
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
</section>`;
  }

  function renderHomeAndalusia(d, lang, cartaUrl) {
    const dishes = (d.dishes || [])
      .filter(dish => dish.available !== false && dish.category_id === 'andalusian-specialities')
      .sort((a, b) => {
        const rank = v => v === true || v === 'recommended' ? 0 : v === 'house' ? 1 : v === 'seasonal' ? 2 : 3;
        return rank(a.featured) - rank(b.featured);
      })
      .slice(0, 5);
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
        const priceHtml = `<span class="home-andalusia__price">${parsed.label || parsed.display}</span>`;
        const priceNoteHtml = parsed.type === 'portions' ? `<p class="price-note">${parsed.note}</p>` : '';
        return `<article class="home-andalusia__item">
          <div class="home-andalusia__main">
            ${renderBadge(dish, lang)}
            <h3>${t(dish.name, lang)}</h3>
            <p>${t(dish.description, lang)}</p>
            ${renderPairingChip(dish, d.wines, lang, cartaUrl)}
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
    const item = (d.cariocas || []).find(entry => {
      const context = entry.context || 'homepage';
      return entry.active && (context === 'homepage' || context === 'archive' || context === 'historia' || context === 'stories') && (entry.image || entry.src);
    });
    if (!item) return '';
    const image = item.image || item.src;
    const caption = t(item.caption, lang);
    return `<section class="stories-archive" aria-labelledby="stories-archive-title">
  <div class="home-section-head">
    <p class="section-label">${LABELS.storiesSub[lang]}</p>
    <h2 id="stories-archive-title">${LABELS.stories[lang]}</h2>
  </div>
  <figure class="stories-archive__figure">
    <img src="${image}" alt="${caption || LABELS.stories[lang]}" loading="lazy" onerror="this.closest('section').style.display='none'">
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
  </figure>
</section>`;
  }

  // ─── CARIOCA SLOT ─────────────────────────────────────────────────────────────
  function renderCariocaSlot(venue, lang) {
    const item = (venue.cariocas || []).find(c => c.active && c.context === 'homepage');
    if (!item) return '';
    const caption = t(item.caption, lang) || '';
    return `
    <div class="carioca-slot">
      <figure class="carioca-slot__card">
        <img src="${item.image}" alt="Carioca de Bar León" loading="lazy"
             onerror="this.closest('.carioca-slot').style.display='none'">
        <figcaption>${caption}</figcaption>
      </figure>
    </div>
  `;
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
    const inService = isNowServiceTime(d.hours);
    const number = d.contact.whatsapp ? d.contact.whatsapp.replace(/\D/g, '') : '';
    const fab = document.createElement('a');
    fab.className = 'mobile-service-cta';
    if (inService || !number) {
      fab.href = d.contact.phone_link;
      fab.textContent = LABELS.call[lang];
    } else {
      fab.href = 'https://wa.me/' + number;
      fab.target = '_blank';
      fab.rel = 'noopener';
      fab.textContent = LABELS.whatsapp[lang];
    }
    document.body.appendChild(fab);
  }

  function render(d, lang) {
    const phoneLink    = d.contact.phone_link;
    const phoneDisplay = formatPhoneDisplay(d.contact.phone);
    const cartaUrl     = CARTA_LINKS[lang];
    const nav          = d.nav;
    const inService    = isNowServiceTime(d.hours);

    const notice = t(d.venue.notice, lang);
    const aviso  = notice ? `<p class="aviso">${notice}</p>` : '';

    const since = { es: 'Desde 1959', en: 'Since 1959', fr: 'Depuis 1959' }[lang];
    const directionsLabel = { es: 'Cómo llegar', en: 'Get directions', fr: 'Itinéraire' }[lang];
    const reviewsLabel    = { es: 'Reseñas en Google', en: 'Google reviews', fr: 'Avis Google' }[lang];

    const mapsUrl    = d.social.google_maps;
    const reviewsUrl = d.social.google_reviews;

    const heroAlt = t(d.hero.alt, lang) || `${t(d.venue.full_name, lang)} — ${t(d.contact.address.city, lang) || d.contact.address.city}`;

    const heroImg = d.hero && d.hero.image;
    const hero = heroImg
      ? `<figure class="hero-frame">
  <picture>
    <source srcset="${heroImg}" type="image/webp">
    <img src="${heroImg.replace('.webp', '.png')}" alt="${heroAlt}" fetchpriority="high" decoding="async">
  </picture>
</figure>`
      : `<div class="hero-editorial" role="img" aria-label="${heroAlt}">
  <div class="hero-editorial-inner">
    <p class="hero-editorial-name">${t(d.venue.full_name, lang)}</p>
    <p class="hero-editorial-year">${since}</p>
    <hr class="hero-editorial-rule">
    <p class="hero-editorial-desc">${t(d.venue.cuisine, lang)}<br>${d.contact.address.neighborhood} &middot; ${d.contact.address.city}</p>
  </div>
</div>`;

    const trustStrip = `
<div class="trust-strip">
  <a href="${mapsUrl}" target="_blank" rel="noopener" class="trust-item">↗ ${directionsLabel}</a>
  <span class="trust-sep"> · </span>
  <a href="${reviewsUrl}" target="_blank" rel="noopener" class="trust-item">★ ${reviewsLabel}</a>
</div>`;

    const addr = d.contact.address;

    // Ubicación & Reseñas variables de idioma
    const locationTitle = { es: 'Ubicación', en: 'Location', fr: 'Emplacement' }[lang];
    const friendsLabel  = { es: 'No se sienta cliente, somos amigos', en: "Don't feel like a customer, we are friends", fr: 'Ne vous sentez pas client, nous sommes des amis' }[lang];

    const mapCopy = {
      es: 'Estamos en calle Pan, al lado de Plaza Nueva. Si se pierde aquí, ya es por gusto.',
      en: 'We are on Calle Pan, right next to Plaza Nueva. If you get lost, it is by choice.',
      fr: "Nous sommes situés rue Pan, juste à côté de Plaza Nueva. Si vous vous perdez, c'est que vous le voulez bien."
    }[lang];

    const reviewCopy = {
      es: 'Si ha comido a gusto, déjenos una reseña buena. Si no, nos lo dice en la barra y lo arreglamos como personas.',
      en: 'If you enjoyed your meal, please leave us a good review. If not, tell us at the bar and we will make it right.',
      fr: 'Si vous avez aimé, laissez-nous un avis positif. Sinon, dites-le nous au comptoir et nous le réglerons ensemble.'
    }[lang];

    const logoBlock = `
<div class="site-logo-container">
  <img src="../assets/images/lion-logo.svg" class="site-logo" alt="" />
</div>`;

    // ─── CALL CTA LOGIC ─────────────────────────────────────────────────────────
    const phoneCtaHtml = `<a href="${phoneLink}" class="call-cta"><span class="call-label">${t(nav && nav.call, lang) || 'Llamar'}</span></a>`;
    const callCta = phoneCtaHtml;

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

    // ─── CARIOCA SLOT ─────────────────────────────────────────────────────────────
    const cariocaSlot = renderCariocaSlot(d, lang);

    return `<div class="wrap">
  ${logoBlock}
  <h1 class="site-name">${t(d.venue.name, lang)}</h1>
  <p class="site-location">
    <span class="site-location__place">${addr.neighborhood} &middot; ${addr.city}</span>
    <span class="site-location__since">${since}</span>
  </p>
  <nav class="site-nav" aria-label="Navigation">
    <div class="nav-primary">
      <a href="${cartaUrl}">${t(d.nav.menu, lang)}</a>
      <a href="${cartaUrl}#hours">${t(d.nav.hours, lang)}</a>
      <a href="${cartaUrl}#hours" class="status-pill ${inService ? 'status-pill--open' : 'status-pill--closed'}">
        <span class="status-pill__dot"></span>
        ${inService ? (lang === 'en' ? 'Open' : lang === 'fr' ? 'Ouvert' : 'Abierto') : (lang === 'en' ? 'Closed' : lang === 'fr' ? 'Fermé' : 'Cerrado')}
      </a>
      ${callCta}
    </div>
    <div class="lang-selector" aria-label="Language">${langSelector(lang, HOME_LINKS)}</div>
  </nav>
  ${aviso}
  ${renderHomeDailyMenu(d, lang, cartaUrl)}
  ${hero}
  ${trustStrip}
  ${renderHomeAndalusia(d, lang, cartaUrl)}
  ${renderHomeFoodGallery(lang)}
  ${renderSocialLinks(d.social)}
  ${locationBlock}
  ${renderStoriesArchive(d, lang)}
  ${cariocaSlot}
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
      <a href="${phoneLink}" class="phone-link">${phoneDisplay}</a>
    </div>
    <div class="owner-access">
      <a href="/admin/" class="owner-link">Acceso propietario</a>
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

  async function init() {
    const lang   = getLang();
    const loader = document.getElementById('loader');
    const app    = document.getElementById('homepage');

    try {
      const res = await fetch('../data/venue.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();

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
      loader.innerHTML = `<span style="color:#7A1C1C;font-family:Georgia,serif;font-size:0.9rem;padding:0 24px;text-align:center;display:block;">${errMsg}</span>`;
      console.error('Bar León:', err);
    }
  }

  init();
}());
