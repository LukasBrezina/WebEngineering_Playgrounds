import Fastify, { type FastifyError } from 'fastify';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { STATUS_CODES } from 'node:http';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import { config } from './config.js';
import { getBears } from './bears.js';
import { BearSchema } from './models/bear.js';
import {
  type Comment,
  CommentSchema,
  comments,
  CreateCommentSchema,
} from './models/comments.js';
import { type Problem, ProblemSchema } from './models/problem.js';
import { HttpError, NotFoundError } from './errors.js';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version: string };

// only accept requestId of this pattern
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

const app = Fastify({
  logger: true,
  requestIdHeader: false,
  genReqId: (req) => {
    const incoming = req.headers['x-request-id'];
    return typeof incoming === 'string' && REQUEST_ID_PATTERN.test(incoming)
      ? incoming
      : randomUUID();
  },
}).withTypeProvider<ZodTypeProvider>();

// validates params/body before the handler runs (failure -> err.validation -> 400)
// and checks every response against its zod schema before it is sent.
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// register() loads a plugin (hooks/routes); await = ready before the routes below are defined.
await app.register(cors, {
  origin: config.CORS_ORIGINS,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['content-type', 'x-request-id'],
  exposedHeaders: ['x-request-id', 'location'],
  maxAge: 600,
});

await app.register(swagger, {
  openapi: { openapi: '3.1.0', info: { title: 'Bears API', version } },
  transform: jsonSchemaTransform,
  transformObject: jsonSchemaTransformObject,
});
await app.register(swaggerUi, { routePrefix: '/api/docs' });

// runs first for every request -> puts the request id into the x-request-id header.
app.addHook('onRequest', async (req, reply) => {
  void reply.header('x-request-id', req.id);
});

app.setNotFoundHandler(async (req) => {
  throw new NotFoundError(`Route ${req.method} ${req.url}`);
});

// Central error handler: turns every error into RFC 9457 Problem Details (application/problem+json).
// Status from HttpError / validation (400) / Fastify (max 500); logs with reqId; field errors in `errors`.
// Unexpected errors only get a generic "Internal Server Error", details stay in the log.
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

  const errors = validation?.map((v) => ({
    pointer: v.instancePath,
    message: v.message ?? 'Invalid value',
  }));

  let detail = 'Internal Server Error';
  if (errors !== undefined) detail = errors.map((e) => e.message).join('; ');
  else if (status < 500 || err instanceof HttpError) detail = err.message;

  const problem: Problem = {
    type: 'about:blank',
    title: err instanceof HttpError ? err.title : (STATUS_CODES[status] ?? ''),
    status,
    detail,
    instance: `urn:request:${req.id}`,
    errors,
  };
  return reply.code(status).type('application/problem+json').send(problem);
});

const upstreamProblems = { 502: ProblemSchema, 504: ProblemSchema };
const BearParams = z.object({ id: z.string() });

const HealthSchema = z.object({
  status: z.literal('ok'),
  version: z.string(),
  uptime: z.number(),
});
const health = async (): Promise<z.infer<typeof HealthSchema>> => ({
  status: 'ok',
  version,
  uptime: process.uptime(),
});
app.get(
  '/health',
  { schema: { tags: ['health'], response: { 200: HealthSchema } } },
  health
);
app.get(
  '/api/health',
  { schema: { tags: ['health'], response: { 200: HealthSchema } } },
  health
);

const requireBear = async (id: string): Promise<void> => {
  if (!(await getBears()).some((b) => b.id === id))
    throw new NotFoundError('Bear');
};

app.get(
  '/api/bears',
  {
    schema: {
      tags: ['bears'],
      response: { 200: z.array(BearSchema), ...upstreamProblems },
    },
  },
  async () => await getBears()
);

app.get(
  '/api/bears/:id',
  {
    schema: {
      tags: ['bears'],
      params: BearParams,
      response: { 200: BearSchema, 404: ProblemSchema, ...upstreamProblems },
    },
  },
  async ({ params }) => {
    const bear = (await getBears()).find((b) => b.id === params.id);
    if (bear === undefined) throw new NotFoundError('Bear');
    return bear;
  }
);

app.get(
  '/api/bears/:id/comments',
  {
    schema: {
      tags: ['comments'],
      params: BearParams,
      response: {
        200: z.array(CommentSchema),
        404: ProblemSchema,
        ...upstreamProblems,
      },
    },
  },
  async ({ params }) => {
    await requireBear(params.id);
    return [...comments.values()].filter((c) => c.bearId === params.id);
  }
);

app.post(
  '/api/bears/:id/comments',
  {
    schema: {
      tags: ['comments'],
      params: BearParams,
      body: CreateCommentSchema,
      response: {
        201: CommentSchema,
        400: ProblemSchema,
        404: ProblemSchema,
        ...upstreamProblems,
      },
    },
  },
  async ({ params, body }, reply) => {
    await requireBear(params.id);
    const comment: Comment = {
      id: randomUUID(),
      bearId: params.id,
      author: body.author,
      text: body.text,
      createdAt: new Date().toISOString(),
    };
    comments.set(comment.id, comment);
    return await reply
      .code(201)
      .header('Location', `/api/comments/${comment.id}`)
      .send(comment);
  }
);

app.delete(
  '/api/comments/:commentId',
  {
    schema: {
      tags: ['comments'],
      params: z.object({ commentId: z.string() }),
      response: { 204: z.undefined(), 404: ProblemSchema },
    },
  },
  async ({ params }, reply) => {
    if (!comments.delete(params.commentId)) throw new NotFoundError('Comment');
    return await reply.code(204).send();
  }
);

// demonstration purpose (provoked 500)
app.get('/api/debug/provoke', { schema: { hide: true } }, async () => {
  throw new Error('Provoked 500');
});

await app.listen({ port: config.PORT, host: config.HOST });
