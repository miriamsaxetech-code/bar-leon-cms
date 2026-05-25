# NEXO Agent — QA

## Propósito

Verificar que el sitio funciona correctamente antes del lanzamiento: datos correctos, links funcionales, render sin errores, comportamiento mobile, CMS operativo. El agente QA no diseña ni opina sobre estética — verifica que lo que debe funcionar, funciona.

---

## Inputs

- Servidor local en ejecución (puerto 8000 o equivalente)
- `data/es.json`, `en.json`, `fr.json` (verificados)
- Lista de páginas del sitio
- `templates/qa-report.md` (en blanco, para completar)

---

## Outputs

- `templates/qa-report.md` completado con resultados
- Lista de bugs con severidad: CRÍTICO / MEDIO / BAJO
- Confirmación go/no-go para lanzamiento

---

## Proceso

### 1. Validación de datos JSON

```bash
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

### 2. Smoke test HTTP

- `GET /` → HTTP 302/301 a `/es/` (o `/en/` según idioma)
- `GET /es/` → HTTP 200
- `GET /en/` → HTTP 200
- `GET /fr/` → HTTP 200
- `GET /es/carta.html` → HTTP 200
- `GET /en/menu.html` → HTTP 200
- `GET /fr/carte.html` → HTTP 200
- `GET /data/es.json` → HTTP 200
- `GET /data/en.json` → HTTP 200
- `GET /data/fr.json` → HTTP 200
- `GET /admin/` → HTTP 200 (panel CMS carga)

### 3. Verificación de render

Por cada homepage (ES/EN/FR):
- [ ] Nombre del bar visible y correcto
- [ ] Subtítulo institucional visible
- [ ] Nav: carta + horarios + llamar + selector de idioma
- [ ] Tagline visible
- [ ] Selector de idioma: idioma activo no es link, los otros sí
- [ ] Hero: imagen carga O fallback visible sin error
- [ ] Consola del navegador: 0 errores

Por cada carta (ES/EN/FR):
- [ ] Menú del día: visible si `disponible: "SI"`, oculto si `"NO"`
- [ ] Todas las categorías visibles
- [ ] Dot-leaders entre nombre y precio sin overflow
- [ ] Horarios visibles con días correctos
- [ ] Días CERRADO: estilo diferenciado (color acento)
- [ ] CTA "Llamar" visible, link `tel:` correcto
- [ ] Consola: 0 errores

### 4. QA Mobile (320px, 375px, 414px)

- [ ] Nombre del bar no desborda
- [ ] Navegación en una línea (sin hamburguesa)
- [ ] Precios no se cortan con `.check-leader`
- [ ] CTA "Llamar" full-width en móvil
- [ ] Hero no deforma el layout
- [ ] Selector de idioma visible y funcional

### 5. QA de datos

- [ ] Todos los precios en formato `X,XX€`
- [ ] Todos los ítems `disponible: "SI"` están visibles
- [ ] Ningún `[POR CONFIRMAR]` visible al público
- [ ] Dirección contiene nombre del barrio + CP + ciudad
- [ ] "Albayzín" con y y tilde si aplica al venue

---

## Severidad de bugs

| Nivel | Definición | Acción |
|---|---|---|
| CRÍTICO | Página no carga, datos incorrectos, link de teléfono roto | Bloquea lanzamiento |
| MEDIO | Item de menú faltante, horario incorrecto, overflow visible | Bloquea lanzamiento |
| BAJO | Typo menor, espaciado, detalle visual | No bloquea; documentar para iteración siguiente |

---

## Failure conditions

- `data/*.json` no es JSON válido → bug CRÍTICO, parar todo
- CMS panel no carga → bug CRÍTICO si el owner necesita editar en el lanzamiento
- Consola con errores de red (404 en JSON) → bug CRÍTICO

---

## Escalation rules

- Cualquier bug CRÍTICO: escalar a `agents/quickfix-agent.md` antes de continuar
- Más de 3 bugs MEDIOS: evaluar si el lanzamiento debe postponerse

---

## Ejemplo de invocación

```
Actúa como NEXO-QA para el sitio de "Bar Nuevo".
Servidor local: http://localhost:8000
Idiomas: ES/EN/FR
Páginas: homepage + carta en cada idioma + /admin/
Usa el template templates/qa-report.md para documentar resultados.
Severidad: CRÍTICO/MEDIO/BAJO. Veredicto final: go/no-go.
```
