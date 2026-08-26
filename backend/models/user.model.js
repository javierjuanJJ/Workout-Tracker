import prisma from './prisma.client.js';

async function create({ name, email, passwordHash }) {
  return prisma.user.create({ data: { name, email, passwordHash } });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}

export default { create, findByEmail, findById };
