# Update Workflow

> Cómo gestionar actualizaciones del sitio después del lanzamiento,
> según el tipo de cambio.

---

## Tipo 1 — Actualización de contenido (owner)

**Quién:** El owner del local  
**Vía:** Panel CMS (`/admin/`)  
**Tiempo:** 2–5 minutos  
**Sin intervención del developer**

Aplica a:
- Cambiar precios
- Ocultar / mostrar platos
- Activar / desactivar menú del día
- Actualizar horarios
- Añadir aviso especial

**Proceso:**
1. Abrir `/admin/`
2. Editar el campo
3. Publicar

---

## Tipo 2 — Actualización de contenido (developer)

**Quién:** Developer  
**Vía:** Editor + GitHub directo o CMS  
**Tiempo:** 15–30 minutos  
**Aplica cuando el cambio es en EN/FR o requiere edición de JSON directa**

Proceso:
1. Editar `data/en.json` y/o `data/fr.json` localmente
2. Validar JSON: `python3 -c "import json; json.load(open('data/en.json'))"`
3. `git add data/en.json data/fr.json`
4. `git commit -m "content: update EN/FR — {descripción del cambio}"`
5. `git push origin main`
6. Verificar en producción

---

## Tipo 3 — Cambio de diseño o lógica

**Quién:** Developer  
**Vía:** Editor local + git  
**Tiempo:** 30 min – 4h según complejidad  
**Requiere QA antes de push a main**

Proceso:
1. Hacer cambios en `css/style.css` o `js/*.js`
2. Probar localmente con servidor estático
3. Verificar en los 3 idiomas
4. QA mobile mínimo (375px)
5. `git commit -m "style/fix: {descripción}"`
6. `git push origin main`
7. Smoke test en producción

**Reglas:**
- No cambiar estructura de archivos sin actualizar `js/*.js` y `_headers`
- No añadir dependencias externas sin evaluación
- No modificar `admin/config.yml` sin verificar que el CMS sigue funcionando

---

## Tipo 4 — Nueva sección o funcionalidad

**Quién:** Developer  
**Vía:** Proyecto local, rama separada recomendada  
**Tiempo:** 4–16h  
**Requiere brief, QA completo, y acuerdo de precio**

Ejemplos:
- Añadir sección Historia
- Añadir mapa / iframe de Google Maps
- Añadir galería de fotos
- Añadir nuevo idioma
- Añadir hemeroteca / prensa

Proceso:
1. Brief actualizado con el cliente
2. Branch de desarrollo: `git checkout -b feat/{nombre}`
3. Build + QA en rama
4. Merge a main tras aprobación
5. Deploy y smoke test

---

## Tipo 5 — Actualización de infraestructura

**Quién:** Developer  
**Aplica a:** Decap CMS version bump, cambios en `_headers`, rotación de GitHub OAuth App

Proceso cauteloso:
1. Testear en preview/staging si es posible
2. Documentar el cambio en `NEXO/context/stack.md`
3. Hacer el cambio en producción fuera de horas pico
4. Verificar `/admin/` funcionando tras el cambio

---

## Comunicación con el owner

| Situación | Comunicar |
|---|---|
| Cambio de contenido por developer | Sí — confirmar qué cambió y cuándo |
| Fix de bug menor | No necesario salvo que afecte UX |
| Nueva sección añadida | Sí — incluir instrucciones si el CMS cambia |
| Actualización de infraestructura | Sí — avisar antes si puede haber downtime |
| Downtime de mantenimiento | Siempre — con antelación mínima de 24h |

---

## Control de versiones del sitio

Usar mensajes de commit descriptivos:

```
content: update prices — Carnes section
fix: FR horarios not showing on mobile
feat: add historia section (ES only)
style: refine edict box spacing
infra: bump Decap to 3.1.0
```

El historial de git es el registro de cambios del proyecto.
