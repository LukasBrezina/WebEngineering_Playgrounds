import Fastify from 'fastify';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version: string };

const app = Fastify({ logger: true });

app.get('/health', async () => ({
  status: 'ok',
  version,
  uptime: process.uptime(),
}));

await app.listen({ port: 3000, host: '0.0.0.0' });
