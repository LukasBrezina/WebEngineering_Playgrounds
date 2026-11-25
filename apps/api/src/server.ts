import { buildApp } from './app.js';
import { config } from './config.js';
import { db, pool } from './db.js';
import {
  createDrizzleBearRepository,
  createDrizzleCommentRepository,
  createDrizzleHealthCheck,
  createDrizzleSessionRepository,
  createDrizzleUserRepository,
} from './repositories/drizzle.js';

const app = await buildApp({
  repos: {
    bears: createDrizzleBearRepository(db),
    comments: createDrizzleCommentRepository(db),
    users: createDrizzleUserRepository(db),
    sessions: createDrizzleSessionRepository(db),
    health: createDrizzleHealthCheck(db),
  },
  corsOrigins: config.CORS_ORIGINS,
  secureCookies: config.NODE_ENV === 'production',
  trustProxy: config.TRUST_PROXY,
});

app.addHook('onClose', async () => {
  await pool.end();
});

await app.listen({ port: config.PORT, host: config.HOST });
