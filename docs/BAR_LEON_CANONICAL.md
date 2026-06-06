# Bar León — Canonical Reference

**Single source of truth for identity, UX, visual direction, typography, navigation, CMS, commercial priorities, and voice.**

**If any other document contradicts this file: this file wins.**

Last consolidated: 2026-06-06

---

## 1. Identity

**Name:** Restaurante Bar León

**Tagline:** Desde 1959 · Albaicín, Granada

**Description (short):**
Bar de barrio en el centro de Granada. Calle Pan, junto a Plaza Nueva. Tres generaciones en la misma barra.

**Founding:** 1959. Founder: Antonio León.

**Location:**
- C. Pan, 1, Albaicín, 18010 Granada, España
- Junto a Plaza Nueva

**Spelling rule:** Albaicín (RAE normative). Not "Albayzín."

**Contact:**
- Teléfono: (+34) 958 22 51 43 · tel link: +34958225143
- WhatsApp interno (no publicar en homepage): +34 696 948 630 (Kakin)
- Google Reviews: 4.1/5 (1.894 reseñas)

**SEO titles:**
- ES: Restaurante Bar León | Cocina andaluza en Plaza Nueva, Granada desde 1959
- EN: Restaurante Bar León | Traditional Andalusian restaurant in Plaza Nueva, Granada
- FR: Restaurante Bar León | Restaurant andalou traditionnel à Plaza Nueva, Grenade

---

## 2. Commercial Priority

Bar León is a restaurant first. Everything else supports the menu.

| Priority | Section |
|----------|---------|
| 1 | Carta restaurante |
| 2 | Carta barra |
| 3 | Bebidas |
| 4 | Bodega (dentro de Bebidas, no sección propia) |
| 5 | Menú del día |
| 6 | Historia |
| 7 | Contacto |

**Rule:** A hungry customer must reach food in under 2 taps. If the user reads paragraphs before seeing dishes, the UX has failed.

History builds trust. Food generates revenue.

---

## 3. Tone of Voice

Granada local. Dry humour. Friendly without performance. Confident without arrogance.

**Mala follá ≠ rudeness.**
Mala follá = brevity · irony · understatement · character.

**Never use:**
- Corporate language
- Luxury language
- Tourism clichés ("experiencia auténtica", "joya escondida", "viaje culinario", "pasión por la gastronomía")
- Romantic Andalusian posturing
- AI-generated "españolidad"

**Preferred register:** factual · institutional · human · observational · local

**Tone test:** ¿Quedaría bien pintado a mano en un azulejo? If yes, keep it.

**Terminology rule:** "cocina andaluza tradicional", never "gastronomía". Prices as data, not as sales argument.

**Language level:** frases cortas. Lenguaje llano. Hechos, no sentimientos.

---

## 4. Visual Direction

The site should feel like:
- printed menu
- old restaurant signage
- Andalusian institutional typography
- documentary photography
- editorial layout

Not like: startup landing page · animated web experience · luxury hospitality site · mobile app.

**Photography:** documentary, available light, no props, no styling. Food as it is actually served.

---

## 5. Colour Palette (canonical)

Resolves contradiction between Systems A/B/C in MASTER_SOURCE_OF_TRUTH and NEXO canonical. **This system is authoritative.**

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#F6F3EC` | background / paper |
| `--ink` | `#1C1A17` | body text |
| `--accent` | `#7A1C1C` | granate / primary accent |
| `--muted` | `#5C5752` | secondary text, labels |
| `--faint` | `rgba(122,28,28,0.16)` | soft accent tint |

