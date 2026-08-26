# Plan — 004-workout-create

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| Nested write de Prisma (`workoutExercises.create`) | transacción manual | Atómico y menos código |
| `position` derivada del índice del array | campo enviado por cliente | Orden determinista y estable |
| Ownership implícito desde JWT | aceptar userId en body | Imposibilidad de suplantación |

## Pasos de implementación

1. `middlewares/auth.middleware.js`: extrae Bearer, `verifyToken`, adjunta `req.user`.
2. `schemas/workout.schema.js`: `workoutExerciseSchema`, `createWorkoutSchema` (status enum default planned).
3. `models/workout.model.js`: `create(userId, dto)` con nested create e include de ejercicios.
4. `controllers/workout.controller.js`: `create`.
5. `routes/workout.routes.js`: `router.use(authMiddleware)` + `POST /`.

## Riesgos y mitigaciones

- **Riesgo**: FK inválida deja error crudo P2003. **Mitigación**: captura en controlador → 400 "Ejercicio inexistente".
- **Riesgo**: fechas inválidas en `scheduledAt`. **Mitigación**: Zod `z.string().datetime({offset:true})` + conversión a Date en modelo.

## Estrategia de verificación

- curl con token → 201; sin token → 401; ejercicio inexistente → error controlado.
