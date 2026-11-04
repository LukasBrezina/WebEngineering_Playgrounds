import Fastify from 'fastify';
import { readFileSync } from 'node:fs';
import { getBears } from './bears.js';
import { randomUUID } from 'node:crypto';
import {Comment, comments, createCommentSchema} from "./models/comments.js";

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

app.get('/api/comments', async () => {
    return [...comments.values()];
});

app.post('/api/comments', async (request, reply) => {
    const result = createCommentSchema.safeParse(request.body);

    if (!result.success) {
        return reply.code(400).send({
            error: 'Invalid comment',
            details: result.error.issues,
        });
    }

    const comment: Comment = {
        id: randomUUID(),
        author: result.data.author,
        text: result.data.text,
        createdAt: new Date().toISOString(),
    };

    comments.set(comment.id, comment);

    return reply
        .code(201)
        .header('Location', `/api/comments/${comment.id}`)
        .send(comment);
});

app.delete<{ Params: { commentId: string } }>(
    '/api/comments/:commentId',
    async ({ params }, reply) => {
        if (!comments.has(params.commentId)) {
            return reply.code(404).send({
                error: 'Comment not found',
            });
        }

        comments.delete(params.commentId);

        return reply.code(204).send();
    }
);

await app.listen({ port: 3000, host: '0.0.0.0' });
