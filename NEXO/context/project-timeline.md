# Restaurante-Bar León Project Timeline

Fecha de consolidacion: 2026-05-23

## Lectura rapida

Bar Leon paso por una secuencia clara: exploracion rica en Next/React, consolidacion de datos y diseno, reinicios de estructura, y finalmente reduccion consciente a HTML/CSS/JS estatico con Decap CMS. La decision final no es una perdida de ambicion, sino una maduracion: el sitio necesita ser estable, editable y facil de conservar.

## Fase 0 - Material bruto y fuentes del negocio

Evidencias:

- PDF de carta: `CARTA REST. BAR LEÓN 2025 (1).pdf`.
- Fotos fuente en `Restaurante-Leon/Bar-leon-fotos`, `restaurante-bar-leon/04_ASSETS`, `bar-leon-clean/04_ASSETS`.
- Datos de menu, vinos, bebidas, historia y hemeroteca en distintas estructuras JSON.

Decisiones acumuladas:

- Cocina andaluza tradicional.
- Continuidad familiar desde 1959.
- Calle Pan / Plaza Nueva como ancla geografica historica.
- Telefono fijo como canal principal.
- Evitar marketing generico.

## Fase 1 - Primer build Next (`Restaurante-Leon`)

Stack detectado:

- Next 16, React 19, Tailwind 4, TypeScript.
- Static export configurado con `output: "export"`.

Componentes destacados:

- `SiteHeader`, `SiteFooter`, `BottomActionBar`, `FloatingActions`.
- `MenuClientView`, `MenuSection`, `MenuItemRow`.
- `MenuDelDia`, `WineCard`, `WinesClientView`.
- `GoogleReviewsCard`, `MediaMentions`.
- `FamiliaLeon`, `HerenciaBlock`, `CofradiaBlock`.
- `LanguageToggle`.

Aportes que sobreviven:

- ES/EN/FR.
- CTA llamar.
- Link a Maps.
- Menu como pieza central.
- Historia 1959 y cofradias como senial de confianza.
- Reviews Google como prueba social posible.

Problemas:

- Complejidad alta para una web pequena.
- Dependencias de framework sin necesidad editorial real.
- Componentizacion abundante, pero coste de mantenimiento alto.

## Fase 2 - V2 Next + rutas localizadas (`Restaurante-Leon-V2`)

Stack detectado:

- Next 16, React 19, Tailwind 4.
- `trailingSlash: true`, static export.
- Rutas localizadas y diccionarios por idioma.

Se anadieron:

- Galeria localizada.
- Mas estructura i18n.
- `JsonLd`.
- `MenuSearch`.
- Paginas de vinos, hemeroteca, reservas/contacto.
- Primitivas UI (`Button`, `Card`, `Container`, `Section`).
- Metadatos de imagenes.

Aportes que sobreviven:

- La necesidad de `hreflang`.
- La idea de no publicar hemeroteca sin URLs validadas.
- Imagenes con alt text factual.
- Carta de vinos como contenido valioso, aunque no debe ser compleja ahora.

Problemas:

- La estructura de rutas se expandio mas alla de lo que el cliente necesita mantener.
- Persistieron rutas legacy y styling mixto.
- La capa i18n era mas sofisticada que la capacidad editorial disponible.

## Fase 3 - Consolidacion documental (`restaurante-bar-leon`)

Estructura detectada:

- `01_CONTENT/ES/*.md`.
- `02_DATA/*.json` con carta, vinos, bebidas, historia, postres, maridajes.
- `02_DATA/schema.md`.
- `05_BUILD/web` como build Next.

Decisiones importantes:

- Orden final propuesto: Hero, Sabores de Andalucia, Carta, Vinos, Barra, Postres, Donde estamos.
- Regla `Albayzín` con `y` y tilde.
- No inventar datos: usar `[POR CONFIRMAR]`.
- Evitar secciones independientes `maridajes`, `bodega`, `recomendaciones`.
- Usar `sugerencias` como terminologia preferida.
- Mantener menu del dia y horarios como datos operativos.

Aportes que sobreviven:

- `02_DATA` es el archivo historico mas rico.
- El criterio de no inventar debe mantenerse.
- La estructura `categorias > items` es buena como archivo, aunque el candidato actual usa array plano.

Problemas:

- Build Next seguia siendo demasiado complejo.
- Existian imports, schemas y alias para resolver datos que en el sitio final no son necesarios.

## Fase 4 - Bar Leon Clean (`bar-leon-clean`)

Rol:

- Carpeta de consolidacion con administracion, contenido, diseno, assets, build y QA.

Documentos clave:

