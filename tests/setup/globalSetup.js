const { execSync } = require('child_process');

// roda uma vez antes dos testes: recria o banco de teste com o schema atual
module.exports = async () => {
  execSync('npx prisma db push --skip-generate --force-reset', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
};
