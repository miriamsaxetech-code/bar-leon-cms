# Bar León — Owner Experience Audit

**Perspective:** 65-year-old restaurant owner. iPhone. No technical background. Uses the panel alone, likely standing at the bar between services.

---

## Scores

| Dimension | Score | Reason |
|-----------|-------|--------|
| Simplicity | 6/10 | Core flows work, but three-language requirements and split upload/save add unnecessary steps |
| Safety | 4/10 | One tap publishes to production. No undo. No confirmation. Empty notices can go live. |
| Mobile usability | 6/10 | PIN and toggles work. HEIC rejection will confuse iPhone users. Tap-to-edit prices has no visible affordance. |
| Maintainability | 8/10 | Clean structure, easy to reason about — but no staging means a typo is instantly live |

---

## 1. Can a 65-year-old restaurant owner use this from an iPhone?

**Mostly yes. Three places where they will get stuck:**

**1. Photo upload (HEIC rejection)**
iPhones shoot in HEIC format by default. The app.js explicitly rejects HEIC/HEIF files. iOS *usually* converts HEIC to JPEG when a file is selected via the browser picker — but this is not guaranteed across all iOS versions and share contexts. If the rejection fires, the owner sees a technical-sounding error with no instruction on what to do differently. A 65-year-old will not know what HEIC is or how to fix it.

**2. Price editing (no visible tap affordance)**
Prices are tappable buttons that reveal an inline input. There is no pencil icon, no underline, no "toca para editar" hint. On a phone, the owner has no way to discover that prices are editable unless they already know to tap them.

**3. Three-language requirement for everything important**
Aviso (notice) requires Spanish, English, and French. Carioca (photo) requires captions in three languages. A monolingual Spanish-speaking owner will fill in Spanish and leave the other two blank. The result depends on whether the public site handles empty values gracefully — if it doesn't, English and French visitors may see no notice or no caption at all.

---

## 2. Click count to complete each task

Assumes the owner is already logged in and on the default tab (Precios).

### Change a price
1. Tap the price text (not labeled as tappable)
2. Clear and type new value
3. Tap Enter or tap away to confirm
4. Tap **Guardar cambios**

**4 interactions.** Acceptable. Blocked by discoverability of step 1.

---

### Upload a photo
1. Tap **Archivo** tab
2. Tap the upload area
3. Navigate iPhone photo library → select photo (2–3 taps depending on iOS version)
4. Wait for upload (no time estimate shown)
5. Tap Spanish caption field → type description
6. Tap English caption field → type description
7. Tap French caption field → type description
8. Tap **Sección de la web** dropdown → select section
9. Confirm **Imagen activa** toggle is on
10. Tap **Guardar cambios**

**10–12 interactions.** The most burdensome flow. Three language captions account for half the steps.

**Critical gap:** The image uploads to GitHub at step 4, before Guardar is tapped. If the owner closes the panel, loses connection, or gets interrupted between steps 4 and 10, the image file is permanently committed to the repo with no corresponding entry in venue.json. It becomes an orphaned file with no way to clean it up from the panel.

---

### Change opening hours
1. Tap **Horarios** tab
2. Find the right day (scroll if needed)
3. Toggle the day open/closed, or tap a time field and use the time picker
4. Tap **Guardar cambios**

**4–5 interactions.** Clean flow, no issues.

---

### Publish a notice
1. Tap **Aviso** tab
2. Toggle **Mostrar aviso en la web** on
3. Tap Spanish textarea → type the notice
4. Tap English textarea → type the notice
5. Tap French textarea → type the notice
6. (Optional) Tap date field → set expiry
7. Tap **Guardar cambios**

**7–9 interactions** plus typing in three languages. In practice the owner will skip English and French, which may produce a partial or invisible notice for non-Spanish visitors.

---

## 3. What actions are confusing?

**"Guardar cambios" saves everything, always**
The button at the bottom is global. It saves all changes across all five tabs in one commit. If the owner edits prices and also toggled the daily menu off, both go live together. There is no indication of what will be saved. If they made an accidental change on a tab they don't remember visiting, it goes live silently.

**"Archivo" vs internal name "Carioca"**
The tab is labeled "Archivo" (Archive) in the UI but referred to as "Carioca" in every error message, status message, and field label inside the tab. A confused owner searching for help or asking someone will get two different names for the same thing.

**Upload then save is two separate operations**
The photo goes to GitHub on upload. The caption and settings go to venue.json on Guardar. The owner has no reason to know these are different systems. If they see the upload success message and close the panel, they will believe the photo is live. It isn't.

**"Menú disponible hoy" toggle with no auto-off**
If the owner enables the daily menu toggle on Monday and forgets to turn it off, the website will show the same menu all week (and next week, and the week after). There is no expiry, no reminder, and nothing in the panel that shows the toggle is still on without navigating to that tab.

**All seven days of "Plato del día" are always visible**
The daily mains section shows Monday through Sunday as individual input fields simultaneously. To update today's main, the owner must scroll past or around six other days. There is no "today" emphasis.

