# MASTER FOOD SYSTEM — Restaurante-Bar León

**Document type:** Content governance and data architecture reference  
**Status:** Authoritative — all content decisions defer to this file  
**Location:** Plaza Nueva · Granada · Andalucía  
**Established:** Three generations  
**Last revised:** 2026-05-25

---

## Purpose

This document defines the complete gastronomic architecture of Restaurante-Bar León: what content exists, what it means, how it should be structured, how it should be communicated, and how the owner can maintain it without technical assistance.

It is not a design document. It is not a menu. It is the system that governs both.

---

## 1. INFORMATION HIERARCHY

Bar León operates on two parallel tracks: **restaurante** and **bar**. These are not the same business. They share a kitchen and a space, but they serve different customers in different modes. The content system must reflect this.

### Track 1 — Restaurante (comedor)

Sit-down service. Table menu. Full meal.

**Carta fija** — the à la carte menu, permanent offering organized by category:

| Category | Spanish label | Character |
|---|---|---|
| Signature dishes | SABORES DE ANDALUCÍA | Andalusian identity dishes: casquería, guisos, offal, traditional recipes |
| Soups | SOPAS Y PLATOS DE CUCHARA | Seasonal. Gazpacho/salmorejo in summer; sopa de ajos in winter |
| Starters and sharing | ENTRANTES Y RACIONES | Salads, cured meats, vegetables, croquetas |
| Fried fish and seafood | FRITURAS Y PESCADOS | Andalusian frying tradition: calamares, boquerones, cazón, puntillitas |
| Meats | CARNES | Grilled and braised. Cerdo, ternera, cordero |
| Eggs and omelettes | HUEVOS Y TORTILLAS | Bar staple. Tortilla de patatas is institutional |
| Rice dishes | ARROCES | Made to order, minimum 2 portions. Not a fast dish |
| Desserts | POSTRES | Mix of house-made and assembled |

**Menú del día** — fixed-price lunch menu:
- Price: 12,50 €
- Days: Monday, Tuesday, Thursday, Friday (lunch only, 13:00–16:00)
- Structure: primer plato + segundo + postre + pan
- Drink: not included
- Consists of: three fixed primeros options, six fixed segundos options, a daily rotating segundo especial, four dessert options

### Track 2 — Bar (barra)

Standing or stool service at the bar. Smaller portions. Faster consumption.

**Tapas de barra** — not currently in the data system. Exists operationally. Requires its own content type (see Section 2).

The tapa system at Bar León follows classic Spanish barra logic:
- Items from the carta are available at the bar in different portion sizes
- Some items have explicit barra pricing (Croquetas: 1,80 € unidad; Pincho de tortilla: 2,80 €; Flamenquín: 5,00 €)
- The distinction between barra and restaurante pricing for the same dish must be explicit in the data

**Bocadillos** — not currently in the data system. Exists operationally. Likely served at bar, possibly lunchtime. Requires its own content type (see Section 2).

### Drinks

Three categories. None currently in the data system.

**Wines (vinos):**
- Wine pairings are suggested in carta item descriptions, referencing specific bottles and prices
- A dedicated wine list does not exist in the system yet
- Referenced wines: D.O. Granada (Fontedei Prado Negro, Muñana Rojo, Señorío de Nevada, Calvente, Delirio, Muñana 3 Cepas), D.O. Rioja, D.O. Ribera del Duero, D.O. Rueda, V.T. Cádiz, V.T. Granada

**Vermouth, sherry, aperitivos:**
- Referenced in pairings: Fino de Jerez, Manzanilla, Amontillado de Jerez
- Central to Granada bar culture, especially Saturday/Sunday lunchtime
- No structured data exists yet

**Beverages (bebidas):**
- Cerveza (Alhambra Reserva 1925 referenced: 3,20 €)
- Agua, refrescos, vino de la casa
- No structured data exists yet

### Seasonal dishes

Not a separate category — seasonal dishes live within the main carta categories. Their seasonality must be explicit in the data.

