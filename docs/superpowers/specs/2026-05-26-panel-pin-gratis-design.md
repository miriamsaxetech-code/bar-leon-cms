# Panel gratis con PIN

## Objetivo

Hacer que el panel privado de Bar Leon sea facil para el uso diario del bar, sin depender de GitHub ni de servicios de pago para entrar. La entrada principal sera un PIN privado de 6 digitos con sesion recordada en el dispositivo. GitHub quedara como respaldo tecnico oculto.

El objetivo operativo es que una persona del bar pueda abrir el panel desde el movil, introducir el PIN y cambiar precios, avisos, horarios o fotos sin entender GitHub ni el CMS completo.

## Decision de login

El acceso principal sera:

- PIN de 6 digitos.
- Cookie de sesion segura tras introducir el PIN correcto.
- Duracion inicial de sesion: 30 dias.
- Logout visible en el panel.
- GitHub OAuth conservado como via tecnica de emergencia, no como llamada principal.

No se usara SMS ni WhatsApp OTP porque no son gratis de forma fiable. Tampoco se usara un PIN escrito en el frontend. El PIN real vivira como hash en variables secretas de Cloudflare y se comprobara en una Function.

## Seguridad

La solucion gratis debe evitar los fallos obvios:

- El PIN nunca se envia ni se guarda en `localStorage`.
- La sesion se guarda en cookie `HttpOnly`, `Secure` y `SameSite=Lax`.
- La cookie ira firmada con un secreto de Cloudflare para detectar manipulacion.
- El login tendra limite de intentos por IP o por ventana temporal.
- Los endpoints de guardado aceptaran una sesion valida del panel o el token GitHub actual.
- La respuesta de error no dira si el problema fue PIN incorrecto, sesion caducada o exceso de intentos, salvo en mensajes amigables de UI.

Cloudflare Turnstile queda fuera del primer corte para mantener el login gratis y simple. El formulario dejara espacio para anadirlo despues si los intentos automaticos se convierten en un problema.

## Flujo de usuario

1. El usuario abre `/panel/`.
2. Si no hay sesion, ve una pantalla limpia con marca Bar Leon y seis casillas de PIN.
3. Introduce el PIN y pulsa Entrar.
4. Si es correcto, el panel carga y muestra un resumen de "Hoy en la web".
5. Durante 30 dias, ese dispositivo entra directo salvo logout o expiracion.
6. Si el PIN falla, se muestra un mensaje breve y se permite reintentar dentro de los limites.

## Panel mas intuitivo

La pantalla inicial del panel debe priorizar acciones frecuentes en vez de listas largas:

- Estado rapido: aviso activo, menu del dia, guardado o cambios pendientes.
- Botones grandes: Menu del dia, Precios, Horarios, Fotos.
- Buscador de platos y bebidas dentro de Precios.
- Guardar cambios fijo y visible.
- Textos cortos, en lenguaje de bar, no tecnico.

La estructura actual por pestanas puede mantenerse internamente, pero el primer nivel debe sentirse como accesos rapidos para movil. Las secciones largas solo aparecen cuando el usuario entra a una tarea.

## Arquitectura

Se mantendra el stack actual: HTML, CSS, JS vanilla y Cloudflare Pages Functions.

Funciones nuevas o ajustadas:

- `/functions/panel-login`: recibe PIN, valida contra secreto/hash y crea cookie de sesion.
- `/functions/panel-session`: devuelve si hay sesion valida para que el frontend decida que pantalla mostrar.
- `/functions/panel-logout`: borra la cookie.
- `/functions/admin-save`: seguira aceptando GitHub, y ademas aceptara la cookie del panel.

Variables de entorno previstas:

- `PANEL_PIN_HASH`: hash del PIN privado.
- `PANEL_SESSION_SECRET`: secreto para firmar cookies.
- `PANEL_SESSION_DAYS`: opcional, por defecto 30.

Variables reservadas para una mejora futura con Turnstile:

- `TURNSTILE_SECRET_KEY`
- Site key publica en el frontend.

## Datos y compatibilidad

No cambia `data/venue.json`. El panel seguira cargando y guardando el mismo archivo. Este cambio afecta autenticacion y experiencia de edicion, no el modelo de datos del restaurante.

GitHub OAuth actual no se elimina. Se reducira su presencia visual en el panel, pero se conserva para soporte tecnico y recuperacion.

## Errores

Estados a cubrir:

- PIN incorrecto.
- Demasiados intentos.
- Sesion caducada.
- Error de red al iniciar sesion.
- Error al guardar cambios.
- Conflicto de guardado si `venue.json` cambio en GitHub desde la carga.

Los mensajes deben ser claros y no tecnicos. Ejemplo: "No se ha podido entrar. Revisa el PIN o espera un momento."

## Pruebas

Verificaciones minimas:

- Sin cookie, `/panel/` muestra pantalla de PIN.
- PIN correcto crea sesion y muestra el panel.
- PIN incorrecto no crea sesion.
- Logout elimina sesion.
- Una sesion valida permite guardar cambios.
- Sin sesion ni token GitHub, `admin-save` responde 401.
- GitHub OAuth sigue funcionando como respaldo.
- En movil, las acciones principales caben sin solaparse y el boton de guardar no tapa campos activos.

## Fuera de alcance

No se implementara en este corte:

- Envio de codigos por SMS o WhatsApp.
- Gestion visual de usuarios multiples.
- Recuperacion automatica de PIN por email.
- Cambio de PIN desde el propio panel.
- Migracion a framework o backend nuevo.
