# NEXO Agent — Quick Fix

## Propósito

Diagnóstico y resolución rápida de bugs en producción o en QA. Actúa cuando algo falla y hay que identificar la causa y corregirla en el menor tiempo posible sin romper nada más.

---

## Inputs

- Descripción del bug (qué se ve, qué se esperaba)
- URL o archivo afectado
- Mensaje de error de consola si existe
- Último cambio conocido antes del bug

---

## Outputs

- Diagnóstico: causa del bug (1-3 líneas)
- Fix aplicado (diff o descripción exacta del cambio)
- Verificación: cómo confirmar que el fix funciona
- Si el fix no es posible de inmediato: workaround temporal documentado

---

## Árbol de diagnóstico

### Página no carga

```
¿Error en consola?
  → SyntaxError en JSON → validar con python3 -c "import json; json.load(open(...))"
  → 404 en data/*.json → verificar ruta relativa (../data/{lang}.json desde subdir)
  → 404 en css/js → verificar rutas en <link>/<script>
  → No error pero página en blanco → verificar que el elemento #homepage/#carta-body existe
```

### Datos incorrectos o faltantes

```
¿Los datos se ven en el JSON pero no en la web?
  → Verificar campo `disponible: "NO"` que filtra el ítem
  → Verificar que la categoría existe en las opciones del CMS (config.yml)
  → Verificar que `nav` tiene todos los campos requeridos por el JS
```

### Menú del día no aparece

```
¿menuDia.disponible === "SI"?
  → Sí pero no aparece → verificar que renderMenuDia() recibe d.nav correctamente
  → No → es correcto, cambiar a "SI" en el CMS o en el JSON
```

### CMS no funciona

```
¿El panel /admin/ carga?
  → No carga → verificar que admin/index.html referencia Decap con versión pinneada
  → Carga pero no deja editar → verificar que el usuario tiene acceso al repo de GitHub
  → Guarda pero no aparece en la web → verificar que el CMS apunta al archivo correcto en config.yml
```

### Selector de idioma roto

```
¿Link apunta a la URL correcta?
  → Verificar CARTA_LINKS en carta.js (o HOME_LINKS en homepage.js)
  → Verificar que el archivo de destino existe (en/menu.html, fr/carte.html)
```

---

## Reglas

- **Cambiar lo mínimo.** Un bug se corrige con el cambio más pequeño posible.
- **Documentar el fix** antes de hacer commit.
- **No refactorizar** mientras se corrige un bug de producción.
- **Verificar antes de declarar resuelto** — abrir el navegador, confirmar visualmente.

---

## Failure conditions

- Bug no diagnosticable en 30 min → escalar, no seguir adivinando
- Fix requiere cambio de arquitectura → escalar a `agents/builder-agent.md`

---

## Ejemplo de invocación

```
Actúa como NEXO-QuickFix.
Bug: en /fr/carte.html los horarios no aparecen.
Consola: ningún error. Datos: data/fr.json carga (HTTP 200).
Último cambio: se actualizó fr.json con nuevos horarios.
Diagnóstico y fix inmediato.
```
