# Feature 009 — reports-generate

## Explicación técnica

Cierre analítico del ciclo: métricas de progreso real.

- **`models/report.model.js → progressSummary(userId)`**: una única consulta de rutinas `status:"completed"` del usuario con include anidado, seguida de reducción en memoria:
  - `totalVolumeKg = Σ(sets × reps × weight)` redondeado a 2 decimales (`round2`).
  - `byMuscleGroup`: Map agrupado por `exercise.muscleGroup` con sesiones únicas (Set de workoutId), sets y volumen; ordenado desc por volumen.
  - `recentSessions`: últimas 10 completadas con su volumen individual.
  - Usuario sin datos → 200 con ceros y arrays vacíos (no es error).
- **`controllers/report.controller.js → progress`** y **`routes/report.routes.js`**: `GET /api/reports/progress` protegido con `authMiddleware`.

Las rutinas `planned/cancelled` no suman volumen: el reporte mide ejecución real, no intención.

### Ejemplo

```bash
curl http://localhost:3000/api/reports/progress -H "Authorization: Bearer $TOKEN"
```

## Reversión (rollback)

```bash
git log --oneline --grep="feat(009-reports-generate)"
git revert <hash-del-commit>
```

Solo lectura; sin impacto en BD.

## Mensaje de commit exacto

```text
feat(009-reports-generate): endpoint GET /reports/progress con métricas
```
