# API de Reserva de Salas

Projeto de Desenvolvimento de API Backend. Node.js, Express, Prisma e SQLite.

## Como rodar

```
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Teste: http://localhost:3000/api/health

## Testes

Rode `npx prisma migrate dev` antes, para o banco existir.

```
npm test
```

## Pastas

- `prisma/` schema do banco e migrations
- `src/app.js` configuração do Express e rotas
- `src/errors.js` AppError, rota não encontrada e tratamento de erros
- `src/server.js` sobe o servidor
- `tests/` testes com Jest e Supertest

## Formato de erro

```
{ "status": 409, "message": "A sala já está reservada nesse horário." }
```

Para lançar um erro: `throw new AppError(409, 'mensagem')`.

## Git

Uma branch por funcionalidade e pull request revisado por outro integrante antes de ir para a main.
