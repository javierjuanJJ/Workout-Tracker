# Feature 004 — workout-create

## Explicación técnica

Núcleo del dominio: creación de rutinas compuestas.

- **`middlewares/auth.middleware.js`**: extrae `Authorization: Bearer`, verifica con `verifyToken` y adjunta `req.user = { id, email }`. Sin token o token inválido → 401 tipado.
- **`schemas/workout.schema.js`**: `workoutExerciseSchema` (`exerciseId` entero positivo, `sets` 1–50, `reps` 1–500, `weight` ≥0 default 0) y `createWorkoutSchema` (`title`, `notes?`, `status` enum default `planned`, `scheduledAt?` ISO-8601 con offset, `exercises` 1–30 items).
- **`models/workout.model.js → create`**: nested write de Prisma — una única operación atómica crea el `Workout` y sus `WorkoutExercise` con `position = índice del array`. Si `status:"completed"` fija `completedAt`.
- **`controllers/workout.controller.js → create`**: usa `req.user.id` (jamás un userId del cliente) y captura P2003 (FK inexistente) → 400 "algún exerciseId no existe".
- **`routes/workout.routes.js`**: `router.use(authMiddleware)` + `POST /` con validate(body).

Volumen de sesión derivable: `Σ(sets × reps × weight)` — contrato que consumirá el reporte 009.

### Ejemplo

```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Push día A","exercises":[{"exerciseId":3,"sets":4,"reps":8,"weight":60}]}'
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(004-workout-create)"
git revert <hash-del-commit>
```

Sin cambios de schema. Para limpiar rutinas de prueba: `DELETE FROM WorkoutExercise; DELETE FROM Workout;` o `npx prisma migrate reset --force`.

## Mensaje de commit exacto

```text
feat(004-workout-create): endpoint POST /workouts protegido con JWT
```
