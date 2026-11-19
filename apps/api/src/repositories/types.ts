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

export interface ReportState {
  id: string;
  reportCount: number;
  hiddenAt: Date | null;
}

export interface CommentRepository {
  listByBear: (
    bearId: string,
    page: CommentPageRequest
  ) => Promise<CommentPageResult>;
  create: (input: NewComment) => Promise<Comment>;
  delete: (id: string) => Promise<boolean>;
  findReportState: (id: string) => Promise<ReportState | undefined>;
  // SELECT ... FOR UPDATE: locks the row until the surrounding transaction ends
  findReportStateForUpdate: (id: string) => Promise<ReportState | undefined>;
  saveReportState: (state: ReportState) => Promise<void>;
  // runs fn in one transaction (COMMIT on success, ROLLBACK on error);
  // the caller (service) decides where the transaction starts and ends
  transaction: <T>(
    fn: (comments: CommentRepository) => Promise<T>
  ) => Promise<T>;
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
