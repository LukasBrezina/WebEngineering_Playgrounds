import type { Bear } from '../models/bear.js';
import type { Comment } from '../models/comments.js';

export interface BearRepository {
  list: () => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface NewComment {
  bearId: string;
  author: string;
  text: string;
}

export interface CommentRepository {
  listByBear: (bearId: string) => Promise<Comment[]>;
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
