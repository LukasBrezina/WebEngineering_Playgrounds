import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type App, buildApp } from './app.js';
import type { Bear } from './models/bear.js';
import type { Comment } from './models/comments.js';
import {
  createMemoryBearRepository,
  createMemoryCommentRepository,
  createMemoryHealthCheck,
} from './repositories/test/memory.js';

const BEARS: Bear[] = [
  {
    id: 'u-arctos',
    name: 'Brown bear',
    binomial: 'U. arctos',
    imageUrl: '/media/brown.jpg',
    range: 'Eurasia and North America',
  },
  {
    id: 'u-maritimus',
    name: 'Polar bear',
    binomial: 'U. maritimus',
    imageUrl: '/media/polar.jpg',
    range: 'Arctic',
  },
];

let app: App;

beforeEach(async () => {
  app = await buildApp({
    repos: {
      bears: createMemoryBearRepository(BEARS),
      comments: createMemoryCommentRepository(),
      health: createMemoryHealthCheck(),
    },
    corsOrigins: [],
    logger: false,
  });
});

afterEach(async () => {
  await app.close();
});

const postComment = async (
  bearId: string,
  body: unknown
): Promise<Awaited<ReturnType<App['inject']>>> =>
  await app.inject({
    method: 'POST',
    url: `/api/bears/${bearId}/comments`,
    payload: body as Record<string, unknown>,
  });

describe('bears', () => {
  it('lists all bears', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/bears' });
    expect(res.statusCode).toBe(200);
    expect(res.json<Bear[]>().map((b) => b.id)).toEqual([
      'u-arctos',
      'u-maritimus',
    ]);
  });

  it('returns one bear and 404 for an unknown one', async () => {
    const found = await app.inject({
      method: 'GET',
      url: '/api/bears/u-arctos',
    });
    expect(found.statusCode).toBe(200);
    expect(found.json<Bear>().name).toBe('Brown bear');

    const missing = await app.inject({
      method: 'GET',
      url: '/api/bears/unknown',
    });
    expect(missing.statusCode).toBe(404);
    expect(missing.headers['content-type']).toContain(
      'application/problem+json'
    );
  });
});

describe('comments', () => {
  it('creates a comment (201) and lists it for its bear only', async () => {
    const created = await postComment('u-arctos', {
      author: 'Bob',
      text: 'Nice bear!',
    });
    expect(created.statusCode).toBe(201);
    const comment = created.json<Comment>();
    expect(created.headers.location).toBe(`/api/comments/${comment.id}`);

    const list = await app.inject({
      method: 'GET',
      url: '/api/bears/u-arctos/comments',
    });
    expect(list.json<Comment[]>()).toEqual([comment]);

    const other = await app.inject({
      method: 'GET',
      url: '/api/bears/u-maritimus/comments',
    });
    expect(other.json<Comment[]>()).toEqual([]);
  });

  it('rejects an invalid body with 400', async () => {
    const res = await postComment('u-arctos', { author: '', text: '' });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for comments of an unknown bear', async () => {
    const res = await postComment('unknown', { author: 'Bob', text: 'Hi' });
    expect(res.statusCode).toBe(404);
  });

  it('deletes a comment (204), a second delete is 404', async () => {
    const { id } = (
      await postComment('u-arctos', { author: 'Bob', text: 'Hi' })
    ).json<Comment>();

    const first = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${id}`,
    });
    expect(first.statusCode).toBe(204);

    const second = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${id}`,
    });
    expect(second.statusCode).toBe(404);
  });
});

describe('health', () => {
  it('is ready when the health check succeeds', async () => {
    const res = await app.inject({ method: 'GET', url: '/health/ready' });
    expect(res.statusCode).toBe(200);
  });
});
