# NEXO — Security Checklist

> Venue: ________________  Fecha: ________________
> Completar antes de lanzamiento y en revisiones anuales.

---

## Headers HTTP

- [ ] `_headers` existe en raíz del proyecto
- [ ] `/*` bloque contiene: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] `/admin/*` bloque contiene: `X-Robots-Tag: noindex`, `Cache-Control: no-store`

Verificar en producción: `curl -I {URL}` y buscar los headers.

---

## Robots / indexación

- [ ] `robots.txt` existe en raíz
- [ ] Contiene `Disallow: /admin/`
- [ ] `/admin/` no aparece en Google Search Console (comprobar 48h post-launch)

---

## CMS

- [ ] `admin/index.html` referencia Decap con versión explícita (ej. `@3.0.0`, no `@latest`)
- [ ] `admin/config.yml` → `auth_type: pkce` (no client_secret)
- [ ] `app_id` configurado con Client ID real de la GitHub OAuth App
- [ ] GitHub OAuth App tiene Callback URL correcta (URL de producción + `/admin/`)

---

## Secretos y código

```bash
grep -rn "password\|secret\|token\|api_key\|private_key\|client_secret" . \
  --include="*.html" --include="*.js" --include="*.yml" --include="*.json" \
  --exclude-dir=".git" --exclude-dir="node_modules"
```
- [ ] Resultado: 0 matches relevantes

---

## HTTPS / SSL

- [ ] Cloudflare SSL/TLS → modo `Full` o `Full Strict` (nunca `Flexible`)
- [ ] Certificado válido (no expirado)
- [ ] HTTPS forzado en Cloudflare (SSL/TLS → Edge Certificates → Always Use HTTPS: ON)

---

## Acceso GitHub

- [ ] Solo las personas necesarias tienen acceso al repo
- [ ] Owner del local tiene acceso de `Write` (para CMS)
- [ ] No hay deploy keys innecesarias en el repo

---

## Resumen

| Área | Estado | Notas |
|---|---|---|
| Headers HTTP | OK / FAIL | |
| Robots | OK / FAIL | |
| CMS config | OK / FAIL | |
| Sin secretos | OK / FAIL | |
| HTTPS | OK / FAIL | |
| Acceso GitHub | OK / FAIL | |

**Veredicto:** OK para lanzamiento / BLOQUEANTE
