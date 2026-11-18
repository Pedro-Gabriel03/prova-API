const express = require('express');
const { notFound, errorHandler } = require('./errors');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// TODO: rotas de auth, rooms e reservations

app.use(notFound);
app.use(errorHandler);

module.exports = app;
