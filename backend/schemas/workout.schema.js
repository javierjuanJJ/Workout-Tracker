import { z } from 'zod';

export const WORKOUT_STATUSES = ['planned', 'completed', 'cancelled'];

export const workoutExerciseSchema = z.object({
  exerciseId: z.number().int().positive('exerciseId debe ser un entero positivo'),
  sets: z.number().int().min(1).max(50),
  reps: z.number().int().min(1).max(500),
  weight: z.number().min(0).max(1000).default(0),
});

export const createWorkoutSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(1000).optional(),
  status: z.enum(WORKOUT_STATUSES).default('planned'),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  exercises: z.array(workoutExerciseSchema).min(1).max(30),
});

export const updateWorkoutSchema = createWorkoutSchema.partial().extend({
  comment: z.string().trim().max(1000).optional(),
});

export const scheduleWorkoutSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ offset: true, message: 'Debe ser una fecha ISO-8601 con offset (ej. 2026-09-01T18:30:00Z)' }),
});

export const listWorkoutsQuerySchema = z.object({
  status: z.enum(WORKOUT_STATUSES).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  sort: z.enum(['date_asc', 'date_desc']).default('date_desc'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});
