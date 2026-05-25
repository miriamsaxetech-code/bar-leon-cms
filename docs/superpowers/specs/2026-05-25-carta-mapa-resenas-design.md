# Carta, mapa y reseñas

## Objetivo

Reordenar la experiencia para que el visitante entienda rápido tres cosas: cómo llegar, cómo dejar una reseña positiva y qué carta quiere consultar. El tono debe ser granadino, con malafollá amable, gracia y salero, bajo el lema: "No se sienta cliente, somos amigos".

El nombre visible del local será "Restaurante Bar León".

## Tipografía

Se usarán las fuentes locales del proyecto:

- `Granaina Limpia` para el nombre principal y titulares donde convenga legibilidad.
- `Granaina Sucia` para detalles con sabor de pizarra o acento puntual, nunca para textos largos ni precios pequeños.

Playfair e Inter seguirán como apoyo si la lectura o los idiomas EN/FR lo piden. La prioridad es que el sitio parezca más Granada real y menos plantilla genérica.

## Logo

El león tendrá más presencia en la home con efecto wow sobrio:

- Logo grande como emblema editorial, en tinta negra o granate, integrado con el nombre "Restaurante Bar León".
- Aparición suave al cargar: fade y escala breve, sin 3D, brillos ni efectos de plantilla.
- Uso como marca de agua en Menú del día, con opacidad baja para no competir con el contenido.
- Sello pequeño en la cabecera de carta.

El logo debe sentirse como una marca antigua del local, no como decoración turística.

## Home

La home añadirá un bloque de ubicación con mapa embebido y enlaces claros a Google Maps. Junto al mapa irá una llamada a reseña positiva, con copy cercano y breve. El texto evitará explicaciones largas y no caerá en caricatura turística.

Copy base en español:

- Lema: "No se sienta cliente, somos amigos".
- Mapa: "Estamos en calle Pan, al lado de Plaza Nueva. Si se pierde aquí, ya es por gusto."
- Reseña: "Si ha comido a gusto, déjenos una reseña buena. Si no, nos lo dice en la barra y lo arreglamos como personas."

En inglés y francés se mantendrá un tono funcional y natural, sin traducir literalmente la malafollá.

## Carta

La carta tendrá una capa superior con tres secciones:

- Menú del día
- Restaurante
- Barra

El Menú del día queda separado de las cartas. Restaurante y Barra tendrán acordeones internos por categoría. En móvil, el selector superior será el acceso principal para elegir Barra o Restaurante sin tener que recorrer toda la página.

La foto aportada de la barra se usará como señal visual de la sección Barra.

## Datos

Se mantendrá `data/venue.json` como fuente principal. Para separar Barra y Restaurante, las categorías tendrán un campo `service` con valores `restaurant` o `bar`; Menú del día seguirá viviendo en `daily_menu`.

## UX y accesibilidad

Los acordeones deben funcionar con teclado, `aria-expanded` y estado visual claro. Debe poder enlazarse a horarios desde la home con `#hours`. El contenido importante no dependerá solo de imágenes.

## Pruebas

Verificar en navegador:

- Home carga mapa, enlace de cómo llegar y reseña.
- Carta muestra Menú del día separado.
- Móvil permite elegir Restaurante o Barra arriba.
- Acordeones abren y cierran con click y teclado.
- Español, inglés y francés no rompen la página.