**Date picker for aviso expiry has no default**
The field is blank by default. If the owner leaves it blank, the notice never expires. If they set a wrong date (e.g., a year in the future instead of next week), the notice stays up for a year. There is no visible "currently live until" summary.

---

## 4. What actions can accidentally break content?

**HIGH RISK — broken content goes live immediately:**

| Action | What breaks |
|--------|------------|
| Toggle aviso ON without filling text | Empty banner shows on all visitor language versions |
| Toggle menú ON without filling any fields | Empty daily menu section appears on the public site |
| Tap Guardar after accidentally editing a price | Wrong price goes live with no undo |
| Upload image → exit panel without saving | Orphaned image in repo forever; nothing changes on the site, but the file takes space |
| Leave menú toggle ON after service ends | Stale menu shows all week |
| Enter text in aviso but forget to toggle it ON | Owner thinks notice is live, it isn't |
| Enter text in aviso and toggle it ON, but leave en/fr blank | Spanish visitors see notice; others see nothing |

**MEDIUM RISK — causes confusion, not immediately visible:**

| Action | What breaks |
|--------|------------|
| Set aviso expiry to wrong year | Notice stays live far longer than intended |
| Remove all time periods for a day | Day may render as "no info" or "closed" depending on public site logic |
| Upload photo without setting "Sección de la web" correctly | Photo may appear in wrong section or nowhere |

---

## 5. What should be simplified before production?

These are concrete changes only — no architecture changes, no redesign.

---

### P0 — Breaks the most common scenario

**A. Add a post-upload reminder before Guardar**
When an image has been uploaded but Guardar has not been tapped, show a visible inline message:
> "Foto subida. Recuerda guardar los cambios para publicarla."

Place it directly above the Guardar button. Do not replace the current carioca-upload-status message — add a second persistent reminder in the save bar.

**B. Verify HEIC handling on real iPhone**
Open `/panel/` on an iPhone. Take a photo with the camera and try to upload it directly. If the HEIC rejection fires, change the error message from a technical rejection to:
> "Usa una foto de tu carrete (no de la cámara directamente). Toca 'Elegir foto' y selecciona desde el álbum."

Do not require the owner to understand what HEIC means.

---

### P1 — Causes real mistakes in daily use

**C. Show a deploy confirmation after Guardar**
After a successful save, replace "✓ Guardado" with:
> "✓ Guardado. Tu web se actualizará en unos 30 segundos."

Without this, the owner will check the site immediately, see no change, and assume something is broken.

**D. Add a price tap affordance**
In the rendered price rows, add a small pencil character or a faint underline to the price button. One character change in the `renderPrecios` function where `priceBtn.textContent` is set:
```
priceBtn.textContent = `${formattedPrice} ✏`;
```
Or add a CSS `cursor: pointer` and a visible border on hover/focus. The owner must be able to see that prices are editable.

**E. Warn before publishing an empty notice**
In the aviso save logic: if `aviso-active` is checked and `aviso-texto-es` is empty, show a confirmation:
> "El aviso está activado pero no tiene texto en español. ¿Quieres publicarlo igualmente?"

Do not block the save — just confirm intent.

**F. Warn if menú is toggled ON with empty content**
Same pattern as E. If `menu-active` is checked and starters, seconds, and desserts are all empty, show:
> "El menú del día está activado pero no tiene contenido. ¿Quieres publicarlo igualmente?"

---

### P2 — Reduces daily friction

**G. Make English/French notice fields optional with a fallback note**
Add a `<span class="field-hint">` under each non-Spanish field:
> "Si se deja vacío, se mostrará el texto en español."

This doesn't change behavior — it tells the owner what will happen so they can decide intentionally.

**H. Show only today's "Plato del día" field by default**
Determine the current day of the week in `app.js` and scroll to or visually highlight the matching `.menu-main-row`. All seven can remain visible, but add a label like "(hoy)" next to the current day. One line of JS to add a CSS class to the matching input.

**I. Make "Recordar este dispositivo" checked by default**
The PIN screen has the checkbox unchecked by default. A 65-year-old using this on their personal iPhone will always want the 30-day session. Change `<input type="checkbox" id="pin-remember-cb">` to `<input type="checkbox" id="pin-remember-cb" checked>`. Unchecking it is still possible for shared devices.

**J. Rename the "Archivo" tab to "Foto"**
"Archivo" means archive in Spanish. The tab's purpose is uploading a photo to display on the website. Change the tab label to "Foto" and update all internal labels and status messages from "Carioca" to the same term. This is a text-only change in index.html and app.js.

---

## Summary

The panel is well-structured for a developer and nearly functional for an owner. The gap is in the moments where the system does something the owner doesn't expect — uploads that happen before saving, toggles with no expiry, prices with no tap hint, and a save button with no confirmation of scope. None of these require architectural changes. They require small guardrails and one line of copy each.

The three-language requirement is the single biggest daily burden. It should be presented as optional-with-fallback, not as three equal required fields.

The HEIC issue must be verified on a real iPhone before launch. If it fires in the field, the owner will not be able to upload photos from their camera roll.
