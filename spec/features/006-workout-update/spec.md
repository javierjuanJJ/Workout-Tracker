# Spec — 006-workout-update

## Historia de usuario

Como usuario autenticado, quiero modificar parcialmente una de mis rutinas (título, notas, estado, ejercicios) y añadir comentarios de sesión para corregir o cerrar mis entrenamientos.

## Alcance

### In scope
- Endpoint `PATCH /api/workouts/:id` protegido con JWT.
- Actualización parcial con `partial().safeParse`.
- Reemplazo atómico del set de ejercicios si se envía `exercises`.
- Campo `comment` para comentarios de sesión.
- `completedAt` automático al pasar a `completed`.

### Out of scope
- PATCH parcial sobre items individuales de WorkoutExercise (se reemplaza el array completo).
- Historial de comentarios (un solo campo comment).

## Requisitos

### Funcionales
- FR-1: Solo campos presentes en el body cambian; el resto permanece intacto.
- FR-2: Si llega `exercises`, se borran los WorkoutExercise previos y se insertan los nuevos en una transacción.
- FR-3: Rutina inexistente o ajena → 404 (sin revelar existencia).
- FR-4: `status:"completed"` fija `completedAt = now()` si no venía ya completada.
- FR-5: Body vacío `{}` es aceptado (no-op) devolviendo la rutina actual.
- FR-6: `comment` acepta texto libre ≤1000 chars.

### No funcionales
- NFR-1: Uso demostrativo de `updateWorkoutSchema = createWorkoutSchema.partial()`.
- NFR-2: `:id` validado como entero positivo vía schema de params.

## Contrato de API

```http
PATCH /api/workouts/10
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "completed", "comment": "Día fuerte, subí 2.5kg en banca" }
```

```jsonc
// 200
{ "success": true, "data": { "id": 10, "status": "completed",
  "comment": "Día fuerte, subí 2.5kg en banca", "completedAt": "...", "workoutExercises": [...] } }
// 404 · 400
{ "success": false, "error": "..." }
```

## Criterios de aceptación

```gherkin
Given una rutina propia con title "A"
When PATCH { title: "B", comment: "ok" }
Then responde 200 con title="B", comment="ok" y exercises intactos

Given la rutina de otro usuario
When PATCH sobre ese id
Then responde 404 y nada cambia

Given status planned
When PATCH { status: "completed" }
Then completedAt queda fijado automáticamente
```

## Métricas de éxito

- Ningún campo no enviado muta; transacción garantiza consistencia al reemplazar ejercicios.
