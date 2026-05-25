# NEXO — Operating System v1.0

> Sistema operativo para la creación de sitios web para locales de hostelería.
> Extraído del proyecto Bar León (Granada, 2025–2026).
> Stack: HTML/CSS/JS puro · Cloudflare Pages · Decap CMS · GitHub

---

## Principio rector

Un sitio de hostelería no es una tienda online ni una startup.
Es un documento institucional con precios, horarios y un número de teléfono.
El sistema no optimiza conversiones — documenta identidad.

**Filosofía inmutable:**
- Static-first. Sin framework, sin runtime, sin build en producción.
- Content-first. El menú y el horario son el producto.
- Owner-operable. El titular del local puede editar sin código.
- Deploy gratuito. Cloudflare Pages, sin servidor.

---

## Fases del sistema

```
1. INTAKE          → qué es el local, qué existe
2. RESEARCH        → datos verificados, historia, menú
3. CONTENT         → texto web, copy, traducciones
4. BUILD           → HTML/CSS/JS, estructura multilingüe
5. QA              → verificación funcional y editorial
6. SECURITY        → headers, CMS, robots, backup
7. LAUNCH          → deploy, DNS, smoke test
8. HANDOFF         → owner guide, CMS training
9. MAINTENANCE     → actualizaciones, backup mensual
```

---

## Fase 1 — Intake

**Agente:** ninguno (conversación directa con el cliente)
**Template:** `templates/venue-intake.md`
**Duración típica:** 30–60 min (presencial o WhatsApp)

### Inputs requeridos

- Nombre oficial del local
- Dirección completa
- Teléfono de contacto
- Horarios actuales
- Carta actual (PDF, foto, menú impreso, cualquier formato)
- Fotos disponibles (del local, del espacio, de la comida)
- Idiomas requeridos (mínimo ES)
- ¿Tiene dominio propio? ¿Hosting actual?
- ¿Hay CMS anterior? ¿Quién gestiona el contenido hoy?
- Fecha límite o urgencia

### Outputs

- `templates/client-brief.md` completado
- `data/VENUE_NAME/intake.md` con todos los datos brutos

### Validación

- [ ] Carta recibida en cualquier formato
- [ ] Teléfono verificado (llamada o WhatsApp)
- [ ] Al menos 2 fotos del local disponibles
- [ ] Horario semanal completo confirmado

---

## Fase 2 — Research

**Agente:** `agents/research-agent.md` + `agents/menu-extractor-agent.md`
**Duración típica:** 2–4 horas

### Inputs

- Resultado de Fase 1
- Carta en cualquier formato
- Fotos del local

### Proceso

1. Research-agent: historia, reseñas, contexto, Google Maps, prensa local
2. Menu-extractor-agent: extrae ítems verificados de la carta
3. Toda información no verificable → marcada `[POR CONFIRMAR]`
4. Nunca se inventa precio, plato, ni horario

### Outputs

- `data/{venue}/historia.es.json`
- `data/{venue}/carta.es.json`
- `data/{venue}/horarios.json`
- `data/{venue}/contact.json`
- `research/reseñas-summary.md` (trust signals para copy)

### Validación

- [ ] Cero datos inventados — todo verificado o marcado `[POR CONFIRMAR]`
- [ ] Precios del menú actuales (confirmar fecha fuente)
- [ ] Horario coincide con Google Maps o fuente directa
- [ ] Dirección verificada (formato consistente)

---

## Fase 3 — Content

**Agente:** `agents/webcopy-agent.md` + `agents/imageprompter-agent.md`
**Duración típica:** 2–3 horas

### Inputs

- Outputs de Fase 2
- Brief del cliente (tono, restricciones, preferencias)

### Proceso

1. Webcopy-agent: genera copy de inicio, descripción, tagline, footer
2. Imageprompter-agent: escribe prompts para fotos si no hay material real
3. Traducciones: EN y FR basadas en ES (primero ES, luego traducir)
4. Revisión humana antes de construir

### Outputs

