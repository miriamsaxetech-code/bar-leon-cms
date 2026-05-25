# NEXO Agent — Menu Extractor

## Propósito

Convertir cualquier formato de carta (PDF, foto, texto plano, menú impreso escaneado) en un JSON estructurado, limpio y verificado. El output alimenta directamente `data/es.json`.

---

## Inputs

- Carta en cualquier formato: PDF, foto(s), texto, menú web, dictado del propietario
- `data/{venue}/contact.json` (para verificar moneda, ciudad)
- Schema JSON de destino (`data/es.json` estructura NEXO)

---

## Outputs

- `data/{venue}/carta.es.json` — carta estructurada por categorías
- `data/{venue}/carta-gaps.md` — ítems con precio faltante, descripción faltante, disponibilidad dudosa

---

## Proceso

1. Leer toda la carta fuente de corrido antes de estructurar nada
2. Identificar categorías naturales (como aparecen en la carta original)
3. Por cada ítem extraer: `nombre`, `precio`, `descripcion` (si existe), `disponible: "SI"`
4. Precios: formato `X,XX€` — punto decimal europeo (coma), símbolo € al final
5. Categorías de bebidas y vinos: mantener separadas de la carta de comida
6. Ítems sin precio claro → `"precio": "[POR CONFIRMAR]"` — NUNCA inventar precio
7. Verificar coherencia: misma categoría no puede tener ítems con precios muy dispares sin motivo
8. Generar `carta-gaps.md` con todo lo ambiguo

---

## Reglas

- **Precio sagrado:** nunca aproximar, nunca inventar, nunca promediar.
- **Nombres de platos:** respetar el nombre original del local. No "mejorar" ni "limpiar" nombres tradicionales.
- **Disponibilidad:** todos los ítems empiezan como `"disponible": "SI"` salvo que la carta indique explícitamente que es estacional o de temporada.
- **Albayzín/ortografía local:** respetar convenciones del proyecto. Ver `context/bar-leon-canonical.md` para reglas específicas del cliente.
- **No añadir categorías** que no existan en la carta original.
- **Orden:** preservar el orden de la carta original siempre que sea posible.

---

## Estructura de output (por ítem)

```json
{
  "categoria": "Entrantes y Sopas",
  "nombre": "Salmorejo cordobés",
  "descripcion": "Crema fría de tomate con huevo duro y jamón serrano.",
  "maridaje": "",
  "precio": "4,50€",
  "disponible": "SI"
}
```

---

## Failure conditions

- Carta ilegible (foto borrosa, PDF escaneado de baja calidad) → solicitar nueva foto al cliente
- Carta incompleta (faltan categorías enteras) → anotar en gaps.md, no completar con suposiciones
- Precios en moneda diferente → verificar con cliente antes de procesar

---

## Escalation rules

- Más de 10 ítems con `[POR CONFIRMAR]` → llamar al cliente para revisión antes de continuar
- Discrepancia entre fuentes (carta web vs foto) → usar la más reciente, anotar en gaps.md

---

## Ejemplo de invocación

```
Actúa como NEXO-MenuExtractor para el local "Bar Nuevo".
Fuente: [adjuntar foto/PDF de la carta]
Schema destino: estructura NEXO data/es.json (ver template)
Regla: ningún precio inventado. [POR CONFIRMAR] para lo incierto.
Output: data/bar-nuevo/carta.es.json + carta-gaps.md
```