Known seasonal items:
- **Gazpacho andaluz** — summer only (carta: SOPAS)
- **Salmorejo** — summer only (carta: SOPAS; also a primero option in the menú del día during summer)
- **Arroz a la cubana** — Friday segundo especial in summer only (menú del día)
- **Sopa de ajos** — winter only (carta: SOPAS)

The current data does not reliably encode seasonality. The `disponible` field is a binary toggle, not a seasonal trigger.

---

## 2. DATA MODEL

### 2.1 Carta fija — individual dish

| Field | Description | Type | CMS editable | Required |
|---|---|---|---|---|
| `categoria` | Menu section | Select (fixed list) | No (owner selects) | Yes |
| `nombre` | Dish name in Spanish | String | Yes | Yes |
| `descripcion` | 1–3 sentences: what it is, how it's made, why it matters | Text | Yes | Yes |
| `maridaje` | Wine/drink pairing suggestion with price | String | Yes | No |
| `precio` | Price string — supports "Media X / Ración Y" format and "(barra) / (restaurante)" format | String | Yes | Yes |
| `disponible` | SI / NO toggle — hides dish without deleting it | Select | Yes | Yes |
| `temporada` | [MISSING] Summer / Winter / Year-round / On request | Select | Yes | No |
| `barra` | [MISSING] Whether dish appears in bar format | Boolean | Yes | No |

**Portion pricing conventions in current data:**
- `Media X,XX € / Ración X,XX €` — two sizes, sitting at table
- `X,XX € (barra) / X,XX € (restaurante)` — different prices by location
- `X,XX € (unidad)` — sold individually
- `X,XX € / ración` — single price, explicit unit

These formats are stored as free-text strings. This is operationally flexible but not machine-readable. For QR menus and structured SEO, prices should eventually be split into structured fields.

**Category list (fixed — do not change without updating CMS config):**
- SABORES DE ANDALUCÍA
- SOPAS Y PLATOS DE CUCHARA
- ENTRANTES Y RACIONES
- FRITURAS Y PESCADOS
- CARNES
- HUEVOS Y TORTILLAS
- ARROCES
- POSTRES

**Appears in:**

| Surface | Includes |
|---|---|
| Carta page | All available dishes, organized by category, with description and pairing |
| QR menu | All available dishes — descriptions optional, prices required |
| SEO | Category names, top 3–5 dish names per category (structured metadata) |
| Instagram | Individual dishes, seasonal items, signature plates |
| Homepage | No — homepage does not reference individual carta items |

---

### 2.2 Menú del día

| Field | Description | Type | CMS editable | Required |
|---|---|---|---|---|
| `disponible` | SI / NO — show or hide the entire menú del día block | Select | Yes | Yes |
| `dias` | Days and hours of service as display string | String | Yes | Yes |
| `precio` | Price with currency | String | Yes | Yes |
| `condiciones` | Legal/practical notes (IVA, drinks, inclusions) | Text | Yes | Yes |
| `primeros` | Fixed first-course options, separated by ` · ` | String | Yes | Yes |
| `segundos` | Fixed second-course options, separated by ` · ` | String | Yes | Yes |
| `platosDelDia` | Rotating daily especiales — list of {dia, plato} objects | List | Yes | No |
| `postres` | Dessert options, separated by ` · ` | String | Yes | Yes |
| `temporada` | Seasonal operating note (free text) | String | Yes | No |

**Current values (source of truth as of 2026-05-25):**

```
disponible: SI
dias: Lunes, Martes, Jueves y Viernes · 13:00–16:00
precio: 12,50 €
condiciones: IVA incluido. Bebida no incluida.
primeros: Ensalada de la casa · Entremeses variados · Salmorejo
segundos: Filete de cerdo (empanado o plancha) · Secreto de cerdo ·
          Filete de pescadilla · Calamares fritos · Filete de dorada ·
          Pechuga de pollo
platosDelDia:
  - Lunes: Cocido
  - Martes: Macarrones
  - Jueves: Cazuela de fideos
  - Viernes: Lentejas (o potaje de habichuelas)
postres: Natillas de la casa · Arroz con leche · Helado · Fruta del tiempo
temporada: Viernes en verano: Arroz a la cubana.
```

