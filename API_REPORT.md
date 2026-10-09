# Informe de pruebas de la API

Fecha: 2026-10-09
Base URL: `http://127.0.0.1:3000` (prefijo API: `/api`)
API: Express 4 + Prisma + Zod + JWT (Node 20). Ejecutada vía contenedor Docker (`workout-tracker:latest`, `docker-compose.yml`) sobre PostgreSQL 16.
Método: `curl` (scripts reales + verificación de respuestas).

## Resumen

| Total de peticiones | Éxitos (2xx) | Errores esperados (4xx) | Errores inesperados |
|---|---|---|---|
| 68 | 26 | 42 | 0 |

Todos los endpoints respondieron exactamente con el código y formato esperado. No se encontraron bugs de comportamiento.

## Endpoints probados

- `GET /health` — estado del servicio (fuera del prefijo `/api`)
- `POST /api/auth/signup` — registro de usuario
- `POST /api/auth/login` — login y emisión de JWT
- `POST /api/workouts` — crear rutina con ejercicios anidados (auth Bearer)
- `GET /api/workouts` — listar rutinas del usuario con filtros (auth Bearer)
- `PATCH /api/workouts/:id` — actualización parcial (auth Bearer)
- `DELETE /api/workouts/:id` — eliminar rutina propia (auth Bearer)
- `POST /api/workouts/:id/schedule` — programar rutina (auth Bearer)
- `GET /api/reports/progress` — métricas de progreso (auth Bearer)

## Pruebas realizadas

### Health

1. `GET /health` — **Esperado:** 200 — **Resultado:** 200 ✅
   Respuesta: `{"success":true,"data":{"status":"ok","env":"development"}}`
2. `HEAD /health` — **Esperado:** 200 — **Resultado:** 200 ✅
3. `POST /health` — **Esperado:** 404 (ruta no definida para POST) — **Resultado:** 404 ✅
4. `OPTIONS /health` — **Esperado:** 204 (CORS) — **Resultado:** 204 ✅
5. `GET /api` — **Esperado:** 404 — **Resultado:** 404 ✅
   `{"success":false,"error":"Ruta no encontrada: GET /api"}`
6. `GET /ruta-inexistente` — **Esperado:** 404 — **Resultado:** 404 ✅
7. `GET /api/inexistente` — **Esperado:** 404 — **Resultado:** 404 ✅

### Auth — `POST /api/auth/signup`

8. Body válido `{name,email,password}` — **Esperado:** 201 — **Resultado:** 201 ✅
   Respuesta: `{"success":true,"data":{id,name,email,createdAt}}` (no expone el `passwordHash`).
9. Email duplicado — **Esperado:** 409 — **Resultado:** 409 ✅
   `{"success":false,"error":"El email ya está registrado"}`
10. Contraseña de 5 caracteres — **Esperado:** 400 con `issues` — **Resultado:** 400 ✅
    `issues:[{path:"password",message:"La contraseña debe tener al menos 8 caracteres"}]`
