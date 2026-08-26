# Spec — 007-workout-delete

## Historia de usuario

Como usuario autenticado, quiero eliminar una de mis rutinas para mantener mi histórico limpio de errores o planes descartados.

## Alcance

### In scope
- Endpoint `DELETE /api/workouts/:id` protegido con JWT.
- Borrado con verificación de ownership en la propia query (deleteMany con userId).
- Cascade automático de `WorkoutExercise` vía FK onDelete: Cascade.

### Out of scope
- Soft-delete / papelera.
- Borrado masivo.

## Requisitos

### Funcionales
- FR-1: `DELETE /api/workouts/:id` sobre rutina propia → 204 sin cuerpo.
- FR-2: Rutina ajena o inexistente → 404; nada se borra.
- FR-3: Al borrar el Workout desaparecen sus WorkoutExercise (cascade).
- FR-4: Los ejercicios del catálogo (`Exercise`) nunca se borran (onDelete: Restrict).

### No funcionales
- NFR-1: Operación idempotente desde el punto de vista del cliente (segundo delete del mismo id → 404, no 500).

## Contrato de API

```http
DELETE /api/workouts/10
Authorization: Bearer <token>
```

```jsonc
// 204 No Content (sin body)
// 404
{ "success": false, "error": "Rutina no encontrada" }
```

## Criterios de aceptación

```gherkin
Given una rutina propia con 3 ejercicios anidados
When DELETE /api/workouts/:id
Then responde 204 y en BD quedan 0 Workout y 0 WorkoutExercise asociados

Given una rutina de otro usuario
When DELETE con mi token
Then responde 404 y la rutina sigue existiendo
```

## Métricas de éxito

- Cero filas huérfanas tras borrados repetidos.
