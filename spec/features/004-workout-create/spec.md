# Spec — 004-workout-create

## Historia de usuario

Como usuario autenticado, quiero crear una rutina de entrenamiento compuesta por varios ejercicios (series, repeticiones y peso) para registrar mis sesiones.

## Alcance

### In scope
- Endpoint `POST /api/workouts` protegido con JWT (`authMiddleware`).
- Creación atómica de `Workout` + `WorkoutExercise[]` anidados vía Prisma.
- Validación estricta de items de ejercicio con Zod.
- Estado inicial `planned` (o el enviado), `completedAt` automático si nace completado.

### Out of scope
- Listado (005), actualización (006), borrado (007), agenda explícita (008).

## Requisitos

### Funcionales
- FR-1: Body `{ title, status?, scheduledAt?, notes?, exercises[{ exerciseId, sets, reps, weight? }] }` → 201 con la rutina y sus ejercicios.
- FR-2: `exerciseId` inexistente → error de clave foránea mapeado a 400 con mensaje claro.
- FR-3: Sin token / token inválido → 401.
- FR-4: Body inválido (0 ejercicios, sets < 1, weight < 0…) → 400 con issues.
- FR-5: La rutina queda ligada al usuario del token, nunca a un userId enviado por el cliente.

### No funcionales
- NFR-1: Máximo 30 ejercicios por rutina.
- NFR-2: Creación atómica (una sola operación anidada de Prisma).

## Contrato de API

```http
POST /api/workouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Push día A",
  "exercises": [
    { "exerciseId": 3, "sets": 4, "reps": 8, "weight": 60 },
    { "exerciseId": 7, "sets": 3, "reps": 12, "weight": 12 }
  ]
}
```

```jsonc
// 201
{ "success": true, "data": { "id": 10, "title": "Push día A", "status": "planned",
  "workoutExercises": [ { "id": 21, "exerciseId": 3, "sets": 4, "reps": 8, "weight": 60,
    "exercise": { "id": 3, "name": "Press banca", "muscleGroup": "chest" } } ] } }
```

## Criterios de aceptación

```gherkin
Given un usuario con token válido
When POST /api/workouts con 2 ejercicios existentes
Then responde 201 y en BD existen 1 Workout y 2 WorkoutExercise con position 0..n

Given el mismo endpoint sin Authorization
When POST
Then responde 401 y no se crea nada

Given exerciseId=9999 inexistente
When POST
Then responde 400/500 controlado con success:false y no queda Workout huérfano
```

## Métricas de éxito

- Volumen total de una rutina = Σ(sets×reps×weight) consistente para el reporte 009.
