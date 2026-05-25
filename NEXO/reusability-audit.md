# NEXO — Reusability Audit

> Qué partes del proyecto Bar León son específicas del venue
> y qué partes ya son sistema reutilizable.
> Generado: 2026-05-23

---

## Clasificación

| Categoría | Venue-specific | Sistema NEXO | Notas |
|---|---|---|---|
| Copy del inicio | ✅ | — | Cada venue tiene su propio titular |
| Datos de carta | ✅ | — | Cada venue tiene su propio menú |
| Horarios | ✅ | — | |
| Color acento | ✅ | Default: `#7A1C1C` | Se puede personalizar por venue |
| Foto hero | ✅ | — | Fallback es reutilizable |
| Repo GitHub | ✅ | Patrón: `org/venue-slug-cms` | |
| **JS engines** | — | ✅ | `homepage.js` y `carta.js` son sistema |
| **CSS design system** | — | ✅ | `style.css` completo es sistema |
| **HTML shells** | — | ✅ | Los 9 HTML son plantillas |
| **Language detector** | — | ✅ | Root `index.html` es sistema |
| **Arquitectura multilingüe** | — | ✅ | Patrón ES/EN/FR es sistema |
| **Schema JSON** | — | ✅ | Estructura `data/*.json` es sistema |
| **Admin Decap config** | Parcial | ✅ | Schema base reutilizable; categorías son venue-specific |
| **Security headers** | — | ✅ | `_headers` es sistema |
| **Robots.txt** | — | ✅ | Es sistema |
| **NEXO agents** | — | ✅ | Todos son sistema |
| **NEXO templates** | — | ✅ | Todos son sistema |
| **NEXO checklists** | — | ✅ | Todos son sistema |
| **NEXO delivery docs** | Parcial | ✅ | Se personalizan por venue pero la estructura es sistema |

---

## Módulos reutilizables (listos para próximo venue)

### 1. JS Engine: `homepage.js`

**Estado:** Reutilizable con configuración mínima.

Variables a cambiar por venue (primeras 10 líneas):
```js
const PHONE = 'tel:+34XXXXXXXXX';
const HOME_LINKS  = { es: '/es/', en: '/en/', fr: '/fr/' };
const CARTA_LINKS = { es: '/es/carta.html', en: '/en/menu.html', fr: '/fr/carte.html' };
```
El objeto `NAV` se puede dejar como está si se usan los campos `nav` del JSON.

**Mejora sugerida para v2:** leer `PHONE` del JSON (`contact.phoneLink`) en lugar de hardcodear.

---

### 2. JS Engine: `carta.js`

**Estado:** Reutilizable con configuración mínima.

Mismas variables que `homepage.js`. El engine de render completo (categorías, dot-leaders, edict, horarios) es totalmente genérico — funciona con cualquier JSON que siga el schema NEXO.

**Dependencias del JSON:**
- `d.menuDia.disponible`, `.precio`, `.dias`, `.condiciones`
- `d.carta` (array con `categoria`, `nombre`, `precio`, `descripcion`, `maridaje`, `disponible`)
- `d.horarios` (array con `dia`, `estado`, `detalle`)
- `d.nav` (objeto con 7 campos obligatorios)

---

### 3. CSS Design System: `style.css`

**Estado:** Reutilizable. Las únicas líneas venue-specific son las variables de color en `:root`.

El sistema completo incluye:
- Tipografía (Playfair + Inter, Google Fonts)
- Color tokens (4 variables)
- Layout (`.wrap`, `.masthead-rule`, `#loader`)
- Homepage (`.site-name`, `.nav-row`, `.hero-frame`, `.lang-selector`)
- Carta (`.carta-header`, `.edict`, `.check-row`, `.check-leader`, `.horarios-grid`)
- Mobile responsive (media queries a 768px y 480px)
- Footer (`.carta-footer`, `.cta-btn`)

**Para un nuevo venue:** cambiar solo `--accent` en `:root`.

---

### 4. HTML Shell Template

**Estado:** Reutilizable. Son 9 archivos casi idénticos entre sí.

Variaciones:
- `es/index.html` vs `en/index.html` vs `fr/index.html` → solo el lang attribute
- `es/carta.html` vs `en/menu.html` vs `fr/carte.html` → nombre del archivo y lang

Un generador simple (bash loop o template engine) podría producir los 9 archivos automáticamente en < 1 minuto.

---

### 5. Language Detector: `index.html` raíz

**Estado:** 100% reutilizable sin cambios. No tiene referencias venue-specific.

