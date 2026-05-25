(function () {
  'use strict';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };

  function getLang() {
    const m = window.location.pathname.match(/\/(es|en|fr)\//);
    return m ? m[1] : 'es';
  }

  function t(field, lang) {
    if (!field || typeof field === 'string') return field || '';
    return field[lang] || field.es || '';
  }

  function langSelector(lang, links) {
    return ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-active">${l.toUpperCase()}</span>`
        : `<a href="${links[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="sep"> · </span>');
  }

  function render(d, lang) {
    const phoneLink    = d.contact.phone_link;
    const phoneDisplay = d.contact.phone;
    const cartaUrl     = CARTA_LINKS[lang];

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
      fr: 'Nous sommes situés rue Pan, juste à côté de Plaza Nueva. Si vous vous perdez, c’est que vous le voulez bien.'
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

    const locationBlock = `
<section class="location-section">
  <p class="section-label">${locationTitle}</p>
  <div class="location-grid">
    <div class="location-map">
      <iframe src="https://maps.google.com/maps?q=Restaurante%20Bar%20Le%C3%B3n,%20Calle%20Pan,%201,%20Granada&t=&z=17&ie=UTF8&iwloc=&output=embed" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" aria-label="Google Maps"></iframe>
    </div>
    <div class="location-info">
      <p class="location-friends">“${friendsLabel}”</p>
      <p class="location-copy">${mapCopy}</p>
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="location-link">↗ ${directionsLabel}</a>
      
      <hr class="location-sep" />
      
      <p class="review-copy">${reviewCopy}</p>
      <a href="${reviewsUrl}" target="_blank" rel="noopener" class="location-link">★ ${reviewsLabel}</a>
    </div>
  </div>
</section>`;

    return `<div class="wrap">
  ${logoBlock}
  <h1 class="site-name">${t(d.venue.name, lang)}</h1>
  <p class="site-location">${addr.neighborhood} &middot; ${addr.city} <span class="site-since">&middot; ${since}</span></p>
  <nav class="site-nav" aria-label="Navigation">
    <div class="nav-primary">
      <a href="${cartaUrl}">${t(d.nav.menu, lang)}</a>
      <a href="${cartaUrl}#hours">${t(d.nav.hours, lang)}</a>
      <a href="${phoneLink}">${t(d.nav.call, lang)}</a>
    </div>
    <div class="lang-selector" aria-label="Language">${langSelector(lang, HOME_LINKS)}</div>
  </nav>
  <p class="site-tagline">${t(d.venue.tagline, lang)}</p>
  ${aviso}
  ${hero}
  ${trustStrip}
  ${locationBlock}
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

  async function init() {
    const lang   = getLang();
    const loader = document.getElementById('loader');
    const app    = document.getElementById('homepage');

    try {
      const res = await fetch('../data/venue.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();

      app.innerHTML = render(d, lang);
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);
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