No other accent colours in active use. Previous Systems A, B, C (burgúndy #6B1D2A, verdes #18362E / #0B8F3A) are superseded.

---

## 6. Typography

| Role | Typeface | Usage |
|------|----------|-------|
| **León Display** | Custom (v1 in development) | identity, section titles, dates, short labels |
| **Playfair Display 700** | Fallback display until León Display ships | same roles as León Display |
| **system-ui** | System sans-serif | body text, prices, descriptions, long copy |

**Hard rules:**
- León Display / Playfair: never for body text, prices, descriptions, long copy
- Minimum body size: 17px
- Line-height body: 1.6

---

## 7. Navigation

**Canonical nav items:**
1. Carta
2. Historia
3. Contacto

**Homepage primary CTAs (in order):**
1. Carta restaurante
2. Carta barra
3. Bebidas
4. Menú del día
5. Llamar

**No WhatsApp button on homepage.**

**Eliminated nav sections** (do not restore as independent pages):
- Bodega → absorbed into Bebidas/Carta
- Maridaje → internal data only, not a navigation item
- Recomendaciones → internal data only

**Hemeroteca:** remains a section but only with validated press URLs. Do not publish press mentions without confirmed URL.

---

## 8. Homepage Structure

**Hero:**
- Azulejo visual
- Desde 1959
- Albaicín · Granada

**Immediately below hero:**
- Primary CTAs (see §7)

**Rule:** Scroll mínimo en homepage — información esencial visible sin bajar.

---

## 9. Mobile First

- Minimum body font: 17px
- Minimum button height: 48px
- Use accordions extensively
- Reduce scrolling, reduce copy
- Target: carta accessible in ≤ 2 taps from homepage

---

## 10. Menu — Taxonomy

Canonical section order for carta:

1. Sabores de Andalucía
2. Sopas y platos de cuchara
3. Entrantes y raciones
4. Frituras y pescados
5. Carnes
6. Huevos y tortillas
7. Arroces (por encargo, mínimo 2 raciones)
8. Postres

**Barra only:** Bocadillos. Not served in restaurante.

**Menú del día:** 12,50 € · L-V, 13:00–16:00 (miércoles cerrado) · incluye pan y postre, bebida aparte.

**Data rule:** consume only from JSON source files. Do not invent dishes or prices.

---

## 11. Horario

| Día | Mediodía | Noche |
|-----|----------|-------|
| Lunes | 13:00–16:00 | 20:00–23:00 |
| Martes | 13:00–16:00 | cerrado |
| Miércoles | cerrado | cerrado |
| Jueves | 13:00–16:00 | 20:00–23:00 |
| Viernes | 13:00–16:00 | 20:30–23:30 |
| Sábado | 13:00–16:00 | 20:00–23:30 |
| Domingo | 13:00–16:00 | 20:00–23:00 |

> ⚠ Unresolved: Viernes mediodía aparece como 16:00 en dos fuentes y 16:30 en una. Usar 16:00 hasta confirmación del propietario.

---

## 12. CMS Rules

Two admin interfaces writing to `data/venue.json`. Division is intentional.

| System | Path | User | When |
|--------|------|------|------|
| Panel del propietario | `/panel/` | Owner (non-technical) | Daily: prices, hours, notices, photos |
| Decap CMS | `/admin/` | Developer / assistant | Schema changes, translations, dishes, wines, SEO, hero, nav |

**Rule:** If the owner can do it in the panel, do not use Decap. Both systems detect write conflicts (SHA-mismatch 409). Do not use both simultaneously on the same data session.

---

## 13. Multilingual

Active languages: ES, EN, FR.

Translations are cultural, not literal.

| ES | EN | FR |
|----|----|----|
| Carta | Menu | Carte |
| Llamar | Call | Appeler |
| Cómo llegar | Directions | Itinéraire |
| Ver la carta | View menu | Voir la carte |
| Cocina andaluza | Andalusian kitchen | Cuisine andalouse |

Language selector visible on all pages.

---

## 14. Open Contradictions (unresolved, needs owner input)

| # | Issue | Options | Status |
|---|-------|---------|--------|
| 1 | Viernes mediodía: 16:00 vs 16:30 | Two sources say 16:00; one says 16:30 | Using 16:00 until confirmed |
| 2 | Ribera de los Molinos: 7,50 € vs 17,00 € | May be two different wines, or price update | Do not publish until confirmed |
| 3 | Cruzcampo Especial: 2,60 € vs 2,90 € | May be "Especial" vs standard | Do not publish until confirmed |
| 4 | Sprite vs 7Up | Different sources list different brand | Defer to current bar stock |

---

## 15. What Bar León Is Not

Do not let the site become:
- brunch venue
- startup café
- luxury restaurant
- Scandinavian minimal brand
- generic tapas app
- Instagram trap
- tourist caricature

Avoid: flamenco tropes · false Andalusian romanticism · AI-generated "españolidad" · generic hospitality positioning.
