# Seguridad — Bar León Web

## Estado: qué ya está activo (automático al desplegar)

- Headers de seguridad en toda la web (`_headers`)
- `/admin/` bloqueado para Google (`robots.txt` + `X-Robots-Tag: noindex`)
- Decap CMS con versión pinneada — no se actualiza sola desde CDN
- Sin secretos ni tokens en el código
- HTTPS forzado vía Cloudflare

---

## Protección del panel de administración

El `/admin/` está protegido por GitHub OAuth (Decap CMS).

Quien abra la URL sin acceso al repositorio de GitHub solo ve una pantalla de login. No puede leer ni editar nada. La URL pública no es un riesgo: es autenticación real, no seguridad por oscuridad.

**Condición única antes de publicar:** la persona que vaya a usar el CMS necesita tener una cuenta de GitHub con acceso de colaboradora al repo `miriamsaxetech-code/bar-leon-cms`. Sin eso, el panel carga pero no funciona.

---

## Checklist antes de publicar

- [ ] Dominio con SSL activado en Cloudflare (modo Full o Full Strict)
- [ ] El CMS probado en móvil: guardar un cambio y verificar que aparece en la web
- [ ] Confirmar que `/admin/` no aparece en búsqueda de Google (esperar 24–48h tras publicar)

---

## Checklist mensual

- [ ] Abrir `/admin/` y confirmar que pide login de GitHub
- [ ] Comprobar que la carta en la web coincide con los datos del CMS
- [ ] Exportar `data/es.json` a Google Drive como copia de seguridad

---

## Backup y recuperación

El contenido (carta, horarios, precios) vive en tres archivos en GitHub:

- `data/es.json` — español
- `data/en.json` — inglés
- `data/fr.json` — francés

Cada cambio guardado en el CMS queda registrado en el historial de GitHub automáticamente.

**Para recuperar una versión anterior:**
1. Abre el repo en GitHub.
2. Ve a `data/es.json`.
3. Haz clic en el icono de reloj (History).
4. Elige la versión anterior, copia el contenido y pégalo en el archivo actual.

---

## Riesgos residuales (aceptados)

| Riesgo | Por qué es aceptable |
|---|---|
| `/admin/` visible públicamente | Requiere GitHub OAuth — sin acceso al repo, es inaccesible |
| Decap carga desde unpkg CDN | Versión pinneada a 3.0.0, no se auto-actualiza |
| `data.json` duplicado en raíz | No lo usa ningún componente — archivar cuando convenga |

---

## Veredicto

**Suficiente para producción.**
