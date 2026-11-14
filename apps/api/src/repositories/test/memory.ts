import { randomUUID } from 'node:crypto';
import type { Bear } from '../../models/bear.js';
import type { Comment } from '../../models/comments.js';
import type {
  BearRepository,
  CommentRepository,
  HealthCheck,
} from '../types.js';

// In-memory implementations (Map, Playground 4) – used by tests
export const createMemoryBearRepository = (
  initial: Bear[] = []
): BearRepository => {
  const bears = [...initial].sort((a, b) => a.name.localeCompare(b.name));
  return {
    list: async () => [...bears],
    findById: async (id) => bears.find((b) => b.id === id),
  };
};

export const createMemoryCommentRepository = (): CommentRepository => {
  const comments = new Map<string, Comment>();
  return {
    listByBear: async (bearId) =>
      [...comments.values()].filter((c) => c.bearId === bearId),

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
