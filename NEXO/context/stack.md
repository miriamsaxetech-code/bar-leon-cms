# Restaurante-Bar León — Stack & Arquitectura

---

## Arquitectura

Sitio estático completamente. Sin backend propio. Sin base de datos. Sin servidor de aplicaciones.

```
GitHub repo (miriamsaxetech-code/bar-leon-cms)
  └── Cloudflare Pages (deploy automático en push a main)
        ├── Sitio público (HTML + CSS + JS vanilla)
        └── /admin/ (Decap CMS — edición sin código)
```

---

## Estructura de archivos

```
/
├── index.html          — router de idioma (JS redirect automático)
├── _headers            — headers de seguridad Cloudflare Pages
├── robots.txt          — noindex en /admin/
├── data.json           — duplicado legacy (no usado, no borrar aún)
├── css/
│   └── style.css       — hoja de estilos unificada (homepage + carta)
├── js/
│   ├── homepage.js     — lógica y render de homepage
│   └── carta.js        — lógica y render de carta/menú/horarios
├── data/
│   ├── es.json         — contenido español (fuente canónica)
│   ├── en.json         — contenido inglés
│   └── fr.json         — contenido francés
├── es/
│   ├── index.html      — homepage en español
│   └── carta.html      — carta en español
├── en/
│   ├── index.html      — homepage en inglés
│   └── menu.html       — carta en inglés
├── fr/
│   ├── index.html      — homepage en francés
│   └── carte.html      — carta en francés
└── admin/
    ├── index.html      — Decap CMS (pinneado a 3.0.0)
    └── config.yml      — configuración CMS (campos, idiomas, backend)
```

---

## CMS

**Decap CMS** (anteriormente Netlify CMS)
- Versión: 3.0.0 desde `https://unpkg.com/decap-cms@3.0.0/dist/decap-cms.js`
- Backend: GitHub (`miriamsaxetech-code/bar-leon-cms`, rama `main`)
- Autenticación: GitHub OAuth
- Archivos editables: `data/es.json`, `data/en.json`, `data/fr.json`

**Campos CMS disponibles:**
- Inicio: titular, subtítulo, aviso especial (opcional)
- Menú del día: disponible (SI/NO), días, precio, condiciones
- Horarios: día · estado (ABIERTO/CERRADO/CERRADO TARDE) · texto visible
- Carta: categoría · nombre · descripción · maridaje · precio · disponible (SI/NO)

**Categorías de carta definidas en CMS:**
- PARA ABRIR BOCA
- LOS PLATOS DE SIEMPRE
- DE NUESTRA BODEGA

---

## Deployment

- Plataforma: Cloudflare Pages
- Trigger: push a rama `main`
- Build: ninguno (sitio estático puro — sin build step)
- Output: directorio raíz
- Dominio: pendiente de configuración con cliente

---

## Fuentes web

Cargadas desde Google Fonts (preconnect configurado):
- `Playfair Display:wght@700`
- `Inter:wght@400;500;600`

---

## Idiomas

Detección automática de idioma del navegador en `index.html` (JS inline).
Fallback: `es`.
Soportados: `es`, `en`, `fr`.

Rutas de carta por idioma:
- ES: `/es/carta.html`
- EN: `/en/menu.html`
- FR: `/fr/carte.html`

---

## Principios técnicos

- Static-first: sin frameworks, sin dependencias de runtime
- Vanilla JS en IIFE (no módulos ES — compatibilidad máxima)
- Un solo CSS para todo el sitio
- Datos en JSON — editables sin código vía CMS
- Sin cookies, sin tracking, sin analytics (por defecto)
- Sin imágenes hardcoded — hero con `onerror` fallback a placeholder
- Render del lado del cliente desde JSON (fetch + innerHTML)

---

## Mantenimiento

**Actualizar contenido:** Decap CMS en `/admin/` → guardar → publicado automáticamente.

**Añadir plato:** CMS → añadir item a lista Carta → guardar.

**Ocultar plato temporalmente:** CMS → campo "¿En carta hoy?" → "No" → guardar.

**Desactivar menú del día:** CMS → campo "¿Disponible hoy?" → "No" → guardar.

**Actualizar horarios:** CMS → lista Horarios → editar estado/detalle por día.

**Recuperar versión anterior:** GitHub → archivo `data/es.json` → History → elegir versión.

---

## Performance

- Sin build step → despliegue instantáneo
- Cloudflare CDN global (edge caching automático)
- CSS y JS mínimos (un archivo cada uno, sin librerías externas)
- Fuentes con `display=swap` (no bloquean render)
- Loader fade-out 380ms (evita flash de contenido sin datos)
- Imágenes: solo hero, con fallback si no existe el archivo

---

## Variables CSS (tokens visuales)

```css
--bg:     #F6F3EC;
--ink:    #1C1A17;
--accent: #7A1C1C;
--muted:  #5C5752;
--faint:  rgba(122, 28, 28, 0.16);
```

---

## Breakpoints responsive

- `max-width: 540px` — móvil estándar
- `max-width: 420px` — móvil pequeño (oculta check-leader punteado)
- `max-width: 380px` — móvil mínimo (ajusta nav)
