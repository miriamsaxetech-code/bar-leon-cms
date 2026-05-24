# Restaurante-Bar León Legacy Audit

Fecha de auditoria: 2026-05-23

Este documento consolida lo encontrado en las carpetas locales relacionadas con Bar Leon. Su proposito es preservar las decisiones acumuladas sin reabrir un redisenyo ni cambiar la arquitectura actual.

## Alcance revisado

Raices locales revisadas:

- `/Users/kokonvt/Projects/personal-assistant/bar-leon-cms` - candidato actual dentro del workspace activo.
- `/Users/kokonvt/Projects/bar-leon-cms-standalone` - repo standalone con historial Git y docs NEXO propios.
- `/Users/kokonvt/Projects/bar-leon-cms` - carpeta vacia, no contiene build util.
- `/Users/kokonvt/Projects/bar-leon-clean` - consolidacion intermedia con documentos fuente, JSON normalizados y build Next export.
- `/Users/kokonvt/Projects/restaurante-bar-leon` - build/documentacion V3 con `01_CONTENT`, `02_DATA` y `05_BUILD/web`.
- `/Users/kokonvt/Projects/Restaurante-Leon` - primer build Next/React con componentes ricos y datos localizados.
- `/Users/kokonvt/Projects/Restaurante-Leon-V2` - segundo build Next/React con i18n, galeria, vinos, hemeroteca y rutas localizadas.
- `/Users/kokonvt/Projects/restaurant-client-template/data/venues/bar-leon` - plantilla generica con entrada minima.
- `/Users/kokonvt/Projects/bella-kurva-web/data/venues/bar-leon` - copia de plantilla generica con entrada minima.

## Resumen ejecutivo

El candidato actual correcto es `personal-assistant/bar-leon-cms`: sitio estatico HTML/CSS/JS con Decap CMS, GitHub backend y headers de Cloudflare Pages. La direccion tecnica correcta ya esta clara: no hay framework, no hay build step, no hay servidor, no hay base de datos.

Los builds historicos aportan valor como archivo de decisiones, datos y patrones, pero no deben volver a introducirse como codigo de produccion. Las versiones Next/React resolvian demasiados problemas a la vez: i18n avanzado, busqueda/filtros, galeria, hemeroteca, vinos, mapas, reviews, componentes reutilizables, schemas y build tooling. Para Bar Leon, esa complejidad quedo fuera de escala.

## Builds detectados

| Carpeta | Stack | Estado | Valor a conservar |
|---|---|---|---|
| `personal-assistant/bar-leon-cms` | HTML/CSS/JS, Decap | Produccion candidata | Canonico tecnico actual |
| `bar-leon-cms-standalone` | HTML/CSS/JS, Decap, Git | Activo historico / upstream cercano | Historial Git, NEXO local, mejoras puntuales |
| `bar-leon-clean` | Docs + Next static export | Archivo de consolidacion | Fuente de decisiones, QA, conflictos, datos completos |
| `restaurante-bar-leon` | Docs + Next App Router | Archivo de reinicio | `02_DATA`, schema, reglas finales, restart master |
| `Restaurante-Leon` | Next 16, React 19, Tailwind 4 | Abandonado | Componentes y patrones UX supervivientes |
| `Restaurante-Leon-V2` | Next 16, React 19, Tailwind 4 | Abandonado | i18n, rutas, galeria, metadata de imagenes |
| `restaurant-client-template` / `bella-kurva-web` | plantilla TS/CSV | No canonico | Solo evidencia de experimentacion generica |

## Componentes repetidos

Estos aparecen en varias iteraciones y por tanto son supervivientes reales:

- Cabecera con nombre del local, navegacion corta e idioma.
- Selector ES / EN / FR.
- CTA telefonico `tel:+34958225143`.
- Carta agrupada por categorias.
- Fila de menu con nombre, precio y separador visual.
- Bloque de menu del dia.
- Horarios semanales con miercoles cerrado y martes solo mediodia.
- Footer/contacto con direccion y telefono.
- Integracion o enlace a Google Maps.
- Referencia a resenias Google en builds Next.
- Historia/continuidad desde 1959 en builds documentales.
- Vinos de Granada / sugerencias como capa editorial.
- Normalizacion de `Albayzin` / `Albayzín`.

## Componentes que no deben volver al candidato actual

Estos fueron utiles en exploracion, pero son demasiado pesados o no estan activos:

