# Feature 007 — workout-delete

## Explicación técnica

Borrado duro con ownership atómico.

- **`models/workout.model.js → removeOwned(id, userId)`**: usa `deleteMany({ where: { id, userId } })` y devuelve `count`. Al ser una única query condicionada por usuario se elimina la ventana TOCTOU entre "comprobar dueño" y "borrar".
- **`controllers/workout.controller.js → remove`**: `count === 0` → 404 (rutina inexistente o de otro usuario, mismo código); éxito → **204 No Content** sin cuerpo.
- **Cascade**: los `WorkoutExercise` hijos se eliminan automáticamente por `onDelete: Cascade`; los `Exercise` del catálogo nunca se borran (`Restrict`). Segundo DELETE sobre el mismo id → 404 (idempotente para el cliente).

### Ejemplo

```bash
curl -X DELETE http://localhost:3000/api/workouts/10 -H "Authorization: Bearer $TOKEN" -i
# HTTP/1.1 204 No Content
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(007-workout-delete)"
git revert <hash-del-commit>
```

⚠️ El borrado es irreversible: revertir el commit recupera el endpoint pero no las rutinas ya eliminadas. Restaurar desde backup si es crítico.

## Mensaje de commit exacto

```text
feat(007-workout-delete): endpoint DELETE /workouts/:id con ownership
```
