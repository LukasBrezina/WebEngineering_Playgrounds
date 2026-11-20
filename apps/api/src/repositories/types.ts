import type { Bear } from '../models/bear.js';
import type { Comment } from '../models/comments.js';
import type { User } from '../models/users.js';

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

export interface NewUser {
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  // undefined means email already in use (unique constraint)
  create: (input: NewUser) => Promise<User | undefined>;
  // user plus stored hash, only for the login check
  findCredentialsByEmail: (
    email: string
  ) => Promise<{ user: User; passwordHash: string } | undefined>;
}

export interface NewSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionRepository {
  create: (input: NewSession) => Promise<void>;
  // undefined = unknown or expired session
  findUser: (sessionId: string) => Promise<User | undefined>;
  delete: (sessionId: string) => Promise<void>;
}

export interface HealthCheck {
  ping: () => Promise<void>;
}

export interface Repositories {
  bears: BearRepository;
  comments: CommentRepository;
  users: UserRepository;
  sessions: SessionRepository;
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
