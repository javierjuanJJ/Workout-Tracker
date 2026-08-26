import assert from 'node:assert/strict';
import { before, after, describe, it } from 'node:test';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'file:./test.db';
process.env.JWT_SECRET ??= 'test-secret-workout-tracker';

const { default: app } = await import('./app.js');
const { default: prisma } = await import('./models/prisma.client.js');

let server;
let baseUrl;
let exerciseIds = [];
const testEmailDomain = '@wt-test.dev';

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const seedExercises = [
    { name: '[TEST] Press banca', description: 'test', muscleGroup: 'chest', category: 'strength' },
    { name: '[TEST] Sentadilla', description: 'test', muscleGroup: 'legs', category: 'strength' },
  ];
  for (const item of seedExercises) {
    const exercise = await prisma.exercise.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
    exerciseIds.push(exercise.id);
  }
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: testEmailDomain } } });
  await prisma.exercise.deleteMany({ where: { name: { startsWith: '[TEST]' } } });
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

async function request(method, path, { token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return { status: response.status, data: null };
  }

  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}${testEmailDomain}`;
}

async function signupAndGetToken(prefix = 'user') {
  const email = uniqueEmail(prefix);
  const { status, data } = await request('POST', '/api/auth/signup', {
    body: { name: `Test ${prefix}`, email, password: 'password123' },
  });
  assert.equal(status, 201);
  const login = await request('POST', '/api/auth/login', {
    body: { email, password: 'password123' },
  });
  assert.equal(login.status, 200);
  return { email, userId: data.data.id, token: login.data.data.token };
}

describe('Health', () => {
  it('GET /health responde 200 ok', async () => {
    const { status, data } = await request('GET', '/health');
    assert.equal(status, 200);
    assert.equal(data.data.status, 'ok');
  });
});

describe('Auth - Signup (002)', () => {
  it('registra un usuario nuevo con 201 y no expone el hash', async () => {
    const email = uniqueEmail('signup');
    const { status, data } = await request('POST', '/api/auth/signup', {
      body: { name: 'Ana Test', email, password: 'password123' },
    });

    assert.equal(status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.email, email);
    assert.ok(!('passwordHash' in data.data));
  });

  it('rechaza emails duplicados con 409', async () => {
    const email = uniqueEmail('dup');
    await request('POST', '/api/auth/signup', {
      body: { name: 'Dup Test', email, password: 'password123' },
    });
    const { status } = await request('POST', '/api/auth/signup', {
      body: { name: 'Dup Test', email, password: 'password123' },
    });

    assert.equal(status, 409);
  });

  it('rechaza contraseñas cortas con 400 e issues', async () => {
    const { status, data } = await request('POST', '/api/auth/signup', {
      body: { name: 'Shorty', email: uniqueEmail('short'), password: '123' },
    });

    assert.equal(status, 400);
    assert.ok(data.issues.length > 0);
  });
});

describe('Auth - Login (003)', () => {
  it('entrega un JWT válido con credenciales correctas', async () => {
    const email = uniqueEmail('login');
    await request('POST', '/api/auth/signup', {
      body: { name: 'Login Test', email, password: 'password123' },
    });
    const { status, data } = await request('POST', '/api/auth/login', {
      body: { email, password: 'password123' },
    });

    assert.equal(status, 200);
    assert.equal(data.data.tokenType, 'Bearer');
    assert.ok(data.data.token.split('.').length === 3);
  });

  it('responde 401 genérico con contraseña incorrecta', async () => {
    const email = uniqueEmail('badpass');
    await request('POST', '/api/auth/signup', {
      body: { name: 'Bad Pass', email, password: 'password123' },
    });
    const { status, data } = await request('POST', '/api/auth/login', {
      body: { email, password: 'wrong-password' },
    });

    assert.equal(status, 401);
    assert.equal(data.error, 'Credenciales inválidas');
  });
});

describe('Workouts (004-008)', () => {
  let userA;
  let userB;
  let workoutId;

  before(async () => {
    userA = await signupAndGetToken('owner');
    userB = await signupAndGetToken('intruder');
  });

  it('401 al crear sin token', async () => {
    const { status } = await request('POST', '/api/workouts', {
      body: { title: 'X', exercises: [{ exerciseId: exerciseIds[0], sets: 1, reps: 1 }] },
    });

    assert.equal(status, 401);
  });

  it('400 al crear sin ejercicios', async () => {
    const { status, data } = await request('POST', '/api/workouts', {
      token: userA.token,
      body: { title: 'Vacía', exercises: [] },
    });

    assert.equal(status, 400);
    assert.ok(data.issues.length > 0);
  });

  it('201 crea una rutina anidada para el usuario del token', async () => {
    const { status, data } = await request('POST', '/api/workouts', {
      token: userA.token,
      body: {
        title: 'Push día A',
        exercises: [
          { exerciseId: exerciseIds[0], sets: 4, reps: 8, weight: 60 },
          { exerciseId: exerciseIds[1], sets: 3, reps: 10, weight: 80 },
        ],
      },
    });

    assert.equal(status, 201);
    assert.equal(data.data.workoutExercises.length, 2);
    workoutId = data.data.id;
  });

  it('lista solo las rutinas propias con filtros y orden', async () => {
    const { status, data } = await request(
      'GET',
      `/api/workouts?status=planned&sort=date_asc`,
      { token: userA.token }
    );

    assert.equal(status, 200);
    assert.equal(data.meta.count >= 1, true);
    assert.ok(data.data.every((w) => w.userId === userA.userId || w.title === 'Push día A'));
    assert.ok(!data.data.some((w) => w.id !== workoutId && w.userId === userB.userId));
  });

  it('PATCH parcial actualiza comentario y estado con completedAt', async () => {
    const { status, data } = await request('PATCH', `/api/workouts/${workoutId}`, {
      token: userA.token,
      body: { status: 'completed', comment: 'Sesión completada' },
    });

    assert.equal(status, 200);
    assert.equal(data.data.comment, 'Sesión completada');
    assert.ok(data.data.completedAt);
  });

  it('PATCH sobre rutina ajena responde 404', async () => {
    const { status } = await request('PATCH', `/api/workouts/${workoutId}`, {
      token: userB.token,
      body: { title: 'hackeado' },
    });

    assert.equal(status, 404);
  });

  it('schedule fija scheduledAt en formato UTC', async () => {
    const { status, data } = await request('POST', `/api/workouts/${workoutId}/schedule`, {
      token: userA.token,
      body: { scheduledAt: '2026-09-01T18:30:00Z' },
    });

    assert.equal(status, 200);
    assert.equal(new Date(data.data.scheduledAt).toISOString(), '2026-09-01T18:30:00.000Z');
  });

  it('schedule con fecha inválida responde 400', async () => {
    const { status } = await request('POST', `/api/workouts/${workoutId}/schedule`, {
      token: userA.token,
      body: { scheduledAt: '2026-09-01 18:30' },
    });

    assert.equal(status, 400);
  });

  it('DELETE propio responde 204 y deja la rutina inaccesible', async () => {
    const del = await request('DELETE', `/api/workouts/${workoutId}`, { token: userA.token });
    assert.equal(del.status, 204);

    const again = await request('DELETE', `/api/workouts/${workoutId}`, { token: userA.token });
    assert.equal(again.status, 404);
  });
});

describe('Reports (009)', () => {
  it('401 sin token', async () => {
    const { status } = await request('GET', '/api/reports/progress');
    assert.equal(status, 401);
  });

  it('calcula métricas exactas sobre rutinas completadas', async () => {
    const user = await signupAndGetToken('reporter');

    await request('POST', '/api/workouts', {
      token: user.token,
      body: {
        title: 'Completa 1',
        status: 'completed',
        exercises: [{ exerciseId: exerciseIds[0], sets: 2, reps: 10, weight: 50 }],
      },
    });
    await request('POST', '/api/workouts', {
      token: user.token,
      body: {
        title: 'Planificada',
        exercises: [{ exerciseId: exerciseIds[0], sets: 5, reps: 10, weight: 100 }],
      },
    });

    const { status, data } = await request('GET', '/api/reports/progress', { token: user.token });

    assert.equal(status, 200);
    assert.equal(data.data.totalCompletedWorkouts, 1);
    assert.equal(data.data.totalVolumeKg, 1000);
    assert.equal(data.data.totalSets, 2);
    assert.equal(data.data.totalReps, 20);
    assert.equal(data.data.averageVolumePerSession, 1000);
  });
});
