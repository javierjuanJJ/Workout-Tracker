# Plan — 008-workout-schedule

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| POST /schedule en vez de PATCH genérico | sobrecargar PATCH | Intención explícita, schema propio, semántica de acción |
| Zod datetime con offset obligatorio | Date.parse permisivo | Evita ambigüedades de zona horaria |

## Pasos de implementación

1. `schemas/workout.schema.js`: `scheduleWorkoutSchema`.
2. `models/workout.model.js`: `schedule(id, isoDate)`.
3. `controllers/workout.controller.js`: `schedule` con ownership previo.
4. `routes/workout.routes.js`: `POST /:id/schedule`.

## Riesgos y mitigaciones

- **Riesgo**: fechas pasadas programadas. **Mitigación**: permitido (registro retrospectivo); validación de pasado queda para v2.

## Estrategia de verificación

- 200 con fecha persistida; 400 formato inválido; 404 ownership cruzado.
