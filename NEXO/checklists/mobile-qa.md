# NEXO — Mobile QA Checklist

> Venue: ________________  Fecha: ________________
> Probar en dispositivo real si es posible. DevTools como mínimo (320px, 375px, 414px).

---

## Viewport breakpoints a probar

| Breakpoint | Dispositivo equivalente |
|---|---|
| 320px | iPhone SE, dispositivos pequeños |
| 375px | iPhone 12/13/14 estándar |
| 414px | iPhone Plus / Android grande |
| 768px | Tablet portrait |

---

## Homepage — mobile

- [ ] Nombre del bar: legible, no desborda lateralmente
- [ ] Subtítulo institucional: en una o dos líneas, no cortado
- [ ] Navegación (Carta · Horarios · Llamar): en una línea sin hamburguesa
- [ ] Selector de idioma: visible junto a la nav
- [ ] Hero: imagen o fallback ocupa el espacio correcto sin distorsionar layout
- [ ] Tagline: legible, márgenes correctos
- [ ] Footer: dirección y teléfono visibles
- [ ] Sin scroll horizontal en ningún breakpoint
- [ ] Sin texto cortado con `overflow: hidden`

---

## Carta — mobile

- [ ] Nombre del plato: se rompe en múltiples líneas si es largo (no se corta)
- [ ] Precio: visible a la derecha de cada ítem
- [ ] `.check-leader` (puntos): no genera scroll horizontal
- [ ] Descripciones de plato: legibles, spacing correcto
- [ ] Menú del día (edict box): ocupa el ancho completo, no desborda
- [ ] Horarios grid: días y horas alineados correctamente
- [ ] CTA "Llamar": full-width, altura mínima 44px (tap target)
- [ ] Selector de idioma en header: funcional con tap
- [ ] Botón "← Bar León": funcional con tap
- [ ] Sin scroll horizontal

---

## Interacción táctil

- [ ] Todos los links y botones tienen área de tap ≥ 44x44px
- [ ] CTA "Llamar" abre el marcador de teléfono al tocar
- [ ] Links de idioma navegan correctamente
- [ ] Back link ("← Bar León") funciona

---

## Performance visual

- [ ] No hay layout shift visible al cargar los datos (fade-in del loader)
- [ ] El loader desaparece limpiamente
- [ ] Las imágenes no causan salto de layout

---

## Orientación landscape (bonus)

- [ ] Homepage legible en landscape 667px de ancho
- [ ] Carta legible en landscape

---

## Notas

---

**Firmado:** ________________  **Fecha:** ________________  **Dispositivo de prueba:** ________________
