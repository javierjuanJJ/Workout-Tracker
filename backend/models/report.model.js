import prisma from './prisma.client.js';

function round2(value) {
  return Math.round(value * 100) / 100;
}

function sessionVolumeKg(session) {
  return session.workoutExercises.reduce(
    (sum, we) => sum + we.sets * we.reps * we.weight,
    0
  );
}

async function progressSummary(userId) {
  const completed = await prisma.workout.findMany({
    where: { userId, status: 'completed' },
    include: {
      workoutExercises: {
        include: {
          exercise: { select: { muscleGroup: true } },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  const byMuscleGroup = new Map();

  for (const session of completed) {
    for (const we of session.workoutExercises) {
      const volume = we.sets * we.reps * we.weight;
      totalVolume += volume;
      totalSets += we.sets;
      totalReps += we.sets * we.reps;

      const key = we.exercise.muscleGroup;
      const current = byMuscleGroup.get(key) ?? { sessions: new Set(), sets: 0, volume: 0 };
      current.sessions.add(session.id);
      current.sets += we.sets;
      current.volume += volume;
      byMuscleGroup.set(key, current);
    }
  }

  const recentSessions = completed.slice(0, 10).map((session) => ({
    id: session.id,
    title: session.title,
    completedAt: session.completedAt,
    volumeKg: round2(sessionVolumeKg(session)),
  }));

  return {
    totalCompletedWorkouts: completed.length,
    totalVolumeKg: round2(totalVolume),
    totalSets,
    totalReps,
    averageVolumePerSession:
      completed.length > 0 ? round2(totalVolume / completed.length) : 0,
    byMuscleGroup: [...byMuscleGroup.entries()]
      .map(([muscleGroup, data]) => ({
        muscleGroup,
        sessions: data.sessions.size,
        sets: data.sets,
        volumeKg: round2(data.volume),
      }))
      .sort((a, b) => b.volumeKg - a.volumeKg),
    recentSessions,
    lastCompletedAt: completed[0]?.completedAt ?? null,
  };
}

export default { progressSummary };