- `BottomActionBar`, `FloatingActions`, iconografia React y nav movil compleja.
- `GoogleReviewsCard` con tarjetas/testimonios.
- `JsonLd`/schemas React mientras el sitio siga sin build step.
- `MenuSearch`, filtros de vinos, sticky chips y busqueda de carta.
- `GalleryGrid`, `HemerotecaPageClient`, `WinesPageClient`.
- Rutas dedicadas `/historia`, `/hemeroteca`, `/galeria`, `/vinos`, `/contacto`, `/legal` mientras no exista contenido editorial mantenible.
- Zod/TypeScript schemas o loaders complejos.
- `wrangler` deploy directo desde build Next.

## Assets duplicados

Patrones detectados:

- Logos y favicons duplicados: `logo-leon2.svg`, `logo-leon2.png`, `leon-512.png`, `leon-apple.png`.
- Heroes duplicados: `hero-leon.png`, `hero-leon.webp`, `hero-barleon.png`, `bar-leon.jpeg`, `bar-leon-fachada-entrada.png`.
- Fotos fuente duplicadas entre `Restaurante-Leon`, `Restaurante-Leon-V2`, `restaurante-bar-leon/04_ASSETS` y `bar-leon-clean/04_ASSETS`.
- `bar-leon-clean` conserva imagenes fuente sueltas (`leon1.jpeg`, `leon2.jpeg`, etc.) ademas de `04_ASSETS/SOURCE_2_BAR_LEON_FOTOS`.
- El candidato actual referencia `../assets/images/hero-bg.jpg`, pero `bar-leon-cms/assets/images` no contiene ese archivo. El fallback de placeholder funciona, pero el asset queda huerfano como intencion no completada.
- `bar-leon-cms-standalone/assets/images/.gitkeep` existe; en el candidato actual no hay `.gitkeep` ni imagen real.

## Datos duplicados y schemas conflictivos

Schemas historicos encontrados:

- `data.json` legacy plano: mezcla `nombreES`, `nombreEN`, `descripcionEN`, `bajada`; no coincide con los JSON actuales por idioma.
- `data/{es,en,fr}.json` actual: `inicio`, `menuDia`, `horarios`, `carta` plano.
- `01_CONTENT/*.json`: menu, wines, enrichments, pairings y daymenu por idioma.
- `02_DATA/*.json`: `categorias > items`, con campos `price_media`, `price_racion`, `price_unidad`, `sugerencia_barra`.
- Next builds: loaders, schemas TypeScript y datos importados en build.
- Plantillas genericas: `menu.csv` + `site.ts`.

Conflictos actuales relevantes:

- `personal-assistant/bar-leon-cms/data.json` es duplicado legacy no usado.
- `bar-leon-cms/data/es.json` tiene 71 items; `bar-leon-cms-standalone/data/es.json` tiene 83 items.
- `data/en.json` y `data/fr.json` actuales tienen solo 4 items cada uno, mientras `es.json` tiene 71. La estructura multilingue existe, pero la cobertura no es equivalente.
- `admin/config.yml` del candidato actual solo expone `data/es.json`. La documentacion `NEXO/context/stack.md` dice que el CMS edita `es/en/fr`, pero el YAML actual no lo hace.
- En `bar-leon-cms-standalone/admin/config.yml` existia `auth_type: pkce` y `app_id: REPLACE_WITH_GITHUB_CLIENT_ID`; el candidato actual lo elimina. Esto evita un placeholder roto, pero deja el modo OAuth exacto dependiente de la configuracion Decap/GitHub final.
- `carta.js` actual renderiza `<p class="item-maridaje"></p>` aunque `maridaje` este vacio. La version standalone lo evitaba con render condicional.
- `SECURITY.md` y `_headers` no coinciden plenamente en redaccion: `_headers` ya incluye CSP/HSTS mas fuerte; `SECURITY.md` es owner-facing y mas corto.

## Rutas muertas o archivadas

Rutas historicas que no deben considerarse vivas:

- Next: `/[lang]/galeria`, `/[lang]/gallery`, `/[lang]/galerie`.
- Next: `/[lang]/historia`.
- Next: `/[lang]/vinos`.
- Next: `/[lang]/cervezas` / beers.
- Next: `/[lang]/contacto`.
- Next: `/[lang]/legal`.
- Next: `/[lang]/hemeroteca`.
- Next V3/V4: `/carta/`, `/maridajes/`, `/reservas/`, `/bodega/`.