- `data/{venue}/es.json` (completo, incluyendo `nav`, `inicio`, `menuDia`)
- `data/{venue}/en.json`
- `data/{venue}/fr.json`
- `assets/prompts/` (prompts de imagen si aplica)

### Regla de traducciones

- ES: generado con el cliente, tono local
- EN: traducción fluida, no literal
- FR: traducción fluida; horarios en formato `13h00–16h00`
- Precios: idénticos en los tres idiomas
- Nunca traducir nombres propios de platos tradicionales

### Validación

- [ ] `data/es.json` válido (JSON sin errores)
- [ ] `nav` object completo en los 3 idiomas
- [ ] Cero `[POR CONFIRMAR]` en campos visibles al público
- [ ] Revisión humana del copy ES antes de continuar

---

## Fase 4 — Build

**Agente:** `agents/builder-agent.md`
**Duración típica:** 4–8 horas (primera vez); 1–2 horas (con template NEXO)

### Inputs

- `data/{venue}/es.json`, `en.json`, `fr.json`
- `css/style.css` (sistema de diseño NEXO, ajustar por venue)
- `js/homepage.js`, `js/carta.js` (logic engines NEXO)
- Fotos del local

### Proceso

1. Copiar template NEXO base
2. Personalizar colores, tipografía si el local lo requiere
3. Adaptar copy y estructura si hay secciones adicionales
4. Añadir hero image
5. Configurar `admin/config.yml` con schema de la carta real
6. Configurar root `index.html` con language detector

### Outputs

```
{venue-slug}/
├── index.html
├── es/ en/ fr/
│   ├── index.html
│   └── carta.html / menu.html / carte.html
├── data/ es.json en.json fr.json
├── css/ style.css
├── js/ homepage.js carta.js
├── admin/ index.html config.yml
├── assets/images/
├── SECURITY.md
├── _headers
└── robots.txt
```

### Validación

- [ ] Servidor local levantado
- [ ] Los 3 idiomas cargan sin errores de consola
- [ ] Carta completa visible en los 3 idiomas
- [ ] Horarios correctos en los 3 idiomas
- [ ] Fallback hero funciona si no hay imagen
- [ ] CMS panel carga en `/admin/`

---

## Fase 5 — QA

**Agente:** `agents/qa-agent.md`
**Template:** `templates/qa-report.md`
**Duración típica:** 1–2 horas

### Proceso

Ver `checklists/pre-launch.md` completo.

Puntos críticos:
1. Language router (root → `/es/`, `/en/`, `/fr/`)
2. Fetch data funciona (HTTP 200 para los 3 JSON)
3. Menú completo sin items en `disponible: "NO"` que no deberían estar
4. Horarios: días cerrados marcados correctamente
5. CTA "Llamar" → `tel:` correcto
6. Sin consola errors
7. Mobile: readable, no overflow, CTA accesible

### Outputs

- `templates/qa-report.md` completado
- Lista de bugs encontrados y estado (resuelto / pendiente)

---

## Fase 6 — Security

**Agente:** `agents/security-agent.md`
**Checklist:** `checklists/security.md`

### Proceso

1. Verificar `_headers` en su lugar
2. Verificar `robots.txt` excluye `/admin/`
3. Verificar Decap con versión pinneada
4. Verificar que no hay secrets en código
5. Verificar HTTPS en Cloudflare (Full o Full Strict)
6. Añadir colaborador GitHub al repo (owner del local)

---

## Fase 7 — Launch

**Agente:** `agents/launch-manager-agent.md`
**Template:** `templates/deployment-report.md`
**Checklist:** `checklists/pre-launch.md`

### Secuencia exacta

```
1. git status → confirmar todo limpio
2. git add <specific files>
3. git commit -m "Launch: {venue} v1"
4. git push origin main
5. Cloudflare Pages → verificar build (no build command)
6. Verificar URL de producción (Cloudflare .pages.dev o dominio propio)
7. Smoke test: root → redirect, homepage ES, carta ES, admin panel
8. DNS: apuntar dominio a Cloudflare Pages (si tiene dominio propio)
9. SSL: confirmar modo Full en Cloudflare
10. Completar deployment-report.md
```

