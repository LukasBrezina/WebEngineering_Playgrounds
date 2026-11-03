import Fastify from 'fastify';
import { readFileSync } from 'node:fs';
import { getBears } from './bears.js';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version: string };

const app = Fastify({ logger: true });

const health = async (): Promise<object> => ({
  status: 'ok',
  version,
  uptime: process.uptime(),
});
app.get('/health', health);
app.get('/api/health', health);

app.get('/api/bears', async () => await getBears());

app.get<{ Params: { id: string } }>(
  '/api/bears/:id',
  async ({ params }, reply) => {
    const bear = (await getBears()).find((b) => b.id === params.id);
    return bear ?? (await reply.code(404).send({ error: 'Bear not found' }));
  }
);

await app.listen({ port: 3000, host: '0.0.0.0' });
