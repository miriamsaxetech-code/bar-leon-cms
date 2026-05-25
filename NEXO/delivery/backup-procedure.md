# Backup Procedure

> El sistema NEXO usa GitHub como backup natural de todo el contenido.
> Cada cambio guardado en el CMS genera un commit — el historial es el backup.

---

## Qué necesita backup

| Archivo | Contenido | Backup automático |
|---|---|---|
| `data/es.json` | Carta, horarios, menú del día en español | ✅ GitHub (cada commit) |
| `data/en.json` | Contenido en inglés | ✅ GitHub |
| `data/fr.json` | Contenido en francés | ✅ GitHub |
| `css/style.css` | Diseño | ✅ GitHub |
| `js/*.js` | Lógica del sitio | ✅ GitHub |
| `assets/images/` | Fotos | ✅ GitHub (si están en el repo) |
| `admin/config.yml` | Schema del CMS | ✅ GitHub |

**No hay base de datos. No hay servidor. Todo está en GitHub.**

---

## Backup mensual manual (recomendado)

Una vez al mes, el developer exporta `data/es.json` a Google Drive como copia externa:

1. Ir a `github.com/{REPO}/blob/main/data/es.json`
2. Hacer clic en "Raw"
3. Seleccionar todo el texto (Ctrl+A) y copiar
4. Abrir Google Drive → crear nuevo archivo de texto → pegar → guardar
5. Nombrar el archivo: `es-backup-YYYY-MM.json`

Esto protege contra pérdida accidental del repositorio entero (raro, pero posible).

---

## Recuperación desde historial de GitHub

Para restaurar cualquier versión anterior:

1. `github.com/{REPO}/commits/main` — ver todos los commits
2. Hacer clic en el commit deseado (fecha visible)
3. Navegar a `data/es.json` en ese estado
4. Copiar el contenido completo
5. Ir a la versión actual: `github.com/{REPO}/blob/main/data/es.json`
6. Hacer clic en el lápiz (editar)
7. Reemplazar todo el contenido con el copiado
8. Commit → "Commit directly to main"
9. Cloudflare re-despliega automáticamente

---

## Backup de Google Drive

El owner puede guardar una copia de la carta en cualquier momento:

1. Abrir la web en el navegador
2. Ir a la sección de carta
3. Hacer captura de pantalla o imprimir como PDF

Esto no es un backup técnico, pero sirve como referencia de lo que estaba publicado.

---

## ¿Qué NO está en GitHub?

- Analíticas de tráfico (están en Cloudflare Dashboard — no necesitan backup)
- Configuración de DNS (está en Cloudflare — no en GitHub)
- Cuentas de GitHub y Cloudflare (gestionar con contraseñas seguras + 2FA)

---

## Frecuencia recomendada

| Acción | Frecuencia | Responsable |
|---|---|---|
| Backup manual a Google Drive | Mensual | Developer |
| Verificar acceso al historial de GitHub | Trimestral | Developer |
| Verificar que el repo no está archivado/eliminado | Anual | Developer |
