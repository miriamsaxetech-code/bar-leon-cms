# Bar León CMS — Diseño de cierre

**Fecha:** 2026-08-05  
**Estado:** aprobado para implementación  
**Proyecto canónico:** `/Users/kokonvt/Projects/2_Clients/bar-leon-cms`

## Objetivo

Cerrar una versión publicable y mantenible de Bar León centrada en dos recorridos: consultar la carta desde un QR en un móvil y actualizar el contenido cotidiano desde el panel del propietario. La implementación conserva la arquitectura estática, los datos existentes y la identidad Fajalauza; no reconstruye el proyecto ni añade IA en producción.

## Fuente de verdad y restricciones

- `docs/BAR_LEON_CANONICAL.md` sigue siendo la fuente de verdad para identidad, tono, datos y división de CMS.
- `docs/BAR_LEON_DESIGN_RESET.md` gobierna el pase visual aprobado cuando no contradice el canon.
- No se inventan platos, precios, alérgenos, horarios, traducciones ni hechos históricos.
- No se ocultan masivamente los precios ya publicados solo porque `price_status` se inicializó como `pending`; se mantienen los datos actuales y se señalan en el panel hasta validación del propietario.
- Se preservan los cambios locales existentes. El pase CSS del 12 de julio se integra o ajusta; no se sobrescribe sin revisión.
- 21st.dev se usa únicamente para patrones de interacción. No se copia código, estilo, animación ni dependencia.

## Enfoque elegido

Se estabiliza la web actual con cambios pequeños sobre HTML, CSS y JavaScript nativos. Se conservan `data/venue.json`, las dos interfaces CMS y las Cloudflare Pages Functions. La carta, el panel y la portada comparten la misma fuente de datos y continúan desplegándose mediante GitHub y Cloudflare Pages.

Se descartan:

- un parche puramente cosmético que deje sin resolver la lectura móvil;
- una reconstrucción React/Next;
- componentes genéricos, glassmorphism, gradientes decorativos, animaciones de escaparate y estética de aplicación SaaS;
- IA generativa dentro del producto.

## Arquitectura y límites

### Web pública

- Las plantillas `es/index.html`, `en/index.html` y `fr/index.html` siguen cargando `js/homepage.js`.
- Las plantillas `es/carta.html`, `en/menu.html` y `fr/carte.html` siguen cargando `js/carta.js`.
- `css/style.css` mantiene el sistema visual compartido.
- `data/venue.json` continúa siendo la única base de contenido público.
- Se añade una ruta estable `/carta` que dirige a `/es/carta` para el QR.

### CMS

- `/panel/` conserva el PIN y sigue siendo la interfaz diaria del propietario.
- `/admin/` conserva Decap CMS para estructura, traducciones y edición técnica.
- `functions/admin-save.js` mantiene el bloqueo optimista mediante SHA y la respuesta 409.
- No se cambia el esquema de datos salvo que una prueba demuestre que un flujo crítico lo necesita.

## Diseño visual

La página utiliza cuatro colores: papel cálido, tinta, Azul Fajalauza y granada para precios. León Display se limita a identidad y títulos; Georgia se usa para lectura, controles y precios. No hay sombras ornamentales, grandes paneles oscuros ni tarjetas repetidas.

La fotografía sigue siendo documental y procede solo de assets locales verificados. No se genera ni retoca contenido con IA. Los motivos Fajalauza son detalles puntuales, no un patrón aplicado a cada bloque.

## Carta QR móvil

### Cabecera

- En 320 px deben caber volver, título y selector de idioma sin solaparse.
- La cabecera permanece corta y no compite con la carta.

### Navegación

- Las categorías se muestran en una fila horizontal táctil de al menos 44 px.
- La categoría activa usa fondo Azul Fajalauza y texto blanco.
- La fila queda fija al desplazarse y sincroniza el estado con la sección visible.
- El scroll horizontal es explícito y no corta silenciosamente la última categoría.

### Platos

