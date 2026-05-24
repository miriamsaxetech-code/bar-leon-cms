(function () {
  'use strict';

  const PHONE = 'tel:+34958225143';

  const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
  const CARTA_LINKS = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };

  const NAV = {
    es: {
      carta: 'Carta', horarios: 'Horarios', llamar: 'Llamar',
      volver: '← Bar León',
      menuDia: 'Menú del Día',
      edictHeader: 'Establecimiento Bar León · Granada',
      edictFoot: 'Bar León · Cocina Tradicional Granadina',
      primeros: 'Primeros', segundos: 'Segundos',
      platoDia: 'Plato del día', postre: 'Postre'
    },
    en: {
      carta: 'Menu', horarios: 'Hours', llamar: 'Call',
      volver: '← Bar León',
      menuDia: 'Daily Menu',
      edictHeader: 'Establishment Bar León · Granada',
      edictFoot: 'Bar León · Traditional Granada Cuisine',
      primeros: 'First course', segundos: 'Second course',
      platoDia: 'Daily special', postre: 'Dessert'
    },
    fr: {
      carta: 'Carte', horarios: 'Horaires', llamar: 'Appeler',
      volver: '← Bar León',
      menuDia: 'Menu du Jour',
      edictHeader: 'Établissement Bar León · Grenade',
      edictFoot: 'Bar León · Cuisine Traditionnelle de Grenade',
      primeros: 'Entrées', segundos: 'Plats',
      platoDia: 'Plat du jour', postre: 'Dessert'
    }
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

  function langSelector(lang) {
    return ['es', 'en', 'fr'].map(l =>
      l === lang
        ? `<span class="lang-active">${l.toUpperCase()}</span>`
        : `<a href="${CARTA_LINKS[l]}">${l.toUpperCase()}</a>`
    ).join('<span class="sep"> · </span>');
  }

  function renderMenuDia(m, nav) {
    if (m.disponible !== 'SI') return '';

    function asList(str) {
      return `<ul class="edict-platos">${str.split(' · ').map(s =>
        `<li>${s.trim()}</li>`).join('')}</ul>`;
    }

    const primeros = m.primeros
      ? `<p class="edict-section-label">${nav.primeros}</p>${asList(m.primeros)}`
      : '';

    const segundos = m.segundos
      ? `<p class="edict-section-label">${nav.segundos}</p>${asList(m.segundos)}`
      : '';

    const platoDia = (m.platosDelDia && m.platosDelDia.length)
      ? `<p class="edict-section-label">${nav.platoDia}</p>
<ul class="edict-platos">${m.platosDelDia.map(p =>
          `<li><strong>${p.dia}:</strong> ${p.plato}</li>`
        ).join('')}</ul>`
      : '';

    const postre = m.postres
      ? `<p class="edict-section-label">${nav.postre}</p>${asList(m.postres)}`
      : '';

    const temporada = m.temporada
      ? `<p class="edict-temporada">${m.temporada}</p>`
      : '';

    return `<div class="wrap" style="margin-bottom:36px">
  <div class="edict">
    <div class="edict-head">
      <h2>${nav.edictHeader}</h2>
      <p class="edict-title">${nav.menuDia}</p>
      <span class="edict-price">${m.precio}</span>
      <p class="edict-dias">${m.dias}</p>
    </div>
    <div class="edict-body">
      <p class="edict-condiciones">${m.condiciones}</p>
      ${primeros}
      ${segundos}
      ${platoDia}
      ${postre}
      ${temporada}
    </div>
    <div class="edict-foot">${nav.edictFoot}</div>
  </div>
</div>`;
  }

  function renderCarta(items) {
    const available = items.filter(i => i.disponible !== 'NO');
    const groups = {};
    available.forEach(i => {
      if (!groups[i.categoria]) groups[i.categoria] = [];
      groups[i.categoria].push(i);
    });

    const cats = Object.entries(groups).map(([cat, list], idx) => {
      const itemsHtml = list.map(item => `<article class="carta-item">
  <div class="check-row">
    <span class="check-name">${item.nombre}</span>
    <span class="check-leader" aria-hidden="true"></span>
    <span class="check-price">${item.precio}</span>
  </div>
  <p class="item-desc">${albayzin(item.descripcion)}</p>
  <p class="item-maridaje">${item.maridaje}</p>
</article>`).join('');

      return `<div class="accordion-item${idx === 0 ? ' is-open' : ''}">
  <div class="categoria-head" role="button" tabindex="0" aria-expanded="${idx === 0 ? 'true' : 'false'}">
    <h2>${cat}</h2>
    <span class="accordion-icon" aria-hidden="true"></span>
  </div>
  <div class="accordion-body">${itemsHtml}</div>
</div>`;
    });

    return `<div class="wrap carta-accordion">${cats.join('')}</div>`;
  }

  function initAccordions(container) {
    container.querySelectorAll('.accordion-item').forEach((item, idx) => {
      const head = item.querySelector('.categoria-head');
      const body = item.querySelector('.accordion-body');

      if (idx === 0) body.style.maxHeight = body.scrollHeight + 'px';

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

  function renderHorarios(horarios, nav) {
    const cells = horarios.map(h => {
      const closed = h.estado === 'CERRADO' || h.estado === 'CERRADO TARDE';
      const cls = closed ? ' h-cerrado' : '';
      return `<div class="h-dia${cls}">${h.dia}</div>
<div class="h-det${cls}">${h.detalle}</div>`;
    }).join('');

    return `<div class="wrap" id="horarios">
  <p class="section-label">${nav.horarios}</p>
  <div class="horarios-grid" role="table" aria-label="${nav.horarios} Bar León">${cells}</div>
</div>`;
  }

  function renderFooter(nav) {
    return `<footer class="carta-footer">
  <div class="wrap">
    <p class="carta-footer-address">Plaza Nueva &middot; Granada &middot; Andaluc&iacute;a<br />Cocina Tradicional &middot; Tres Generaciones</p>
  </div>
  <a href="${PHONE}" class="cta-btn">${nav.llamar}</a>
  <div class="wrap">
    <p class="carta-brand">Bar Le&oacute;n</p>
  </div>
</footer>`;
  }

  async function init() {
    const lang      = getLang();
    const nav       = NAV[lang];
    const loader    = document.getElementById('loader');
    const header    = document.getElementById('carta-header');
    const headerNav = document.getElementById('carta-nav');
    const app       = document.getElementById('carta-body');

    try {
      const res = await fetch(`../data/${lang}.json`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();

      headerNav.innerHTML = `<div class="carta-header-left">
  <a href="${HOME_LINKS[lang]}" class="carta-back">${nav.volver}</a>
</div>
<div class="carta-header-center">
  <span class="carta-bar-name">Bar Le&oacute;n</span>
</div>
<div class="carta-header-right">
  <div class="carta-lang-selector" aria-label="Language">${langSelector(lang)}</div>
</div>`;

      app.innerHTML = [
        renderMenuDia(d.menuDia, nav),
        renderCarta(d.carta),
        '<div class="wrap"><hr class="divider" /></div>',
        renderHorarios(d.horarios, nav),
        renderFooter(nav),
      ].join('\n');

      initAccordions(app);
      header.style.display = 'block';
      app.style.display = 'block';
      loader.classList.add('fade-out');
      setTimeout(() => { loader.style.display = 'none'; }, 380);

      if (window.location.hash === '#horarios') {
        setTimeout(() => {
          const el = document.getElementById('horarios');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      loader.innerHTML = '<span style="color:#7A1C1C;font-family:Georgia,serif;font-size:0.9rem;padding:0 24px;text-align:center;display:block;">Error al cargar. Por favor, recarga la p&aacute;gina.</span>';
      console.error('Bar León:', err);
    }
  }

  init();
}());
