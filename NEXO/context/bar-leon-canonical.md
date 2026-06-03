# Restaurante-Bar León — Canonical Context

**Source of truth for all agents, prompts, and iterations.**
**If any instruction contradicts this file: this file wins.**

---

## Identidad

Restaurante-Bar León es un bar-restaurante tradicional en Plaza Nueva, Granada.
No es un concepto. No es una marca creada. Es un establecimiento real con continuidad familiar y memoria institucional local.

- Ubicación: Plaza Nueva · Granada · Andalucía
- Teléfono: +34 958 22 51 43
- Fundación implícita: múltiples generaciones (tagline: "Tres generaciones sin cambiar de receta.")
- Categoría: cocina andaluza tradicional, clientela mixta (locales + visitantes no turísticos)

Lo que Restaurante-Bar León comunica:
- "Este sitio ya existe en la vida de la gente."
- "Esto es Granada, no una simulación de Granada."
- "Los turistas son bienvenidos, pero el sitio no está diseñado para turistas."

---

## Posicionamiento

**Granada real. Continuidad familiar. Cocina de siempre.**

Conceptos clave: tradición · familiaridad · barrio · sobremesa · cocina andaluza · clientela mixta · generaciones · institución local · Plaza Nueva

Público primario: locales de Granada, familias, clientes habituales, trabajadores de la zona, gente que busca comida andaluza reconocible.

Público secundario: visitantes que buscan algo real, turistas que evitan trampas turísticas obvias, viajeros internacionales interesados en atmósfera local.

---

## Dirección visual

El sitio debe sentirse como:
- menú impreso
- señalética antigua de restaurante
- tipografía institucional andaluza
- fotografía documental
- maquetación editorial

No como:
- landing page de startup
- experiencia web animada
- sitio de hostelería de lujo
- app móvil

**Paleta fija:**
- `--bg: #F6F3EC` — papel / crema
- `--ink: #1C1A17` — negro tinta
- `--accent: #7A1C1C` — rojo granate
- `--muted: #5C5752` — gris piedra
- `--faint: rgba(122, 28, 28, 0.16)` — acento suave

**Tipografía fija:**
- Playfair Display 700 — titulares, nombre del local, precios, elementos editoriales
- Inter 400/500/600 — navegación, etiquetas, texto funcional
- Courier New — precio del menú del día (énfasis documental)

**Principios visuales:**
- densidad sobre exceso de espacio en blanco
- animación mínima (solo fade-out del loader, 380ms)
- sin glassmorphism
- sin tarjetas flotantes
- sin gradientes
- sin UI brillante
- sin border-radius excesivo
- sin sensación de "app"
- sin fotografía de stock ni tomas de influencer

---

## Tono

Conciso · directo · local · confianza seca · no comercial

**Prohibido usar:**
- "experiencia auténtica"
- "joya escondida"
- "viaje culinario"
- "pasión por la gastronomía"
- spam SEO

**Tono preferido:** institucional · humano · familiar · observacional · anclado

---

## UX Principles

- El menú es central. Acceso desde homepage en un clic.
- CTA principal siempre visible: llamar al teléfono.
- Navegación: Carta · Horarios · Llamar.
- Selector de idioma: ES · EN · FR (en todas las páginas).
- Scroll mínimo en homepage — la información esencial aparece sin bajar.
- En carta: menú del día visible primero si está disponible, luego platos, luego horarios, luego footer con CTA de llamada.
- Enlace `#horarios` funciona como anchor desde homepage nav.

---

## Señales obligatorias

Todo estado del sitio debe incluir:
- dirección visible (Plaza Nueva · Granada · Andalucía)
- horarios completos por día
- teléfono como CTA clicable
- acceso a carta multilingüe
- continuidad histórica ("Tres generaciones sin cambiar de receta.")

---

## Prohibiciones

No convertir Restaurante-Bar León en:
- local de brunch
- café de startup
- restaurante de lujo
- marca escandinava minimalista
- app genérica de tapas
- trampa de Instagram
- caricatura turística

Evitar siempre:
- tópicos de flamenco o corridas
- romanticismo andaluz falso
- "españolidad" generada por IA
- posicionamiento genérico de hostelería

---

## Acceso CMS

El proyecto tiene dos interfaces de administración que escriben sobre `data/venue.json`. La división es intencional:

| Sistema | Ruta | Usuario | Cuándo usarlo |
|---|---|---|---|
| Panel del propietario | `/panel/` | Propietario (no técnico) | Tareas diarias: precios, horarios, avisos, fotos del local |
| Decap CMS | `/admin/` | Desarrollador / asistente | Cambios de esquema, traducciones, platos, vinos, SEO, hero, nav |

**Regla:** si el propietario puede hacerlo en el panel, no se hace en Decap. El panel es la herramienta operativa diaria; Decap es para cambios que requieren contexto técnico.

Ambos sistemas detectan conflictos de escritura (SHA-mismatch 409). No usar los dos a la vez sobre la misma sesión de datos.

---

## Carta actual (datos reales, venue.json)

**Categorías activas:**
- SABORES DE ANDALUCÍA
- SOPAS Y PLATOS DE CUCHARA
- ENTRANTES Y RACIONES
- FRITURAS Y PESCADOS
- CARNES
- HUEVOS Y TORTILLAS
- ARROCES
- POSTRES

**Platos activos (ejemplos representativos):**
- Tortilla del Sacromonte — 10,00 €
- Habas con jamón ibérico y huevo frito — 13,00 €
- Carne de monte (ciervo en adobo) — Media 10,50 € / Ración 13,50 €
- Riñones al Jerez — Media 9,00 € / Ración 12,50 €

**Menú del día:** 12,50 € · Lun/Mar/Jue/Vie (solo mediodía) · primer plato (gazpacho, sopa de picadillo, salmorejo...) + plato del día (lunes cocido, martes macarrones...) + postre de la casa. IVA incluido. Bebida no incluida.

**Maridajes:** vinos D.O. Granada (Fontedei Prado Negro, Muñana, Delirio, Calvente), Fino/Manzanilla de Jerez, Alhambra Reserva 1925.

