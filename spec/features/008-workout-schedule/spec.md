# Spec — 008-workout-schedule

## Historia de usuario

Como usuario autenticado, quiero programar una de mis rutinas para una fecha y hora específicas para organizar mi semana de entrenamiento.

## Alcance

### In scope
- Endpoint `POST /api/workouts/:id/schedule` protegido con JWT.
- Fija `scheduledAt` (DateTime) sobre una rutina propia.
- Validación estricta ISO-8601 con offset.

### Out of scope
- Recurrencias semestrales/mensuales.
- Notificaciones o recordatorios.
- Reprogramación automática al completar.

## Requisitos

### Funcionales
- FR-1: Body `{ "scheduledAt": "2026-09-01T18:30:00Z" }` → 200 con la rutina actualizada.
- FR-2: Rutina inexistente o ajena → 404.
- FR-3: Fecha inválida o sin offset → 400 con issues.
- FR-4: Programar no altera `status`; completar la sesión es responsabilidad del usuario vía PATCH.

### No funcionales
- NFR-1: La fecha se almacena como DateTime UTC en Prisma.
- NFR-2: Índice en `scheduledAt` para consultas futuras de agenda.

## Contrato de API

```http
POST /api/workouts/10/schedule
Authorization: Bearer <token>
Content-Type: application/json

{ "scheduledAt": "2026-09-01T18:30:00Z" }
```

```jsonc
// 200
{ "success": true, "data": { "id": 10, "scheduledAt": "2026-09-01T18:30:00.000Z", ... } }
// 400 · 404
{ "success": false, "error": "..." }
```

## Criterios de aceptación

```gherkin
Given una rutina propia sin programar
When POST /:id/schedule con fecha válida
Then responde 200 y scheduledAt persiste en UTC

Given scheduledAt "2026-09-01 18:30" (sin offset)
When POST
Then responde 400 indicando el formato esperado
```

## Métricas de éxito

- Las rutinas programadas aparecen correctamente bajo filtros from/to del listado (005).
