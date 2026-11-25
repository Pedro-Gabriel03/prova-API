const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prisma');

const sala = { name: 'Sala 101', capacity: 40, location: 'Bloco A' };

beforeEach(async () => {
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(() => prisma.$disconnect());

describe('POST /api/rooms', () => {
  test('cria uma sala e responde 201', async () => {
    const res = await request(app).post('/api/rooms').send(sala);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Sala 101');
  });

  test('dados inválidos respondem 422 com a lista de campos', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ name: '', capacity: -1 });
    expect(res.status).toBe(422);
    expect(res.body.status).toBe(422);
    const campos = res.body.errors.map((e) => e.field);
    expect(campos).toEqual(expect.arrayContaining(['name', 'capacity', 'location']));
  });

  test('nome repetido responde 409', async () => {
    await request(app).post('/api/rooms').send(sala);
    const res = await request(app).post('/api/rooms').send(sala);
    expect(res.status).toBe(409);
  });
});

describe('GET /api/rooms', () => {
  test('lista com paginação', async () => {
    for (const n of [1, 2, 3]) {
      await prisma.room.create({ data: { name: 'Sala ' + n, capacity: 10, location: 'Bloco A' } });
    }

    const res = await request(app).get('/api/rooms?page=2&size=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(2);
  });

  test('page inválido responde 422', async () => {
    const res = await request(app).get('/api/rooms?page=abc');
    expect(res.status).toBe(422);
  });
});

describe('GET /api/rooms/:id', () => {
  test('busca a sala pelo id', async () => {
    const criada = await prisma.room.create({ data: sala });
    const res = await request(app).get('/api/rooms/' + criada.id);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(criada.id);
  });

  test('id que não existe responde 404', async () => {
    const res = await request(app).get('/api/rooms/999999');
    expect(res.status).toBe(404);
  });

  test('id inválido responde 422', async () => {
    const res = await request(app).get('/api/rooms/abc');
    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe('id');
  });
});

describe('PUT /api/rooms/:id', () => {
  test('atualiza a sala', async () => {
    const criada = await prisma.room.create({ data: sala });
    const res = await request(app)
      .put('/api/rooms/' + criada.id)
      .send({ ...sala, capacity: 60, location: 'Bloco C' });
    expect(res.status).toBe(200);
    expect(res.body.capacity).toBe(60);
    expect(res.body.location).toBe('Bloco C');
  });

  test('sala que não existe responde 404', async () => {
    const res = await request(app).put('/api/rooms/9999').send(sala);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/rooms/:id', () => {
  test('remove a sala e responde 204', async () => {
    const criada = await prisma.room.create({ data: sala });
    const res = await request(app).delete('/api/rooms/' + criada.id);
    expect(res.status).toBe(204);

    const depois = await request(app).delete('/api/rooms/' + criada.id);
    expect(depois.status).toBe(404);
  });

  test('sala com reservas não pode ser removida (409)', async () => {
    const room = await prisma.room.create({ data: sala });
    const user = await prisma.user.create({
      data: { name: 'Teste', email: 'teste@exemplo.com', passwordHash: 'x' },
    });
    await prisma.reservation.create({
      data: {
        roomId: room.id,
        userId: user.id,
        start: new Date('2030-01-01T10:00:00Z'),
        end: new Date('2030-01-01T11:00:00Z'),
        reason: 'Aula',
      },
    });

    const res = await request(app).delete('/api/rooms/' + room.id);
    expect(res.status).toBe(409);
  });
});
