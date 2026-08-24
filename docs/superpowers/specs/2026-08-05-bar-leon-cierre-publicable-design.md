# Bar León — Cierre publicable

**Fecha:** 2026-08-05

**Estado:** diseño aprobado

**Objetivo:** dejar publicables hoy la portada esencial, la carta QR móvil y el panel del propietario, reutilizando la arquitectura actual.

## 1. Resultado esperado

Bar León se entrega como una web pequeña, clara y operativa. La portada convence, la carta permite elegir rápido y el panel permite mantener la información diaria sin tocar código.

Se considera terminado cuando:

- la portada y la carta funcionan en ES, EN y FR;
- la carta se abre en un máximo de dos acciones desde la portada;
- el QR se comprueba en un teléfono real;
- el propietario puede editar precios, disponibilidad, menú diario, horarios y avisos;
- los datos dudosos no se publican;
- las pruebas automáticas y la revisión responsive pasan;
- la versión desplegada se revisa en producción.

## 2. Alcance

### Incluido

1. Portada esencial.
2. Carta QR móvil.
3. Panel del propietario para las tareas diarias.
4. Revisión de accesibilidad, rendimiento, enlaces y datos publicados.
5. Despliegue y comprobación final.

### Fuera de alcance

- páginas independientes de Historia, Galería, Vinos y Contacto;
- una nueva arquitectura o framework;
- reestructurar `data/venue.json`;
- publicar precios, alérgenos o hechos históricos no confirmados;
- ampliar el CMS de desarrollador salvo lo imprescindible para evitar una incoherencia pública;
- incorporar imágenes generadas por IA.

## 3. Arquitectura

Se conserva el sistema existente:

- `data/venue.json` continúa como fuente única de contenido;
- `js/homepage.js` consume los datos de la portada;
- `js/carta.js` consume los datos de la carta;
- `/panel/` sigue siendo la interfaz del propietario;
- `/admin/` sigue reservado a cambios de esquema, traducciones y mantenimiento avanzado;
- las funciones de Cloudflare existentes mantienen autenticación, sesión, subida de imágenes y guardado.

La implementación será una extensión de las plantillas existentes. No se reconstruyen los renderizadores ni el CMS. Los cambios locales presentes al iniciar el trabajo se preservan y se revisan antes de modificar archivos coincidentes.

## 4. Portada esencial

Orden definitivo:

1. Cabecera: marca Bar León y selector ES · EN · FR.
2. Hero: fotografía real del panel Fajalauza, “Desde 1959 · Albayzín · Granada” y un único botón primario, “Ver la carta”.
3. Tres platos de la casa: fotografía, nombre y precio confirmado.
4. Menú del día: precio y horario visibles; detalle en acordeón.
5. Historia breve: “1959”, dos imágenes de archivo como máximo y tres frases.
6. Ubicación: dirección, horario del día y botón para abrir el mapa.
7. Pie: contacto, idiomas y acceso del propietario.

La portada no incorpora WhatsApp. La comida aparece antes que la historia y no se añaden secciones promocionales secundarias.

## 5. Carta QR móvil

La carta prioriza lectura y velocidad:

- cabecera de una línea con volver, “Carta” e idiomas;
- categorías en una fila horizontal fija, con área táctil mínima de 44 px;
- listas de platos planas, sin tarjetas ni miniaturas;
- cada plato muestra nombre, descripción breve y precio en líneas separadas cuando sea necesario;
- precios en una única posición y formato: `10,00 €` o `Media 7,50 € · Ración 10,00 €`;
- acciones inferiores fijas: Llamar, Horario y Arriba;
- cuerpo de al menos 17 px y botones de al menos 52 px;
- los alérgenos no se muestran hasta estar confirmados plato por plato.

Los artículos marcados como `price_status: "uncertain"`, con un conflicto documental conocido o con `available: false` permanecen ocultos. El valor heredado `pending` identifica precios aún no cotejados en bloque, pero no vacía por sí solo la carta que ya está publicada. Cualquier artículo nuevo nace no publicable hasta que su precio se revise. No se inventan sustitutos ni precios de referencia.

