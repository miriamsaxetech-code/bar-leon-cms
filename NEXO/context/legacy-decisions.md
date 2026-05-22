# Bar León — Legacy Decisions

Elementos que sobrevivieron múltiples iteraciones del build.
Son supervivientes: si reaparecen es porque funcionan o son necesarios.

---

## Decisiones de identidad (persistentes)

**Homepage editorial, no comercial.**
En cada iteración el punto de entrada ha sido un masthead con nombre grande, ubicación, nav funcional y tagline — nunca un hero de imagen a pantalla completa con CTA centrado.

**Menú como documento impreso.**
La carta usa dotted leaders (`. . . . . .`) entre nombre y precio, tipografía Playfair, categorías en versales. Es deliberadamente más cercano a una carta física que a un componente de app.

**Identidad granadina explícita, no decorativa.**
"Plaza Nueva · Granada · Andalucía" aparece en footer de homepage y pie de carta. No como elemento de diseño sino como dato de negocio.

**"Tres generaciones sin cambiar de receta."**
Tagline superviviente. Comunica continuidad y legitimidad sin storytelling forzado.

**Nombre siempre como `Bar Le&oacute;n`** (entidad HTML) en código para evitar problemas de encoding en cualquier entorno.

---

## Decisiones de arquitectura (persistentes)

**Estático puro, sin framework.**
Cada vez que se consideró añadir un framework (React, Vue, Astro) se descartó. El sitio es HTML + CSS + JS vanilla. La razón: mantenimiento a largo plazo por una persona no técnica, sin dependencias que rompan.

**JSON como única fuente de datos.**
El contenido (carta, horarios, menú del día) vive en `data/es.json`, `en.json`, `fr.json`. El JS hace fetch y renderiza. El CMS edita esos mismos archivos. No hay duplicación de fuente de verdad.

**Decap CMS como interfaz de edición.**
Alternativas (Contentful, Sanity, Google Sheets como CMS) se descartaron. Decap es local al repo, sin suscripción, sin terceros adicionales, editable desde móvil.

**Versión de Decap pinneada.**
`unpkg.com/decap-cms@3.0.0` — no `@latest`. Decisión de seguridad: evitar actualizaciones automáticas que rompan la interfaz sin previo aviso.

**GitHub OAuth para /admin.**
La URL de `/admin/` es pública pero inaccesible sin cuenta GitHub con acceso al repo. Esto es autenticación real, no seguridad por oscuridad.

**Cloudflare Pages como host.**
Deploy automático en push a `main`. Sin configuración de build. Sin servidor. Edge caching incluido.

---

## Decisiones de diseño (persistentes)

**Paleta de tres colores fija.**
`--bg #F6F3EC` · `--ink #1C1A17` · `--accent #7A1C1C`. En cada iteración se ha mantenido esta combinación. Es no-negociable.

**Playfair Display 700 para titulares.**
Inter 400/500/600 para texto funcional. Esta combinación ha sobrevivido todas las revisiones.

**Masthead rule rojo en la cima.**
Una línea de 2px en `--accent` separa el top del navegador del contenido. Es el único elemento puramente decorativo que se ha mantenido en todas las versiones.

**Sin border-radius en botones.**
El CTA "Llamar" y el botón de carta son `border-radius: 0`. Decisión editorial deliberada.

**Loader como texto "Bar León".**
El estado de carga no es un spinner genérico sino el nombre del local en Playfair. Coherente con la identidad.

**Menú del día en "edict".**
El bloque del menú del día usa un estilo de edicto — borde doble en accent, cabecera con texto institucional, precio en Courier New. Es el componente con más personalidad del sitio.

---

## Patrones de copy (supervivientes)

**"Cocina Tradicional · Tres Generaciones"** — aparece en footer de homepage y pie de carta.

**"Bar León · Cocina Tradicional Granadina"** — pie del edict del menú del día.

**"Establecimiento Bar León · Granada"** — cabecera del edict del menú del día.

**`albayzin()` normalizer** — función en JS que corrige variantes ortográficas ("Albaicín", "Albayzin", "albayZín") a la forma oficial "Albayzín". Superviviente desde el primer build porque el barrio aparece en descripciones de platos.

---

## Señales recurrentes de iteraciones anteriores

- Cada vez que se añadió exceso de whitespace, se redujo en la siguiente iteración.
- Cada vez que se propuso fotografía de fondo a pantalla completa, se rechazó.
- Cada vez que se propuso animación de entrada para items de carta, se eliminó.
- El anchor `#horarios` apareció en la primera versión y se ha mantenido.
- El maridaje de vinos (D.O. Granada) se añadió desde el primer contenido real y no se ha eliminado.
- La estructura de tres idiomas (ES/EN/FR) fue decisión del primer build y no se ha cuestionado.
- La navegación "Carta · Horarios · Llamar" ha tenido el mismo orden en todas las versiones.

---

## Elementos pendientes (no ejecutados aún)

- Hero image real (actualmente con fallback a placeholder)
- Dominio propio configurado en Cloudflare
- Colaboradora del repo añadida para que el cliente use el CMS
- `data.json` en raíz — duplicado legacy, no usado, pendiente de archivar
- Verificación final del CMS en móvil por parte del cliente