Rutas vivas en el candidato actual:

- `/` - detector de idioma.
- `/es/`, `/en/`, `/fr/` - homepages.
- `/es/carta.html`, `/en/menu.html`, `/fr/carte.html` - cartas.
- `/admin/` - Decap CMS.

No hay evidencia de rutas vivas que falten fisicamente dentro del candidato actual. El anchor `#horarios` existe en las tres cartas via JS.

## CSS y UI

Patrones que sobrevivieron:

- Papel crema, tinta oscura, rojo granate.
- Playfair Display para nombre/precios/titulares e Inter para texto funcional.
- Una hoja CSS unificada.
- `masthead-rule` superior de 2px.
- Loader textual `Bar León`.
- Menu con dotted leaders.
- Bloque de menu del dia tipo edicto.
- Botones sin border radius.
- Responsive simple con breakpoints `540`, `420`, `380`.

Riesgos menores:

- `.item-maridaje` se imprime aunque este vacio.
- `hero-frame` depende de un asset ausente y fallback inline.
- El telefono visible aparece en homepage footer; documentos historicos recientes indicaban no mostrar numero fijo como texto visible. El contexto actual `bar-leon-canonical.md` exige telefono clicable visible, asi que gana el candidato actual salvo decision editorial nueva.

## Multilingue

Estructura estable:

- Idiomas: `es`, `en`, `fr`.
- Redirect de `/` por `navigator.language`, fallback `es`.
- Rutas de carta localizadas por nombre de archivo.
- Selector de idioma en home y carta.
- `hreflang` presente en HTML.

Estructura inestable:

- Cobertura de carta EN/FR muy inferior a ES.
- El CMS actual no edita EN/FR.
- Estados `ABIERTO`, `CERRADO`, `CERRADO TARDE` se mantienen en espanol dentro de JSON de EN/FR; el render usa esos tokens tecnicos y no los muestra directamente. Esto es aceptable mientras se documente como API interna.
- Categorias actuales difieren entre idiomas: ES usa 8 categorias; EN/FR solo una categoria.

## Mapas y resenias

Integraciones historicas:

- Google Maps share URL recurrente: `https://share.google/xJVQZSEIEcJKQ0uD3`.
- Otra URL detectada en plantillas: `https://share.google/mXVdOf3VPSJsqqShh`.
- Reviews Google historicas: rating `4.1`, conteo `1.894` / `1894`, `reviewsUrl` con place id en `Restaurante-Leon`.
- Builds Next tenian `GoogleReviewsCard`, `FloatingActions` y enlaces Maps.
- `bar-leon-clean` documento una limitacion de iframe de Google Maps con URL placeholder.

Decision para actual:

- No reintroducir iframe ni tarjeta de reviews en el candidato estatico actual.
- Si se necesita mapa, usar enlace externo simple y documentar URL canonica antes de implementarlo.
- Si se usan reviews, no hardcodear conteos temporales salvo que se acepte como texto editorial revisable.

## Legacy CMS

Decap CMS esta bien elegido para el objetivo actual, pero su schema actual no esta completamente alineado con el contenido:

- Solo existe una coleccion/file para `data/es.json`.
- `media_folder` apunta a `assets/images`, carpeta sin imagenes.
- Las categorias del CMS actual coinciden con el ES actual, no con EN/FR.
- No hay colecciones para `data/en.json` ni `data/fr.json`.
- No hay validacion de cobertura multilingue.
- No hay campo editorial para hero image, mapa o enlace Google.

## Orfandades actuales

En `personal-assistant/bar-leon-cms`:

- `data.json` - duplicado legacy no usado por ningun JS/HTML.
- `assets/images/` - carpeta vacia; `hero-bg.jpg` referenciado y ausente.
- `data/en.json` y `data/fr.json` - vivos en rutas, pero incompletos frente a ES.
- `item-maridaje` vacio - markup redundante, no rompe.

## Conclusion de auditoria

La consolidacion ya ocurrio en arquitectura: el proyecto ha bajado correctamente desde builds Next complejos a una web estatica mantenible. Lo que falta no es reconstruir, sino cerrar inconsistencias de fuente:

- elegir una sola raiz canonica,
- archivar builds historicos fuera del deployment,
- decidir si EN/FR son completos o solo versiones resumidas,
- alinear docs con el CMS real,
- resolver `data.json` y `hero-bg.jpg`,
- preservar en docs los patrones que sobrevivieron.

