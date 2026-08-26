# Feature 008 — workout-schedule

## Explicación técnica

Agenda de entrenamientos.

- **Endpoint dedicado** `POST /api/workouts/:id/schedule` en lugar de sobrecargar PATCH: intención explícita, schema propio y semántica de acción.
- **`schemas/workout.schema.js → scheduleWorkoutSchema`**: `scheduledAt` obligatorio, ISO-8601 **con offset obligatorio** (`z.string().datetime({ offset: true })`) — rechaza `"2026-09-01 18:30"` con 400 e issues descriptivos.
- **`controllers/workout.controller.js → schedule`**: ownership previo (`findByIdOwned`) → 404 si no es propio; delega en el modelo.
- **`models/workout.model.js → schedule(id, isoDate)`**: `update({ data: { scheduledAt: new Date(isoDate) } })`; Prisma almacena DateTime UTC. No altera `status`.
- Sinergia con 005: las rutinas programadas entran en los filtros `from/to` vía la rama `scheduledAt` de `buildDateFilter`.

### Ejemplo

```bash
curl -X POST http://localhost:3000/api/workouts/10/schedule \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"scheduledAt":"2026-09-01T18:30:00Z"}'
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(008-workout-schedule)"
git revert <hash-del-commit>
```

Para limpiar agenda de prueba: `UPDATE Workout SET scheduledAt = NULL;`

## Mensaje de commit exacto

```text
feat(008-workout-schedule): endpoint POST /workouts/:id/schedule
```
