import { afterAll, inject } from 'vitest';

import { closeMysqlPool } from '@/lib/mysql/pool';

import './provided-context';

// Aponta o pool da aplicação para o banco de teste criado no setup global,
// antes de qualquer consulta.
const config = inject('lyraMysqlTest');
process.env.MYSQL_HOST = config.host;
process.env.MYSQL_PORT = String(config.port);
process.env.MYSQL_USER = config.user;
process.env.MYSQL_PASSWORD = config.password;
process.env.MYSQL_DATABASE = config.database;

afterAll(async () => {
  await closeMysqlPool();
});
