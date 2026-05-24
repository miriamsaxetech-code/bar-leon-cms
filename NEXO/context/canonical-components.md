# Restaurante-Bar León Canonical Components

Fecha: 2026-05-23

Este documento define que patrones deben considerarse canonicos para Bar Leon tras revisar las iteraciones historicas. "Componente" aqui no significa React: significa bloque, patron, dato o convencion que debe sobrevivir en el sitio estatico actual.

## Regla principal

La implementacion canonica debe seguir siendo HTML/CSS/JS estatico. Si un componente historico solo existe como React, se conserva como idea de UX, no como codigo.

## Componentes canonicos actuales

### 1. Language Router

Archivo actual:

- `bar-leon-cms/index.html`

Responsabilidad:

- Detectar `navigator.language`.
- Redirigir a `/es/`, `/en/` o `/fr/`.
- Usar `es` como fallback.

Canonico porque:

- Es pequeno.
- No requiere middleware.
- Evita i18n framework.
- Todas las versiones convergieron en ES/EN/FR.

No ampliar a:

- geolocalizacion,
- cookies,
- selector modal,
- redireccion server-side.

### 2. Locale Shell Pages

Archivos actuales:

- `es/index.html`, `en/index.html`, `fr/index.html`.
- `es/carta.html`, `en/menu.html`, `fr/carte.html`.

Responsabilidad:

- Definir `lang`, metadata minima, fuentes, CSS y contenedor.
- Delegar contenido a JS + JSON.

Canonico porque:

- Rutas claras y estaticas.
- `hreflang` presente.
- Sin build step.

Estructura inestable:

- Si se anaden rutas nuevas, crece el mantenimiento. Evitar nuevas paginas hasta que el contenido este aprobado.

### 3. Masthead Rule

Clase:

- `.masthead-rule`

Responsabilidad:

- Linea granate superior de 2px.

Canonico porque:

- Aparece en sucesivas decisiones visuales.
- Aporta identidad sin decoracion excesiva.
- No complica layout.

### 4. Text Loader

Elemento:

- `#loader` con `Bar Le&oacute;n`.

Responsabilidad:

- Cubrir el breve fetch de JSON.
- Evitar flash de contenido incompleto.

Canonico porque:

- Es editorial, no spinner generico.
- Transicion minima.

Limite:

- Mantener fade simple; no anadir animaciones de marca.

### 5. Homepage Masthead

Origen actual:

- `js/homepage.js`.

Bloques:

- `site-name`.
- `site-location`.
- `site-nav`.
- `site-tagline`.
- aviso opcional.
- hero/fallback.
- footer compacto.

Canonico porque:

- Las iteraciones repetian una entrada editorial, no una landing comercial.
- El nombre del local y la ubicacion aparecen primero.
- La carta esta a un clic.

No cambiar a:

- hero full-screen,
- cards promocionales,
- claim de marketing,
- bloque de reservas complejo.

### 6. Primary Navigation

Actual:

- Carta / Horarios / Llamar.
- Menu / Hours / Call.
- Carte / Horaires / Appeler.

Canonico porque:

- Cubre los tres trabajos reales del usuario.
- Evita IA sobredimensionada.
- Sobrevivio a builds con muchas mas rutas.

No reintroducir:

- Galeria,
- Historia,
- Hemeroteca,
- Vinos,
- Legal,
- Reservas,
- Bodega,
- Maridajes,
- Recomendaciones.

Estas secciones pueden vivir como archivo o futuras iteraciones, no en nav actual.

### 7. Language Selector

Actual:

- ES / EN / FR con activo como texto y otros como links.

Canonico porque:

- Aparece en todos los builds maduros.
- Es comprensible y ligero.

Regla:

- Home cambia entre homepages.
- Carta cambia entre rutas equivalentes de carta.

### 8. Hero Frame With Fallback

Actual:

- `hero-frame`.
- Referencia `../assets/images/hero-bg.jpg`.
- Fallback textual si la imagen falla.

Canonico condicional:

- El marco puede ser canonico.
- La imagen no es canonica hasta que exista asset aprobado.

Accion pendiente:

- O aportar imagen documental real,
- o convertir el fallback en estado deliberado,
- o retirar referencia rota.

### 9. Carta Header

Actual:

- Back link a home.
- Nombre centrado.
- Selector idioma a la derecha.

Canonico porque:

- Resuelve orientacion sin nav compleja.
- Mantiene la carta como documento enfocado.

No ampliar a:

- hamburger,
- sticky category nav,
- buscador,
- filtros.

### 10. Menu del Dia Edict

Actual:

- `renderMenuDia`.
- `.edict`, `.edict-head`, `.edict-price`, `.edict-foot`.

Responsabilidad:

- Mostrar menu del dia solo si `menuDia.disponible === "SI"`.

Canonico porque:

- Sobrevivio como componente con personalidad.
- Comunica informacion operativa con tono de casa.
- Evita formato de card generica.

Datos canonicos minimos:

- disponibilidad,
- dias,
- precio,
- condiciones.

Riesgo:

- Las reglas de menu del dia historicas son mas detalladas que el JSON actual. No ampliar sin decision editorial.

### 11. Carta Grouping

Actual:

- Array plano `carta`.
- Agrupacion por `categoria` en JS.
- Categorias en mayusculas.

Canonico porque:

- Suficiente para Decap.
- Facil de editar.
- Evita schemas anidados complejos.

Categoria ES actual:

