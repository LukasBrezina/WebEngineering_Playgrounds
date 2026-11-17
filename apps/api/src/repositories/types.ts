import type { Bear } from '../models/bear.js';
import type { Comment } from '../models/comments.js';

export interface BearFilter {
  q?: string;
}

export interface BearRepository {
  list: (filter?: BearFilter) => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface NewComment {
  bearId: string;
  author: string;
  text: string;
}

export interface CommentKey {
  createdAt: string;
  id: string;
}

export interface CommentPageRequest {
  limit: number;
  after?: CommentKey;
}

export interface CommentPageResult {
  items: Comment[];
  next: CommentKey | null; // null = no further page
}

export interface CommentRepository {
  listByBear: (
    bearId: string,
    page: CommentPageRequest
  ) => Promise<CommentPageResult>;
  create: (input: NewComment) => Promise<Comment>;
  delete: (id: string) => Promise<boolean>;
}

export interface HealthCheck {
  ping: () => Promise<void>;
}

export interface Repositories {
  bears: BearRepository;
  comments: CommentRepository;
  health: HealthCheck;
}

export const toCommentPage = (
  rows: Comment[],
  limit: number
): CommentPageResult => {
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    next:
      rows.length > limit && last !== undefined
        ? { createdAt: last.createdAt, id: last.id }
        : null,
  };
};
