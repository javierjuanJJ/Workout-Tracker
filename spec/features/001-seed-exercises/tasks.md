# Tasks — 001-seed-exercises

- [x] T1 · `backend/package.json` con dependencias (express, cors, bcryptjs, jsonwebtoken, zod, @prisma/client) y devDependency prisma.
- [x] T2 · `backend/config.js` centraliza PORT, JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS.
- [x] T3 · `backend/prisma/schema.prisma`: User, Exercise, Workout, WorkoutExercise + índices + onDelete Cascade/Restrict.
- [x] T4 · `backend/models/prisma.client.js` singleton PrismaClient.
- [x] T5 · `backend/models/exercise.model.js` con `seedMany`, `count`, `list`.
- [x] T6 · `backend/prisma/seed.js` con 20+ ejercicios idempotentes.
- [x] T7 · `backend/.env.example` y `backend/.gitignore`.
- [x] T8 · Documentar comandos de migración/rollback en `docs/001-seed-exercises.md`.

**Verificación**: `node --check` sobre seed.js y models · `npx prisma validate` (requiere npm install).
