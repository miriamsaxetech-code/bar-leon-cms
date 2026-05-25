# Bar León — Rediseño Integral
**Fecha:** 2026-05-25  
**Enfoque:** B — Rediseño funcional  
**Estimación:** ~3 semanas

---

## Contexto

El sitio web de Bar León funciona pero no emociona. La carta es plana, no empuja upselling, y el panel de control (Decap CMS) es inutilizable desde el móvil del dueño. El restaurante tiene activos visuales excepcionales — caricaturas familiares reales de 1959 y del 60 aniversario — que no están integrados. La identidad cofrade y el humor granadino que define el bar tampoco tienen expresión en la web.

**Objetivo:** Tres mejoras en paralelo que se refuerzan mutuamente:
1. Wow moments que hagan sentir la personalidad real del bar
2. Upselling integrado que suba el ticket medio sin postureo
3. Panel de control móvil sin fricción para el dueño

---

## Archivos críticos

| Archivo | Rol |
|---|---|
| `/data/venue.json` | Fuente de verdad única — se extiende con nuevos campos |
| `/js/carta.js` | Renderizado de carta — spotlight, badges, pairing chips, carioca block |
| `/js/homepage.js` | Homepage — carioca slot, WhatsApp CTA |
| `/css/style.css` | Estilos — nuevos componentes visuales |
| `/admin/config.yml` | Decap CMS — colección `cariocas` nueva |
| `/admin-quick/index.html` | Panel móvil nuevo — creación desde cero |
| `/functions/admin-save.js` | Cloudflare Function nueva — escribe en GitHub API |

---

## Área 1 — Wow Moments

### 1.1 Caricaturas como identidad visual

Las dos caricaturas existentes se integran como piezas editoriales, no como imágenes decorativas:

- **Tarjeta de Antonio León Mena (1959):** Ocupa el bloque principal de la sección Historia en la homepage. Tratamiento: full-width en móvil, encabezado con "Fundado en 1959 · Antonio León Mena", tipografía Georgia. No es un carousel ni un banner — es un cuadro.
- **"La Leonera" 60 aniversario (1959–2019):** Abre la sección Hemeroteca. Pie de foto: "Tres generaciones · Paco García, 2019". Tamaño completo, sin recortar.

Los archivos de imagen se colocan en `/assets/images/cariocas/`. Nombres kebab-case: `antonio-leon-mena-tarjeta-1959.jpg`, `la-leonera-60-aniversario-paco-garcia.jpg`.

### 1.2 Slot de carioca rotativa (homepage)

Un bloque fijo en la homepage, entre el bloque de contacto y el footer, que muestra una carioca activa. Estructura en `venue.json`:

```json
"cariocas": [
  {
    "id": "carioca-01",
    "image": "/assets/images/cariocas/nombre.jpg",
    "caption": { "es": "Texto corto o copla", "en": "...", "fr": "..." },
    "active": true,
    "context": "homepage"
  }
]
```

- Solo se muestra la primera entrada con `"active": true` y `"context": "homepage"`.
- Si no hay ninguna activa, el bloque no renderiza (no hay fallback vacío).
- El dueño gestiona esto desde el admin (ver Área 3).

### 1.3 Sabores de Andalucía — Spotlight

Los platos de la categoría `sabores-andalucia` salen del acordeón genérico. Pasan a una sección propia con:
- Encabezado independiente: "Sabores de Andalucía" con subtítulo contextual
- Tarjetas con más espacio visual que los ítems estándar
- Badge de especialidad si `featured: true`
- Pairing chip integrado (ver Área 2)
- Esta sección se renderiza antes que el acordeón general de Carta Restaurante

---

## Área 2 — Upselling

### 2.1 Pairing chips en dish cards

Cada plato con campo `pairing` no vacío muestra una chip visual bajo el precio:

```
🍷 Marida con: Calvente Guindalera · 18€
```

