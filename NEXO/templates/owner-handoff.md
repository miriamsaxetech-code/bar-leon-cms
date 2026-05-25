# NEXO — Owner Handoff

> Venue: ________________  Fecha de entrega: ________________
> Developer: ________________  Owner: ________________

---

## Lo que se entrega hoy

| Recurso | Detalle |
|---|---|
| **Web en producción** | URL: |
| **Panel de administración** | URL: /admin/ |
| **Repositorio de código** | GitHub: |
| **Guía de uso del CMS** | Adjunta / enviada por WhatsApp |
| **Instrucciones de backup** | En guía de uso |

---

## Lo que el owner puede hacer desde hoy

Sin tocar código, desde el panel del CMS:

1. **Activar o desactivar el menú del día** → campo "¿Disponible hoy?"
2. **Cambiar precio del menú del día**
3. **Actualizar horarios de la semana**
4. **Ocultar un plato temporalmente** → campo "¿En carta hoy?" → No
5. **Añadir un aviso especial** (vacaciones, evento, cierre temporal)
6. **Cambiar precios** de cualquier plato

---

## Lo que el owner NO puede hacer desde el CMS

_(Requiere al developer)_

- Añadir una sección nueva (historia, mapa, galería)
- Cambiar los colores o la tipografía
- Añadir un idioma nuevo
- Cambiar la estructura de la carta
- Subir fotos al hero

---

## Acceso al CMS — pasos

1. Abrir `{URL}/admin/`
2. Hacer clic en "Login with GitHub"
3. Autorizar acceso (solo la primera vez)
4. Seleccionar "Carta, Menú y Horarios (Español)"
5. Editar el campo que quiera cambiar
6. Pulsar "Publicar" — el cambio aparece en la web en 30–60 segundos

---

## En caso de problema

**No aparece el cambio en la web:**
1. Esperar 2 minutos y recargar
2. Comprobar el historial de GitHub: `github.com/{REPO}/commits/main` — ¿hay un nuevo commit?
3. Si no hay commit: el cambio no se guardó. Volver a guardar.

**No puede acceder al CMS:**
1. Verificar que tiene cuenta de GitHub activa
2. Verificar que su usuario está como colaborador del repo
3. Contactar al developer

**La web no carga:**
1. Comprobar `github.com/miriamsaxetech-code/{venue-slug}-cms` — ¿el último commit tiene fallo?
2. Contactar al developer con captura de pantalla del error

---

## Backup — cómo recuperar una versión anterior

1. Ir a `github.com/{REPO}/blob/main/data/es.json`
2. Clic en el icono de reloj (History)
3. Elegir la versión correcta
4. Copiar todo el contenido
5. Pegar en el archivo actual (desde el editor o contactar al developer)

---

## Contacto del developer

- **Nombre:** Miriam Saxe-Coburgo
- **WhatsApp:** ________________
- **Email:** ________________
- **Horario de atención:** ________________

---

## Firma de recepción

El owner confirma que recibió acceso al sitio, al CMS, y a esta documentación:

- **Owner:** ________________  **Firma:** ________________  **Fecha:** ________________