**Structural logic:**
- `primeros` and `segundos` are the permanent options — they change rarely (seasonal menu update)
- `platosDelDia` is the rotating daily specials — a different dish each day that acts as an additional segundo
- `postres` changes rarely
- `temporada` is a note, not a structured field — it communicates an operational exception, not a data relationship

**Relationship between segundos and platosDelDia:**
The `platosDelDia` entries (cocido, macarrones, cazuela, lentejas) are additional second-course options. They appear each week on their designated day. They do not replace the fixed `segundos`. A customer on Monday can choose any of the six fixed segundos OR the cocido. This must be rendered clearly in the UI: fixed options listed first, daily especial added below.

**Unresolved questions (verify with owner):**
- Is salmorejo a current primero option in summer, or only the three fixed options year-round?
- Is gazpacho available as a primero on the menú? (Not included in current data pending confirmation)
- Is "Sopa de picadillo" available as a primero? (Was in original data, removed pending photo confirmation)
- Is potaje de vigilia (Viernes Santo) a confirmed special, or a tradition that may not always apply?

**Appears in:**

| Surface | Includes |
|---|---|
| Carta page | Full menú del día block — primeros, segundos, platosDelDia, postres, price, condiciones, temporada |
| Homepage | Summary block: available/not, price, days (if available) |
| QR menu | Full block — same as carta |
| SEO | Price, days, keyword: "menú del día Granada" |
| Instagram | Daily specials. platosDelDia is the natural Instagram content unit |

---

### 2.3 Horarios

| Field | Description | Type | CMS editable | Required |
|---|---|---|---|---|
| `dia` | Day name in the language of the data file | String | Yes | Yes |
| `estado` | ABIERTO / CERRADO / CERRADO TARDE | Select | Yes | Yes |
| `detalle` | Human-readable schedule for that day | String | Yes | Yes |

**Current schedule:**

| Day | Status | Hours |
|---|---|---|
| Lunes | ABIERTO | 13:00–16:00 / 20:00–23:00 |
| Martes | CERRADO TARDE | 13:00–16:00 (solo mediodía) |
| Miércoles | CERRADO | Cerrado |
| Jueves | ABIERTO | 13:00–16:00 / 20:00–23:00 |
| Viernes | ABIERTO | 13:00–16:00 / 20:30–23:30 |
| Sábado | ABIERTO | 13:00–16:00 / 20:00–23:30 |
| Domingo | ABIERTO | 13:00–16:00 / 20:00–23:00 |

**Data inconsistency to resolve:** en.json shows Tuesday as ABIERTO (not CERRADO TARDE). Needs correction.

**Appears in:**

| Surface | Includes |
|---|---|
| Carta page | Full horarios grid, reachable via `#horarios` anchor |
| Homepage | Via nav link pointing to carta#horarios |
| QR menu | Essential — must be present |
| SEO | Structured hours markup (future) |
| Google Business | Manual sync, not automated |

---

### 2.4 Tapas de barra [MISSING — define before implementing]

| Field | Description | Type | Notes |
|---|---|---|---|
| `nombre` | Tapa name | String | May match a carta dish name |
| `precio_barra` | Price at the bar | String | |
| `disponible` | SI / NO | Select | |
| `tipo` | pincho / tapa / media | Select | |

**Implementation note:** Several carta dishes already have barra pricing embedded in the `precio` field string. Before creating a separate tapas content type, audit the carta and separate out the barra-specific prices. Items with dual pricing (barra/restaurante) should have both values explicitly stored, not concatenated.

---

### 2.5 Bocadillos [MISSING — define before implementing]

| Field | Description | Type |
|---|---|---|
| `nombre` | Bocadillo name | String |
| `relleno` | Filling | String |
| `precio` | Price | String |
| `disponible` | SI / NO | Select |

**Note:** Bocadillos likely have limited hours or are bar-only. Operational rules need to be confirmed with the owner before this content type is built.

---

### 2.6 Vinos [MISSING — define before implementing]

The current system references wines as strings inside dish `maridaje` fields. This is sufficient for pairing suggestions but not for a wine list.

