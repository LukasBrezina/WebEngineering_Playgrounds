import { randomUUID } from 'node:crypto';
import type { Bear } from '../../models/bear.js';
import type { Comment } from '../../models/comments.js';
import type { User } from '../../models/users.js';
import {
  type BearRepository,
  type CommentKey,
  type CommentRepository,
  type HealthCheck,
  type ReportState,
  type UserRepository,
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
  const reports = new Map<string, ReportState>();

  const findReportState = async (
    id: string
  ): Promise<ReportState | undefined> => {
    if (!comments.has(id)) return undefined;
    return reports.get(id) ?? { id, reportCount: 0, hiddenAt: null };
  };

  const repository: CommentRepository = {
    listByBear: async (bearId, { limit, after }) => {
      const rows = [...comments.values()]
        .filter((c) => c.bearId === bearId)
        .filter((c) => (reports.get(c.id)?.hiddenAt ?? null) === null)
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

    delete: async (id) => {
      reports.delete(id);
      return comments.delete(id);
    },

    findReportState,
    findReportStateForUpdate: findReportState,

    saveReportState: async (state) => {
      reports.set(state.id, state);
    },

    transaction: async (fn) => await fn(repository),
  };
  return repository;
};

export const createMemoryUserRepository = (): UserRepository => {
  const users = new Map<string, User>(); // key: email
  return {
    create: async ({ email }) => {
      if (users.has(email)) return undefined;
      const user: User = {
        id: randomUUID(),
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      users.set(email, user);
      return user;
    },
  };
};

export const createMemoryHealthCheck = (): HealthCheck => ({
  ping: async () => {},
});
