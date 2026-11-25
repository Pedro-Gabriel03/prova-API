# API de Reserva de Salas

Projeto de Desenvolvimento de API Backend. Node.js, Express, Prisma e SQLite.

## Como rodar

```
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

Teste: http://localhost:3000/api/health

O seed cria o usuário administrador (e-mail e senha em `ADMIN_EMAIL` e `ADMIN_PASSWORD`, no `.env`,
com a senha gravada em hash bcrypt) e quatro salas de exemplo. Pode rodar mais de uma vez sem duplicar.

## Rotas de salas (`/api/rooms`)

| Método | Rota | Resposta |
| ------ | ---- | -------- |
| GET | `/api/rooms?page=1&size=10` | 200 com `data`, `page`, `size`, `total` e `totalPages` |
| GET | `/api/rooms/:id` | 200 com a sala |
| POST | `/api/rooms` | 201 com a sala criada |
| PUT | `/api/rooms/:id` | 200 com a sala atualizada |
| DELETE | `/api/rooms/:id` | 204 sem corpo |

Corpo esperado em POST/PUT:

```json
{ "name": "Sala 1", "capacity": 10, "location": "Bloco A" }
```

Erros: 404 sala não encontrada, 409 nome repetido ou sala com reservas, 422 dados inválidos.
A proteção de POST, PUT e DELETE só para admin entra junto com o login (JWT).

## Testes

```
npm test
```

Usam um banco separado (`prisma/test.db`), recriado a cada execução. O banco de desenvolvimento não é alterado.

## Pastas

- `prisma/` schema, migrations e seed
- `src/app.js` configuração do Express e rotas
- `src/routes/` rotas de cada recurso
- `src/validations/` schemas do zod
- `src/validate.js` middleware que aplica os schemas
- `src/errors.js` AppError, rota não encontrada e tratamento de erros
- `src/server.js` sobe o servidor
- `tests/` testes com Jest e Supertest

## Formato de erro

```
{ "status": 409, "message": "Sala possui reservas e não pode ser removida." }
```

Erros de validação trazem a lista de campos:

```
{ "status": 422, "message": "Dados inválidos.", "errors": [{ "field": "capacity", "message": "..." }] }
```

Para lançar um erro: `throw new AppError(409, 'mensagem')`.

## Git

Uma branch por funcionalidade e pull request revisado por outro integrante antes de ir para a main.
