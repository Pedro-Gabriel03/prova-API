const { z } = require('zod');

const texto = (campo) =>
  z
    .string({
      required_error: `${campo} é obrigatório.`,
      invalid_type_error: `${campo} deve ser um texto.`,
    })
    .trim()
    .min(1, `${campo} não pode ser vazio.`)
    .max(100, `${campo} deve ter no máximo 100 caracteres.`);

// corpo do POST e do PUT (o PUT substitui os dados, então exige todos os campos)
const roomBody = z.object({
  name: texto('name'),
  capacity: z
    .number({
      required_error: 'capacity é obrigatório.',
      invalid_type_error: 'capacity deve ser um número.',
    })
    .int('capacity deve ser um número inteiro.')
    .positive('capacity deve ser maior que zero.'),
  location: texto('location'),
});

// /api/rooms/:id
const roomId = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'id deve ser um número.' })
    .int('id deve ser um número inteiro.')
    .positive('id deve ser maior que zero.'),
});

// /api/rooms?page=1&size=10
const roomListQuery = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'page deve ser um número.' })
    .int('page deve ser um número inteiro.')
    .min(1, 'page deve ser no mínimo 1.')
    .default(1),
  size: z.coerce
    .number({ invalid_type_error: 'size deve ser um número.' })
    .int('size deve ser um número inteiro.')
    .min(1, 'size deve ser no mínimo 1.')
    .max(100, 'size deve ser no máximo 100.')
    .default(10),
});

module.exports = { roomBody, roomId, roomListQuery };
