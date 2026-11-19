import { and, asc, eq, ilike, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '../db.js';
import { bears, comments } from '../db/schema.js';
import type { Comment } from '../models/comments.js';
import {
  type BearRepository,
  type CommentRepository,
  type HealthCheck,
  type ReportState,
  toCommentPage,
} from './types.js';

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
type Executor = Database | Transaction;

const bearColumns = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  imageUrl: bears.imageUrl,
  range: bears.range,
};

export const createDrizzleBearRepository = (db: Database): BearRepository => ({
  list: async ({ q } = {}) =>
    await db
      .select(bearColumns)
      .from(bears)
      .where(q === undefined ? undefined : ilike(bears.name, `%${q}%`))
      .orderBy(asc(bears.name)),

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

const reportColumns = {
  id: comments.id,
  reportCount: comments.reportCount,
  hiddenAt: comments.hiddenAt,
};

export const createDrizzleCommentRepository = (
  db: Executor
): CommentRepository => ({
  listByBear: async (bearId, { limit, after }) => {
    const rows = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.bearId, bearId),
          isNull(comments.hiddenAt),
          after === undefined
            ? undefined
            : sql`(${comments.createdAt}, ${comments.id}) > (${after.createdAt}::timestamptz, ${after.id}::uuid)`
        )
      )
      .orderBy(asc(comments.createdAt), asc(comments.id))
      .limit(limit + 1);
    return toCommentPage(rows.map(toComment), limit);
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

  findReportState: async (id): Promise<ReportState | undefined> => {
    if (!isUuid(id)) return undefined;
    const [row] = await db
      .select(reportColumns)
      .from(comments)
      .where(eq(comments.id, id));
    return row;
  },

  findReportStateForUpdate: async (id): Promise<ReportState | undefined> => {
    if (!isUuid(id)) return undefined;
    const [row] = await db
      .select(reportColumns)
      .from(comments)
      .where(eq(comments.id, id))
      .for('update');
    return row;
  },

  saveReportState: async ({ id, reportCount, hiddenAt }) => {
    await db
      .update(comments)
      .set({ reportCount, hiddenAt })
      .where(eq(comments.id, id));
  },

  transaction: async (fn) =>
    await db.transaction(
      async (tx) => await fn(createDrizzleCommentRepository(tx))
    ),
});

export const createDrizzleHealthCheck = (db: Database): HealthCheck => ({
  ping: async () => {
    await db.execute(sql`SELECT 1`);
  },
});