- Los platos se muestran como filas planas, sin miniaturas.
- El orden visual es nombre, descripción breve y precio.
- El precio queda en su propia línea o columna segura, sin colisionar con nombres largos.
- En móvil se omiten chips y sugerencias que ralenticen la consulta principal. No se presentan alérgenos como confirmados mientras su estado siga pendiente.
- La carta debe conservar restaurante, barra, bebidas y menú del día sin perder acceso a vinos ni horarios.

### Acciones persistentes

- Una barra inferior muestra `Llamar`, `Horario` y `Arriba`.
- Los objetivos táctiles tienen al menos 48 px y respetan `env(safe-area-inset-bottom)`.
- No hay animaciones de etiquetas ni iconos dependientes de librerías.

## Portada

La portada se simplifica sin convertirse en un proyecto nuevo:

1. identidad y estado de apertura;
2. acciones principales con la carta en primer lugar;
3. selección breve de platos;
4. menú del día;
5. historia y fotografías documentales;
6. ubicación y horario;
7. pie con idiomas y acceso del propietario.

Se elimina espacio muerto, se limita cada viewport a un mensaje y se evita repetir contenido que ya vive en la carta. La carta queda accesible en un toque desde la portada y en una URL estable desde el QR.

## Panel del propietario

Se preservan los flujos ya implementados: PIN, recordar dispositivo, búsqueda, CRUD, horarios, menú diario, aviso, fotos, pizarra, validación, guardado, conflicto y deshacer.

El cierre se centra en verificar y completar:

- login correcto e incorrecto;
- sesión recordada y caducada;
- edición de precio y disponibilidad;
- bloqueo de un estado inválido;
- aviso o menú activo sin contenido;
- guardado satisfactorio y mensaje de despliegue;
- conflicto 409 sin sobrescritura;
- deshacer;
- carga de imagen no compatible con instrucción comprensible.

Los secretos de Cloudflare no se copian ni se simulan como si fueran producción. Las funciones se prueban con solicitudes y dependencias controladas; el recorrido real queda señalado como verificación operativa si el entorno conectado no está disponible.

## Manejo de errores

- Un fallo al cargar `venue.json` muestra un mensaje seguro y no deja un loader infinito.
- Las respuestas 401 devuelven al login sin perder claridad.
- Un 409 explica que el contenido cambió y bloquea la sobrescritura.
- Un error de red conserva el estado local para reintento.
- Los datos inválidos bloquean el guardado y enumeran el problema en español.
- Los enlaces, imágenes o recursos inexistentes se consideran fallos de verificación.

## Pruebas

Cada cambio de comportamiento sigue ciclo rojo-verde:

1. prueba que falla por la ausencia del comportamiento;
2. ejecución y confirmación del fallo esperado;
3. implementación mínima;
4. prueba verde;
5. ejecución de toda la suite.

La verificación final incluye:

- `node --test tests/*.test.mjs`;
- comprobación sintáctica de JavaScript;
- carga HTTP de todas las rutas;
- ausencia de errores de consola y respuestas 4xx/5xx;
- capturas y medidas en 320, 390, 768 y 1440 px;
- carta ES/EN/FR;
- panel en móvil;
- revisión de teclado, foco, tamaños táctiles y safe area.

## Uso de IA

No se añade ninguna función de IA a la web o al CMS. La IA solo se usa durante el trabajo para acelerar inventario, comparación visual y generación de casos de prueba que después se ejecutan de forma determinista. Esto reduce trabajo sin crear contenido inventado ni una dependencia de mantenimiento.

## Criterios de aceptación

- `/carta` ofrece una URL QR estable.
- La carta se consulta con una mano a 320–390 px y las acciones críticas permanecen accesibles.
- No hay solapamientos, texto cortado ni scroll horizontal de página.
- La estética coincide con Bar León: papel, tinta, Azul Fajalauza, granada, León Display y fotografía real.
- La portada llega a la carta en un toque.
- El panel mantiene y prueba sus flujos críticos sin perder datos ante errores o conflictos.
- ES, EN y FR cargan desde `venue.json`.
- Las pruebas, la sintaxis y la auditoría responsive finalizan sin fallos no documentados.
- El informe final diferencia con precisión cambios ejecutados, verificaciones realizadas y pendientes que requieren propietario, Cloudflare o GitHub.
