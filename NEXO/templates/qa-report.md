# NEXO — QA Report

> Venue: ________________  Fecha: ________________  
> Tester: ________________  Servidor: ________________

---

## Estado general

**Veredicto:** ⬜ GO — lanzar  /  ⬜ NO-GO — corregir primero

---

## 1. Validación de datos JSON

```
python3 -c "
import json
for lang in ['es', 'en', 'fr']:
    d = json.load(open(f'data/{lang}.json'))
    items = d['carta']
    nav = d.get('nav', {})
    required = ['edictHeader','menuDia','edictFoot','volver','horarios','llamar']
    missing = [k for k in required if k not in nav]
    print(f'{lang}: {len(items)} items | nav missing: {missing}')
"
```

| Lang | Items | Nav OK | Notas |
|---|---|---|---|
| ES | | | |
| EN | | | |
| FR | | | |

---

## 2. HTTP Smoke Test

| URL | Status | Resultado |
|---|---|---|
| `/` | | redirect a idioma correcto |
| `/es/` | | |
| `/en/` | | |
| `/fr/` | | |
| `/es/carta.html` | | |
| `/en/menu.html` | | |
| `/fr/carte.html` | | |
| `/data/es.json` | | |
| `/data/en.json` | | |
| `/data/fr.json` | | |
| `/admin/` | | panel CMS carga |

---

## 3. Render — Homepage

| Check | ES | EN | FR |
|---|---|---|---|
| Nombre del bar visible | | | |
| Subtítulo institucional | | | |
| Nav (carta + horarios + llamar) | | | |
| Selector de idioma correcto | | | |
| Hero: imagen O fallback | | | |
| 0 errores en consola | | | |

---

## 4. Render — Carta

| Check | ES | EN | FR |
|---|---|---|---|
| Menú del día (si disponible: SI) | | | |
| Todas las categorías visibles | | | |
| Dot-leaders sin overflow | | | |
| Horarios completos | | | |
| Días CERRADO diferenciados | | | |
| CTA Llamar visible | | | |
| Link tel: correcto | | | |
| 0 errores en consola | | | |

---

## 5. QA Mobile (375px)

| Check | OK |
|---|---|
| Nombre del bar sin desbordamiento | |
| Navegación en una línea | |
| Precios no cortados | |
| CTA Llamar full-width | |
| Hero no rompe layout | |
| Selector de idioma funcional | |

---

## 6. QA de datos

| Check | OK |
|---|---|
| Precios formato X,XX€ | |
| Sin `[POR CONFIRMAR]` visible | |
| Dirección completa (barrio + CP + ciudad) | |
| Albayzín con y y tilde (si aplica) | |
| Categorías coinciden con config.yml | |

---

## Bugs encontrados

| # | Descripción | Página | Severidad | Estado |
|---|---|---|---|---|
| 1 | | | CRÍTICO / MEDIO / BAJO | Abierto / Resuelto |
| 2 | | | | |
| 3 | | | | |

---

## Notas adicionales

---

## Firma

- **QA completado por:**
- **Fecha:**
- **Veredicto final:** GO / NO-GO
- **Condición para GO (si NO-GO):**
