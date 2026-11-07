import Fastify, { type FastifyError } from 'fastify';
import { readFileSync } from 'node:fs';
import { getBears } from './bears.js';
import { randomUUID } from 'node:crypto';
import { type Comment, comments, createComment } from './models/comments.js';
import { HttpError, NotFoundError } from './errors.js';
import { STATUS_CODES } from 'node:http';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version: string };

const app = Fastify({
  logger: true,
  requestIdHeader: 'x-request-id',
  genReqId: () => randomUUID(),
});

app.addHook('onRequest', async (req, reply) => {
  void reply.header('x-request-id', req.id);
});

app.setNotFoundHandler(async (req) => {
  throw new NotFoundError(`Route ${req.method} ${req.url}`);
});

app.setErrorHandler((err: FastifyError | HttpError, req, reply) => {
  const validation = 'validation' in err ? err.validation : undefined;
  const status =
    err instanceof HttpError
      ? err.status
      : validation !== undefined
        ? 400
        : Math.min(err.statusCode ?? 500, 500);

  (status >= 500 ? req.log.error : req.log.warn).call(
    req.log,
    { err },
    'request failed'
  );

  const expected = status < 500 || err instanceof HttpError;
  return reply
    .code(status)
    .type('application/problem+json')
    .send({
      type: 'about:blank',
      title: err instanceof HttpError ? err.title : STATUS_CODES[status],
      status,
      detail: expected ? err.message : 'Internal Server Error',
      instance: `urn:request:${req.id}`,
      errors: validation?.map((v) => ({
        pointer: v.instancePath,
        message: v.message,
      })),
    });
});

const health = async (): Promise<object> => ({
  status: 'ok',
  version,
  uptime: process.uptime(),
});
app.get('/health', health);
app.get('/api/health', health);

app.get('/api/bears', async () => await getBears());

app.get<{ Params: { id: string } }>('/api/bears/:id', async ({ params }) => {
  const bear = (await getBears()).find((b) => b.id === params.id);
  if (bear === undefined) throw new NotFoundError('Bear');
  return bear;
});

app.get('/api/comments', async () => {
  return [...comments.values()];
});

app.post<{ Body: { author: string; text: string } }>(
  '/api/comments',
  { schema: createComment },
  async ({ body }, reply) => {
    const comment: Comment = {
      id: randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };
    comments.set(comment.id, comment);
    return await reply
      .code(201)
      .header('Location', `/api/comments/${comment.id}`)
      .send(comment);
  }
);

app.delete<{ Params: { commentId: string } }>(
  '/api/comments/:commentId',
  async ({ params }, reply) => {
    if (!comments.delete(params.commentId)) throw new NotFoundError('Comment');
    return await reply.code(204).send();
  }
);

app.get('/api/debug/provoke', async () => {
  throw new Error('Provoked 500');
});

await app.listen({ port: 3000, host: '0.0.0.0' });
