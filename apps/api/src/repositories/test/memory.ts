import { randomUUID } from 'node:crypto';
import type { Bear } from '../../models/bear.js';
import type { Comment } from '../../models/comments.js';
import {
  type BearRepository,
  type CommentKey,
  type CommentRepository,
  type HealthCheck,
  toCommentPage,
} from '../types.js';

// In-memory implementations (Map, Playground 4) – used by tests
export const createMemoryBearRepository = (
  initial: Bear[] = []
): BearRepository => {
  const bears = [...initial].sort((a, b) => a.name.localeCompare(b.name));
  return {
    list: async ({ q } = {}) => {
      const term = q?.toLowerCase();
      return bears.filter(
        (b) => term === undefined || b.name.toLowerCase().includes(term)
      );
    },
    findById: async (id) => bears.find((b) => b.id === id),
  };
};

const compareKey = (a: CommentKey, b: CommentKey): number =>
  a.createdAt === b.createdAt
    ? a.id.localeCompare(b.id)
    : a.createdAt.localeCompare(b.createdAt);

export const createMemoryCommentRepository = (): CommentRepository => {
  const comments = new Map<string, Comment>();
  return {
    listByBear: async (bearId, { limit, after }) => {
      const rows = [...comments.values()]
        .filter((c) => c.bearId === bearId)
        .filter((c) => after === undefined || compareKey(c, after) > 0)
        .sort(compareKey)
        .slice(0, limit + 1);
      return toCommentPage(rows, limit);
    },

    create: async (input) => {
      const comment: Comment = {
        id: randomUUID(),
        ...input,
        createdAt: new Date().toISOString(),
      };
      comments.set(comment.id, comment);
      return comment;
    },

    delete: async (id) => comments.delete(id),
  };
};

export const createMemoryHealthCheck = (): HealthCheck => ({
  ping: async () => {},
});
