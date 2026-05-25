# NEXO Agent — Legacy Extractor

## Propósito

Cuando existe un proyecto anterior (web antigua, CMS previo, datos históricos, múltiples iteraciones), extraer todo lo rescatable antes de construir desde el template. Evita que decisiones y contenido válido se pierdan en cada iteración.

---

## Inputs

- Ruta(s) de proyectos anteriores del mismo venue
- Acceso a git history si existe
- Cualquier documentación previa (HANDOFF, MASTER, RESTART docs)
- Brief actual del venue

---

## Outputs

- `NEXO/context/legacy-decisions.md` — decisiones anteriores vigentes y descartadas
- `NEXO/context/legacy-audit.md` — qué rescatar, qué descartar, qué contradicciones
- `data/{venue}/rescued/` — archivos de datos recuperados de versiones anteriores
- `research/legacy-trust-signals.md` — trust signals encontrados en proyectos legacy

---

## Proceso

1. Listar todos los proyectos relacionados (`find ~ -name "*{venue}*" -type d`)
2. Para cada proyecto: identificar stack, fecha aproximada, estado
3. Leer docs clave (MASTER, HANDOFF, CLAUDE.md, PROJECT_RULES.md)
4. Extraer datos recuperables (JSON de carta, historia, contacto)
5. Identificar decisiones recurrentes → candidatas a "reglas del sistema"
6. Identificar contradicciones entre versiones → documentar y resolver
7. Identificar lo que se descartó y por qué → no reintroducir sin motivo
8. Compilar trust signals (lemas, claims, descripciones editoriales validadas)

---

## Señales de que algo merece rescatarse

- Aparece en más de una versión del proyecto
- Está en un documento etiquetado como "canónico", "final", o "master"
- Fue ratificado por el cliente (está en un commit de aprobación)
- Es un hecho factual verificable (fecha, dirección, teléfono)

## Señales de que algo debe descartarse

- Marcado `[POR CONFIRMAR]` y nunca actualizado
- Solo aparece en un branch nunca mergeado
- Contradice datos verificados en otra fuente
- Es un artefacto del framework descartado (TypeScript schema, Tailwind class)

---

## Reglas

- **No borrar archivos legacy.** Solo leer, extraer, documentar.
- **Nunca sobrescribir datos canónicos con datos legacy dudosos.**
- **Anotar la fuente** de cada dato rescatado (archivo, línea, fecha del commit).
- **Contradicciones:** documentar ambos lados; no resolver sin confirmación del cliente o fuente fiable.

---

## Failure conditions

- Datos legacy contradicen los datos actuales verificados → documentar, escalar al cliente para decisión
- No hay nada rescatable → documentar que se investigó y el resultado; continuar desde cero

---

## Ejemplo de invocación

```
Actúa como NEXO-LegacyExtractor para el venue "Bar León".
Proyectos previos a revisar:
  - /Projects/Restaurante-Leon/ (V1, Next.js)
  - /Projects/Restaurante-Leon-V2/ (V2, Next.js + Tailwind)
  - /Projects/restaurante-bar-leon/ (V3, Next.js App Router)
  - /Projects/bar-leon-clean/ (estático abandonado)
  - /Projects/bar-leon-cms/ (CMS anterior)
Output: legacy-decisions.md + legacy-audit.md + rescued/historia.es.json
```
