# Restaurante-Bar León Cleanup Plan

Fecha: 2026-05-23

Este plan no ejecuta borrados automaticamente. Define prioridades para estabilizar el proyecto sin romper deploy, sin redisenar y sin reintroducir frameworks.

## Principios de limpieza

- Preservar despliegue: no tocar rutas vivas sin prueba local.
- Preservar direccion editorial: no cambiar tono, layout ni copy principal por gusto.
- Preservar static-first: no anadir Next, Astro, Vite, Tailwind, TypeScript, package.json ni build step.
- Reducir fuentes de verdad: un solo JSON activo por idioma.
- Archivar antes de borrar si hay valor historico.
- Borrar solo lo que no este referenciado, no tenga valor documental y no afecte al deploy.

## Produccion candidata revisada

Ruta: `/Users/kokonvt/Projects/personal-assistant/bar-leon-cms`

Estructura actual viva:

```text
bar-leon-cms/
├── index.html
├── _headers
├── robots.txt
├── SECURITY.md
├── admin/
│   ├── index.html
│   └── config.yml
├── css/style.css
├── js/homepage.js
├── js/carta.js
├── data/es.json
├── data/en.json
├── data/fr.json
├── es/index.html
├── es/carta.html
├── en/index.html
├── en/menu.html
├── fr/index.html
└── fr/carte.html
```

Hallazgos:

- No hay `package.json`, `node_modules`, Next, React, Vite, Tailwind ni build tooling dentro del candidato actual.
- No hay hidden framework remnants dentro de `bar-leon-cms`.
- Las rutas locales enlazadas por HTML/JS existen.
- `/admin/` esta aislado y no indexable por `robots.txt` + `X-Robots-Tag`.
- `data.json` es legacy y no se referencia desde HTML/JS.
- `assets/images/hero-bg.jpg` se referencia, pero no existe; el fallback evita rotura visible.
- `data/en.json` y `data/fr.json` son funcionales pero incompletos.
- `admin/config.yml` solo edita `data/es.json`.

## Prioridad 0 - No tocar sin decision explicita

No hacer:

- No reconstruir frontend.
- No migrar a framework.
- No cambiar Cloudflare Pages.
- No cambiar Decap por otro CMS.
- No mover rutas publicas actuales.
- No eliminar `bar-leon-cms/data/en.json` ni `data/fr.json`; aunque incompletos, son rutas vivas.
- No borrar builds historicos desde este repo; estan fuera de la raiz activa y tienen valor de archivo.

## Prioridad 1 - Estabilizacion inmediata

1. Documentar `data.json` como archivo legacy listo para archivar.

   Accion recomendada:
   - moverlo en una iteracion controlada a `NEXO/archive/bar-leon/data.legacy.json` o eliminarlo tras confirmacion.
   - antes de borrar, verificar de nuevo: `rg "data\\.json" bar-leon-cms`.

2. Resolver hero ausente.

   Opciones seguras:
   - mantener fallback y documentar que no hay hero real;
   - o anadir `assets/images/hero-bg.jpg` con imagen documental aprobada;
   - o retirar la referencia de imagen y convertir el placeholder en estado canonico.

   No hacer:
   - no traer imagenes de builds antiguos sin revisar permisos/calidad.

3. Alinear docs con CMS real.

   Problema:
   - `NEXO/context/stack.md` dice que Decap edita `data/es.json`, `data/en.json`, `data/fr.json`.
   - `admin/config.yml` actual solo edita `data/es.json`.

   Decision necesaria:
   - Si solo ES es editable, documentarlo como canonico.
   - Si EN/FR tambien deben ser editables, extender `admin/config.yml` copiando el schema con labels por idioma. Esto es bajo riesgo pero requiere prueba CMS.

4. Evitar markup vacio en carta.

   Cambio pequeno recomendado:
   - recuperar la logica de `bar-leon-cms-standalone/js/carta.js` para renderizar descripcion y sugerencia solo cuando existen.

   Motivo:
   - mejora limpieza HTML sin cambiar diseno.