- `00_ADMIN/MASTER_BAR_LEON_SOURCE_OF_TRUTH.md`.
- `00_ADMIN/BAR_LEON_MASTER_HANDOFF.md`.
- `00_ADMIN/CONTENT_CONFLICTS.md`.
- `05_BUILD/FINAL_QA.md`.
- `05_BUILD/KNOWN_LIMITATIONS.md`.
- `06_REFERENCE/DOCS/*`.

Decisiones importantes:

- Tono sobrio, institucional, factual.
- Fotografia documental.
- Precios como datos, no reclamo.
- Evitar copy turistico.
- Menu del dia: lunes, martes, jueves, viernes.
- Miércoles cerrado.
- Google Maps embed no resuelto: link directo fiable, iframe pendiente.
- Build Next podia pasar TypeScript, pero seguia sin ser la solucion final.

Aportes que sobreviven:

- Lista de conflictos de contenido.
- Criterios de QA.
- Inventario de limitaciones.
- Datos completos para carta y vinos.

Problemas:

- Genero otro build Next y otro set de datos.
- `menu.clean.json`, `wines.clean.json`, `enrichments` y `pairings` complicaban la fuente editorial.

## Fase 5 - CMS standalone (`bar-leon-cms-standalone`)

Stack:

- HTML/CSS/JS puro.
- Decap CMS 3.0.0.
- GitHub backend.
- Cloudflare Pages.

Commits visibles:

- `Initial commit — Bar León CMS website`.
- `Rebuild Bar León as multilingual editorial system (ES/EN/FR)`.
- `Add security hardening`.
- `Full real menu data, security hardening, CMS config update`.

Decisiones:

- Sin framework.
- Sin build step.
- `data/es.json`, `data/en.json`, `data/fr.json`.
- `/admin/` con Decap.
- `/` como redirect de idioma.
- Rutas: `/es/carta.html`, `/en/menu.html`, `/fr/carte.html`.

Valor:

- Esta es la transicion correcta hacia el proyecto canonico.
- Contiene NEXO local con contexto tecnico.

Diferencias frente al candidato actual:

- `bar-leon-cms-standalone/data/es.json` tiene 83 items; el candidato actual tiene 71.
- Standalone renderizaba descripcion/maridaje solo si existian; candidato actual imprime parrafos vacios.
- Standalone tenia `.gitkeep` en assets.
- Standalone contenia `auth_type: pkce` y `app_id: REPLACE_WITH_GITHUB_CLIENT_ID`, retirados en el candidato actual.

## Fase 6 - Candidato actual (`personal-assistant/bar-leon-cms`)

Estado:

- Produccion candidata dentro del repo activo.
- Static-first, sin package.json, sin framework, sin node_modules.
- Un CSS, dos JS, seis paginas localizadas, Decap admin, security headers.

Fortalezas:

- Arquitectura pequena.
- Rutas vivas claras.
- Datos editables.
- Buenas medidas de seguridad para un sitio estatico.
- Mantiene identidad visual acumulada.

Deuda:

- `data.json` legacy no usado.
- `assets/images/hero-bg.jpg` ausente.
- EN/FR incompletos frente a ES.
- CMS no edita EN/FR aunque algunas docs lo afirman.
- Docs canonicas actuales mezclan dos direcciones: Plaza Nueva como visible en web actual y C. Pan/Albayzín como fuente historica.
- `SECURITY.md` owner-facing y `_headers` tecnico no estan plenamente sincronizados.

## Decision historica principal

La trayectoria muestra una reduccion deliberada:

1. Next/React para explorar posibilidades.
2. Documentos para consolidar identidad y datos.
3. Builds Next static export para validar estructura.
4. Abandono de rutas complejas.
5. Sitio estatico puro para produccion.

La fase canonica no debe intentar recuperar toda la ambicion de V1/V2. Debe conservar el aprendizaje como contexto, no como complejidad activa.

## Linea canonica actual

Canonico tecnico:

- `personal-assistant/bar-leon-cms`.

Canonico documental:

- `NEXO/context/bar-leon-canonical.md`.
- `NEXO/context/stack.md`.
- `NEXO/context/security.md`.
- `NEXO/context/legacy-decisions.md`.
- Este paquete de auditoria: `legacy-audit.md`, `project-timeline.md`, `cleanup-plan.md`, `canonical-components.md`.

Archivo historico:

- `bar-leon-clean` y `restaurante-bar-leon` como fuentes de contenido y decisiones.
- `Restaurante-Leon` y `Restaurante-Leon-V2` como archivo de experimentacion UX/React.
- `bar-leon-cms-standalone` como upstream historico del candidato actual.

