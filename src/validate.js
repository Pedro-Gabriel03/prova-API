const { AppError } = require('./errors');

// Valida req.body, req.params ou req.query com um schema do zod.
// Se estiver tudo certo, guarda o resultado em req.valid[origem].
// Se não, responde 422 com a lista de campos inválidos.
function validate(schema, origem = 'body') {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origem]);

    if (!resultado.success) {
      const errors = resultado.error.issues.map((issue) => ({
        field: issue.path.join('.') || origem,
        message: issue.message,
      }));
      return next(new AppError(422, 'Dados inválidos.', errors));
    }

    req.valid = { ...req.valid, [origem]: resultado.data };
    next();
  };
}

module.exports = validate;
