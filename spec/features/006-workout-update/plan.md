# Plan — 006-workout-update

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| Reemplazo completo del array exercises | diff por item | Simple, determinista; volumen de datos pequeño |
| Transacción `$transaction` | dos llamadas sueltas | Consistencia delete+insert |
| 404 para recursos ajenos | 403 | No revela existencia de ids de terceros |

## Pasos de implementación

1. `schemas/workout.schema.js`: `idParamSchema` (z.coerce.number) y `updateWorkoutSchema = createWorkoutSchema.partial().extend({ comment })`.
2. `models/workout.model.js`: `findByIdOwned(id,userId)` y `update(id,data,exercises?)` con transacción.
3. `controllers/workout.controller.js`: `update` con guard de ownership y auto-completedAt.
4. `routes/workout.routes.js`: `PATCH /:id` con validate(params)+validate(body).

## Riesgos y mitigaciones

- **Riesgo**: update vacío rompe Prisma. **Mitigación**: no-op controlado devolviendo la entidad.
- **Riesgo**: completedAt inconsistente al reabrir. **Mitigación**: al volver a planned/completed se recalcula; documentado.

## Estrategia de verificación

- PATCH parcial conserva campos; ownership cruzado da 404; transacción deja cero huérfanos.
