(function () {
  'use strict';

  const PHONE         = 'tel:+34958225143';
  const PHONE_DISPLAY = '+34 958 22 51 43';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };

  const NAV = {
    es: { carta: 'Carta',  horarios: 'Horarios', llamar: 'Llamar'  },
    en: { carta: 'Menu',   horarios: 'Hours',    llamar: 'Call'    },
    fr: { carta: 'Carte',  horarios: 'Horaires', llamar: 'Appeler' }
  };

  function getLang() {
    const m = window.location.pathname.match(/\/(es|en|fr)\//);
    return m ? m[1] : 'es';
  }

  function albayzin(str) {
    if (!str) return str;
    return str.replace(/albay[cz][íi]n/gi, m =>
      m[0] === m[0].toUpperCase() ? 'Albayzín' : 'albayzín'
    );
  }

  function langSelector(lang, links) {
    return ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-active">${l.toUpperCase()}</span>`
        : `<a href="${links[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="sep"> · </span>');
  }

  function render(d, lang) {
    const nav  = NAV[lang];
    const aviso = d.inicio.avisoEspecial
      ? `<p class="aviso">${d.inicio.avisoEspecial}</p>`
      : '';

    const since = { es: 'Desde 1959', en: 'Since 1959', fr: 'Depuis 1959' }[lang];
    const directionsLabel = { es: 'Cómo llegar', en: 'Get directions', fr: 'Itinéraire' }[lang];
    const reviewsLabel    = { es: 'Reseñas en Google', en: 'Google reviews', fr: 'Avis Google' }[lang];

    const mapsUrl    = 'https://maps.google.com/?q=Restaurante+Bar+León+Plaza+Nueva+Granada';
    const reviewsUrl = 'https://www.google.com/search?q=Bar+León+Granada+opiniones';

    const hero = `
<div class="hero-editorial" role="img" aria-label="Bar León — Plaza Nueva, Granada">
  <div class="hero-editorial-inner">
    <p class="hero-editorial-name">Restaurante-Bar Le&oacute;n</p>
    <p class="hero-editorial-year">${since}</p>
    <hr class="hero-editorial-rule">
    <p class="hero-editorial-desc">Cocina tradicional andaluza<br>Plaza Nueva &middot; Granada</p>
  </div>
</div>`;

    const trustStrip = `
<div class="trust-strip">
  <a href="${mapsUrl}" target="_blank" rel="noopener" class="trust-item">↗ ${directionsLabel}</a>
  <span class="trust-sep"> · </span>
  <a href="${reviewsUrl}" target="_blank" rel="noopener" class="trust-item">★ ${reviewsLabel}</a>
</div>`;

    return `<div class="wrap">
  <h1 class="site-name">Bar Le&oacute;n</h1>
  <p class="site-location">${d.inicio.subtitulo} <span class="site-since">&middot; ${since}</span></p>
  <nav class="site-nav" aria-label="Navigation">
    <div class="nav-primary">
      <a href="${CARTA_LINKS[lang]}">${nav.carta}</a>
      <a href="${CARTA_LINKS[lang]}#horarios">${nav.horarios}</a>
      <a href="${PHONE}">${nav.llamar}</a>
    </div>
    <div class="lang-selector" aria-label="Language">${langSelector(lang, HOME_LINKS)}</div>
  </nav>
  <p class="site-tagline">${albayzin(d.inicio.titular)}</p>
  ${aviso}
  ${hero}
  ${trustStrip}
  <div class="homepage-footer">
    <div class="homepage-footer-inner">
      <p class="address">Plaza Nueva &middot; Granada &middot; Andaluc&iacute;a<br />Cocina Tradicional &middot; Tres Generaciones</p>
      <a href="${PHONE}" class="phone-link">${PHONE_DISPLAY}</a>
    </div>
  </div>
</div>`;
  }

  async function init() {
    const lang   = getLang();
    const loader = document.getElementById('loader');
    const app    = document.getElementById('homepage');

    try {
      const res = await fetch(`../data/${lang}.json`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();

      app.innerHTML = render(d, lang);
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);
    } catch (err) {
      loader.innerHTML = '<span style="color:#7A1C1C;font-family:Georgia,serif;font-size:0.9rem;padding:0 24px;text-align:center;display:block;">Error al cargar. Por favor, recarga la p&aacute;gina.</span>';
      console.error('Bar León:', err);
    }
  }

  init();
}());
