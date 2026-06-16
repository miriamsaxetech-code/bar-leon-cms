# 1 Project identity

- Nombre consolidado: **Restaurante Bar León**.
- Posicionamiento consolidado: bar/restaurante tradicional de Granada, cocina andaluza, trayectoria familiar desde **1959**.
- Ubicación consolidada: **C. Pan, 1, Albayzín, 18010 Granada** (junto a Plaza Nueva).
- Idiomas disponibles en los repositorios: **ES, EN, FR**.
- Lema recurrente consolidado: “Desde 1959 en Granada”.

Fuentes principales:
- `/Users/kokonvt/Projects/Restaurante-Leon/src/content/es/site.json`
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/brand/brand.copy.json`
- `/Users/kokonvt/Projects/restaurante-bar-leon/02_DATA/historia.es.json`


# 2 Art direction

- Tono editorial consolidado: **sobrio, institucional, factual, frases cortas, sin copy promocional florido**.
- Principio visual consolidado (sistema más repetido en v1/v2): base clara + texto oscuro, jerarquía tipográfica, acento cálido controlado.
- Regla editorial consolidada: usar lenguaje de **cocina andaluza tradicional**; precios como dato, no como reclamo.
- Fotografía consolidada: documental, sin atrezzo, comida como se sirve realmente.

Convenciones editoriales (aplicadas para rebuild):
- Ortografía española correcta (tildes, signos, mayúsculas/minúsculas normativas).
- Comillas españolas o latinas de forma consistente para citas; evitar anglicismos innecesarios.
- CTA telefónica visible: **“Llamar”**.

Fuentes principales:
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/brand/brand.rules.md`
- `/Users/kokonvt/Projects/Restaurante-Leon/MASTER_BAR_LEON_SOURCE_OF_TRUTH.md`
- `/Users/kokonvt/Projects/restaurante-bar-leon/PROJECT_RULES.md`


# 3 Website structure

Arquitectura objetivo para reconstrucción (consolidada y depurada):
- Inicio
- Carta
- Galería
- Historia
- Hemeroteca
- Contacto
- Legal

Estructuras eliminadas por obsolescencia (no migrar como secciones independientes):
- `bodega`
- `maridaje` / `maridajes`
- `recomendaciones`

Nota de consolidación:
- Mantener maridajes como **dato interno** (campos de apoyo), no como IA principal de navegación.

Fuentes principales:
- `/Users/kokonvt/Projects/restaurante-bar-leon/05_BUILD/web/src/content/es/ui.json`
- `/Users/kokonvt/Projects/Restaurante-Leon/docs/HANDOFF_TO_CLAUDE.md`
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/content/data/pairings.json`


# 4 Historical narrative

Hechos históricos consolidados para publicar:
- Apertura en **1959**.
- Fundador mencionado: **Antonio León**.
- Continuidad familiar por generaciones.
- Vínculo fuerte con Semana Santa y tejido cofrade local.
- Calle Pan / Plaza Nueva como enclave histórico del negocio.

Hechos que aparecen en investigación pero requieren prudencia editorial (no convertir en “dato cerrado” sin verificación adicional):
- Fecha exacta (día/mes) de apertura.
- Detalle documental del local original “frente al actual”.
- Determinadas atribuciones de hermandades sin acta pública asociada en los repositorios.

Fuentes principales:
- `/Users/kokonvt/Projects/restaurante-bar-leon/deep-research-leon.md`
- `/Users/kokonvt/Projects/restaurante-bar-leon/deep-research-hemeroteca-leon.md`
- `/Users/kokonvt/Projects/Restaurante-Leon/src/content/es/site.json`


# 5 Sabores de Andalucía

Categoría consolidada: **Sabores de Andalucía**.

Platos presentes en datos consolidados:
- Tortilla del Sacromonte
- Callos
- Carne de monte (ciervo)
- Cordobés (carne en salsa)
- Riñones al Jerez
- Criadillas
- Sesos (en algunas fuentes como “Sesos” y en reglas de negocio solicitado como “sesos fritos”)
- Habas con jamón ibérico y huevo frito

Regla de destaque solicitada para rebuild (aplicar en UI):
- berenjenas con miel de caña
- tortilla de sacromonte
- callos
- zahacú
- flamenquín
- sesos fritos
- carne de monte
- cordobés

Estado de cobertura en repositorios (sin inventar):
- Confirmados de la lista en datos: tortilla de sacromonte, callos, flamenquín, sesos/sesos fritos (normalizado), carne de monte, cordobés, berenjenas (aparecen como berenjenas fritas).
- **No encontrado literalmente en los JSON/MD/TXT/CSV leídos:** `zahacú` y `berenjenas con miel de caña` como denominación exacta.

Fuentes principales:
- `/Users/kokonvt/Projects/Restaurante-Leon/src/content/es/site.json`
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/content/data/menu.es.json`
- `/Users/kokonvt/Projects/restaurante-bar-leon/02_DATA/sabores-andalucia.canonical.json`


# 6 Menu structured

Modelo de datos consolidado de carta:
- Secciones (`title`) con `items`.
- Ítems con `name`, `price` o `prices` (media/ración), ingredientes y, en algunos casos, alérgenos/recomendaciones.