---

### 6. Schema JSON: `data/*.json`

**Estado:** La estructura es sistema. El contenido es venue-specific.

El schema base:
```json
{
  "inicio": { "titular", "subtitulo", "avisoEspecial" },
  "menuDia": { "disponible", "dias", "precio", "condiciones" },
  "horarios": [{ "dia", "estado", "detalle" }],
  "carta": [{ "categoria", "nombre", "descripcion", "maridaje", "precio", "disponible" }],
  "nav": { 7 campos },
  "contact": { "address", "phone", "phoneLink", "whatsapp" }
}
```

---

### 7. Decap CMS Config: `admin/config.yml`

**Estado:** Parcialmente reutilizable.

Reutilizable:
- Estructura de `backend`, `media_folder`, `public_folder`
- Widgets de `inicio`, `menuDia`, `horarios`
- Estructura base de `carta` (todos los campos)

Venue-specific:
- `repo` y `app_id`
- Lista de `options` en el widget `categoria`

**Para un nuevo venue:** copiar `config.yml`, cambiar `repo`, `app_id`, y las categorías de carta.

---

### 8. Security Package

**Estado:** 100% reutilizable.

- `_headers` → copia directa sin cambios
- `robots.txt` → copia directa sin cambios
- `SECURITY.md` → sustituir nombre del venue y del repo

---

## Prompts reutilizables

### Prompt de extracción de carta

```
Actúa como NEXO-MenuExtractor.
Fuente: [adjuntar carta]
Schema: { categoria, nombre, descripcion, maridaje, precio, disponible }
Precios en formato X,XX€. Sin inventar. [POR CONFIRMAR] para lo incierto.
Output: array JSON listo para data/es.json → campo "carta"
```

### Prompt de copy de inicio

```
Local: [nombre], [tipo], [año], [ubicación]
Historia: [2-3 frases]
Tono: institucional, factual, sin adjetivos vacíos
Output: 3 opciones de titular de una frase (máx. 8 palabras) + subtítulo institucional
```

### Prompt de traducción de horarios (FR)

```
Traduce estos horarios al francés.
Formato de horas: 13h00–16h00 (con h, sin espacio, guión corto)
Días en francés. Estado CERRADO → "Fermé". ABIERTO → no texto (solo el horario).
```

---

## Layouts reutilizables

| Layout | Estado | Venues que lo usarán |
|---|---|---|
| Homepage editorial (masthead + nombre + nav + tagline + hero) | ✅ Producción | Todos |
| Carta con dot-leaders | ✅ Producción | Todos con carta |
| Edict box (menú del día, avisos) | ✅ Producción | Todos con menú del día |
| Horarios grid (días + estado + detalle) | ✅ Producción | Todos |
| CTA full-width (tel:) | ✅ Producción | Todos |
| Historia timeline | ⚠ Pendiente | Venues con historia documentada |
| Mapa / Dónde estamos | ⚠ Pendiente | Todos (alta demanda) |
| Galería de fotos | ⚠ Pendiente | Venues con fotos de calidad |
| Hemeroteca / Prensa | ⚠ Pendiente | Venues con presencia mediática |

---

## Lógica multilingüe reutilizable

El patrón completo ES/EN/FR es sistema:

1. Root detect → redirect por `navigator.language`
2. Pathname detect → `window.location.pathname.match(/\/(es|en|fr)\//)`
3. Data fetch → `fetch('../data/{lang}.json')`
4. `langSelector()` → idioma activo como `<span>`, otros como `<a>`
5. `NAV[lang]` → strings de UI por idioma desde objeto hardcoded en JS

**Para añadir un idioma nuevo** (ej. DE):
- Crear `de/index.html` y `de/carta-de.html`
- Añadir `de` al root detector y al `getLang()` en ambos JS
- Crear `data/de.json`
- Añadir `de` al `langSelector()` y a los `NAV`/`HOME_LINKS`/`CARTA_LINKS` objects

---

## Patrones de seguridad reutilizables

| Patrón | Reutilizable | Nota |
|---|---|---|
| `_headers` con security headers | ✅ | Copia directa |
| PKCE auth sin client secret | ✅ | Mejor práctica para sitios estáticos |
| Decap con versión pinneada | ✅ | Siempre usar versión explícita |
| `robots.txt` excluye `/admin/` | ✅ | Copia directa |
| GitHub como backup natural | ✅ | Sin configuración extra |
| Sin secrets en código cliente | ✅ | PKCE lo garantiza |
