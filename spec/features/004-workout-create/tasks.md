# Tasks — 004-workout-create

- [x] T1 · `backend/middlewares/auth.middleware.js` (Bearer → req.user, 401 tipado).
- [x] T2 · `backend/schemas/workout.schema.js` con workoutExerciseSchema + createWorkoutSchema.
- [x] T3 · `backend/models/workout.model.js` → create con nested exercises.
- [x] T4 · `backend/controllers/workout.controller.js` → create (mapeo FK inválida).
- [x] T5 · `backend/routes/workout.routes.js` protegido + montaje en index.

**Verificación**: 201 con include completo; 401 sin token; 400 payload inválido.
