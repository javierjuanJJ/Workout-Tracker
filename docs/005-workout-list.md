# Feature 005 — workout-list

## Explicación técnica

Listado seguro y filtrable de rutinas propias.

- **`schemas/workout.schema.js → listWorkoutsQuerySchema`**: `status?` (enum), `from?`/`to?` (datetime ISO), `sort` (`date_asc|date_desc`, default `date_desc`). Se valida con `validate(schema, 'query')` → resultado en `req.validatedQuery`.
- **`models/workout.model.js`**:
  - `buildDateFilter(from,to)`: genera `OR [{ scheduledAt: range }, { AND: [{ scheduledAt: null }, { createdAt: range }] }]` — el rango aplica a la fecha programada y, para sesiones sin agenda, a la fecha de creación (evita que rutinas no programadas "desaparezcan").
  - `listByUser`: `where.userId` obligatorio (aislamiento multiusuario), include anidado de `workoutExercises.exercise`, orden por `createdAt`.
- **`controllers/workout.controller.js → list`**: responde `{ success, data[], meta:{ count } }`.

Índices usados: `(userId, status)` para filtro principal, `scheduledAt` para rangos.

### Ejemplo

```bash
curl "http://localhost:3000/api/workouts?status=planned&from=2026-08-01T00:00:00Z&sort=date_asc" \
  -H "Authorization: Bearer $TOKEN"
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(005-workout-list)"
git revert <hash-del-commit>
```

Solo código de lectura; sin efectos en BD.

## Mensaje de commit exacto

```text
feat(005-workout-list): endpoint GET /workouts con filtros y orden
```
