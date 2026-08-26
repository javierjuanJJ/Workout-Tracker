import prisma from './prisma.client.js';

const PUBLIC_SELECT = {
  id: true,
  name: true,
  description: true,
  muscleGroup: true,
  category: true,
};

async function seedMany(exercises) {
  return prisma.exercise.createMany({ data: exercises, skipDuplicates: true });
}

async function count() {
  return prisma.exercise.count();
}

async function list() {
  return prisma.exercise.findMany({
    select: PUBLIC_SELECT,
    orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
  });
}

async function existsMany(ids) {
  const found = await prisma.exercise.count({ where: { id: { in: ids } } });
  return found === ids.length;
}

export default { seedMany, count, list, existsMany };
