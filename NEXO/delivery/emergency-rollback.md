# Emergency Rollback Instructions

> Use this when the site is broken and needs to be restored immediately.
> These instructions work without any local development environment.

---

## Scenario 1 — Bad content (wrong prices, deleted items, corrupted data)

The site loads but content is wrong. Fix via GitHub directly.

**Time to fix: 2–5 minutes.**

1. Go to `github.com/{REPO}/blob/main/data/es.json`
2. Click the clock icon → "History"
3. Find the last commit before the problem (check timestamps)
4. Click on that commit → click "Browse files"
5. Open `data/es.json` in the old state
6. Click the pencil icon (Edit) — GitHub will fork the file
7. Select all content, paste the old content
8. Click "Commit changes" → "Commit directly to main"
9. Cloudflare Pages re-deploys automatically in ~30–60 seconds
10. Verify the site shows correct content

---

## Scenario 2 — Cloudflare build failing

The site is down because a deploy failed.

**Time to fix: 3–10 minutes.**

1. Go to Cloudflare Dashboard → Pages → `{CF_PROJECT_NAME}`
2. Click on "Deployments"
3. Find the last **successful** deployment
4. Click "..." → "Rollback to this deployment"
5. Confirm the rollback
6. Verify the site is live again

This rolls back to the previous working version without touching the code.

---

## Scenario 3 — Site completely down (Cloudflare outage)

Check `status.cloudflare.com` first. If it's a Cloudflare incident, wait — nothing to do on our end.

If Cloudflare is fine but the site is down:
1. Check the domain DNS settings in Cloudflare Dashboard
2. Verify the CNAME still points to `{CF_PAGES_URL}.pages.dev`
3. Check SSL certificate status (SSL/TLS → Edge Certificates)

---

## Scenario 4 — CMS broken (can't edit content)

The site works but the owner can't edit via CMS.

1. Verify the owner's GitHub account has `Write` access to the repo
2. Verify `admin/config.yml` has the correct `app_id`
3. Verify the GitHub OAuth App callback URL matches production URL exactly
4. As a workaround: the developer can edit `data/es.json` directly on GitHub and commit

---

## Emergency contacts

| Role | Name | Contact |
|---|---|---|
| Developer | Miriam Saxe-Coburgo | ________________ |
| Cloudflare account | | ________________ |
| GitHub account | miriamsaxetech-code | ________________ |
| Domain registrar | | ________________ |

---

## What NOT to do in an emergency

- Do not delete the repository
- Do not force-push to main without understanding what you're reverting
- Do not change DNS records unless you know exactly what you're doing — a wrong DNS change can take 24–48h to propagate back
- Do not change the Cloudflare SSL mode to Flexible (security risk)
