# Plan — 007-workout-delete

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| `deleteMany({ where: { id, userId } })` | find + delete | Una sola query; ownership atómico sin TOCTOU |
| 204 sin cuerpo | 200 con mensaje | Convención REST estándar |
| Cascade por FK | borrado manual en transacción | El schema ya garantiza integridad |

## Pasos de implementación

1. `models/workout.model.js`: `removeOwned(id, userId)` devolviendo count.
2. `controllers/workout.controller.js`: `remove` (count=0 → 404).
3. `routes/workout.routes.js`: `DELETE /:id` con validate(params).

## Riesgos y mitigaciones

- **Riesgo**: borrado accidental irreversible. **Mitigación**: v2 soft-delete; documentado como limitación.

## Estrategia de verificación

- 204 propio · 404 ajeno · re-check en listado · conteo huérfanos = 0.
