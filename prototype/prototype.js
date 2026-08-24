/* BAR LEÓN — Fajalauza Vivo prototype
   Branch design/fajalauza-vivo-prototype — NOT PRODUCTION.
   Reads the real, untouched data/venue.json. Renders ES only.
   Motion: transform/opacity, IntersectionObserver, reduced-motion aware. */

(function () {
  'use strict';

  var LANG = 'es';
  var page = document.body.getAttribute('data-page');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Real dish photos verified in the asset inventory (docs/BAR_LEON_PROTOTYPE_ASSETS.md)
  var DISH_PHOTOS = {
    'tortilla-sacromonte': 'assets/plato-tortilla.webp',
    'sesos': 'assets/plato-sesos.jpg',
    'callos': 'assets/plato-callos.jpg',
    'papas': 'assets/plato-papas.webp'
  };
  var DAY_NAMES = {
    monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
    thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
  };

  function t(field) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    return field[LANG] || field.es || '';
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  fetch('../data/venue.json')
    .then(function (r) { if (!r.ok) throw new Error('venue.json ' + r.status); return r.json(); })
    .then(function (data) {
      if (page === 'home') renderHome(data);
      if (page === 'carta') renderCarta(data);
      initReveal();
      initStickyBar();
    })
    .catch(function (e) {
      var main = document.querySelector('main');
      if (main) main.appendChild(el('p', 'carta-section__intro', 'No se pudo cargar la carta. ' + esc(e.message)));
    });

  /* ── HOME ── */
  function renderHome(data) {
    // Quiet status note: today's hours, no green pill
    var status = document.getElementById('status-note');
    if (status && data.hours && data.hours.schedule) {
      var dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
      var today = data.hours.schedule.find(function (d) { return d.day === dayKey; });
      if (today) {
        if (today.status === 'closed' || !today.periods.length) {
          status.textContent = 'Hoy ' + DAY_NAMES[dayKey].toLowerCase() + ': cerrado';
        } else {
          var spans = today.periods.map(function (p) { return p.open + '–' + p.close; }).join(' y ');
          var note = today.note ? ' · ' + t(today.note) : '';
          status.innerHTML = 'Hoy: <strong>' + esc(spans) + '</strong>' + esc(note);
        }
      }
    }

    // Signature dishes: 4 real dishes with verified photos
    var host = document.getElementById('signature-dishes');
    if (host) {
      var picks = [];
      var wanted = [
        function (d) { return d.id === 'tortilla-sacromonte'; },
        function (d) { return d.id === 'sesos' || /^sesos/i.test(t(d.name)); },
        function (d) { return /callos/i.test(t(d.name)); },
        function (d) { return /papas a lo pobre|lo pobre/i.test(t(d.name)); }
      ];
      wanted.forEach(function (match) {
        var found = data.dishes.find(function (d) { return d.available !== false && match(d); });
        if (found && picks.indexOf(found) === -1) picks.push(found);
      });
      picks.slice(0, 4).forEach(function (d) {
        var photo = DISH_PHOTOS[d.id] ||
          (/callos/i.test(t(d.name)) ? DISH_PHOTOS.callos : null) ||
          (/pobre/i.test(t(d.name)) ? DISH_PHOTOS.papas : null);
        var row = el('article', 'dish-feature reveal');
        var fig = el('figure', 'img-frame');
        if (photo) fig.innerHTML = '<img src="' + photo + '" alt="' + esc(t(d.name)) + '" loading="lazy" />';
        var body = el('div', 'dish-feature__body');
        body.appendChild(el('h3', 'dish-feature__name', esc(t(d.name))));
        body.appendChild(el('p', 'dish-feature__desc', esc(t(d.description))));
        if (d.price && d.price_status !== 'pending') {
          body.appendChild(el('p', 'dish-feature__price', esc(d.price)));
        }
        if (d.pairing) body.appendChild(el('p', 'dish-feature__pairing', esc(t(d.pairing))));
        if (photo) row.appendChild(fig);
        row.appendChild(body);
        host.appendChild(row);
      });
    }

    renderDaily(data);
    renderHours(data, document.getElementById('hours-table'));
  }

  function renderDaily(data) {
    var dm = data.daily_menu;
    if (!dm || !dm.active) return;
    var meta = document.getElementById('daily-meta');
    var price = document.getElementById('daily-price');
    var foot = document.getElementById('daily-foot');
    var groups = document.getElementById('daily-groups');
    if (meta) {
      var days = (dm.days || []).map(function (d) { return DAY_NAMES[d]; }).join(', ');
      meta.textContent = days + ' · ' + dm.service_period.open + ' a ' + dm.service_period.close;
    }
    if (price) price.textContent = (typeof dm.price === 'number' ? dm.price.toFixed(2).replace('.', ',') : String(dm.price)) + ' €';
    if (foot) foot.textContent = t(dm.includes);
    if (!groups) return;
    var sections = [
      ['Primeros', dm.starters], ['Segundos', dm.seconds],
      ['Plato del día', dm.mains], ['Postre', dm.desserts]
    ];
    var first = true;
    sections.forEach(function (s) {
      var list = s[1] && (s[1][LANG] || s[1].es);
      if (!Array.isArray(list) || !list.length) return;
      var d = el('details');
      if (first) { d.open = true; first = false; }
      d.appendChild(el('summary', null, esc(s[0])));
      var ul = el('ul');
      list.forEach(function (item) { ul.appendChild(el('li', null, esc(item))); });
      d.appendChild(ul);
      groups.appendChild(d);
    });
  }

  function renderHours(data, table) {
    if (!table || !data.hours || !data.hours.schedule) return;
    data.hours.schedule.forEach(function (d) {
      var tr = el('tr', d.status === 'closed' ? 'closed' : d.status);
      var td1 = el('td', null, esc(DAY_NAMES[d.day] || d.day));
      var td2 = el('td');
      if (d.status === 'closed' || !d.periods.length) {
        td2.textContent = 'Cerrado';
      } else {
        td2.textContent = d.periods.map(function (p) { return p.open + ' a ' + p.close; }).join(' / ');
        if (d.note) td2.appendChild(el('span', 'note', esc(t(d.note))));
      }
      tr.appendChild(td1); tr.appendChild(td2);
      table.appendChild(tr);
    });
  }

  /* ── CARTA ── */
  function renderCarta(data) {
    var chipHost = document.getElementById('carta-chips');
    var body = document.getElementById('carta-body');
    if (!chipHost || !body) return;

    var allergenById = {};
    (data.allergens || []).forEach(function (a) { allergenById[a.id] = a; });

    var cats = (data.categories || [])
      .filter(function (c) { return c.type === 'food'; })
      .sort(function (a, b) { return (a.order || 99) - (b.order || 99); });

    var sections = cats.map(function (c) {
      var dishes = data.dishes.filter(function (d) {
        return d.category_id === c.id && d.available !== false && d.deleted !== true;
      });
      return { id: c.id, name: t(c.name), items: dishes, kind: 'dish' };
    }).filter(function (s) { return s.items.length; });

    if (data.wines && data.wines.length) {
      sections.push({ id: 'vinos', name: 'Vinos', items: data.wines.filter(function (w) { return w.available !== false && w.deleted !== true; }), kind: 'wine' });
    }
    if (data.beverages && data.beverages.length) {
      sections.push({ id: 'bebidas', name: 'Cervezas y refrescos', items: data.beverages.filter(function (b) { return b.available !== false && b.deleted !== true; }), kind: 'bev' });
    }

    sections.forEach(function (s) {
      var chip = el('a', 'chip', esc(s.name));
      chip.href = '#cat-' + s.id;
      chip.setAttribute('data-target', 'cat-' + s.id);
      chipHost.appendChild(chip);

      var sec = el('section', 'carta-section');
      sec.id = 'cat-' + s.id;
      sec.setAttribute('aria-label', s.name);
      sec.appendChild(el('h2', 'reveal', esc(s.name)));
      s.items.forEach(function (d) { sec.appendChild(dishRow(d, allergenById)); });
      body.appendChild(sec);
    });

    // Allergen legend
    var legend = document.getElementById('allergen-legend');
    if (legend && data.allergens) {
      legend.textContent = 'Alérgenos: ' + data.allergens.map(function (a) {
        return t(a.short) + ' = ' + t(a.label);
      }).join(' · ');
    }

    // Active chip on scroll
    initChipSpy(sections);
  }

  function dishRow(d, allergenById) {
    var name = t(d.name);
    var photo = DISH_PHOTOS[d.id] ||
      (/callos/i.test(name) ? DISH_PHOTOS.callos : null) ||
      (/lo pobre/i.test(name) ? DISH_PHOTOS.papas : null);
    var row = el('article', 'dish-row' + (photo ? ' dish-row--thumb' : ''));

    if (d.featured) row.appendChild(el('p', 'dish-row__badge', 'Recomendado'));
    row.appendChild(el('h3', 'dish-row__name', esc(name)));
    if (photo) {
      var img = el('img', 'dish-row__thumb');
      img.src = photo; img.alt = ''; img.loading = 'lazy';
      row.appendChild(img);
    }
    var desc = t(d.description);
    if (desc) row.appendChild(el('p', 'dish-row__desc', esc(desc)));

    var meta = el('div', 'dish-row__meta');
    var pairing = t(d.pairing);
    if (pairing) meta.appendChild(el('span', 'dish-row__pairing', esc(pairing)));
    if (d.price && d.price_status !== 'pending') {
      meta.appendChild(el('span', 'dish-row__price', esc(normalisePrice(d.price))));
    }
    row.appendChild(meta);

    var ids = d.allergens_confirmed;
    if (Array.isArray(ids) && ids.length) {
      var ar = el('div', 'allergen-row');
      ids.forEach(function (id) {
        var a = allergenById[id];
        if (a) {
          var chip = el('span', 'allergen-chip', esc(t(a.short)));
          chip.title = t(a.label);
          ar.appendChild(chip);
        }
      });
      if (ar.children.length) row.appendChild(ar);
    }
    return row;
  }

  // One consistent Media/Ración presentation
  function normalisePrice(p) {
    if (typeof p !== 'string') return p;
    return p.replace(/media/i, 'Media').replace(/raci[oó]n/i, 'Ración');
  }

  /* ── Motion ── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .motif-draw');
    if (!('IntersectionObserver' in window) || reduced) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function initStickyBar() {
    var bar = document.getElementById('sticky-bar');
    if (!bar) return;
    var shown = false;
    function onScroll() {
      var show = window.scrollY > 320;
      if (show !== shown) { shown = show; bar.classList.toggle('is-visible', show); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initChipSpy(sections) {
    if (!('IntersectionObserver' in window)) return;
    var chips = {};
    document.querySelectorAll('.chip[data-target]').forEach(function (c) {
      chips[c.getAttribute('data-target')] = c;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(chips).forEach(function (k) { chips[k].classList.remove('active'); });
          var chip = chips[en.target.id];
          if (chip) {
            chip.classList.add('active');
            chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(function (s) {
      var elx = document.getElementById('cat-' + s.id);
      if (elx) io.observe(elx);
    });
  }
})();
