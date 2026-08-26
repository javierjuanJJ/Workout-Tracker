import workoutModel from '../models/workout.model.js';

const FK_ERROR_MESSAGE = 'Referencia inválida: algún exerciseId no existe en el catálogo';

function buildCompletedPatch(data = {}) {
  if (data.status === 'completed' && !data.completedAt) {
    return { ...data, completedAt: new Date() };
  }
  if (data.status && data.status !== 'completed') {
    return { ...data, completedAt: null };
  }
  return data;
}

export async function create(req, res, next) {
  try {
    const workout = await workoutModel.create(req.user.id, req.body);
    return res.status(201).json({ success: true, data: workout });
  } catch (error) {
    if (error?.code === 'P2003') {
      return res.status(400).json({ success: false, error: FK_ERROR_MESSAGE });
    }
    return next(error);
  }
}

export async function list(req, res, next) {
  try {
    const workouts = await workoutModel.listByUser(req.user.id, req.validatedQuery ?? {});
    return res.json({ success: true, data: workouts, meta: { count: workouts.length } });
  } catch (error) {
    return next(error);
  }
}

export async function update(req, res, next) {
  try {
    const id = req.validatedParams.id;
    const existing = await workoutModel.findByIdOwned(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rutina no encontrada' });
    }

    const { exercises, ...rest } = req.body;
    const hasBodyChanges = exercises || Object.keys(rest).length > 0;

    if (!hasBodyChanges) {
      return res.json({ success: true, data: existing });
    }

    const workout = await workoutModel.update(id, buildCompletedPatch(rest), exercises);
    return res.json({ success: true, data: workout });
  } catch (error) {
    if (error?.code === 'P2003') {
      return res.status(400).json({ success: false, error: FK_ERROR_MESSAGE });
    }
    return next(error);
  }
}

export async function schedule(req, res, next) {
  try {
    const id = req.validatedParams.id;
    const existing = await workoutModel.findByIdOwned(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rutina no encontrada' });
    }

    const workout = await workoutModel.schedule(id, req.body.scheduledAt);
    return res.json({ success: true, data: workout });
  } catch (error) {
    return next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await workoutModel.removeOwned(req.validatedParams.id, req.user.id);

    if (deleted === 0) {
      return res.status(404).json({ success: false, error: 'Rutina no encontrada' });
    }

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
