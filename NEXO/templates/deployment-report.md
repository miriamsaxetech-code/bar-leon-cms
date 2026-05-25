# NEXO — Deployment Report

> Venue: ________________  Fecha de deploy: ________________
> Developer: ________________

---

## URLs de producción

| Recurso | URL |
|---|---|
| Sitio principal | |
| Homepage ES | |
| Carta ES | |
| Panel CMS | |
| GitHub repo | |
| Cloudflare Pages project | |

---

## Deploy

| Campo | Valor |
|---|---|
| Commit hash | |
| Mensaje del commit | |
| Rama | main |
| Build time (Cloudflare) | |
| Estado del build | Success / Failed |

---

## Smoke test post-deploy

| Check | OK |
|---|---|
| Root → redirect a idioma correcto | |
| Homepage ES carga | |
| Carta ES carga | |
| Primer plato visible con precio | |
| `/admin/` carga panel CMS | |
| Link tel: funciona | |

---

## DNS (si hay dominio propio)

| Campo | Valor |
|---|---|
| Dominio | |
| Registrador | |
| DNS apuntado a Cloudflare | Sí / No |
| SSL modo | Full / Full Strict / Flexible |
| Propagación completada | Sí / No / En curso |

---

## Acceso CMS

| Campo | Estado |
|---|---|
| Colaborador GitHub añadido | Sí / No |
| Owner probó el CMS | Sí / No |
| Owner guardó un cambio de prueba | Sí / No |
| Cambio apareció en la web | Sí / No |

---

## Estado de los archivos

| Archivo | Versión | Notas |
|---|---|---|
| `data/es.json` | | N items, N categorías |
| `data/en.json` | | |
| `data/fr.json` | | |
| `admin/config.yml` | | |
| `css/style.css` | | |

---

## Issues conocidos al lanzamiento

_(Bugs BAJO pendientes de próxima iteración)_

| # | Descripción | Prioridad |
|---|---|---|
| | | |

---

## Comunicación al cliente

- **Fecha de comunicación:**
- **Medio:** WhatsApp / Email / Llamada
- **Contenido comunicado:** URL, acceso CMS, guía de uso enviada

---

## Notas post-deploy

---

## Próxima acción

- [ ] Sesión de formación CMS con el owner
- [ ] Entrega de guía de uso
- [ ] Backup inicial de `data/es.json` a Google Drive
- [ ] Revisión en 30 días
