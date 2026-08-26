# Spec — 005-workout-list

## Historia de usuario

Como usuario autenticado, quiero listar mis rutinas filtrándolas por estado y rango de fechas, ordenadas ascendentemente o descendentes, para revisar mi histórico y mi agenda.

## Alcance

### In scope
- Endpoint `GET /api/workouts` protegido con JWT.
- Filtro por `status`, rango temporal `from`/`to` y orden `date_asc|date_desc`.
- Regla de fecha: el rango aplica a `scheduledAt`; entrenamientos sin programar se comparan por `createdAt`.
- Respuesta con metadatos de conteo.

### Out of scope
- Paginación cursor/offset (v2).
- Búsqueda por texto.

## Requisitos

### Funcionales
- FR-1: Devuelve únicamente rutinas del usuario del token (aislamiento por userId).
- FR-2: `?status=completed` filtra por estado exacto; valor fuera del enum → 400.
- FR-3: `?from=ISO&to=ISO` acota por fecha (regla scheduledAt→createdAt fallback).
- FR-4: `?sort=date_asc|date_desc` ordena por `createdAt` (default date_desc).
- FR-5: Cada rutina incluye sus `workoutExercises` con el ejercicio anidado.

### No funcionales
- NFR-1: Índices `(userId, status)` y `(scheduledAt)` en BD.
- NFR-2: Query params validados con Zod (`safeParse`) antes de tocar el modelo.

## Contrato de API

```http
GET /api/workouts?status=planned&from=2026-08-01T00:00:00Z&sort=date_asc
Authorization: Bearer <token>
```

```jsonc
// 200
{ "success": true, "data": [ { "id": 10, "title": "Push día A", "status": "planned",
    "scheduledAt": null, "workoutExercises": [ ... ] } ],
  "meta": { "count": 1 } }
```

## Criterios de aceptación

```gherkin
Given dos usuarios con una rutina cada uno
When el usuario A lista sus rutinas
Then solo ve la suya (count=1) sin fugas del usuario B

Given rutinas con status planned y completed
When GET ?status=completed
Then solo aparecen las completed

Given sort=date_asc
When GET
Then la más antigua aparece primero
```

## Métricas de éxito

- Ninguna consulta devuelve filas ajenas al usuario autenticado.
