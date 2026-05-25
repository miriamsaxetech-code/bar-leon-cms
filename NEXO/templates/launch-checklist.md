# NEXO — Launch Checklist

> Venue: ________________  Fecha: ________________
> No lanzar hasta que todos los BLOQUEANTES estén en ✅

---

## BLOQUEANTES (deben estar OK)

### Datos

- [ ] `data/es.json` válido como JSON
- [ ] `data/en.json` válido como JSON
- [ ] `data/fr.json` válido como JSON
- [ ] `nav` completo en los 3 idiomas (7 campos mínimo)
- [ ] 0 campos `[POR CONFIRMAR]` visibles al público
- [ ] Precios en formato `X,XX€`
- [ ] Teléfono en `PHONE` del JS correcto

### Funcionalidad

- [ ] Root `/` redirige correctamente según idioma del navegador
- [ ] Los 3 homepages cargan sin errores de consola
- [ ] Las 3 páginas de carta cargan sin errores de consola
- [ ] `data/*.json` sirve HTTP 200 desde todos los subdirectorios
- [ ] CTA "Llamar" → `tel:` link funcional
- [ ] Selector de idioma: idioma activo no es link, los otros sí

### CMS

- [ ] `admin/config.yml` → repo y branch correctos
- [ ] `app_id` configurado (no es `REPLACE_WITH_GITHUB_CLIENT_ID`)
- [ ] Colaborador GitHub añadido al repo

### Security

- [ ] `_headers` en su lugar con security headers
- [ ] `robots.txt` excluye `/admin/`
- [ ] Decap version pinneada (no `latest`)
- [ ] 0 secrets en código (`grep -r "secret\|password\|token"`)

### Deploy

- [ ] Cloudflare Pages conectado al repo
- [ ] Build con 0 errores
- [ ] URL de producción accesible

---

## NO BLOQUEANTES (documentar pero no bloquean)

- [ ] Hero image presente (fallback funciona)
- [ ] SSL modo Full (no solo Flexible)
- [ ] DNS propio configurado (puede hacerse post-launch)
- [ ] Owner hizo prueba de edición en CMS

---

## Firmado por

- **Developer:** 
- **Fecha:**
- **Estado:** LISTO PARA LANZAR / PENDIENTE CORRECCIONES
