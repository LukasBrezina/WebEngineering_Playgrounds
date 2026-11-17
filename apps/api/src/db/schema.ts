import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const bears = pgTable('bears', {
  id: text('id').primaryKey(), // binomial slug
  name: text('name').notNull(),
  binomial: text('binomial').notNull().unique(),
  imageUrl: text('image_url').notNull(),
  range: text('range').notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bearId: text('bear_id')
      .notNull()
      .references(() => bears.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    text: text('text').notNull(),
    // precision 3 = milliseconds, same as JavaScript Date. With the default
    // (microseconds) a cursor built from a JS date would not match the stored value.
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  // keyset pagination: WHERE bear_id = ? AND (created_at, id) > (?, ?) ORDER BY created_at, id
  (t) => [
    index('comments_bear_id_created_at_id_idx').on(t.bearId, t.createdAt, t.id),
  ]
);