## 6. Panel del propietario

El panel cubre únicamente operaciones diarias:

- buscar platos y navegar por categorías;
- editar precio;
- activar o desactivar disponibilidad;
- marcar platos destacados;
- editar el menú diario;
- cambiar horarios y excepciones por fecha;
- publicar avisos con caducidad;
- subir las imágenes ya soportadas por el flujo existente.

Antes de guardar, el panel muestra un resumen de errores y bloquea estados inválidos. Conserva deshacer y restaurar, y trata un conflicto de versión como un error recuperable: no sobrescribe el contenido remoto y pide recargar los datos.

## 7. Sistema visual

La dirección aprobada es **Reset sobrio**.

### Colores

- blanco cálido `#FAF7EF`: fondo;
- tinta `#1C1A17`: texto;
- azul Fajalauza `#1D4D85`: identidad, enlaces, botones y estados activos;
- rojo granada `#A93226`: precios y marca de recomendado, exclusivamente.

No se emplean fondos oscuros, sombras decorativas ni colores adicionales.

### Tipografía

- León Display Bold: títulos, categorías y “1959”; nunca por debajo de 1.4 rem;
- Georgia: cuerpo, platos, precios, controles y botones.

### Componentes

- botón primario azul y botón secundario delineado;
- esquinas de 2 px;
- un solo estilo de tarjeta, reservado a archivo, menú diario y mapa;
- platos como filas, no tarjetas;
- un ramo Fajalauza estático bajo el hero y otro sobre el pie;
- marca de granada únicamente para platos recomendados.

### Fotografía

Se usan únicamente fotografías reales ya verificadas. La selección se limita a siete imágenes en todo el alcance: hero, tres platos, dos imágenes históricas y una imagen de fachada o ubicación. No se usan imágenes generadas ni reinterpretaciones documentales mediante IA.

## 8. Estados de error y degradación

- Si `venue.json` no carga, se conserva la cabecera, el teléfono y la dirección, y se muestra un aviso breve de indisponibilidad de la carta.
- Si faltan traducciones, no se mezcla contenido de idiomas silenciosamente; se usa el fallback ya definido y se registra la incidencia en revisión.
- Si un enlace de mapa o teléfono es inválido, la entrega queda bloqueada hasta corregirlo.
- Si no existe una imagen opcional, el bloque se adapta sin mostrar un marco vacío.
- Si el panel recibe un conflicto de guardado, conserva los cambios locales en memoria y evita sobrescribir el remoto.

## 9. Movimiento y accesibilidad

No se añade movimiento ornamental. Se permiten únicamente transiciones breves de color y una aparición discreta de la barra móvil. Con `prefers-reduced-motion`, las transiciones no esenciales quedan desactivadas.

La revisión incluye:

- navegación por teclado;
- foco visible;
- contraste de texto y controles;
- áreas táctiles;
- zoom del navegador;
- textos alternativos;
- orden semántico de títulos;
- comportamiento entre 320 px y escritorio.

## 10. Verificación y publicación

1. Ejecutar las pruebas existentes antes y después de los cambios.
2. Añadir pruebas específicas para la nueva estructura visual y los estados de datos.
3. Revisar portada y carta en 320, 390, 768 y 1440 px.
4. Probar el panel con edición, validación, deshacer y conflicto simulado.
5. Validar enlaces de teléfono, mapa e idiomas.
6. Comprobar que ningún artículo incierto, desactivado o con conflicto documental conocido se renderiza.
7. Desplegar mediante el flujo existente de Cloudflare.
8. Abrir la versión pública, recorrer los flujos críticos y probar el QR en un teléfono real.

## 11. Decisiones explícitas

- Se aplica el reset a las plantillas actuales; no se continúa el prototipo Fajalauza Vivo.
- Se prioriza carta QR, portada y panel sobre páginas secundarias.
- Se preserva el modelo de datos y la separación entre panel del propietario y CMS de desarrollador.
- Se oculta contenido dudoso en vez de completarlo por inferencia.
- La entrega incluye despliegue y revisión pública, no solo cambios locales.
