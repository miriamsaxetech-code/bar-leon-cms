# Bar León CMS — Claude Startup

## Read first

Before any work on this project, read:

```
docs/BAR_LEON_CANONICAL.md
```

This is the single source of truth for identity, voice, visual direction, typography, navigation, CMS rules, and commercial priorities.

If any other document contradicts the canonical: the canonical wins.

## Project rules

See `PROJECT_RULES.md` for the REUSE FIRST principle.

## CMS architecture

Two admin interfaces write to `data/venue.json`:
- `/panel/` — owner daily tasks
- `/admin/` — developer/schema changes

Do not use both simultaneously. See canonical §12 for full rules.

## Do not

- Invent menu items, prices, or historical facts
- Publish press mentions without a validated URL
- Add WhatsApp button to homepage
- Use luxury, tourism-cliché, or corporate language
