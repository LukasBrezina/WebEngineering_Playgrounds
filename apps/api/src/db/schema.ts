import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  integer,
} from 'drizzle-orm/pg-core';

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

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(), // send to browser in session cookie
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)]
);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bearId: text('bear_id')
      .notNull()
      .references(() => bears.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    authorId: uuid('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    text: text('text').notNull(),
    // precision 3 = milliseconds, same as JavaScript Date. With the default
    // (microseconds) a cursor built from a JS date would not match the stored value.
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    reportCount: integer('report_count').notNull().default(0),
    hiddenAt: timestamp('hidden_at', { withTimezone: true, precision: 3 }),
  },
  (t) => [
    index('comments_bear_id_created_at_id_idx').on(t.bearId, t.createdAt, t.id),
  ]
);
