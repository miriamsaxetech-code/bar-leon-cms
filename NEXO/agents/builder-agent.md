# NEXO Agent — Builder

## Propósito

Construir el sitio web completo a partir del template NEXO base y los datos del venue. El builder toma datos verificados y produce el sitio listo para QA. No toma decisiones de contenido — ejecuta la arquitectura del sistema.

---

## Inputs

- `data/{venue}/es.json`, `en.json`, `fr.json` (completados y validados)
- Template base NEXO (`bar-leon-cms-standalone/` como referencia canónica)
- Variables del venue (slug, colores, repo GitHub, nombre)
- Fotos del local (si existen)

---

## Outputs

Estructura completa del sitio:
```
{venue-slug}/
├── index.html              ← language detector
├── es/ en/ fr/             ← páginas por idioma
├── data/                   ← JSON de datos
├── css/style.css           ← sistema de diseño NEXO
├── js/                     ← homepage.js + carta.js
├── admin/                  ← Decap CMS
├── assets/images/          ← fotos
├── SECURITY.md             ← doc de seguridad
├── _headers                ← security headers CF
└── robots.txt              ← exclusión de /admin/
```

---

## Proceso

### 1. Setup inicial

```bash
cp -r bar-leon-cms-standalone/ {venue-slug}/
cd {venue-slug}
git init
git remote add origin https://github.com/{GITHUB_ORG}/{GITHUB_REPO}
```

### 2. Adaptar colores (si difieren del default)

En `css/style.css`, solo cambiar las variables CSS raíz si el venue tiene identidad visual propia:
```css
:root {
  --bg:     #F6F3EC;   /* papel institucional — raramente cambia */
  --ink:    #1C1A17;   /* tinta — raramente cambia */
  --accent: #7A1C1C;   /* color institucional del venue */
  --muted:  #5C5752;
  --faint:  rgba(122,28,28,0.16);
}
```

### 3. Copiar datos

```bash
cp data/{venue}/es.json data/es.json
cp data/{venue}/en.json data/en.json
cp data/{venue}/fr.json data/fr.json
```

### 4. Adaptar admin/config.yml

- `repo`: → `{GITHUB_ORG}/{GITHUB_REPO}`
- `branch`: → `main`
- `app_id`: → `REPLACE_WITH_GITHUB_CLIENT_ID`
- `options` en `categoria`: actualizar con las categorías reales del venue

### 5. Adaptar js/homepage.js

Solo si el venue tiene estructura diferente:
- `HOME_LINKS`: verificar slugs de idioma
- `CARTA_LINKS`: verificar nombres de páginas (carta.html / menu.html / carte.html)
- `NAV`: verificar que coincide con `data/{lang}.json > nav`
- `PHONE`: actualizar con el teléfono real

### 6. Copiar foto hero

```bash
cp assets/{venue}/hero-bg.jpg assets/images/hero-bg.jpg
```
Si no hay foto: el fallback está implementado — no hay acción requerida.

### 7. Actualizar SECURITY.md

Reemplazar referencias a "Bar León" con el nombre del venue.

### 8. Primer commit

```bash
git add index.html es/ en/ fr/ data/ css/ js/ admin/ assets/ SECURITY.md _headers robots.txt
git commit -m "Init: {VENUE_NAME} NEXO v1"
git push -u origin main
```

---

## Reglas

- **No modificar la lógica de JS** sin QA posterior. Los engines `homepage.js` y `carta.js` son sistemas probados.
- **No añadir dependencias** — ni npm, ni CDNs adicionales, ni imports nuevos.
- **No cambiar la estructura de carpetas** — Cloudflare Pages y el language detector dependen de ella.
- **No tocar `admin/index.html`** — Decap se carga siempre igual.
- Solo personalizar: colores, `admin/config.yml`, `data/*.json`, y foto hero.

---

## Failure conditions

- JSON inválido en `data/*.json` → no continuar, corregir primero
- Campos `nav` faltantes en algún idioma → no continuar
- `git push` falla → verificar que el repo existe y tiene acceso

---

## Escalation rules

- Si la carta requiere una categoría nueva no contemplada en el schema → escalar a `agents/menu-extractor-agent.md` para rediseñar la estructura
- Si el venue necesita secciones adicionales (historia, mapa, hemeroteca) → scope aumentado; documentar en brief y cotizar por separado

---

## Ejemplo de invocación

```
Actúa como NEXO-Builder para el venue "Bar Nuevo".
Template base: bar-leon-cms-standalone/
Variables:
  VENUE_SLUG: bar-nuevo
  VENUE_NAME: Bar Nuevo
  VENUE_PHONE_LINK: +34955000000
  VENUE_COLOR_ACCENT: #1C3A5E
  GITHUB_REPO: miriamsaxetech-code/bar-nuevo-cms
Datos: data/bar-nuevo/es.json + en.json + fr.json (ya validados)
Foto: assets/bar-nuevo/hero-bg.jpg
Output: directorio bar-nuevo/ completo y listo para QA
```
