# NEXO — Maintenance Notes

> Venue: ________________
> Developer: ________________

---

## Revisiones completadas

| Fecha | Tipo | Acción tomada | Estado |
|---|---|---|---|
| | Mensual | | OK |
| | Mensual | | OK |

---

## Rutina mensual — checklist

- [ ] Abrir `/admin/` — confirmar que pide login de GitHub
- [ ] Verificar carta en web vs CMS — coinciden
- [ ] Exportar `data/es.json` a Google Drive (backup)
- [ ] Revisar Cloudflare Analytics: errores 404, tráfico anómalo
- [ ] Verificar que las fotos cargan (hero + cualquier imagen)
- [ ] Revisar que el menú del día está en estado correcto

---

## Actualizaciones de contenido

| Fecha | Qué cambió | Quién | Vía |
|---|---|---|---|
| | | Owner | CMS |
| | | Developer | Código |

---

## Issues conocidos (pendientes)

| # | Descripción | Prioridad | Desde |
|---|---|---|---|
| | | | |

---

## Decap CMS — nota de versión

Versión actual en uso: `3.0.0` (pinneada en `admin/index.html`)

Para actualizar a nueva versión:
1. Comprobar changelog de Decap (decapcms.org)
2. Probar en staging antes de actualizar producción
3. Actualizar la URL en `admin/index.html`
4. Hacer commit y verificar que el panel sigue funcionando

**No actualizar sin testing previo.**

---

## Registro de dominio y DNS

| Campo | Valor |
|---|---|
| Dominio | |
| Registrador | |
| Fecha de renovación | |
| SSL | |
| Cloudflare account | |

---

## Escalation

| Situación | Acción |
|---|---|
| Web down (Cloudflare error) | Revisar Status Cloudflare → status.cloudflare.com |
| CMS no permite edición | Verificar acceso GitHub del owner |
| Dominio caducado | Renovar en registrador — urgente |
| Datos corruptos en JSON | Recuperar desde historial GitHub |
