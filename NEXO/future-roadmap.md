# NEXO — Future Roadmap

> Qué automatizar, qué mantener humano, y dónde están los riesgos.
> Generado: 2026-05-23

---

## Qué automatizar a continuación

### Alta prioridad — alto impacto, bajo riesgo

**1. Generador de HTML shells**

Hoy: copiar y editar a mano los 9 archivos HTML.
Propuesta: script bash de 20 líneas que genera los 9 archivos con `sed` o variables de entorno.
Ganancia: de 30 min a 2 min por nuevo venue.

```bash
# Ejemplo conceptual
VENUE_SLUG=bar-nuevo VENUE_LANG_PRIMARY=es ./nexo-init.sh
```

**2. Validador de JSON pre-build**

Hoy: el developer valida manualmente con `python3 -c "..."`.
Propuesta: script `validate.sh` que verifica los 3 JSON, comprueba los 7 campos de `nav`, y lista ítems con `[POR CONFIRMAR]`.
Ganancia: 5 min de QA automatizado, 0 errores de datos en producción.

**3. Template de `data/es.json` vacío**

Hoy: copiar de Bar León y borrar el contenido manualmente.
Propuesta: `templates/data-template.json` con estructura completa, campos vacíos, y `[POR CONFIRMAR]` donde hay incertidumbre.
Ganancia: punto de partida limpio en cada nuevo proyecto.

**4. `admin/config.yml` generator**

Hoy: editar el config.yml de Bar León manualmente.
Propuesta: template con `{VENUE_SLUG}`, `{GITHUB_REPO}`, y lista de categorías como variable.
Ganancia: evita errores de configuración CMS, el bug más difícil de diagnosticar.

---

### Media prioridad — valor real pero requiere más trabajo

**5. Sección Historia (template)**

Hoy: no implementada en ningún venue.
Propuesta: bloque reutilizable en `js/homepage.js` que renderiza `historia.es.json` si existe, lo omite si no.
Activa con: `if (d.historia) { renderHistoria(d.historia); }`
Depende de: schema `historia.es.json` bien definido (ya existe en `restaurante-bar-leon/02_DATA/`).

**6. Mapa / Dónde estamos**

Alta demanda. Implementación: iframe de Google Maps con la dirección canónica.
Decisión pendiente: ¿iframe directo (simple, gratis) o link a Google Maps (sin iframe, más limpio)?
Recomendación: link estilizado en lugar de iframe — sin dependencia externa, sin política de cookies.

**7. Script de nuevo venue en 1 comando**

```bash
./nexo-new.sh \
  --slug bar-nuevo \
  --name "Bar Nuevo" \
  --phone "+34955000000" \
  --accent "#1C3A5E" \
  --repo "miriamsaxetech-code/bar-nuevo-cms"
```

Genera: estructura completa de carpetas, HTML shells, config.yml configurado, data templates.
Tiempo de implementación: 4–6h.
Ganancia: de 2h a 15 min de setup inicial.

---

### Baja prioridad — útil pero no urgente

**8. Preview deploy automático (Cloudflare Pages branches)**

Configurar Cloudflare Pages para desplegar ramas no-main como previews.
Permite QA en producción real antes de merge a main.
Requiere: configuración en CF dashboard — sin código extra.

**9. Backup automático a Google Drive**

Script o Zapier que exporta `data/es.json` a Google Drive mensualmente.
Eliminaría la tarea manual del developer.
Complejidad: media (OAuth de Google Drive).

---

## Qué debe permanecer humano

**Research inicial del venue**
La verificación de datos (teléfono, horario, historia) requiere criterio. Un dato incorrecto publicado daña la confianza del cliente. No automatizar.

**Revisión editorial del copy**
El titular de inicio, el tono, los textos de cada sección — siempre con revisión humana. La IA genera opciones; el humano elige y ajusta.

**Fotografía**
Ningún prompt de imagen IA sustituye una sesión fotográfica real. Esta es la mayor oportunidad de diferenciación para cada venue y debe mantenerse humana.

**Aprobación del cliente**
Antes de lanzar: el owner del local debe ver el sitio y dar el OK. No automatizable.

**Handoff y formación CMS**
La sesión con el owner no se puede automatizar. Es también donde se detectan necesidades futuras.

**Decisiones de diseño venue-specific**
El color acento, si el venue quiere emblema, si necesita sección Historia — son decisiones editoriales con el cliente, no parámetros a rellenar.

---