Taxonomía consolidada para reconstrucción:
- Sabores de Andalucía
- Sopas y platos de cuchara
- Entrantes y raciones
- Frituras y pescados
- Carnes
- Huevos y tortillas
- Arroces
- Postres
- Vinos (Granada, Rioja, Ribera del Duero, Blancos)
- Cervezas y bebidas (cervezas, refrescos y aguas)

Reglas de implementación de menú:
- Consumir datos locales JSON; no inventar platos/precios.
- Mantener nota operativa de arroces: paellas por encargo y mínimo 2 raciones.
- Mantener menú del día (L-V, 13:00–16:00, 12,50 €, pan y postre incluidos, bebida aparte).

Fuentes principales:
- `/Users/kokonvt/Projects/Restaurante-Leon/src/content/es/site.json`
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/content/data/menu.es.json`
- `/Users/kokonvt/Projects/restaurante-bar-leon/02_DATA/carta.es.json`


# 7 Drinks

Regla obligatoria aplicada:
- Usar **nombres reales de producto** y catálogos de bebidas/vinos existentes en repositorio.

Conjunto consolidado de bebidas (ejemplos representativos presentes en datos):
- Generosos: Fino, Manzanilla, Amontillado, Oloroso, Pedro Ximénez.
- Vinos: Señorío de Nevada, Calvente Guindalera, Delirio, Muñana Rojo, Muñana 3 Cepas, Marqués de Cáceres (Crianza/Reserva), Protos Roble, Valdesantos Roble, Castillo de Aza Crianza, D.O. Rueda Verdejo, Yllera 5.5, Castillo de San Diego, Maestrante Semi.
- Cervezas: Cruzcampo, Heineken, Alhambra Reserva 1925, Águila, Águila sin filtrar, Voll-Damm (y en algunas fuentes Alhambra Especial, Radler, Tostada 0.0, etc.).
- Refrescos/aguas: Coca-Cola, Fanta, 7Up/Sprite (hay variación por fuente), Aquarius, Nestea, agua mineral.

Notas de consolidación:
- Existen discrepancias puntuales de precio/nombre entre repositorios; preservar trazabilidad por fuente.
- `pairings.json` usa IDs internos para recomendaciones; mapear siempre a nombre comercial visible.

Fuentes principales:
- `/Users/kokonvt/Projects/restaurante-bar-leon/02_DATA/bebidas.es.json`
- `/Users/kokonvt/Projects/restaurante-bar-leon/02_DATA/vinos.es.json`
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/content/data/pairings.json`
- `/Users/kokonvt/Projects/Restaurante-Leon/src/content/es/site.json`


# 8 Hemeroteca

Ejes hemerográficos consolidados para web:
- Historia del bar en prensa local (1959, continuidad familiar, enclave urbano).
- Vínculo cofrade (Semana Santa, Martes Santo, vida de hermandades).
- Cartelería y concurso/cultura visual del bar.

Datos estructurados disponibles en repositorio:
- `press_mentions` en `site.json` (actualmente con URLs vacías en algunos casos).
- Entradas de hemeroteca técnica/proyecto en `02_DATA/hemeroteca.es.json`.

Regla de publicación:
- No publicar enlaces de prensa sin URL validada.

Fuentes principales:
- `/Users/kokonvt/Projects/restaurante-bar-leon/deep-research-hemeroteca-leon.md`
- `/Users/kokonvt/Projects/restaurante-bar-leon/02_DATA/hemeroteca.es.json`
- `/Users/kokonvt/Projects/Restaurante-Leon/src/content/es/site.json`


# 9 Contact and logistics

Datos de contacto consolidados para rebuild:
- Dirección: **C. Pan, 1, Albayzín, 18010 Granada, España**.
- Teléfono base en datos históricos/proyecto: **(+34) 958 22 51 43**.
- Horario consolidado: L-D con miércoles cerrado; tramos comida/cena según JSON.

Reglas operativas obligatorias aplicadas (entrada del usuario):
- WhatsApp reservas: **+34 696 948 630 (Kakin)**.
- Botón de teléfono visible: **“Llamar”** (sin mostrar número en el botón).

Fuentes principales:
- `/Users/kokonvt/Projects/Restaurante-Leon/src/content/es/site.json`
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/content/data/site.es.json`
- `/Users/kokonvt/Projects/restaurante-bar-leon/PROJECT_RULES.md`


# 10 Asset inventory

Fuente maestra de inventario multimedia:
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/content/images.json`

Contenido consolidado del inventario:
- Metadatos por imagen: `src`, categoría, dimensiones, alt ES/EN/FR, nombre original.
- Categorías detectadas: `hero`, `gallery`, `menu`, `history`, `hemeroteca`.
- Colecciones listas para UI: `home`, `splash`, `menu`, `wines`, `historia`, `hemeroteca`, `gallery`.

Reglas de activos:
- Mantener convención de nombres en kebab-case para nuevas incorporaciones.
- Mantener alt text descriptivo y factual por idioma.
- No eliminar trazabilidad de nombre original al importar.

Fuentes principales:
- `/Users/kokonvt/Projects/Restaurante-Leon-V2/src/content/images.json`
- `/Users/kokonvt/Projects/restaurante-bar-leon/PROJECT_RULES.md`
