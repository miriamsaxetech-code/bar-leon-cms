# NEXO — Multilingual Content Template

> Una tabla por cada campo de texto visible en la interfaz.
> Completar ES primero, luego EN y FR.
> Venue: ________________  Fecha: ________________

---

## Campos de inicio (homepage)

| Campo | ES | EN | FR |
|---|---|---|---|
| `inicio.titular` | | | |
| `inicio.subtitulo` | | | |
| `inicio.avisoEspecial` | _(vacío si no hay)_ | | |

---

## Menú del día

| Campo | ES | EN | FR |
|---|---|---|---|
| `menuDia.dias` | | | |
| `menuDia.condiciones` | | | |
| `menuDia.precio` | _(idéntico en los 3)_ | = ES | = ES |

---

## Campos de navegación

| Campo | ES | EN | FR |
|---|---|---|---|
| `nav.carta` | Carta | Menu | Carte |
| `nav.horarios` | Horarios | Hours | Horaires |
| `nav.llamar` | Llamar | Call | Appeler |
| `nav.volver` | ← Bar León | ← Bar León | ← Bar León |
| `nav.menuDia` | Menú del Día | Daily Menu | Menu du Jour |
| `nav.edictHeader` | | | |
| `nav.edictFoot` | | | |

---

## Horarios

> Los horarios en FR usan formato `13h00–16h00` (no `13:00–16:00`).
> Los días en EN son en inglés (Monday, Tuesday...), en FR en francés.

| Día ES | Día EN | Día FR | Estado | Detalle ES | Detalle EN | Detalle FR |
|---|---|---|---|---|---|---|
| Lunes | Monday | Lundi | | | | |
| Martes | Tuesday | Mardi | | | | |
| Miércoles | Wednesday | Mercredi | CERRADO | | Closed | Fermé |
| Jueves | Thursday | Jeudi | | | | |
| Viernes | Friday | Vendredi | | | | |
| Sábado | Saturday | Samedi | | | | |
| Domingo | Sunday | Dimanche | | | | |

---

## Reglas de traducción

- **Nombres de platos:** nunca traducir nombres propios (Salmorejo, Tortilla del Sacromonte, Porra)
- **Precios:** idénticos en los 3 idiomas — nunca convertir
- **Horarios FR:** `13h00–16h00` con `h` sin espacio, guión largo
- **"Closed" en EN / "Fermé" en FR** para días `estado: CERRADO`
- **`nav.volver`:** siempre `← Bar León` (el nombre no se traduce)
- **`nav.edictHeader` en EN/FR:** adaptar texto institucional; incluir año de fundación si es relevante

---

## Verificación final

- [ ] ES revisado por hablante nativa
- [ ] EN: no hay calcos del español
- [ ] FR: horarios en formato `13h00`
- [ ] Precios idénticos en los 3 archivos JSON
- [ ] Ningún campo vacío en EN o FR que sea visible al público
