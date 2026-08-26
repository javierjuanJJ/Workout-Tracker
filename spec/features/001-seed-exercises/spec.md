# Spec — 001-seed-exercises

## Historia de usuario

Como desarrollador del sistema, quiero un seeder que poblique la base de datos con un catálogo de ejercicios (nombre, descripción, grupo muscular y categoría) para que las rutinas referencien ejercicios existentes desde el primer despliegue.

## Alcance

### In scope
- Schema Prisma relacional completo: `User`, `Exercise`, `Workout`, `WorkoutExercise`.
- Script `prisma/seed.js` idempotente (`createMany` + `skipDuplicates`).
- Configuración centralizada en `backend/config.js`.
- Scaffold de `backend/package.json` con scripts estándar.

### Out of scope
- Endpoints HTTP (ninguno en esta feature).
- CRUD de ejercicios vía API.
- Migraciones aplicadas automáticamente (se documentan los comandos).

## Requisitos

### Funcionales
- FR-1: El seeder inserta al menos 20 ejercicios reales con `name`, `description`, `muscleGroup`, `category`.
- FR-2: Ejecutarlo dos veces no duplica registros (`skipDuplicates: true`, `name @unique`).
- FR-3: Al finalizar imprime cuántos registros insertó.

### No funcionales
- NFR-1: `muscleGroup` normalizado en minúsculas (`legs`, `chest`, `back`, `shoulders`, `arms`, `core`, `full_body`).
- NFR-2: `category` ∈ `strength | cardio | mobility`.

## Modelo de datos (impacto)

- `User(id, name, email unique, passwordHash, createdAt, updatedAt)`
- `Exercise(id, name unique, description, muscleGroup, category, createdAt)`
- `Workout(id, userId FK cascade, title, status default "planned", comment, notes, scheduledAt?, completedAt?, timestamps)`
- `WorkoutExercise(id, workoutId FK cascade, exerciseId FK restrict, sets, reps, weight default 0, position)`

## Criterios de aceptación

```gherkin
Given una base de datos vacía
When ejecuto "npm run db:seed"
Then la tabla Exercise contiene >= 20 filas y el script reporta el total insertado

Given el catálogo ya poblado
When vuelvo a ejecutar "npm run db:seed"
Then el conteo de filas no cambia (0 inserts nuevos)
```

## Métricas de éxito

- `npx prisma validate` pasa sin errores.
- Seed idempotente verificado con doble ejecución manual.
