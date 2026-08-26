# Feature 001 — seed-exercises

## Explicación técnica

Esta feature establece la capa de datos del proyecto:

- **`prisma/schema.prisma`**: modelo relacional con 4 entidades. `User` (credenciales), `Exercise` (catálogo con `name @unique`, `muscleGroup`, `category`), `Workout` (rutina con `status`, `comment`, `scheduledAt`, `completedAt`) y `WorkoutExercise` (tabla intermedia N:M con `sets`, `reps`, `weight`, `position`). Integridad: `User→Workout` y `Workout→WorkoutExercise` en `onDelete: Cascade`; `Exercise→WorkoutExercise` en `Restrict` para que no se pueda borrar un ejercicio referenciado. Índices compuestos `(userId, status)` y `(scheduledAt)`.
- **`config.js`**: centraliza `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS` leyendo `process.env` con defaults de desarrollo.
- **`models/prisma.client.js`**: singleton de `PrismaClient`.
- **`models/exercise.model.js`**: funciones `seedMany`, `count`, `list`, `existsMany`.
- **`prisma/seed.js`**: inserta 22 ejercicios reales con `createMany({ skipDuplicates: true })` → idempotente gracias a la restricción unique sobre `name`.

Provider inicial: **SQLite** (`file:./dev.db`). Para PostgreSQL solo hay que cambiar `provider = "postgresql"` en el datasource y regenerar migraciones.

### Cómo ejecutar

```bash
cd backend
npm install
cp .env.example .env          # ajusta DATABASE_URL si procede
npx prisma migrate dev --name init
npm run db:seed
```

Salida esperada: `Seed completado: 22 ejercicios insertados (22 totales en catálogo).`

## Reversión (rollback)

```bash
# 1. Deshacer el commit (crea un commit inverso, nunca force-push)
git log --oneline --grep="feat(001-seed-exercises)"   # localiza el hash
git revert <hash-del-commit>

# 2. Deshacer la base de datos local
cd backend
npx prisma migrate reset --force        # borra y reaplica desde cero
# o elimina la primera migración y la BD:
rm -rf prisma/migrations dev.db test.db
npx prisma generate
```

> Prisma no soporta "down migrations": la reversión canónica es `git revert` del commit + `prisma migrate reset` (o borrar las migraciones afectadas si aún no se han desplegado).

## Mensaje de commit exacto

```text
feat(001-seed-exercises): esquema Prisma y seeder de ejercicios
```