| Field | Description |
|---|---|
| `nombre` | Wine name |
| `bodega` | Producer |
| `denominacion` | D.O. or V.T. |
| `tipo` | Blanco / Tinto / Rosado / Espumoso / Generoso |
| `formato` | Copa / Botella |
| `precio_copa` | Price by glass |
| `precio_botella` | Price by bottle |
| `disponible` | SI / NO |

**Priority wines from Granada D.O.** (referenced in current pairings):
- Fontedei Prado Negro
- Muñana Rojo / Muñana 3 Cepas
- Señorío de Nevada
- Calvente / Calvente Guindalera
- Delirio

**Sherry and Jerez** (referenced):
- Fino de Jerez
- Manzanilla
- Amontillado de Jerez

---

### 2.7 Bebidas generales [MISSING — define before implementing]

| Field | Description |
|---|---|
| `nombre` | Drink name |
| `tipo` | Cerveza / Agua / Refresco / Zumo / Vino de la casa |
| `precio` | Price |
| `disponible` | SI / NO |

Known reference: Alhambra Reserva 1925 cerveza — 3,20 €

---

### 2.8 Inicio (homepage content)

| Field | Description | CMS editable | Required |
|---|---|---|---|
| `titular` | One-line positioning statement | Yes | Yes |
| `subtitulo` | Location descriptor — Plaza Nueva · Granada | Yes (rare) | Yes |
| `avisoEspecial` | Temporary notice (holiday closure, event, etc.) | Yes | No |

**Current values:**
- `titular`: "Tres generaciones sin cambiar de receta."
- `subtitulo`: "Plaza Nueva · Granada"
- `avisoEspecial`: "" (empty — no active notice)

---

## 3. OPERATIONAL RULES

These rules govern the real-world operation of the restaurant and must be reflected in all content, translations, and data.

### Hours

- **Wednesday: closed all day.** No exceptions in standard operation.
- **Tuesday: lunch only.** Open 13:00–16:00. Closed in the evening. This is a standing rule, not temporary.
- **Monday, Thursday: full day.** Lunch 13:00–16:00, dinner 20:00–23:00.
- **Friday: full day with extended evening.** Lunch 13:00–16:00, dinner 20:30–23:30.
- **Saturday: full day.** Lunch 13:00–16:00, dinner 20:00–23:30.
- **Sunday: full day.** Lunch 13:00–16:00, dinner 20:00–23:00.

### Menú del día

- Available **Monday, Tuesday, Thursday, and Friday only**.
- Lunch service only: **13:00–16:00**.
- Never available on Wednesday, Saturday, or Sunday.
- Never available at dinner.
- Price is **12,50 €, IVA included**.
- Drink is **not included**.
- The `platosDelDia` rotating specials are additional segundo options, not replacements for the fixed `segundos` list.

### Seasonal rules

- **Gazpacho andaluz:** summer only. Available from approximately late May to September. Hide in winter via `disponible: NO`.
- **Salmorejo:** summer only. Same window as gazpacho. Currently appears in carta as `Solo en temporada de verano` in its description.
- **Sopa de ajos:** winter preference, though not exclusively. The description notes it as a "plato de invierno."
- **Arroz a la cubana:** only appears as a `platosDelDia` specials entry on **Fridays in summer**. This is an operational exception, not a rotating entry. The `temporada` field in `menuDia` communicates this. Do not add arroz a la cubana as a permanent Friday plato del día entry.
- **Fritura de pescado variado:** offered "según disponibilidad" — this is a market-availability dish, not seasonal. The description already captures this.

### Arroces

- **Paella is made to order.** Minimum 2 portions. Cannot be ordered à la minute.
- This must be communicated in the dish description and in any QR menu or print menu.
- Never imply paella is a fast dish or a solo-diner option.

### Bar logic

- Bar León is a bar that serves restaurant food. It is not a restaurant that has a bar.
- The barra culture matters: quick service, standing customers, smaller portions, casual ordering.
- Items sold at the bar at lower prices (pincho de tortilla, croquetas, flamenquín) serve a different customer moment than the same items in the comedor.
- The website currently does not reflect bar logic. Future QR and barra menus must.

