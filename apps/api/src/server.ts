import Fastify, { type FastifyError } from 'fastify';
import { readFileSync } from 'node:fs';
import { getBears } from './bears.js';
import { randomUUID } from 'node:crypto';
import { type Comment, comments, createComment } from './models/comments.js';
import { HttpError, NotFoundError } from './errors.js';
import { STATUS_CODES } from 'node:http';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { bearSchema, commentSchema, problem } from './models/swaggerSchemas.js';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version: string };

const app = Fastify({
  logger: true,
  requestIdHeader: 'x-request-id',
  genReqId: () => randomUUID(),
});

await app.register(cors, {
  origin: ['http://localhost:4173', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['content-type', 'x-request-id'],
  exposedHeaders: ['x-request-id', 'location'],
  maxAge: 600,
});

app.addSchema(problem);
app.addSchema(commentSchema);
app.addSchema(bearSchema);

await app.register(swagger, {
  openapi: { openapi: '3.1.0', info: { title: 'Bears API', version } },
});
await app.register(swaggerUi, { routePrefix: '/api/docs' });

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

const problemRef = { $ref: 'Problem#' };

const health = async (): Promise<object> => ({
  status: 'ok',
  version,
  uptime: process.uptime(),
});
const healthSchema = {
  tags: ['health'],
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        version: { type: 'string' },
        uptime: { type: 'number' },
      },
    },
  },
};
app.get('/health', { schema: { ...healthSchema, hide: true } }, health);
app.get('/api/health', { schema: healthSchema }, health);

const requireBear = async (id: string): Promise<void> => {
  if (!(await getBears()).some((b) => b.id === id))
    throw new NotFoundError('Bear');
};

const bearIdParams = {
  type: 'object',
  properties: { id: { type: 'string' } },
};

app.get(
  '/api/bears',
  {
    schema: {
      tags: ['bears'],
      response: {
        200: { type: 'array', items: { $ref: 'Bear#' } },
        502: problemRef,
        504: problemRef,
      },
    },
  },
  async () => await getBears()
);

app.get<{ Params: { id: string } }>(
  '/api/bears/:id',
  {
    schema: {
      tags: ['bears'],
      response: {
        200: { $ref: 'Bear#' },
        404: problemRef,
        502: problemRef,
        504: problemRef,
      },
    },
  },
  async ({ params }) => {
    const bear = (await getBears()).find((b) => b.id === params.id);
    if (bear === undefined) throw new NotFoundError('Bear');
    return bear;
  }
);

app.get<{ Params: { id: string } }>(
  '/api/bears/:id/comments',
  {
    schema: {
      params: bearIdParams,
      tags: ['comments'],
      response: {
        200: { type: 'array', items: { $ref: 'Comment#' } },
        404: problemRef,
        502: problemRef,
        504: problemRef,
      },
    },
  },
  async ({ params }) => {
    await requireBear(params.id);
    return [...comments.values()].filter((c) => c.bearId === params.id);
  }
);

app.post<{ Params: { id: string }; Body: { author: string; text: string } }>(
  '/api/bears/:id/comments',
  {
    schema: {
      ...createComment,
      params: bearIdParams,
      tags: ['comments'],
      response: {
        201: { $ref: 'Comment#' },
        400: problemRef,
        404: problemRef,
        502: problemRef,
        504: problemRef,
      },
    },
  },
  async ({ params, body }, reply) => {
    await requireBear(params.id);
    const comment: Comment = {
      id: randomUUID(),
      bearId: params.id,
      author: body.author.trim(),
      text: body.text.trim(),
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
  {
    schema: {
      tags: ['comments'],
      response: { 204: { type: 'null' }, 404: problemRef },
    },
  },
  async ({ params }, reply) => {
    if (!comments.delete(params.commentId)) throw new NotFoundError('Comment');
    return await reply.code(204).send();
  }
);

app.get('/api/debug/provoke', { schema: { hide: true } }, async () => {
  throw new Error('Provoked 500');
});

await app.listen({ port: 3000, host: '0.0.0.0' });
