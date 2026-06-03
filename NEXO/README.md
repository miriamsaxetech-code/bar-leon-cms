# NEXO — Bar León Context

Sistema de contexto persistente para el proyecto Bar León.
Generado: 2026-05-23

## Archivos

| Archivo | Contenido |
|---|---|
| `context/bar-leon-canonical.md` | Identidad fija: nombre, dirección, lema, tono, CTA, idiomas, secciones |
| `context/stack.md` | Arquitectura técnica activa, historial de versiones, por qué se descartó Next.js |
| `context/security.md` | Estado de seguridad, checklists, backup, riesgos aceptados |
| `context/legacy-decisions.md` | Decisiones anteriores vigentes, descartadas, y deuda técnica pendiente |
| `context/legacy-audit.md` | Qué rescatar, qué descartar, contradicciones, riesgos |

## Uso

Antes de cualquier iteración nueva: leer `legacy-decisions.md` y `legacy-audit.md`.
Antes de editar contenido: consultar `bar-leon-canonical.md` para reglas de escritura.
Antes de cambiar stack: consultar `stack.md` para entender por qué se tomaron las decisiones.

## Nota de migración

El proyecto migró de tres archivos separados (`data/es.json`, `data/en.json`, `data/fr.json`) a un único `data/venue.json` con contenido multilingüe inline (claves `es`/`en`/`fr` por campo). La corrección de `Albaycín → Albayzín` fue aplicada en la migración. Ver `context/stack.md` para la arquitectura actual.