## Prioridad 2 - Fuente de verdad editorial

1. Decidir cobertura multilingue.

   Estado actual:
   - ES: 71 items, 8 categorias.
   - EN: 4 items, 1 categoria.
   - FR: 4 items, 1 categoria.

   Opciones:
   - Canonico ligero: EN/FR solo muestran platos destacados y horarios. Documentarlo explicitamente.
   - Canonico completo: traducir/sincronizar 71 items. Mayor trabajo editorial, no tecnico.

2. Resolver direccion visible.

   Conflicto historico:
   - Fuentes antiguas: `C. Pan, 1 · Albayzín · 18010 Granada`, junto a Plaza Nueva.
   - Candidato actual: `Plaza Nueva · Granada · Andalucía` como senial visible.

   Recomendacion:
   - Mantener `Plaza Nueva` como referencia de orientacion si asi se decidio editorialmente.
   - Documentar en canonico la direccion postal real si se va a publicar legal/contacto.
   - No mezclar ambos como si fueran equivalentes exactos.

3. Normalizar terminologia `maridaje` vs `sugerencia`.

   Estado:
   - Campo tecnico `maridaje` existe.
   - Docs historicas prefieren `sugerencias` en UI.

   Recomendacion:
   - Mantener `maridaje` como campo tecnico para no tocar CMS.
   - Si se muestra label visible, usar "Sugerencia".

## Prioridad 3 - Archivo y consolidacion externa

Archivar como historico:

- `Restaurante-Leon`.
- `Restaurante-Leon-V2`.
- `restaurante-bar-leon/05_BUILD/web`.
- `bar-leon-clean/05_BUILD/bar-leon-web`.
- carpetas `.next`, `node_modules`, `out`, builds y worktrees historicos.

Preservar como referencia:

- `bar-leon-clean/00_ADMIN/*`.
- `bar-leon-clean/05_BUILD/FINAL_QA.md`.
- `bar-leon-clean/05_BUILD/KNOWN_LIMITATIONS.md`.
- `restaurante-bar-leon/02_DATA/*`.
- `restaurante-bar-leon/05_BUILD/web/docs/BAR_LEON_MASTER_HANDOFF.md`.
- `Restaurante-Leon/MASTER_BAR_LEON_SOURCE_OF_TRUTH.md`.
- `Restaurante-Leon/BAR_LEON_MASTER_HANDOFF.md`.
- `Restaurante-Leon-V2/src/content/images.json`.

Borrar solo tras backup:

- `.DS_Store` en carpetas del proyecto.
- `.next`, `node_modules`, `out` de builds abandonados.
- carpetas vacias como `/Users/kokonvt/Projects/bar-leon-cms`.
- duplicados de assets no usados cuando ya exista inventario maestro.

## Prioridad 4 - Pruebas antes de produccion

Comandos de verificacion recomendados desde `personal-assistant`:

```bash
jq empty bar-leon-cms/data/es.json bar-leon-cms/data/en.json bar-leon-cms/data/fr.json bar-leon-cms/data.json
rg "React|Next|Astro|Vue|Vite|Tailwind|webpack|package\\.json" bar-leon-cms
rg "data\\.json|hero-bg|assets/images" bar-leon-cms
find bar-leon-cms -type f | sort
```

Pruebas manuales:

- Abrir `/es/`, `/en/`, `/fr/`.
- Abrir `/es/carta.html`, `/en/menu.html`, `/fr/carte.html`.
- Probar `#horarios` desde home.
- Probar selector ES/EN/FR en home y carta.
- Probar `tel:+34958225143`.
- Abrir `/admin/` y confirmar que pide autenticacion GitHub.
- Guardar un cambio menor en `data/es.json` via CMS y verificar deploy.

## Que debe ser canonico

Canonico tecnico:

