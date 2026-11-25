import argon2 from 'argon2';
import { sql } from 'drizzle-orm';
import { fetchBearsFromWikipedia } from '../source/bears.js';
import { config } from '../config.js';
import { db, pool } from '../db.js';
import { ROLE_MODERATOR } from '../models/users.js';
import { bears, users } from './schema.js';

// one moderator; the password only comes from the environment (no secrets in git)
const seedModerator = async (): Promise<void> => {
  const email = config.MODERATOR_EMAIL;
  const password = config.MODERATOR_PASSWORD;
  if (password === undefined || password === '') {
    console.warn('MODERATOR_PASSWORD not set – skipping the moderator seed');
    return;
  }
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await db
    .insert(users)
    .values({ email, passwordHash, role: ROLE_MODERATOR })
    .onConflictDoNothing();
  console.log(`seeded moderator ${email}`);
};

try {
  await seedModerator();

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
