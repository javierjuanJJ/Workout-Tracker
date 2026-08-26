# Tech Stack — Workout Tracker

## Stack obligatorio

| Capa                | Tecnología                          | Versión   |
| ------------------- | ----------------------------------- | --------- |
| Runtime             | Node.js                             | >= 20 LTS |
| Framework HTTP      | Express                             | 4.x       |
| ORM                 | Prisma ORM (`prisma-client-js`)     | 5.x       |
| Base de datos       | SQLite (dev/test) · PostgreSQL (prod)| -         |
| Validación          | Zod                                 | 3.x       |
| Auth                | JSON Web Token (`jsonwebtoken`)     | 9.x       |
| Hashing             | bcryptjs                            | 2.x/3.x   |
| CORS                | cors                                | 2.8.x     |
| Testing             | `node:test` + `node:assert/strict`  | nativo    |

## Decisiones arquitectónicas

1. **ESM** ("type": "module") en todo el proyecto.
2. **Arranque condicional**: `app.js` NO contiene funciones `async` ni usa `.run()`. El listen está condicionado: `if (!process.env.NODE_ENV) { app.listen(...) }`. Exporta `default app`.
3. **Estructura interna obligatoria**:

```text
backend/
├── app.js              # Instancia Express + middlewares globales + routers
├── config.js           # Constantes y variables de entorno
├── controllers/        # Lógica HTTP (req/res), sin Prisma directo
├── models/             # Acceso a datos con Prisma Client
├── routes/             # express.Router() por dominio
├── schemas/            # Schemas Zod (safeParse / partial().safeParse)
├── middlewares/        # authMiddleware JWT, validate (Zod), errores
├── utils/              # Helpers puros (firma/verificación JWT)
├── prisma/
│   ├── schema.prisma   # Modelo relacional
│   └── seed.js         # Seeder de ejercicios
└── docs/openapi.json   # Contrato OpenAPI 3.0
```

4. **Sobre de respuesta uniforme**:

```jsonc
// Éxito
{ "success": true, "data": { } }
// Error
{ "success": false, "error": "mensaje", "issues": [{ "path": "campo", "message": "detalle" }] }
```

5. **Códigos HTTP**: 200 OK · 201 Created · 204 No Content · 400 validación · 401 credenciales/token · 404 no encontrado o ajeno · 409 conflicto (email duplicado) · 500 interno.

## Convenciones

- Controladores: funciones nombradas exportadas (`export async function signup`).
- Modelos: módulo default con funciones async agrupadas por entidad.
- Routers montados bajo `/api`: `/api/auth`, `/api/workouts`, `/api/reports`.
- Fechas: ISO-8601 con offset (`2026-08-26T10:00:00Z`).
- Secretos: solo por variables de entorno (`.env`, nunca commiteado).

## Comandos estándar

```bash
npm run db:migrate      # prisma migrate dev (crear/esquema)
npm run db:seed         # node prisma/seed.js
npm start               # producción
npm run dev             # desarrollo con --watch
npm test                # node --test app.test.js
```
