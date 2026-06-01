# Panel mobile-first CRUD design

## Goal

Turn the owner panel into a centered, mobile-first editor where the owner can manage all visible menu and site sections without touching JSON. The panel must support adding, editing, deleting, and activating/deactivating items across prices, dishes, wines, beverages, opening hours, daily menu entries, notices, and photos.

## Current context

The project is a static multilingual site backed by `data/venue.json`. The owner panel is plain HTML, CSS, and JavaScript with no build step:

- `panel/index.html` defines auth, tabs, forms, and the save bar.
- `panel/panel.css` is already mobile-first but current list layout is too long, narrow, and visually dense.
- `panel/app.js` loads `venue.json`, mutates the in-memory `state`, and saves the full JSON through `/admin-save`.
- Image upload uses `/upload-image` and creates new `state.cariocas` entries during save.

## UX principles

- The panel is designed first for phone screens.
- Main content is centered with a comfortable max width.
- Each tab uses compact sections and editable rows, not an endless raw list.
- Every collection section has an obvious `+ Añadir` action.
- Every editable item row has a delete action.
- Destructive actions require confirmation.
- The existing bottom save bar remains the publishing checkpoint.
- Empty sections show a useful empty state and an add button.

## Scope

### Prices, dishes, wines, and beverages

The current `Precios` tab becomes a general catalog editor.

It contains grouped sections:

- Platos
- Vinos
- Bebidas

Each section supports:

- Search/filter.
- Inline price editing.
- Add new item.
- Edit name in Spanish.
- Delete item.
- Activate/deactivate item where the underlying schema supports availability.

New items receive stable generated ids based on the Spanish name plus a timestamp suffix if needed. New text fields default to Spanish with empty English/French values. Existing multilingual fields are preserved.

### Opening hours

The existing hour editor is kept and visually polished:

- Each day is a centered card.
- Open/closed toggle remains.
- Existing add/remove period behavior remains.
- Empty open days get a default period when adding.

### Daily menu

The daily menu tab becomes a list editor instead of only textarea blocks.

Editable lists:

- Primeros
- Segundos
- Postres
- Optional seasonal notes
- Plato del día entries

Each list supports:

- Add item.
- Edit item text.
- Delete item.

For compatibility with the current public renderer, list values are serialized back into the current Spanish text fields using ` · ` separators unless the existing schema already stores a structured array for that field. Existing translation fallback behavior is preserved.

### Notice

The notice tab stays simple:

- Active toggle.
- ES/EN/FR text.
- Optional expiry date.

Only visual centering and spacing are changed in this pass.

### Photos / cariocas

The photo tab becomes a photo manager:

- Upload new photo.
- Caption ES/EN/FR.
- Context selector.
- Active toggle.
- List existing photos.
- Activate/deactivate existing photo.
- Delete existing photo from `venue.json`.

Deleting removes the entry from `state.cariocas`; it does not delete the already-uploaded image file from GitHub in this pass.

## Data flow

1. Load `/data/venue.json` into `state`.
2. Render each tab from `state`.
3. User edits mutate `state` only in memory.
4. `markDirty()` enables the save button.
5. On save:
   - Pending photo upload runs first.
   - Daily menu text fallback translations sync if needed.
   - Full `state` is posted to `/admin-save`.
6. Existing undo behavior remains.

## Error handling

- Empty required name when adding an item shows a visible panel error.
- Delete actions ask for confirmation.
- Failed save keeps local pending state and re-enables save.
- Failed image upload keeps the file selected and explains the failure.
- Generated ids avoid collisions against existing ids in the target collection.

## Accessibility

- Buttons use clear accessible labels.
- Add/delete controls are keyboard reachable.
- Tabs retain `role="tablist"` and `aria-selected`.
- Rows keep native inputs/buttons rather than custom div controls where possible.
- Touch targets stay at least 40px high.

## Visual design

- The auth screen stays centered.
- The app shell uses a centered column with max width around 520px.
- Header, tabs, content, and save bar align to the same column.
- Rows use compact white cards with light borders and 6-10px radius.
- Section headers include title, count, and add button.
- Delete actions use small icon/text buttons with a destructive color, not hidden gestures.

## Testing

Add focused tests around panel behavior without requiring a browser:

- Adding a dish appends to `state.dishes` with a generated id.
- Deleting a dish removes it from `state.dishes`.
- Adding/deleting wines and beverages mutates the correct collections.
- Daily menu list serialization preserves the public renderer format.
- Existing owner-panel tests still pass.

Manual verification:

- Start a local static server.
- Open `/panel/` on a narrow viewport.
- Check that each tab is centered and usable on mobile width.
- Add, edit, delete, and save-state behavior is reachable for every supported section.

## Out of scope

- Deleting uploaded image files from GitHub storage.
- Full multilingual editing for every catalog item.
- Large schema migration of `daily_menu` to structured arrays.
- Replacing the current no-build architecture.
- Server-side JSON schema validation.