### Condición de abort

Si cualquier smoke test falla: no comunicar al cliente.
Usar `agents/quickfix-agent.md` para diagnóstico rápido.

---

## Fase 8 — Handoff

**Template:** `delivery/owner-guide.md`, `delivery/cms-usage-guide.md`
**Duración:** 30 min (llamada o presencial)

### Entregables al cliente

1. URL del sitio en producción
2. URL del panel CMS (`/admin/`)
3. Guía de uso del CMS (PDF o doc, en español)
4. Procedimiento de backup
5. Instrucciones de recuperación de versión anterior

### Condición de completado

- [ ] Owner abrió el CMS y guardó al menos un cambio
- [ ] Owner confirmó que el cambio aparece en la web
- [ ] Owner tiene las instrucciones guardadas

---

## Fase 9 — Maintenance

**Cadencia:** mensual (si se contrata) o a demanda

### Rutina mensual

- [ ] Abrir `/admin/` — confirmar que carga el login
- [ ] Verificar que carta en web coincide con datos del CMS
- [ ] Exportar `data/es.json` a Google Drive (backup)
- [ ] Revisar Cloudflare Analytics: errores 404, tráfico anómalo
- [ ] Verificar que las fotos cargan (no hay 404 en assets)

### Tipos de actualización frecuentes

| Tipo | Quién | Vía |
|---|---|---|
| Precio o disponibilidad | Owner | CMS |
| Horarios | Owner | CMS |
| Aviso especial | Owner | CMS |
| Nuevo plato | Owner o developer | CMS |
| Cambio de diseño | Developer | Código |
| Nueva sección | Developer | Código |
| Foto nueva | Owner o developer | GitHub o CMS (si assets configurado) |

---

## Handoff entre agentes — lógica

```
research-agent
  └── entrega: datos brutos verificados
      └── menu-extractor-agent
            └── entrega: carta.es.json estructurada
                └── webcopy-agent
                      └── entrega: es.json, en.json, fr.json
                          └── builder-agent
                                └── entrega: sitio completo local
                                    ├── qa-agent → informe QA
                                    └── security-agent
                                          └── launch-manager-agent
                                                └── handoff al owner
```

**Regla de escalation:** Si un agente encuentra datos ambiguos o faltantes, escala hacia atrás (al agente anterior o al cliente) antes de continuar. Nunca continúa con suposiciones.

---

## Variables del sistema por venue

| Variable | Descripción | Ejemplo Bar León |
|---|---|---|
| `VENUE_SLUG` | Identificador URL | `bar-leon` |
| `VENUE_NAME` | Nombre oficial | `Bar León` |
| `VENUE_FOUNDED` | Año de fundación | `1959` |
| `VENUE_ADDRESS` | Dirección completa | `C. Pan, 1 · Albayzín · 18010 Granada` |
| `VENUE_PHONE` | Teléfono | `+34 958 22 51 43` |
| `VENUE_PHONE_LINK` | Format tel: | `+34958225143` |
| `VENUE_COLOR_ACCENT` | Color institucional | `#7A1C1C` |
| `VENUE_LANG_PRIMARY` | Idioma principal | `es` |
| `VENUE_GITHUB_REPO` | Repo deploy | `miriamsaxetech-code/bar-leon-cms` |
| `VENUE_CLOUDFLARE_PROJECT` | Proyecto CF Pages | `bar-leon-cms` |

---

## Tiempos estimados por tipo de proyecto

| Tipo | Descripción | Tiempo total |
|---|---|---|
| Express | Carta + horarios + tel, 1 idioma | 8–12h |
| Estándar | Multilingüe ES/EN/FR + CMS | 16–24h |
| Completo | + Historia + Hemeroteca + Mapa | 30–40h |
| Con fotos | + Sesión fotográfica + edición | +8–16h |

**Nota:** Con templates NEXO maduros, Express puede bajar a 4–6h.
