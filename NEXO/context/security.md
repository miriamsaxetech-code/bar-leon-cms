# Restaurante-Bar León — Security

**Estado: suficiente para producción.**

---

## Qué está activo (automático al desplegar)

- Headers de seguridad en toda la web via `_headers` (Cloudflare Pages)
- HTTPS forzado vía Cloudflare (HSTS: max-age=31536000; includeSubDomains)
- `/admin/` bloqueado para indexación (robots.txt + `X-Robots-Tag: noindex, nofollow`)
- Decap CMS con versión pinneada (3.0.0 desde unpkg) — no se auto-actualiza
- Sin secretos ni tokens en el código
- Sin backend propio — todo es estático

---

## Headers de seguridad por zona

**Rutas públicas (`/*`):**
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'
```

**Rutas admin (`/admin/*`):**
CSP más permisiva para soportar Decap CMS (unpkg CDN, GitHub OAuth, GitHub API, Google Fonts).
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://unpkg.com https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://github.com https://unpkg.com; frame-src https://github.com; frame-ancestors 'none'
```

---

## Protección del panel CMS

- Autenticación: GitHub OAuth (Decap CMS)
- Sin acceso al repo de GitHub → panel carga pero no funciona → no es un riesgo
- La URL pública de `/admin/` no es seguridad por oscuridad — es autenticación real
- Condición antes de publicar: la persona que use el CMS necesita cuenta GitHub con acceso de colaboradora al repo `miriamsaxetech-code/bar-leon-cms`

---

## Público vs privado

**Público (debe ser siempre accesible):**
- carta, precios, dirección, teléfono, horarios, contenido visible

**Privado (nunca exponer):**
- CMS (`/admin/`)
- credenciales o tokens
- notas internas o borradores
- prompts o instrucciones de agentes
- copias de seguridad

---

## Checklist antes de publicar

- [ ] Dominio con SSL en Cloudflare (modo Full o Full Strict)
- [ ] CMS probado en móvil: guardar cambio → verificar en web
- [ ] Confirmar que `/admin/` no aparece en búsquedas (esperar 24–48h)
- [ ] Colaboradora del repo añadida en GitHub si hay editor externo

---

## Checklist mensual

- [ ] Abrir `/admin/` y confirmar que pide login de GitHub
- [ ] Comprobar que la carta en web coincide con los datos del CMS
- [ ] Exportar `data/es.json` a Google Drive como copia de seguridad

---

## Backup y recuperación

Contenido vive en:
- `data/es.json` — español
- `data/en.json` — inglés
- `data/fr.json` — francés

Cada guardado en el CMS genera un commit en GitHub automáticamente.

Para recuperar versión anterior: GitHub → archivo → icono de reloj (History) → elegir versión → copiar y pegar.

---

## Riesgos residuales (aceptados)

| Riesgo | Por qué es aceptable |
|---|---|
| `/admin/` visible públicamente | Requiere GitHub OAuth — sin acceso al repo, es inaccesible |
| Decap carga desde unpkg CDN | Versión pinneada a 3.0.0, no se auto-actualiza |
| `data.json` duplicado en raíz | No lo usa ningún componente — archivar cuando convenga |