### Identity

- This is a neighborhood institution. It is not a concept.
- Three generations of the same family. This is not marketing language — it is true.
- The word "auténtico" should never appear in marketing copy. The authenticity is demonstrated by the carta, the prices, and the operation, not stated.
- Regulars and tourists coexist. The experience is not calibrated to tourists. Tourists are welcome in a non-condescending way.
- Granada cuisine is not "rustic." It is precise and traditional. Casquería is not exotic — it is the point.

---

## 4. TRANSLATION PHILOSOPHY

### Core principle

Bar León translates for **comprehension**, not for **comfort**. A guest who reads the menu in English should understand what they are ordering. They should not be insulated from what the dish actually is.

### What is not negotiable

**Dish names are preserved in Spanish.** Translations appear as explanations, not replacements. The Spanish name always comes first.

Correct: *Callos — tripe stew with chorizo, morcilla and chickpeas*  
Wrong: *Traditional Stew*

**Andalusian identity is not diluted.** The word "Granada" appears more than once. D.O. Granada wines are labeled as such, not genericized to "local wine."

**Casquería is explained honestly.** Offal and variety meats are a central part of Bar León's identity — they are listed in the first and most prominent carta section. They must be translated accurately.

| Spanish | Acceptable translation |
|---|---|
| Sesos | Brains — crumbed and fried |
| Criadillas | Bull's testicles — battered and fried |
| Callos | Tripe stew with chorizo, morcilla and chickpeas |
| Riñones al Jerez | Kidneys in sherry sauce |
| Casquería | Offal — variety meats |
| Tortilla del Sacromonte | The Granada omelette — egg, brains and sweetbreads |

Using "sweetbreads" for criadillas is a mistranslation. Sweetbreads are thymus or pancreas; criadillas are testicles. The English word exists. Use it.

### Category translations

| Spanish | English | French |
|---|---|---|
| SABORES DE ANDALUCÍA | Andalusian Classics | Classiques d'Andalousie |
| SOPAS Y PLATOS DE CUCHARA | Soups | Soupes |
| ENTRANTES Y RACIONES | Starters and sharing plates | Entrées et à partager |
| FRITURAS Y PESCADOS | Fried fish and seafood | Fritures et poissons |
| CARNES | Meats | Viandes |
| HUEVOS Y TORTILLAS | Eggs and omelettes | Œufs et tortillas |
| ARROCES | Rice dishes | Riz |
| POSTRES | Desserts | Desserts |

### Dishes that require explanation, not just translation

These dishes will confuse foreign guests if not explained. The explanation belongs in the `descripcion` field, not in the dish name.

| Dish | What to explain |
|---|---|
| Secreto de cerdo | The secreto is a specific Iberian pork cut from the shoulder, hidden under the shoulder blade — marbled, not lean |
| Presa ibérica | Another premium Iberian pork cut — shoulder area, intense marbling |
| Cazón en adobo | Not generic fried fish — cazón is dogfish/smooth-hound, marinated in spiced vinegar before frying |
| Puntillitas (chopos) | Very small squid, fried whole with tentacles — not rings |
| Flamenquín | A rolled pork-and-ham cylinder, breaded and fried — an Andalusian invention |
| Consomé al Jerez | Sherry is a wine from Cádiz; it needs naming for non-Spanish speakers |
| Manzanilla | Not chamomile tea — a dry fino-style sherry from Sanlúcar de Barrameda |
| Tomate aliñao | Seasoned raw tomato — a Granadan way of eating tomato with oil, salt and onion |
| Paella mixta | Clarify that this is made to order, minimum 2 portions — prevents misexpectations |

### Tone of translations

- Direct and informative.
- No food-media adjectives ("succulent," "divine," "melt-in-your-mouth").
- No heritage performance ("passed down through generations for your table today").
- If the Spanish is five words, the English can be eight. It cannot be forty.

### When in doubt

If a dish name cannot be translated clearly without sounding either clinical or patronizing, keep the Spanish name and add a short parenthetical: *Callos (tripe stew)*.

