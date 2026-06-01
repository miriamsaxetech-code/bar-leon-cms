# Implementation Review — PIN Authentication System

**Date:** 2026-06-01
**Scope:** Replacement of GitHub OAuth with PIN-based auth in `/panel/`
**Files changed:** `functions/pin-login.js` (new), `functions/upload-image.js` (new), `functions/admin-save.js`, `panel/index.html`, `panel/app.js`, `panel/panel.css`

---

## 1. Why these changes were necessary

The custom admin panel (`/panel/`) previously required the bar owner to log in with a **GitHub account** via OAuth. This created a daily friction problem: the panel is used operationally to update prices, opening hours, and banner notices — tasks that happen from a phone, often quickly, and by a person with no reason to maintain a developer account.

The brainstorm concluded that a **6-digit PIN with device memory** (Option A) was the correct trade-off:

- Free (no SMS, no third-party auth service)
- Fast (no redirect, no popup)
- Sufficient for a single-operator context
- The GitHub account remains available as a technical fallback via Decap CMS (`/admin/`)

---

## 2. What problem they solve

| Problem | Solution |
|---|---|
| GitHub account required for daily ops | PIN entry replaces OAuth redirect |
| Repeated logins from the owner's phone | Device token stored in `localStorage` for 30 days |
| GitHub user token sent to browser for image uploads | Image uploads now proxied server-side via `functions/upload-image.js` |
| Token verification required a live GitHub API call | HMAC-signed token verified locally with `PANEL_SECRET` |

---

## 3. What existed before

| Mechanism | Before | After |
|---|---|---|
| Panel login | `functions/auth.js` → GitHub OAuth redirect | `functions/pin-login.js` → PIN |
| Token source | GitHub access token (from `callback.js`) | HMAC-SHA256 signed opaque token |
| Token storage | `sessionStorage` only (`gh_token`) | `localStorage` 30d (`panel_device_token`) or `sessionStorage` 4h (`panel_session_token`) |
| Token verification | Live call to `api.github.com/user` in `admin-save.js` | Signature + expiry checked locally with `PANEL_SECRET` |
| Image upload | Client called GitHub Contents API directly with user token | Client calls `functions/upload-image.js`; server calls GitHub with PAT |
| `functions/auth.js` | Used by both panel and Decap CMS | Now used only by Decap CMS (`/admin/`) |
| `functions/callback.js` | Served both flows | Now serves only Decap CMS |

The panel auth screen changed from a single "Entrar con GitHub" button to a 6-digit PIN input grid with a "Recordar este dispositivo 30 días" checkbox.

---

## 4. Security implications

### Improvements

- **Constant-time PIN comparison** in `pin-login.js` resists timing attacks that could reveal PIN characters via response latency.
- **GitHub PAT stays server-side.** Previously the user's GitHub token was used from the browser to call the GitHub API directly (image uploads). Now all GitHub API calls go through Cloudflare Functions using the server-held `GITHUB_TOKEN` PAT.
- **Token expiry enforced on every request.** `admin-save.js` and `upload-image.js` both verify the token's `exp` field before acting.
- **Stateless tokens.** The HMAC signature lets any Function instance verify a token without shared session state or a database.

### Remaining risks

**XSS token exposure.** Tokens are stored in `localStorage`, which is accessible to any JavaScript running on the same origin. The panel and public site share the same Cloudflare Pages domain. Mitigations: the panel renders no user-supplied HTML; Cloudflare security headers block inline scripts via CSP.

**No rate limiting on `/functions/pin-login`.** A 6-digit PIN has 1,000,000 combinations. Automated requests are not throttled in code. Mitigation: add a Cloudflare Rate Limiting rule (see §7). Cloudflare's WAF may provide partial protection, but it is not guaranteed.

**No server-side token revocation.** Issued tokens remain valid until expiry. Emergency revocation: rotate `PANEL_SECRET` in Cloudflare env vars — this invalidates all existing tokens, forcing all devices to re-authenticate.

**`callback.js` redirect validation gap.** The redirect URL check (`startsWith('/')` but not `//`) could be bypassed for open-redirect to a subdomain. Low severity: `callback.js` is now only invoked by Decap CMS, which always provides a relative return URL.