- La chip usa el nombre del vino como texto. Al tocarla: activa la pestaña "Carta Barra" y hace scroll hasta el vino correspondiente (por `id` de vino en el anchor `#wine-{id}`).
- Color: fondo `#f0e8d0`, borde `#d4c098`, texto `#5a4200` — tono ambarino, no rojo.
- Solo se muestra si el plato tiene pairing Y el vino correspondiente está `available: true`.

### 2.2 Bloque "Para empezar"

Bloque corto que aparece como primera sección al abrir Carta Barra (antes de cervezas/vinos). Muestra 4–5 items hardcoded desde venue.json: fino, manzanilla, vermut, Alhambra Reserva 1925. Título: "Para empezar · La barra, antes de la mesa." Precio de copa visible junto a cada uno.

No es un acordeón — es una tira horizontal en móvil (scroll horizontal) o grid 2×2 en desktop.

### 2.3 Badges de plato

El campo `featured` existente en dishes se extiende de boolean a string con tres valores posibles:

```json
"featured": "recommended"   // ⭐ Recomendado
"featured": "seasonal"      // 🌿 Temporada
"featured": "house"         // 🦁 De la casa
"featured": false           // sin badge
```

**Migración:** Los dishes existentes con `"featured": true` se tratan como `"recommended"` en el renderizado (el código lee: si el valor es `true` o `"recommended"`, muestra ⭐). No se requiere migración de datos — es retrocompatible. El tipo definitivo se asigna la próxima vez que el dueño edite ese plato en Decap CMS.

El badge aparece encima del nombre del plato. El dueño asigna el tipo desde Decap CMS (campo select). En el admin rápido se puede activar/desactivar pero no cambiar el tipo.

### 2.4 WhatsApp CTA flotante

Botón fijo `position: fixed; bottom: 1.5rem; right: 1.5rem` en carta y homepage. Solo en móvil (oculto en `@media (min-width: 768px)`). Texto: "Reservar mesa". Enlaza a `https://wa.me/34696948630`. El número viene de `venue.json → contact.whatsapp`.

El número en `venue.json` puede contener espacios o paréntesis — el código lo sanitiza antes de construir el enlace: `number.replace(/\D/g, '')` → `https://wa.me/{digits}`.

Si el campo `contact.whatsapp` está vacío, el botón no renderiza.

---

## Área 3 — Panel de control móvil

### 3.1 Arquitectura

Nuevo panel en `/admin-quick/` — HTML/CSS/JS vanilla, mobile-first, sin dependencias externas.

**Autenticación:** Reutiliza el flujo GitHub OAuth existente (`/functions/auth.js` + `/functions/callback.js`). Tras el callback, el token se guarda en `sessionStorage`. El panel lee el token de `sessionStorage` en cada operación.

**Escritura de datos:** Nueva Cloudflare Pages Function en `/functions/admin-save.js`. Recibe el contenido actualizado de `venue.json` como JSON en el body, lo convierte a base64, y hace PUT a la GitHub Contents API:

```
PUT https://api.github.com/repos/{owner}/{repo}/contents/data/venue.json
```

El token de GitHub (Personal Access Token con scope `repo`) se almacena como variable de entorno en Cloudflare Pages: `GITHUB_TOKEN`. El owner/repo son constantes en la función: `miriamsaxetech-code/bar-leon-cms`, rama `main`.

**Seguridad:** El endpoint `/api/admin-save` solo acepta requests con un header `Authorization: Bearer <session-token>` válido, verificado contra la sesión GitHub OAuth activa. Si el token no es válido, devuelve 401.

### 3.2 Interfaz — tres pestañas

**Pestaña Precios:**
- Lista searchable de todos los dishes + wines + beverages con `available: true`
- Cada fila: nombre del plato | precio actual (tappable)
- Al tocar el precio: input numérico aparece inline, teclado numérico en móvil (`inputmode="decimal"`)
- Cambios se acumulan en memoria hasta pulsar "Guardar" — un solo commit
- Búsqueda por nombre (filtro en tiempo real, sin API call)

