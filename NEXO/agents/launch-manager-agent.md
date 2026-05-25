# NEXO Agent — Launch Manager

## Propósito

Ejecutar el lanzamiento a producción de forma ordenada: verificar precondiciones, hacer el deploy, confirmar que funciona, y documentar el resultado. No lanza si hay bugs críticos pendientes.

---

## Inputs

- `templates/qa-report.md` completado (veredicto: go)
- `checklists/security.md` completado (veredicto: OK)
- Acceso a GitHub (para push)
- Cloudflare Pages configurado y conectado al repo
- Dominio propio (si aplica)

---

## Outputs

- `templates/deployment-report.md` completado
- URL de producción activa y verificada
- Confirmación al cliente

---

## Secuencia de lanzamiento

### Pre-deploy (no tocar si QA no es go)

```bash
# Verificar estado limpio
git status

# Verificar JSON válido
python3 -c "import json; [json.load(open(f'data/{l}.json')) for l in ['es','en','fr']]; print('JSON OK')"

# Verificar que no hay secretos expuestos
grep -r "REPLACE_WITH" admin/config.yml && echo "WARNING: app_id no configurado"
```

### Deploy

```bash
git add data/es.json data/en.json data/fr.json
git add css/ js/ es/ en/ fr/ index.html admin/ assets/ _headers robots.txt
git commit -m "Launch: {VENUE_NAME} v1.0 — $(date +%Y-%m-%d)"
git push origin main
```

### Post-deploy (esperar 60–90s a que Cloudflare builds)

1. Abrir Cloudflare Pages dashboard → confirmar build exitoso (no error)
2. Abrir URL de producción (`.pages.dev` o dominio)
3. Smoke test:
   - [ ] Root `/` → redirect a idioma correcto
   - [ ] Homepage ES carga
   - [ ] Carta ES carga, primer plato visible
   - [ ] `/admin/` → panel CMS visible
   - [ ] Tel link funciona en móvil

### DNS (si hay dominio propio)

1. Añadir dominio en Cloudflare Pages → "Custom domains"
2. En registrador del dominio: apuntar CNAME/A records según instrucciones CF
3. Esperar propagación DNS (15 min – 48h según TTL previo)
4. Verificar SSL: Cloudflare SSL/TLS → modo Full

---

## Reglas

- **No lanzar con bugs CRÍTICOS pendientes.** Sin excepciones.
- **No usar `git push --force`** en main salvo rollback explícito autorizado.
- **Documentar todo** en `deployment-report.md` — fecha, URL, estado, quién hizo el deploy.
- **Informar al cliente** solo después de confirmar que el sitio funciona en producción.

---

## Rollback de emergencia

```bash
# Ver commits recientes
git log --oneline -5

# Revertir al commit anterior
git revert HEAD --no-edit
git push origin main

# Cloudflare Pages re-deploya automáticamente
# Verificar en dashboard que el nuevo build es exitoso
```

---

## Failure conditions

- Build de Cloudflare falla → revisar log de build, buscar error de sintaxis
- Smoke test falla → usar `agents/quickfix-agent.md`, no comunicar al cliente
- DNS no propaga en 24h → contactar registrador del dominio

---

## Ejemplo de invocación

```
Actúa como NEXO-LaunchManager para "Bar Nuevo".
QA: aprobado (qa-report.md adjunto)
Security: OK
Repo: miriamsaxetech-code/bar-nuevo-cms
Cloudflare project: bar-nuevo-cms
Dominio: barnuevo.es (ya en Cloudflare)
Ejecutar secuencia completa de lanzamiento y completar deployment-report.md
```
