# NEXO — CMS Checklist

> Venue: ________________  Fecha: ________________
> Verificar antes del lanzamiento y después de cualquier cambio en config.yml.

---

## Configuración

- [ ] `backend.name: github`
- [ ] `backend.repo`: correcto (`org/repo`)
- [ ] `backend.branch: main`
- [ ] `backend.auth_type: pkce`
- [ ] `backend.app_id`: configurado (no placeholder)
- [ ] `media_folder: assets/images`
- [ ] `public_folder: assets/images`

---

## Schema — colección bar_leon

- [ ] `file: data/es.json` (o el archivo correcto del venue)
- [ ] Campo `inicio` con subcampos: `titular`, `subtitulo`, `avisoEspecial`
- [ ] Campo `menuDia` con: `disponible` (select SI/NO), `dias`, `precio`, `condiciones`
- [ ] Campo `horarios` (lista) con: `dia`, `estado` (select), `detalle`
- [ ] Campo `carta` (lista) con: `categoria` (select), `nombre`, `descripcion`, `maridaje`, `precio`, `disponible` (select)
- [ ] Opciones del select `categoria` coinciden **exactamente** con las categorías en `data/es.json`

---

## Test funcional

- [ ] `/admin/` carga el panel Decap
- [ ] Login con GitHub funciona
- [ ] Se puede navegar a "Carta, Menú y Horarios (Español)"
- [ ] Se puede editar el campo "Frase principal" (titular de inicio)
- [ ] Se puede guardar — aparece commit en GitHub
- [ ] El cambio se refleja en la web en menos de 60 segundos

---

## Acceso owner

- [ ] Owner tiene cuenta GitHub activa
- [ ] Owner añadido como colaborador con rol `Write`
- [ ] Owner puede hacer login en `/admin/`
- [ ] Owner hizo al menos un cambio de prueba y lo verificó en la web

---

## Notas

---

**Firmado:** ________________  **Fecha:** ________________
