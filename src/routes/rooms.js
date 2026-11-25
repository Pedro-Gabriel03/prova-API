const express = require('express');
const prisma = require('../prisma');
const { AppError } = require('../errors');
const validate = require('../validate');
const { roomBody, roomId, roomListQuery } = require('../validations/rooms');

const router = express.Router();

// TODO: quando o login com JWT estiver pronto, proteger POST, PUT e DELETE com requireAdmin

// GET /api/rooms?page=1&size=10 - lista as salas com paginação
router.get('/', validate(roomListQuery, 'query'), async (req, res, next) => {
  try {
    const { page, size } = req.valid.query;

    const [data, total] = await Promise.all([
      prisma.room.findMany({
        orderBy: { id: 'asc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.room.count(),
    ]);

    res.json({ data, page, size, total, totalPages: Math.ceil(total / size) });
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms/:id - busca uma sala pelo id
router.get('/:id', validate(roomId, 'params'), async (req, res, next) => {
  try {
    const { id } = req.valid.params;

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new AppError(404, 'Sala não encontrada.');
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms - cria uma sala nova
router.post('/', validate(roomBody), async (req, res, next) => {
  try {
    const room = await prisma.room.create({ data: req.valid.body });
    res.status(201).json(room);
  } catch (err) {
    // P2002 é o código do Prisma para violação de campo "unique"
    if (err.code === 'P2002') {
      return next(new AppError(409, 'Já existe uma sala com esse nome.'));
    }
    next(err);
  }
});

// PUT /api/rooms/:id - atualiza uma sala existente
router.put('/:id', validate(roomId, 'params'), validate(roomBody), async (req, res, next) => {
  try {
    const { id } = req.valid.params;

    const salaExistente = await prisma.room.findUnique({ where: { id } });
    if (!salaExistente) {
      throw new AppError(404, 'Sala não encontrada.');
    }

    const room = await prisma.room.update({ where: { id }, data: req.valid.body });
    res.json(room);
  } catch (err) {
    if (err.code === 'P2002') {
      return next(new AppError(409, 'Já existe uma sala com esse nome.'));
    }
    next(err);
  }
});

// DELETE /api/rooms/:id - remove uma sala
router.delete('/:id', validate(roomId, 'params'), async (req, res, next) => {
  try {
    const { id } = req.valid.params;

    const salaExistente = await prisma.room.findUnique({ where: { id } });
    if (!salaExistente) {
      throw new AppError(404, 'Sala não encontrada.');
    }

    // não deixa remover sala que já tem reserva vinculada
    const totalDeReservas = await prisma.reservation.count({ where: { roomId: id } });
    if (totalDeReservas > 0) {
      throw new AppError(409, 'Sala possui reservas e não pode ser removida.');
    }

    await prisma.room.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
