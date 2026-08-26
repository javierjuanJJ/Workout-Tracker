# Roadmap — Workout Tracker

Orden de ejecución vinculante. Cada fase = 1 carpeta en `spec/features/` = 1 commit = 1 documento en `docs/`.

| # | Feature               | Entregable                                   | Estado       |
|---|-----------------------|----------------------------------------------|--------------|
| 001 | seed-exercises     | Seeder de catálogo de ejercicios              | Implementada |
| 002 | auth-signup        | `POST /api/auth/signup`                       | Implementada |
| 003 | auth-login         | `POST /api/auth/login` (JWT)                  | Implementada |
| 004 | workout-create     | `POST /api/workouts` (JWT)                    | Implementada |
| 005 | workout-list       | `GET /api/workouts` (JWT, filtros)            | Implementada |
| 006 | workout-update     | `PATCH /api/workouts/:id` (JWT, parcial)      | Implementada |
| 007 | workout-delete     | `DELETE /api/workouts/:id` (JWT)              | Implementada |
| 008 | workout-schedule   | `POST /api/workouts/:id/schedule` (JWT)       | Implementada |
| 009 | reports-generate   | `GET /api/reports/progress` (JWT)             | Implementada |

## Dependencias

- 002 requiere 001 (schema Prisma + config).
- 003 requiere 002 (usuarios persistidos).
- 004–008 requieren 003 (authMiddleware JWT).
- 009 requiere 004 (datos de entrenamientos).
- Transversal: tests de integración + OpenAPI se cierran tras 009.

## Fases fuera del alcance v1

- Refresh tokens / OAuth.
- Categorización avanzada o imágenes de ejercicios.
- Notificaciones de entrenamientos programados.
- Frontend.