## Qué NO automatizar

**Precios y carta**
El sistema correcto es que el owner edite los precios vía CMS cuando cambian. Automatizar la extracción de precios desde fuentes externas (Google, TripAdvisor) introduciría datos no verificados.

**Horarios desde Google Maps**
Google Maps puede tener horarios desactualizados. El owner es la fuente de verdad de sus propios horarios.

**Traducciones automáticas sin revisión**
DeepL/GPT pueden generar EN/FR aceptables, pero necesitan revisión humana, especialmente para nombres de platos y copy institucional.

**Deploy automático sin QA**
El deploy siempre debe ir precedido de QA. No configurar auto-deploy desde ramas sin proceso de validación.

---

## Bottlenecks actuales

| Bottleneck | Impacto | Solución |
|---|---|---|
| Setup inicial (9 HTML + configs) | ~2h por venue | Generator script (ver punto 7) |
| Extracción de carta desde PDF/foto | ~2h por venue | Menu-extractor-agent + template |
| Traducción EN/FR | ~2h por venue | Prompt optimizado + revisión rápida |
| Configuración GitHub OAuth App | ~30 min | Documentación paso a paso (ya existe) |
| QA manual | ~1.5h por venue | Validador automático + checklist optimizado |

**Total estimado hoy:** ~10–14h para un venue estándar (ES/EN/FR + CMS).
**Con automatizaciones de alta prioridad:** ~6–8h.
**Objetivo a medio plazo:** ~4h para venue estándar con carta previamente procesada.

---

## Riesgos de escala

### Riesgo 1 — Fragmentación de versiones

Al crecer el número de venues, el sistema base (`css/style.css`, `js/homepage.js`) puede divergir entre proyectos si se hacen cambios locales por venue.

**Mitigación:** mantener un repositorio central NEXO con el sistema base. Los venues hacen fork o copian la versión con su número de versión documentado.

### Riesgo 2 — Decap CMS obsolescencia

Decap CMS es un proyecto activo pero de tamaño limitado. Si el proyecto se abandona o rompe una API de GitHub, todos los venues pierden el CMS.

**Mitigación:** el contenido siempre es JSON en GitHub — un CMS alternativo (Tina, Forestry, edición directa) puede sustituir a Decap sin tocar el resto del sistema.

### Riesgo 3 — Dependencia de GitHub OAuth

Si GitHub cambia su OAuth flow o aumenta restricciones, el CMS puede dejar de funcionar.

**Mitigación:** PKCE no requiere client_secret, lo que reduce la superficie de riesgo. La alternativa sería un CMS con backend propio (más complejidad, más coste).

### Riesgo 4 — Cloudflare Pages pricing

Hoy es gratuito para proyectos de este tamaño. Si Cloudflare cambia su modelo, el coste puede aparecer.

**Mitigación:** la arquitectura estática funciona en cualquier CDN (Netlify, Vercel, GitHub Pages). La migración sería de configuración, no de código.

### Riesgo 5 — Sobrecarga del developer si escala rápido

Con 5+ venues activos, el mantenimiento puntual (updates, fixes, preguntas) puede consumir tiempo desproporcional.

**Mitigación:** documentación owner-facing de calidad (ya en proceso), formación inicial sólida, y política clara de qué está incluido en el precio y qué es soporte adicional.

---

## Riesgos arquitecturales futuros

**Si se añaden galerías de fotos grandes:** los assets en GitHub pueden crecer y ralentizar los clones. Solución: usar Cloudflare Images o un bucket separado.

**Si se necesita reservas online:** el sistema estático no puede gestionar reservas. Requeriría un servicio externo (Covermanager, TheFork, Resy) integrado como iframe o link externo — no como parte del sistema NEXO.

**Si se necesitan analíticas avanzadas:** el sistema actual no tiene tracking. Añadir Cloudflare Web Analytics (sin cookies, gratis) es trivial y no introduce dependencias pesadas.

---

## Próximos pasos por orden de impacto

1. **Generator script** — mayor palanca de tiempo en el setup inicial
2. **Validador JSON** — elimina la categoría entera de bugs de datos
3. **Sección Historia template** — sube el valor percibido del producto inmediatamente
4. **Mapa / Dónde estamos** — la sección más pedida que falta
5. **Template `data-template.json`** — pequeño pero elimina errores de estructura
6. **Documentación: NEXO como producto vendible** — describir el sistema como oferta de servicios (no solo como herramienta interna)
