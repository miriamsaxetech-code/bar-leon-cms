# NEXO — Pre-Launch Checklist

> Completar DESPUÉS del QA y ANTES de hacer git push a producción.
> Venue: ________________  Fecha: ________________

---

## Código

- [ ] `admin/config.yml` → `repo` correcto
- [ ] `admin/config.yml` → `app_id` configurado (no es el placeholder)
- [ ] `js/homepage.js` → `PHONE` es el teléfono real
- [ ] `js/carta.js` → `PHONE` es el teléfono real
- [ ] `index.html` root → language detector funciona localmente
- [ ] Sin console.log ni comentarios de debugging en producción

## Datos

- [ ] `data/es.json` válido, 0 `[POR CONFIRMAR]`
- [ ] `data/en.json` válido, 0 `[POR CONFIRMAR]`
- [ ] `data/fr.json` válido, 0 `[POR CONFIRMAR]`
- [ ] Precios idénticos en los 3 archivos

## Security

- [ ] `_headers` presente y correcto
- [ ] `robots.txt` desindexia `/admin/`
- [ ] `grep -r "REPLACE_WITH\|secret\|password" .` → 0 resultados relevantes
- [ ] Decap versión pinneada (no `latest`)

## QA

- [ ] QA report completado con veredicto GO
- [ ] 0 bugs CRÍTICOS abiertos
- [ ] 0 bugs MEDIOS abiertos

## Deploy

- [ ] `git status` limpio
- [ ] `git log --oneline -1` muestra el commit correcto
- [ ] Cloudflare Pages build OK en staging/preview (si existe)

---

## Firma

- **Developer:**
- **Fecha:**
- **Estado:** GO / NO-GO