**Env var confidentiality.** `PANEL_PIN`, `PANEL_SECRET`, `GITHUB_TOKEN`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET` are Cloudflare environment variables — not in code, not in git history.

---

## 5. Cloudflare Pages requirements

### New env vars — must be added before deploying

| Variable | Purpose | How to generate |
|---|---|---|
| `PANEL_PIN` | 6-digit numeric PIN | Choose any 6 digits; set once |
| `PANEL_SECRET` | HMAC signing key | `openssl rand -hex 32` |

Add in: **Cloudflare Dashboard → Pages → bar-leon-cms → Settings → Environment variables**. Apply to Production (and Preview if testing).

### Existing env vars that remain required

| Variable | Used by | Notes |
|---|---|---|
| `GITHUB_TOKEN` | `admin-save.js`, `upload-image.js` | PAT with `repo` write scope |
| `GITHUB_CLIENT_ID` | `auth.js`, `callback.js` | Decap CMS only |
| `GITHUB_CLIENT_SECRET` | `callback.js` | Decap CMS only |

All five variables must be present for full functionality. Missing `PANEL_SECRET` causes `admin-save.js` to return 500 and block all saves. Missing `GITHUB_TOKEN` blocks image uploads and saves.

---

## 6. Rollback procedure

Rollback restores GitHub OAuth to the panel. The new files (`pin-login.js`, `upload-image.js`) are additive and do not need to be removed.

**Step 1 — Revert `functions/admin-save.js`**

Replace the `verifyPanelToken` function and the auth check block with the original GitHub user verification:

```js
const ghUser = await fetch('https://api.github.com/user', {
  headers: { 'Authorization': `Bearer ${userToken}`, 'User-Agent': 'bar-leon-cms' },
});
if (!ghUser.ok) return new Response('Token no válido', { status: 401 });
```

**Step 2 — Revert `panel/index.html`**

Replace the `<form id="pin-form">` block inside `#auth-screen` with:

```html
<button id="login-btn" class="btn btn--primary btn--full">
  Entrar con GitHub
</button>
```

**Step 3 — Revert `panel/app.js`**

- Restore `getToken/setToken/clearToken` to use `sessionStorage` with key `gh_token`
- Restore `showAuthScreen` to redirect to `/functions/auth?provider=github&state=return:/panel/`
- Restore `showPanel` to fetch `https://api.github.com/user` and display `u.login`
- Restore `uploadCariocaImage` to call the GitHub Contents API directly with the user token

**Step 4 — Redeploy**

Push the reverted files to `main`. Cloudflare Pages will redeploy automatically.

**Via git:**

```bash
git log --oneline -10                       # find the pre-PIN commit hash
git checkout <hash> -- panel/ functions/admin-save.js
git commit -m "revert: restore GitHub OAuth to panel"
git push
```

---

## 7. Remaining work

### High priority

**Rate limiting on `/functions/pin-login`**
Add a Cloudflare Rate Limiting rule: max 10 requests / 1 minute / IP to the path `/functions/pin-login`. No code change required — done entirely in the Cloudflare dashboard under Security → WAF → Rate limiting rules.

### Medium priority

**Update `SECURITY.md`**
The root `SECURITY.md` documents auth architecture and env var requirements. It predates the PIN system and still describes only GitHub OAuth for the panel. It should be updated to reflect the two-system auth model and list all five env vars.

**`callback.js` redirect validation**
Tighten the URL safety check to reject `//`-prefixed paths:
```js
if (!returnUrl.startsWith('/') || returnUrl.startsWith('//')) { /* reject */ }
```

### Low priority / operational notes

**PIN change procedure**
Update `PANEL_PIN` in Cloudflare env vars and redeploy (or trigger an env var update which redeploys automatically). No code change or UI needed.

**Emergency token revocation**
Rotate `PANEL_SECRET` in Cloudflare env vars. All existing device and session tokens become invalid immediately on next deploy.

**Uneditable fields in `venue.json`**
`chalkboard` and `service_mode` exist in `data/venue.json` but are not editable in the panel or Decap CMS. Tracked in `06-next-action.md`. Out of scope for this change.

---

## 8. Whether Decap CMS is still required

**Yes. Decap CMS (`/admin/`) remains active and serves a distinct role.**

The two systems are complementary, not redundant:

| Feature | Custom panel `/panel/` | Decap CMS `/admin/` |
|---|---|---|
| Auth | 6-digit PIN | GitHub OAuth |
| Daily ops: price, hours, notice | ✅ | ✓ (more complex UI) |
| Full menu editing (dishes, wines, categories) | ❌ | ✅ |
| Photo archive (cariocas) | ✅ upload only | ✅ full CRUD |
| `chalkboard`, `service_mode` fields | ❌ | ❌ (gap in both) |
| Structured forms with validation | ❌ | ✅ |
| Multilingual field editing | ❌ | ✅ |
| Live preview | ❌ | ✅ |
| Who uses it | Bar owner — daily | Technical admin — occasionally |

Both systems write to `data/venue.json` via the GitHub Contents API. Both use optimistic locking (SHA-based conflict detection). A simultaneous save from both would produce a 409 conflict, which the panel surfaces to the user. This is acceptable in a single-operator environment.

**Decap CMS is the tool for structural changes** (adding a dish, updating the wine list, editing multilingual descriptions). **The PIN panel is the tool for operational changes** (today's lunch price, a holiday closure notice, this week's hours). Removing either would create a gap the other cannot fill.