**Pestaña Horarios:**
- Lista de 7 días con toggle open/closed
- Al estar abierto: dos campos de hora (apertura, cierre) por período
- Soporte para doble período (comida + cena) — botón "Añadir período"
- Misma lógica de guardado batch

**Pestaña Aviso:**
- Textarea para texto del aviso (español)
- Toggle on/off
- Campo de fecha de expiración opcional (date picker nativo)
- Al llegar la fecha, el aviso se oculta automáticamente en la web (la lógica ya existe en `homepage.js`)

**Pestaña Carioca:**
- Upload de imagen (file input, acepta JPG/PNG/WebP)
- La imagen se sube a `/assets/images/cariocas/` via GitHub API (PUT contents)
- Campo de texto corto (caption en ES, EN, FR — tres inputs)
- Toggle activo/inactivo
- Preview inline antes de guardar

### 3.3 Flujo de guardado

```
Usuario edita → cambios en memoria → pulsa Guardar
→ POST /api/admin-save con venue.json completo actualizado
→ Cloudflare Function → GitHub PUT → commit automático
→ Panel muestra "✓ Guardado" durante 2 segundos
→ Cloudflare Pages rebuild automático (~30s)
```

El panel NO muestra el estado del rebuild — sería complejidad innecesaria. El dueño recarga la web en 60 segundos y ve el cambio.

### 3.4 Decap CMS — rol residual

Decap CMS se mantiene en `/admin/` sin cambios para:
- Añadir o eliminar platos
- Editar descripciones e ingredientes
- Gestionar fotos de galería
- Cambios estructurales en SEO y venue info

No se elimina ni se modifica. Los dos paneles conviven sin conflicto porque ambos escriben el mismo `venue.json` vía GitHub — el historial de commits registra todas las ediciones.

---

## Datos — extensiones a venue.json

Campos nuevos o modificados:

```jsonc
// En venue root
"cariocas": [
  {
    "id": "string",
    "image": "string (path)",
    "caption": { "es": "string", "en": "string", "fr": "string" },
    "active": true,
    "context": "homepage | historia | hemeroteca"
  }
]

// En cada dish
"featured": false | "recommended" | "seasonal" | "house"

// En contact (ya existe, verificar que esté)
"whatsapp": "+34696948630"
```

Todos los campos son opcionales hacia atrás — si no existen, los componentes no renderizan. Sin breaking changes.

---

## Verificación (cómo probar)

1. **Pairing chips:** Abrir carta, ir a "Sabores de Andalucía", verificar que carne de monte muestra chip de maridaje. Verificar que un plato sin pairing no muestra chip.
2. **Spotlight:** Verificar que "Sabores de Andalucía" aparece como sección propia antes del acordeón general.
3. **Badges:** Poner `"featured": "recommended"` en un plato en venue.json y verificar que el badge aparece en carta.
4. **WhatsApp:** En viewport < 768px, verificar botón flotante visible en carta y homepage. En desktop, verificar que no aparece.
5. **Carioca slot:** Añadir entrada en `cariocas[]` con `active: true` y verificar que el bloque aparece en homepage. Poner `active: false` y verificar que el bloque desaparece.
6. **Admin rápido — autenticación:** Abrir `/admin-quick/`, hacer login, verificar redirección de vuelta al panel.
7. **Admin rápido — precios:** Editar el precio de un plato, guardar, esperar ~60s, recargar carta y verificar cambio.
8. **Admin rápido — aviso:** Escribir texto de aviso, activar, guardar. Verificar banner en homepage.
9. **Admin rápido — carioca:** Subir imagen + caption, activar, guardar. Verificar bloque en homepage.
10. **Decap CMS:** Verificar que sigue funcionando en `/admin/` sin cambios tras añadir los nuevos campos.
