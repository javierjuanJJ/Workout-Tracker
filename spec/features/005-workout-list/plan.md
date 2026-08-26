# Plan — 005-workout-list

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| Fallback de rango scheduledAt→createdAt con OR | filtrar solo createdAt | La agenda (008) fija scheduledAt; sin fallback esas rutinas "desaparecerían" del rango |
| Orden por createdAt | orden por scheduledAt | Estable aunque se reprograme la sesión |
| Validación de query con validate(schema,'query') | parse manual | Mismo mecanismo uniforme de errores 400 |

## Pasos de implementación

1. `schemas/workout.schema.js`: `listWorkoutsQuerySchema` (status/from/to/sort).
2. `models/workout.model.js`: `buildDateFilter(from,to)` + `listByUser(userId, filters)` con include.
3. `controllers/workout.controller.js`: `list` leyendo `req.validatedQuery`.
4. `routes/workout.routes.js`: `GET /` con `validate(listWorkoutsQuerySchema, 'query')`.

## Riesgos y mitigaciones

- **Riesgo**: fechas inválidas en query → crash. **Mitigación**: datetime Zod + 400.
- **Riesgo**: listado masivo. **Mitigación**: v2 paginación; conteo incluido en meta.

## Estrategia de verificación

- Dos usuarios aislados; filtros combinados status+from+to; ambos órdenes.
