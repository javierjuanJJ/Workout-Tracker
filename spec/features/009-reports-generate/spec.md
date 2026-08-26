# Spec — 009-reports-generate

## Historia de usuario

Como usuario autenticado, quiero obtener métricas de mi progreso (sesiones completadas, volumen total, desglose por grupo muscular) para medir mi evolución.

## Alcance

### In scope
- Endpoint `GET /api/reports/progress` protegido con JWT.
- Agregaciones sobre rutinas `completed` del usuario.
- Métricas: totales, promedios, desglose por grupo muscular y últimas sesiones.

### Out of scope
- Exportación CSV/PDF.
- Comparativas entre usuarios o rankings.
- Series temporales avanzadas por semana/mes (v2).

## Requisitos

### Funcionales
- FR-1: Respuesta incluye `totalCompletedWorkouts`, `totalVolumeKg`, `totalSets`, `totalReps`, `averageVolumePerSession`.
- FR-2: `byMuscleGroup[]` con `{ muscleGroup, sessions, sets, volumeKg }` ordenado por volumen desc.
- FR-3: `recentSessions[]` (últimas 10 completadas) con id, title, completedAt y volumen por sesión.
- FR-4: Usuario sin entrenamientos → 200 con todas las métricas en cero y arrays vacíos (no es error).
- FR-5: Solo computan datos del usuario autenticado; las rutinas `planned/cancelled` no suman volumen.

### No funcionales
- NFR-1: Volumen = Σ(sets × reps × weight) redondeado a 2 decimales.
- NFR-2: Cálculo en memoria a partir de una única consulta con include (dataset por usuario acotado); agregaciones SQL si crece.

## Contrato de API

```http
GET /api/reports/progress
Authorization: Bearer <token>
```

```jsonc
// 200
{ "success": true, "data": {
    "totalCompletedWorkouts": 12,
    "totalVolumeKg": 18450.5,
    "totalSets": 340,
    "totalReps": 2710,
    "averageVolumePerSession": 1537.54,
    "byMuscleGroup": [ { "muscleGroup": "chest", "sessions": 8, "sets": 96, "volumeKg": 6200.0 } ],
    "recentSessions": [ { "id": 10, "title": "Push día A", "completedAt": "...", "volumeKg": 2100.0 } ],
    "lastCompletedAt": "..." | null
} }
```

## Criterios de aceptación

```gherkin
Given un usuario con 3 rutinas completadas y 2 planificadas
When GET /api/reports/progress
Then totalCompletedWorkouts=3 y el volumen solo suma las completadas

Given un usuario nuevo sin rutinas
When GET /api/reports/progress
Then responde 200 con ceros y arrays vacíos

Given el endpoint sin token
When GET
Then responde 401
```

## Métricas de éxito

- Volumen del reporte coincide con Σ manual sobre datos sembrados en tests.
