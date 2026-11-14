import { asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '../db.js';
import { bears, comments } from '../db/schema.js';
import type { Comment } from '../models/comments.js';
import type {
  BearRepository,
  CommentRepository,
  HealthCheck,
} from './types.js';

const bearColumns = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  imageUrl: bears.imageUrl,
  range: bears.range,
};

export const createDrizzleBearRepository = (db: Database): BearRepository => ({
  list: async () =>
    await db.select(bearColumns).from(bears).orderBy(asc(bears.name)),

  findById: async (id) => {
    const [bear] = await db
      .select(bearColumns)
      .from(bears)
      .where(eq(bears.id, id))
      .limit(1);
    return bear;
  },
});

// createdAt needs to be converted to ISO string
const toComment = (row: typeof comments.$inferSelect): Comment => ({
  id: row.id,
  bearId: row.bearId,
  author: row.author,
  text: row.text,
  createdAt: row.createdAt.toISOString(),
});

const isUuid = (id: string): boolean => z.uuid().safeParse(id).success;

export const createDrizzleCommentRepository = (
  db: Database
): CommentRepository => ({
  listByBear: async (bearId) => {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.bearId, bearId))
      .orderBy(asc(comments.createdAt), asc(comments.id));
    return rows.map(toComment);
  },

  create: async (input) => {
    const [row] = await db.insert(comments).values(input).returning();
    return toComment(row);
  },

  delete: async (id) => {
    if (!isUuid(id)) return false;
    const deleted = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    return deleted.length > 0;
  },
});

export const createDrizzleHealthCheck = (db: Database): HealthCheck => ({
  ping: async () => {
    await db.execute(sql`SELECT 1`);
  },
});
