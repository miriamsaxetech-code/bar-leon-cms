# NEXO — Menu Extraction Template

> Completar durante el proceso de extracción de carta.
> Una fila por cada ítem. Copiar al formato JSON una vez verificado.
> Venue: ________________  Fuente: ________________  Fecha: ________________

---

## Categorías identificadas

_(Listar en el orden en que aparecen en la carta original)_

1. 
2. 
3. 
4. 
5. 
6. 

---

## Tabla de extracción

| # | Categoría | Nombre | Precio | Descripción | Disponible | Fuente |
|---|---|---|---|---|---|---|
| 1 | | | | | SI | carta PDF |
| 2 | | | | | SI | carta PDF |
| ... | | | | | | |

---

## Gaps de carta

_(Ítems con información incompleta — requieren confirmación)_

| Ítem | Campo faltante | Acción |
|---|---|---|
| | precio | Preguntar al cliente |
| | descripción | Opcional — dejar vacío |
| | disponible | Confirmar si es de temporada |

---

## Notas de extracción

- **Total ítems extraídos:**
- **Total categorías:**
- **Ítems con precio confirmado:**
- **Ítems con `[POR CONFIRMAR]`:**
- **Fecha de validez de los precios:**

---

## Verificación de formato

Antes de convertir a JSON, verificar:
- [ ] Todos los precios en formato `X,XX€` (coma decimal, € al final)
- [ ] Nombres de platos: capitalización correcta, nombres propios respetados
- [ ] Cero precios inventados
- [ ] Categorías de vino separadas de carta de comida
- [ ] `disponible: "SI"` en todos los ítems activos

---

## Ejemplo de output JSON correcto

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
