# Domain Transfer Checklist

> Use when connecting a custom domain to the Cloudflare Pages site,
> or when transferring an existing domain from another registrar.

---

## Option A — Domain already at Cloudflare (easiest)

If the domain is already managed in Cloudflare:

1. Cloudflare Dashboard → Pages → `{CF_PROJECT_NAME}`
2. "Custom domains" → "Set up a custom domain"
3. Enter the domain (e.g. `barnuevo.es`)
4. Cloudflare adds the DNS record automatically
5. SSL certificate issued automatically (5–15 min)
6. Verify: open the domain in browser — site loads over HTTPS

---

## Option B — Domain at another registrar, using Cloudflare DNS

If the domain is at GoDaddy, 1&1, Namecheap, etc.:

### Step 1 — Add domain to Cloudflare

1. Cloudflare Dashboard → "Add a site"
2. Enter the domain name
3. Choose Free plan
4. Cloudflare scans existing DNS records — review and confirm
5. Note the two Cloudflare nameservers assigned (e.g. `ada.ns.cloudflare.com`)

### Step 2 — Update nameservers at registrar

1. Log into the domain registrar account
2. Find DNS / Nameservers settings
3. Replace current nameservers with the two Cloudflare ones
4. Save — propagation takes 15 min to 48h

### Step 3 — Connect to Pages

1. Cloudflare Dashboard → Pages → `{CF_PROJECT_NAME}` → "Custom domains"
2. Add the domain
3. Cloudflare creates the CNAME automatically
4. SSL: issued automatically once DNS is active

---

## Option C — Domain at registrar, keep DNS there (CNAME only)

If the owner won't move nameservers to Cloudflare:

1. At the registrar, create a CNAME record:
   - Name: `@` or `www` (depending on what the registrar allows)
   - Value: `{CF_PROJECT_NAME}.pages.dev`
2. In Cloudflare Pages: add the custom domain
3. **Note:** Cloudflare's automatic SSL may not work — may need to use registrar's SSL

This is the least recommended option. Prefer Option A or B.

---

## SSL verification

After DNS is connected:

- Cloudflare Dashboard → SSL/TLS → Overview → Mode: **Full** (minimum) or **Full (Strict)**
- Edge Certificates → Universal SSL: Active
- Test: `https://{domain}` loads without certificate warning

---

## DNS propagation check

```
dig {domain} +short
# or online: whatsmydns.net
```

Expected: resolves to Cloudflare IP range (104.x.x.x or similar).

---

## Redirect www → root (or root → www)

If the owner wants `www.barnuevo.es` to redirect to `barnuevo.es`:

- Cloudflare Dashboard → Pages → Custom domains → add `www.barnuevo.es` as alias
- Cloudflare handles the redirect automatically

---

## Record of domain setup

| Field | Value |
|---|---|
| Domain | |
| Registrar | |
| DNS managed by | Cloudflare / Registrar |
| Nameservers updated | Yes / No / N/A |
| Custom domain in CF Pages | Yes / No |
| SSL mode | |
| SSL status | Active / Pending |
| Date completed | |
