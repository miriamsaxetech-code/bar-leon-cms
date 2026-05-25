# CMS Usage Guide — Technical Reference

> For: Developer / advanced users
> System: Decap CMS 3.0.0 on GitHub backend

---

## Panel access

URL: `{PRODUCTION_URL}/admin/`

Authentication: GitHub OAuth (PKCE). The user must:
1. Have a GitHub account
2. Be added as a collaborator to the repo with `Write` role
3. Complete the one-time OAuth authorization flow

---

## What the CMS can edit

The CMS is scoped to `data/es.json` only. It controls:

| Section | Fields |
|---|---|
| Inicio | `titular`, `subtitulo`, `avisoEspecial` |
| Menú del Día | `disponible`, `dias`, `precio`, `condiciones` |
| Horarios | per-day: `dia`, `estado`, `detalle` |
| Carta | per-item: `categoria`, `nombre`, `descripcion`, `maridaje`, `precio`, `disponible` |

The CMS does **not** edit `data/en.json` or `data/fr.json`. Those are developer-managed.

---

## How a CMS save works

1. Owner edits a field and clicks "Publish"
2. Decap CMS makes a GitHub API call
3. GitHub creates a new commit on `main` with the updated `data/es.json`
4. Cloudflare Pages detects the push and re-serves the updated file
5. The updated file is live in 15–60 seconds (no build step)

---

## Adding a new menu item

1. Open "Carta, Menú y Horarios (Español)"
2. Scroll to "Carta" section
3. Click "Add carta +"
4. Fill: `categoria` (select from list), `nombre`, `descripcion`, `precio`, `disponible: Sí`
5. `maridaje` is optional — leave blank if not needed
6. Click "Publish"

**Important:** The `categoria` must exactly match one of the options defined in `admin/config.yml`. If the owner needs a new category, the developer must add it to `config.yml` first.

---

## Changing available categories

Categories are defined in `admin/config.yml` under the `categoria` widget's `options` list. To add or rename a category:

1. Edit `admin/config.yml`
2. Add the new option with `label` and `value` (must match exactly)
3. Also update `data/es.json` items that should use the new category
4. Commit and push — the CMS will reflect the change

---

## Decap version management

Current version: `3.0.0` (pinned in `admin/index.html`)

```html
<script src="https://unpkg.com/decap-cms@3.0.0/dist/decap-cms.js"></script>
```

To upgrade:
1. Check Decap changelog at decapcms.org/docs/
2. Test on a preview branch first
3. Update the version number in `admin/index.html`
4. Commit, push, verify the admin panel still loads and functions

**Never use `@latest`** — it would auto-update and potentially break the interface.

---

## GitHub OAuth App setup

For a new venue, create a GitHub OAuth App:

1. GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Application name: `Bar León CMS` (or venue name)
3. Homepage URL: `{PRODUCTION_URL}`
4. Authorization callback URL: `{PRODUCTION_URL}/admin/`
5. Copy the Client ID → paste into `admin/config.yml` as `app_id`
6. **No client secret needed** — PKCE auth doesn't use one

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Login loop | OAuth app callback URL wrong | Fix the callback URL in GitHub OAuth App settings |
| "Not authorized" | User not in repo collaborators | Add user to repo with Write role |
| Save doesn't create a commit | GitHub API error | Check repo settings; try again |
| Changes don't appear on site | Cloudflare build failed | Check CF Pages dashboard for build errors |
| CMS panel blank | Decap JS error | Check browser console; verify version URL loads |
