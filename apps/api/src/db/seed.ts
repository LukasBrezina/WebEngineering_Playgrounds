import { sql } from 'drizzle-orm';
import { fetchBearsFromWikipedia } from '../bears.js';
import { db, pool } from '../db.js';
import { bears } from './schema.js';

try {
  // fetch bears as in Playground 4 and upsert into database
  const rows = await fetchBearsFromWikipedia();
  const fetchedAt = new Date();

  await db
    .insert(bears)
    .values(rows.map((bear) => ({ ...bear, fetchedAt })))
    .onConflictDoUpdate({
      target: bears.id,
      set: {
        name: sql`excluded.name`,
        binomial: sql`excluded.binomial`,
        imageUrl: sql`excluded.image_url`,
        range: sql`excluded.range`,
        fetchedAt: sql`excluded.fetched_at`,
      },
    });
  console.log(`upserted ${rows.length} bears`);
} finally {
  await pool.end();
}
