require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/prisma');

// hashes do bcrypt começam com $2a$, $2b$ ou $2y$
const ehBcrypt = (hash) => /^\$2[aby]\$/.test(hash);

async function criarAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@sistema.com';
  const senha = process.env.ADMIN_PASSWORD || 'admin123';

  const adminExistente = await prisma.user.findUnique({ where: { email } });

  if (!adminExistente) {
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        passwordHash: await bcrypt.hash(senha, 10),
        role: 'admin',
      },
    });
    console.log('Usuário administrador criado: ' + email);
    return;
  }

  // admin criado antes com outro tipo de hash: refaz com bcrypt para o login funcionar
  if (!ehBcrypt(adminExistente.passwordHash)) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash: await bcrypt.hash(senha, 10) },
    });
    console.log('Hash do administrador atualizado para bcrypt: ' + email);
    return;
  }

  console.log('Usuário administrador já existe (' + email + '). Nada a fazer.');
}

async function criarSalas() {
  const salas = [
    { name: 'Sala 101', capacity: 40, location: 'Bloco A, 1º andar' },
    { name: 'Sala 102', capacity: 30, location: 'Bloco A, 1º andar' },
    { name: 'Laboratório de Informática 1', capacity: 25, location: 'Bloco B, térreo' },
    { name: 'Laboratório de Redes', capacity: 20, location: 'Bloco B, 2º andar' },
  ];

  for (const sala of salas) {
    // upsert pelo nome (que é único): não duplica se o seed rodar de novo
    await prisma.room.upsert({ where: { name: sala.name }, update: {}, create: sala });
  }
  console.log('Salas de exemplo conferidas: ' + salas.length);
}

async function main() {
  await criarAdmin();
  await criarSalas();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