French translations follow the same logic. Andalusian Spanish names are not French — they are Spanish — and should be kept as such.

---

## 5. CMS STRATEGY

### Design constraint

The owner of Bar León is not a developer. The CMS must work on a mobile phone, during service, under time pressure, without training refreshers.

### What must be editable — quickly

These are the fields the owner changes regularly (weekly or monthly):

1. **Menú del día: disponible** — SI/NO toggle. One tap.
2. **Menú del día: platosDelDia** — add/remove/edit the rotating daily dishes.
3. **Menú del día: temporada** — update the seasonal note when summer begins or ends.
4. **Carta: disponible per dish** — toggle individual dishes off when unavailable.
5. **Inicio: avisoEspecial** — post a closure notice or event notice.

These need to be reachable in three taps or fewer from the CMS home screen.

### What is editable — occasionally

These fields change seasonally or when the carta genuinely changes:

1. **Menú del día: primeros, segundos, postres** — when the standing options change.
2. **Menú del día: precio** — if price changes.
3. **Carta: precio per dish** — if prices change.
4. **Carta: descripcion** — if descriptions need updating.
5. **Horarios: detalle** — if schedule changes.

### What should not be easily editable

These fields exist but should be protected from casual changes:

1. **Category names** — changing a category name breaks the display grouping. The CMS currently uses a fixed `select` widget. Keep it.
2. **Dish names** (`nombre`) — renaming a dish severs any external link or indexed reference. Edit with care.
3. **Idioma field structure** — the three-language data files (es/en/fr) must stay in sync. Editing one language does not update the others.

### CMS field ordering priority

Fields in the CMS should be ordered by editing frequency:

```
Menú del Día
  1. ¿Disponible hoy? [SI/NO toggle — first field, most used]
  2. Precio
  3. Días de servicio
  4. Primeros
  5. Segundos
  6. Platos del día [list, editable]
  7. Postre
  8. Nota de temporada
  9. Condiciones [rarely changes]

Carta [by category — use collapsible list]
  Each item: Nombre / Precio / ¿En carta hoy? [visible] / Descripción [collapsed]

Horarios [7 rows, rarely changes]

Página de Inicio
  1. Aviso especial [most likely to be used]
  2. Frase principal
  3. Subtítulo
```

### Language management

The current CMS only manages the Spanish data file (`data/es.json`). English and French files (`en.json`, `fr.json`) must be edited manually or through a future workflow.

For now: **Spanish is the source of truth. English and French are derived.** When the owner edits the Spanish menu, someone (or an AI-assisted process) must update the other two files to match.

Do not expose the owner to raw JSON under any circumstances. If a translation update requires touching JSON directly, that is an assistant task, not an owner task.

### What makes the CMS fail

These are known failure modes to avoid in future CMS development:

- Free-text fields for things that should be structured (e.g., price formatting, dish categories)
- No validation — the owner can accidentally delete required content
- Showing all fields at once — overwhelming on mobile
- No confirmation before publishing — changes go live immediately
- No way to preview before publishing

---

## 6. FUTURE SCALABILITY

### QR menus

QR menus differ from the website in one important way: they are accessed on a physical device at a physical table, with no context about who the user is or what language they speak.

**Requirements for QR menus:**
- Language selector must be the first visible element
- Menú del día block must appear first when available
- All prices must be visible without expanding anything
- Hours must be reachable in one tap
- Phone number must be a tap-to-call link
- Works offline (or with a bad connection) — all content pre-rendered

**Data implications:**
- The current JSON structure is QR-compatible in principle
- Needs a dedicated rendering layer that is lighter than the current carta page
- Consider a separate template: `qr.html` per language, same data source

### Seasonal updates

The current system requires manual intervention to switch seasonal dishes. Future improvement:

- Add `temporada` field to individual carta items: `VERANO / INVIERNO / TODO EL AÑO`
- Automated seasonal toggle: items with `temporada: VERANO` auto-hide in winter without owner action
- The `platosDelDia` list for `Arroz a la cubana` should appear automatically in summer, not be manually managed

### AI-assisted translations

When the carta changes, the current process requires manual translation updates to en.json and fr.json. A future workflow:

1. Owner edits Spanish (es.json) in the CMS
2. A triggered process detects the change
3. An AI assistant generates a conservative literal translation following the philosophy in Section 4
4. A human (Miriam or similar) reviews and approves before the translation goes live
5. The reviewed translation is pushed to en.json and fr.json

**Translation fields that require AI assistance:**
- `descripcion` — nuanced, dish-specific text
- `platosDelDia` — rotating dishes that change weekly

**Translation fields that can be automated safely:**
- `dias` — fixed schedules with known patterns
- `condiciones` — legal boilerplate
- `temporada` — short seasonal notes

### Structured SEO

The current site has basic meta descriptions. Future improvements:

- **Structured data (JSON-LD):** Restaurant schema with name, address, telephone, openingHours, servesCuisine, menu URL
- **Individual dish pages or schema:** Not needed at current scale, but would allow Google to show menu items in search results
- **Multilingual SEO:** Each language version (`/es/`, `/en/`, `/fr/`) needs its own meta description targeting the relevant market

Priority keywords by language:
- ES: menú del día Granada, restaurante tradicional Plaza Nueva, cocina andaluza Granada
- EN: traditional restaurant Granada Spain, lunch menu Granada, Andalusian food Granada
- FR: restaurant traditionnel Grenade, menu du jour Grenade, cuisine andalouse

### Instagram content generation

The `platosDelDia` data is the natural source for weekly Instagram content: one post per day showing what the daily special is, with the price.

**Content generation pipeline (future):**
1. `platosDelDia` entries → daily post text (ES + brief EN/FR)
2. Seasonal items when added/removed → announcement post
3. Dish descriptions → caption base for photo posts

Instagram should never reference the website in a generic way. CTAs: "Reserva llamando al [phone]" or "Ven a verlo."

### Reservation system (future)

Bar León currently takes reservations by phone. A future online reservation system must:

- Not replace the phone call as primary CTA — phone calls are the relationship
- Only supplement for formal bookings (groups, events)
- Respect the closed-Wednesday / Tuesday-lunch-only rules automatically
- Block reservation attempts for non-service hours
- Send a confirmation that includes the phone number, in case of questions

The current website CTA (phone number, tap-to-call) is correct. Do not add a reservation widget before validating the operational need with the owner.

---

## Appendix A — Known data gaps (as of 2026-05-25)

| Missing data | Priority | Owner action required |
|---|---|---|
| Tuesday horario in en.json (shows ABIERTO instead of CERRADO TARDE) | High | Confirm Tuesday hours in English file |
| Gazpacho / sopa de picadillo as primeros in menú del día | High | Owner to confirm if these are currently offered |
| Potaje de vigilia (Viernes Santo) | Medium | Owner to confirm if this is a standing rule |
| Tapas de barra section | Medium | Confirm which carta items have barra pricing |
| Bocadillos list and prices | Medium | Owner to provide current bocadillos |
| Wine list (separate from pairings) | Low | Owner to confirm which wines are currently available |
| Vermouth / aperitivos list | Low | Confirm what's served at the bar |
| Seasonal dish toggle per item | Low | Technical — requires data model change |
| Salmorejo as summer primero in menú del día | Medium | Confirm with owner |

---

## Appendix B — Dishes requiring attention

These dishes in the current data have descriptions or pricing that may need verification:

| Dish | Issue |
|---|---|
| Criadillas | Described as "Casquería tradicional, rebozada y frita" — correct but may need more specificity for EN/FR translations |
| Fritura de pescado variado | "Según disponibilidad" — consider adding this to the barra/seasonal logic |
| Arroces (all) | "Por encargo, mínimo 2 raciones" — this operational note is in the description but should also appear prominently in the UI |
| Paella mixta | Description uses "pollo, marisco y verduras" — confirm this is the current composition |
| Tarta Canadá | Described as "Tarta helada Contesa" — Tarta Contesa is a branded ice cream product; confirm this is the correct product name |

---

*This document is the single source of truth for gastronomic content governance at Restaurante-Bar León. Update it when the operation changes, not after.*
