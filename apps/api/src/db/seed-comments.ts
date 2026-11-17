import { sql } from 'drizzle-orm';
import { db, pool } from '../db.js';

const COUNT = 100_000;

try {
  const bears = await db.execute<{ total: number }>(
    sql`SELECT count(*)::int AS total FROM bears`
  );
  if ((bears.rows[0]?.total ?? 0) === 0) {
    throw new Error('No bears in the database – run npm run db:seed first');
  }

  const inserted = await db.execute(sql`
    INSERT INTO comments (bear_id, author, text, created_at)
    SELECT b.ids[1 + i % array_length(b.ids, 1)],
           'Seed user ' || (i % 50),
           'Seeded comment ' || i,
           now() - i * interval '1 second'
    FROM generate_series(1, ${COUNT}) AS i,
         (SELECT array_agg(id ORDER BY id) AS ids FROM bears) AS b
  `);

  await db.execute(sql`ANALYZE comments`);
  console.log(`inserted ${inserted.rowCount ?? 0} comments`);
} finally {
  await pool.end();
}
