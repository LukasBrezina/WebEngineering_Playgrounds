import pg from 'pg';
import { config } from './config.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './db/schema.js';

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: config.DB_POOL_MAX,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('pg pool error', err);
});

export const db = drizzle(pool, { schema });
