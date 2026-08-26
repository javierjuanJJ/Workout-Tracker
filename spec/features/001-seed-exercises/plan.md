# Plan — 001-seed-exercises

## Decisiones técnicas

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| SQLite como provider inicial | PostgreSQL directo | Sin servidor externo para dev/test; cambiar provider = 1 línea + migración |
| `createMany({ skipDuplicates: true })` | upsert por ejercicio | Una sola query, idempotente por `@unique name` |
| Seeder en JS plano con ESM | prisma/seed.ts | Evita toolchain extra; coherente con el resto |
| `bcryptjs` ya declarado aquí | instalar después | Congela dependencias desde el commit inicial |

## Pasos de implementación

1. Crear `backend/package.json` (ESM, scripts `db:*`, `start`, `dev`, `test`).
2. Crear `backend/config.js` leyendo `process.env` con defaults seguros.
3. Crear `backend/prisma/schema.prisma` con las 4 entidades e índices.
4. Crear `backend/models/prisma.client.js` (singleton) y `backend/models/exercise.model.js`.
5. Crear `backend/prisma/seed.js` con 20+ ejercicios.
6. Añadir `backend/.env.example` y `.gitignore` de backend.

## Riesgos y mitigaciones

- **Riesgo**: `DATABASE_URL` ausente → Prisma falla. **Mitigación**: `.env.example` + docs con comando exacto.
- **Riesgo**: cambio posterior de provider a PostgreSQL rompe tipos. **Mitigación**: sin enums nativos ni tipos exclusivos de SQLite en el schema.

## Estrategia de verificación

- `npx prisma validate`
- `npm run db:migrate && npm run db:seed` (manual; requiere BD disponible)
- Doble ejecución del seed para comprobar idempotencia.