- `SABORES DE ANDALUCÍA`.
- `SOPAS Y PLATOS DE CUCHARA`.
- `ENTRANTES Y RACIONES`.
- `FRITURAS Y PESCADOS`.
- `CARNES`.
- `HUEVOS Y TORTILLAS`.
- `ARROCES`.
- `POSTRES`.

Inestable:

- EN/FR no tienen cobertura equivalente.
- Historicos incluian vinos y bebidas como secciones separadas.

### 12. Menu Item Row

Actual:

- `.check-row`.
- `.check-name`.
- `.check-leader`.
- `.check-price`.
- `.item-desc`.
- `.item-maridaje`.

Canonico porque:

- El patron "nombre ...... precio" aparece como decision persistente.
- Evoca carta impresa.
- Es denso y escaneable.

Mejora recomendada:

- Renderizar descripcion y sugerencia solo si existen.

No reintroducir:

- chips de alergenos,
- filtros,
- accordions,
- busqueda,
- notas enriquecidas generadas.

### 13. Horarios Anchor

Actual:

- Link desde home: `#horarios`.
- Carta renderiza `<div id="horarios">`.
- JS hace scroll suave si se abre con hash.

Canonico porque:

- Es una de las funcionalidades repetidas mas estables.
- Resuelve una necesidad real sin pagina de contacto.

Datos canonicos:

- Siete dias.
- `ABIERTO`, `CERRADO`, `CERRADO TARDE` como tokens internos.
- `detalle` como texto visible.

### 14. Footer CTA

Actual:

- Direccion/contexto.
- CTA full-width `Llamar`.
- Marca final `Bar Le&oacute;n`.

Canonico porque:

- Cierra carta con accion util.
- No introduce formularios ni reservas.

Regla:

- El canal canonico es telefono fijo salvo decision nueva.

### 15. Data Files

Actual:

- `data/es.json`.
- `data/en.json`.
- `data/fr.json`.

Schema canonico actual:

```json
{
  "inicio": {
    "titular": "",
    "subtitulo": "",
    "avisoEspecial": ""
  },
  "menuDia": {
    "disponible": "SI",
    "dias": "",
    "precio": "",
    "condiciones": ""
  },
  "horarios": [
    { "dia": "", "estado": "ABIERTO", "detalle": "" }
  ],
  "carta": [
    {
      "categoria": "",
      "nombre": "",
      "descripcion": "",
      "maridaje": "",
      "precio": "",
      "disponible": "SI"
    }
  ]
}
```

No canonico:

- root `data.json`.
- `nombreES` / `nombreEN`.
- `01_CONTENT` split files as production source.
- `02_DATA` nested schemas as production source.
- CSV template menu.

### 16. Decap CMS

Actual:

- `admin/index.html`.
- `admin/config.yml`.
- Decap 3.0.0 pinned.
- GitHub backend.

Canonico porque:

- Edicion sin framework.
- Historial Git automatico.
- Sin suscripcion nueva.

Inestable:

- Si el CMS debe editar EN/FR, el config actual esta incompleto.
- Si solo edita ES, docs deben decirlo claramente.

### 17. Security Headers

Actual:

- `_headers`.
- CSP publica estricta.
- CSP admin mas permisiva para Decap/GitHub.
- HSTS.
- `robots.txt`.

Canonico porque:

- Se ajusta a Cloudflare Pages.
- No requiere servidor.
- Protege `/admin/` de indexacion.

No hacer:

- No meter secretos en cliente.
- No confiar en ocultar `/admin/`.

## Trust signals canonicas

Mantener:

- `Bar León` como nombre claro.
- Plaza Nueva / Granada como contexto visible.
- Continuidad generacional.
- Telefono real.
- Horarios completos.
- Menu del dia con precio.
- Platos de casa: Tortilla del Sacromonte, Habas con jamon, Carne de monte, Riñones, Callos, Cordobes, Criadillas, Sesos.
- Vinos D.O. Granada como sugerencia cuando el dato este disponible.

Usar con cautela:

- 1959, Antonio Leon, cofradias, "No se sienta cliente, somos amigos" si se publica historia ampliada.
- Google reviews/rating, porque cambia y requiere mantenimiento.
- Maps iframe, porque historicamente quedo como placeholder.

Evitar:

- "joya escondida".
- "experiencia autentica".
- "viaje culinario".
- "gastro".
- claims turisticos no documentados.

## Patrones intencionales

Intencionales y canonicos:

- Densidad sobre aire excesivo.
- Editorial sobre promocional.
- Papel/tinta/granate.
- Tipografia serif para identidad.
- Sin border-radius en CTA.
- Sin tarjetas flotantes.
- Sin gradientes.
- Sin animacion salvo loader.
- Sin framework.
- Sin tracking por defecto.

Accidentales o inestables:

- Direccion reducida a `Plaza Nueva` sin direccion postal.
- Hero image ausente.
- EN/FR incompletos.
- `data.json` legacy.
- Diferencia entre `bar-leon-cms-standalone` y copia actual.
- CMS docs mas amplias que config real.

## Decision final

El sistema canonico no es una coleccion de todos los componentes historicos. Es el subconjunto que sobrevivio por necesidad:

- entrar,
- entender que lugar es,
- ver carta/menu,
- comprobar horarios,
- llamar,
- cambiar idioma,
- editar contenido sin romper el sitio.

Todo lo demas queda como archivo o futura mejora solo si existe contenido aprobado y mantenimiento claro.