11. Email inválido (`no-es-email`) — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"email",message:"Email inválido"}]`
12. Body vacío `{}` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[name,email,password → Required]`
13. Nombre de 1 carácter — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"name",message:"El nombre debe tener al menos 2 caracteres"}]`
14. JSON malformado — **Esperado:** 400 — **Resultado:** 400 ✅
    `{"success":false,"error":"Expected ',' or '}' after property value in JSON at position 17"}`

### Auth — `POST /api/auth/login`

15. Credenciales correctas — **Esperado:** 200 — **Resultado:** 200 ✅
    `data:{token, tokenType:"Bearer", expiresIn:"1h", user:{...}}` (JWT de 3 partes).
16. Contraseña incorrecta — **Esperado:** 401 genérico — **Resultado:** 401 ✅
    `{"success":false,"error":"Credenciales inválidas"}`
17. Email no registrado — **Esperado:** 401 — **Resultado:** 401 ✅
    `{"success":false,"error":"Credenciales inválidas"}`
18. Body vacío `{}` — **Esperado:** 400 — **Resultado:** 400 ✅
19. `GET /api/auth/login` (método erróneo) — **Esperado:** 404 — **Resultado:** 404 ✅
20. `GET /api/auth/signup` (método erróneo) — **Esperado:** 404 — **Resultado:** 404 ✅
21. `POST /api/auth/login` sin cabecera `Content-Type` — **Esperado:** 400 — **Resultado:** 400 ✅ (body no parseado → validación falla).

### Workouts — `POST /api/workouts` (Bearer)

22. Body válido (2 ejercicios, `scheduledAt` ISO-8601) — **Esperado:** 201 — **Resultado:** 201 ✅
    Respuesta con arrays `workoutExercises` y `exercise` expandido (id/nombre/grupo muscular/categoría).
23. Sin token — **Esperado:** 401 — **Resultado:** 401 ✅
    `{"success":false,"error":"Token de autenticación requerido"}`
24. Token inválido — **Esperado:** 401 — **Resultado:** 401 ✅
    `{"success":false,"error":"Token inválido o expirado"}`
25. Cabecera sin esquema `Bearer` (solo token) — **Esperado:** 401 — **Resultado:** 401 ✅
26. Sin campo `exercises` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"exercises",message:"Required"}]`
27. `exercises: []` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"exercises",message:"Array must contain at least 1 element(s)"}]`
28. `exerciseId: 9999` inexistente — **Esperado:** 400 — **Resultado:** 400 ✅
    `{"success":false,"error":"Referencia inválida: algún exerciseId no existe en el catálogo"}`
29. Tipos erróneos (`title` número, `exerciseId` string, `sets:0`, `reps:-2`, `weight:-5`) — **Esperado:** 400 — **Resultado:** 400 ✅ (múltiples `issues` por campo).
30. `status: "foo"` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[Invalid enum value. Expected 'planned' | 'completed' | 'cancelled']`
31. JSON malformado — **Esperado:** 400 — **Resultado:** 400 ✅
32. `status: "completed"` sin `completedAt` — **Esperado:** 201 y `completedAt` autogenerado — **Resultado:** 201 ✅
33. Sin `status` — **Esperado:** 201 con `status:"planned"` por defecto — **Resultado:** 201 ✅

### Workouts — `GET /api/workouts` (Bearer)

34. Sin filtros — **Esperado:** 200 lista + `meta.count` — **Resultado:** 200 ✅
35. `?status=completed` — **Esperado:** 200 filtrado — **Resultado:** 200 ✅
36. `?status=foo` — **Esperado:** 400 — **Resultado:** 400 ✅
37. `?status=planned&sort=date_asc` — **Esperado:** 200 — **Resultado:** 200 ✅
38. `?sort=weird` — **Esperado:** 400 — **Resultado:** 400 ✅
39. `?from=no-es-fecha` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"from",message:"Invalid datetime"}]`
40. `?from=2026-10-01T00:00:00Z&to=2026-10-12T00:00:00Z` — **Esperado:** 200 — **Resultado:** 200 ✅

### Workouts — `PATCH /api/workouts/:id` (Bearer)

41. Actualizar `title`, `notes`, `comment` — **Esperado:** 200 — **Resultado:** 200 ✅
42. Reemplazar `exercises` (transacción delete+create) — **Esperado:** 200 — **Resultado:** 200 ✅
43. `status:"completed"` sin `completedAt` — **Esperado:** 200 y `completedAt` autogenerado — **Resultado:** 200 ✅
44. `status:"cancelled"` — **Esperado:** 200 y `completedAt` limpio (`null`) — **Resultado:** 200 ✅
45. `id=999999` inexistente — **Esperado:** 404 — **Resultado:** 404 ✅
    `{"success":false,"error":"Rutina no encontrada"}`
46. `id=abc` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"id",message:"Expected number, received nan"}]`
47. `id=0` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"id",message:"El id debe ser un entero positivo"}]`
48. Sin token — **Esperado:** 401 — **Resultado:** 401 ✅
49. Body vacío `{}` — **Esperado:** 200 (devuelve la rutina sin cambios) — **Resultado:** 200 ✅

### Workouts — `POST /api/workouts/:id/schedule` (Bearer)

50. `scheduledAt` ISO válido — **Esperado:** 200 — **Resultado:** 200 ✅
51. Body vacío `{}` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"scheduledAt",message:"Required"}]`
52. `scheduledAt:"ayer"` — **Esperado:** 400 — **Resultado:** 400 ✅
    `issues:[{path:"scheduledAt",message:"Debe ser una fecha ISO-8601 con offset (ej. 2026-09-01T18:30:00Z)"}]`
