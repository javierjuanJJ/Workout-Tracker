# Feature 006 — workout-update

## Explicación técnica

Actualización parcial (PATCH) con validación `partial()` de Zod.

- **`schemas/workout.schema.js`**:
  - `idParamSchema`: `z.coerce.number().int().positive()` para el `:id` de la URL.
  - `updateWorkoutSchema = createWorkoutSchema.partial().extend({ comment })` — todos los campos opcionales + campo nuevo `comment` (≤1000 chars) para comentarios de sesión. El middleware aplica `.safeParse`, demostrando el patrón `partial().safeParse`.
- **`models/workout.model.js → update(id, data, exercises?)`**: dentro de `$transaction`: si llega `exercises`, borra los items previos (`deleteMany`) y recrea el array completo con posiciones nuevas; después aplica el patch con `update`. Si no hay cambios en columnas devuelve la entidad tal cual (no-op seguro).
- **`controllers/workout.controller.js → update`**: ownership previo con `findByIdOwned(id, req.user.id)`; ajeno/inexistente → 404 sin revelar existencia. Regla de estado: `status:"completed"` fija `completedAt=now()`; volver a otro estado lo resetea a null.

### Ejemplo

```bash
curl -X PATCH http://localhost:3000/api/workouts/10 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"completed","comment":"Subí 2.5kg en banca"}'
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(006-workout-update)"
git revert <hash-del-commit>
```

Sin migraciones. Los comentarios añadidos permanecen en BD (columna creada en 001); si se quiere limpiar: `UPDATE Workout SET comment = NULL;`.

## Mensaje de commit exacto

```text
feat(006-workout-update): endpoint PATCH /workouts/:id parcial con comentarios
```