- HTML estatico por idioma.
- CSS unico.
- JS vanilla en IIFE.
- JSON por idioma.
- Decap CMS en `/admin/`.
- Cloudflare Pages con `_headers`.
- GitHub como backend editorial.

Canonico UX:

- Home editorial compacta.
- Carta como documento impreso.
- Menu del dia arriba en carta si esta disponible.
- Horarios como anchor funcional.
- CTA telefonico.
- Selector ES/EN/FR.
- Footer con direccion/contexto y continuidad familiar.

Canonico editorial:

- Granada real, no simulacion turistica.
- Cocina andaluza tradicional.
- Continuidad generacional.
- Sobriedad institucional.
- Sin claims inflados.
- Precios como datos.

## Que debe archivarse

- Builds Next completos.
- Componentes React.
- Schemas TypeScript.
- Sistemas de filtros/busqueda.
- Galeria y hemeroteca no publicadas.
- Map iframe placeholder.
- Reviews card con conteos temporales.
- Datos enriquecidos que no tengan mantenimiento editorial.
- CSV de plantillas genericas.

## Que puede borrarse

Tras confirmacion y backup:

- `bar-leon-cms/data.json`.
- `.DS_Store`.
- `/Users/kokonvt/Projects/bar-leon-cms` si sigue vacia.
- `.next`, `node_modules`, `out` de builds historicos.
- assets duplicados no referenciados y no marcados como fuente.

No borrar todavia:

- `bar-leon-cms/data/en.json`, `data/fr.json`.
- `bar-leon-cms/assets/images/` mientras `media_folder` del CMS apunte alli.
- `bar-leon-cms-standalone` hasta decidir si es upstream o archivo.

## Final Report

### Current project maturity

Maturity: high for a small static restaurant site; medium for editorial governance.

The technical shape is mature because it has removed unnecessary framework complexity and now matches the operational need. The editorial/data layer still needs final alignment around multilingual completeness, address wording and CMS scope.

### Architectural strengths

- Static-first architecture is appropriate and stable.
- No build step reduces long-term maintenance risk.
- Decap CMS keeps editing close to Git history.
- Cloudflare Pages is suitable for this scale.
- Security headers are stronger than typical static sites.
- Routes are few and understandable.
- Data-driven render avoids hardcoding the full menu in HTML.
- Visual system is coherent and already stripped of excess UI.

### Technical debt

- Root `data.json` duplicate.
- Missing `hero-bg.jpg` referenced by homepage.
- CMS schema edits only Spanish despite broader docs.
- EN/FR content coverage does not match ES.
- Empty markup for missing `maridaje`/description.
- Multiple historical source-of-truth docs conflict on address, naming and final sections.
- Standalone repo and in-workspace copy have diverged.

### Remaining risks

- Client may expect EN/FR to be complete because language routes exist.
- Decap auth flow should be tested on the real Cloudflare Pages URL.
- Cloudflare Access policy is external to the repo and cannot be verified from files alone.
- If `data/es.json` is edited manually, CMS category options may still constrain future entries.
- If hero image is added later without size review, it can affect first viewport.

### Production readiness

Production readiness: conditionally ready.

Ready if accepted scope is:

- Spanish-first site,
- compact EN/FR highlights,
- no real hero image yet,
- phone-only contact,
- no map iframe,
- CMS editing Spanish content only.

Not fully ready if expected scope is:

- complete trilingual menu,
- owner editing all languages,
- live hero photography,
- full address/contact/map module,
- visible Google reviews integration.

### Cleanup priorities

1. Decide whether `data/en.json` and `data/fr.json` are complete pages or lightweight summaries.
2. Align `NEXO/context/stack.md` with actual CMS edit scope.
3. Remove or archive `data.json`.
4. Resolve `hero-bg.jpg` intentionally.
5. Sync `bar-leon-cms-standalone` and `personal-assistant/bar-leon-cms` or declare one archived.
6. Keep all historical builds out of production deployment.