53. `id=999999` — **Esperado:** 404 — **Resultado:** 404 ✅

### Workouts — `DELETE /api/workouts/:id` (Bearer)

54. Eliminar rutina propia — **Esperado:** 204 sin cuerpo — **Resultado:** 204 ✅
55. Eliminar de nuevo la misma rutina — **Esperado:** 404 — **Resultado:** 404 ✅
56. `id=999999` — **Esperado:** 404 — **Resultado:** 404 ✅
57. Sin token — **Esperado:** 401 — **Resultado:** 401 ✅

### Reports — `GET /api/reports/progress` (Bearer)

58. Usuario sin rutinas completadas — **Esperado:** 200 con ceros — **Resultado:** 200 ✅
    `data:{totalCompletedWorkouts:0, totalVolumeKg:0, ..., byMuscleGroup:[], recentSessions:[], lastCompletedAt:null}`
59. Sin token — **Esperado:** 401 — **Resultado:** 401 ✅

### Aislamiento entre usuarios (ownership)

60. `PATCH /api/workouts/15` con token de otro usuario — **Esperado:** 404 — **Resultado:** 404 ✅
61. `DELETE /api/workouts/15` con token de otro usuario — **Esperado:** 404 — **Resultado:** 404 ✅
62. `GET /api/workouts` con token de otro usuario — **Esperado:** 200 con lista vacía — **Resultado:** 200 ✅

### Reports con datos

63. Crear 2 rutinas `status:"completed"` — **Esperado:** 201 / 201 — **Resultado:** 201 / 201 ✅
64. `GET /api/reports/progress` con datos — **Esperado:** 200 y volumen calculado — **Resultado:** 200 ✅
    `totalCompletedWorkouts:2, totalVolumeKg:7440, totalSets:12, totalReps:112, averageVolumePerSession:3720, byMuscleGroup:[legs 5000, chest 1800, back 640]` (cálculo correcto: 4×8×20=640, 3×10×60=1800, 5×10×100=5000).

### Otros

65. `OPTIONS /api/workouts` — **Esperado:** 204 (CORS) — **Resultado:** 204 ✅
66. `GET /docs/openapi.json` — **Esperado:** 404 (no se sirve por HTTP) — **Resultado:** 404 ✅
67. `GET /health?x=1` (query ignorada) — **Esperado:** 200 — **Resultado:** 200 ✅

## Hallazgos

No hay bugs de respuesta: el comportamiento de todos los endpoints coincide con lo documentado y con la spec `backend/docs/openapi.json`.

**Nota operativa (entorno):** en una base de datos recién creada el catálogo de ejercicios (`Exercise`) está **vacío** si no se ejecuta el seed, y la API **no expone ningún endpoint** para listar/crear ejercicios del catálogo. En ese estado, cualquier `POST /api/workouts` falla con `400 "Referencia inválida: algún exerciseId no existe en el catálogo"`. El `docker-compose.yml` no ejecuta el seed al arrancar (solo `prisma db push`), por lo que en un despliegue fresco hay que lanzar `npm run db:seed` manualmente. Detalle en `docs/001-seed-exercises.md`.

## Notas

- Autenticación: cabecera `Authorization: Bearer <jwt>`, JWT firmado con `JWT_SECRET`, expiración configurable (`JWT_EXPIRES_IN`, por defecto `1h`).
- Respuestas con envoltorio `{success, data | error, issues?}`. Errores de validación incluyen `issues` con `path` y `message`.
- No hay endpoints websocket/SSE; todo se probó con `curl`.
- Los tests automatizados del proyecto (`npm test`, 17 tests) también pasan en verde.