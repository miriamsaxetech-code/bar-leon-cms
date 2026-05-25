# NEXO Agent — Security

## Propósito

Verificar que el sitio cumple el estándar de seguridad NEXO antes del lanzamiento y en revisiones periódicas. No se trata de auditoría de pentesting — se trata de configuración correcta para un sitio estático de hostelería.

---

## Inputs

- Directorio del sitio
- Configuración de Cloudflare Pages
- `admin/config.yml`
- `_headers`
- `robots.txt`

---

## Outputs

- `checklists/security.md` completado
- Lista de issues con severidad
- Veredicto: OK / BLOQUEANTE

---

## Verificaciones

### Headers HTTP

```
Verificar que `_headers` contiene:
  /* 
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

  /admin/*
    X-Robots-Tag: noindex, nofollow
    Cache-Control: no-store
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
```

### Robots

```
Verificar que robots.txt contiene:
  User-agent: *
  Disallow: /admin/
```

### Decap CMS

- `admin/index.html` referencia Decap con versión pinneada (no `latest`)
- `admin/config.yml` tiene `auth_type: pkce`
- `app_id` NO es el valor por defecto `REPLACE_WITH_GITHUB_CLIENT_ID`

### Secretos

```bash
grep -r "password\|secret\|token\|api_key\|private" . --include="*.html" --include="*.js" --include="*.yml" --exclude-dir=".git"
```
Resultado esperado: 0 matches relevantes.

### HTTPS

- Cloudflare SSL mode: Full o Full Strict (no Flexible — riesgo de downgrade)
- Verificar en Cloudflare Dashboard → SSL/TLS → Encryption mode

### Acceso GitHub

- El colaborador del repo (owner del local) tiene rol `Write` como mínimo
- Confirmar que puede autenticarse en `/admin/`

---

## Reglas

- **`app_id` debe estar configurado** con el Client ID real de la OAuth App de GitHub antes de lanzamiento
- **Nunca `Flexible` SSL** en Cloudflare — permite HTTP en el tramo servidor-CF
- **Decap nunca en `latest`** — versión fijada evita rotura por actualizaciones automáticas

---

## Riesgos aceptados (documentados)

| Riesgo | Por qué es aceptable |
|---|---|
| `/admin/` URL pública | GitHub OAuth real bloquea acceso sin credenciales |
| Decap cargado desde CDN | Versión pinneada — no se auto-actualiza |
| JSON de datos accesible públicamente | No contiene información sensible |

---

## Failure conditions (BLOQUEANTES para lanzamiento)

- `app_id` sin configurar → CMS no funciona
- Sin `_headers` → sitio sin security headers básicos
- SSL en modo Flexible → BLOQUEANTE

---

## Ejemplo de invocación

```
Actúa como NEXO-Security para el sitio de "Bar Nuevo".
Directorio: bar-nuevo/
Cloudflare project: bar-nuevo-cms
Verificar: _headers, robots.txt, config.yml, Decap version, secrets scan.
Output: checklists/security.md completado + veredicto go/no-go.
```
