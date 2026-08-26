import prisma from './prisma.client.js';

const INCLUDE_EXERCISES = {
  workoutExercises: {
    orderBy: { position: 'asc' },
    include: {
      exercise: {
        select: { id: true, name: true, muscleGroup: true, category: true },
      },
    },
  },
};

function buildDateFilter(from, to) {
  if (!from && !to) return undefined;

  const range = {};
  if (from) range.gte = new Date(from);
  if (to) range.lte = new Date(to);

  return {
    OR: [{ scheduledAt: range }, { AND: [{ scheduledAt: null }, { createdAt: range }] }],
  };
}

async function create(userId, { title, notes, status = 'planned', scheduledAt, exercises }) {
  return prisma.workout.create({
    data: {
      userId,
      title,
      notes,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      completedAt: status === 'completed' ? new Date() : undefined,
      workoutExercises: {
        create: exercises.map((item, index) => ({
          exerciseId: item.exerciseId,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          position: index,
        })),
      },
    },
    include: INCLUDE_EXERCISES,
  });
}

async function listByUser(userId, { status, from, to, sort = 'date_desc' } = {}) {
  const dateFilter = buildDateFilter(from, to);

  const where = {
    userId,
    ...(status ? { status } : {}),
    ...(dateFilter ? dateFilter : {}),
  };

  return prisma.workout.findMany({
    where,
    include: INCLUDE_EXERCISES,
    orderBy: [{ createdAt: sort === 'date_asc' ? 'asc' : 'desc' }],
  });
}

async function findByIdOwned(id, userId) {
  return prisma.workout.findFirst({
    where: { id, userId },
    include: INCLUDE_EXERCISES,
  });
}

async function update(id, data, exercises) {
  return prisma.$transaction(async (tx) => {
    if (exercises) {
      await tx.workoutExercise.deleteMany({ where: { workoutId: id } });
      await tx.workoutExercise.createMany({
        data: exercises.map((item, index) => ({
          workoutId: id,
          exerciseId: item.exerciseId,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          position: index,
        })),
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return tx.workout.findUnique({ where: { id }, include: INCLUDE_EXERCISES });
    }

    return tx.workout.update({
      where: { id },
      data,
      include: INCLUDE_EXERCISES,
    });
  });
}

async function schedule(id, isoDate) {
  return prisma.workout.update({
    where: { id },
    data: { scheduledAt: new Date(isoDate) },
    include: INCLUDE_EXERCISES,
  });
}

async function removeOwned(id, userId) {
  const result = await prisma.workout.deleteMany({ where: { id, userId } });
  return result.count;
}

export default {
  create,
  listByUser,
  findByIdOwned,
  update,
  schedule,
  removeOwned,
};
