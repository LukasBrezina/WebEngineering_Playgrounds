import { eq } from 'drizzle-orm';
import { db, pool } from '../db.js';
import { comments } from '../db/schema.js';

const API = 'http://localhost:3000/api';
const REPORTS = 50;

try {
  const bears = (await (await fetch(`${API}/bears`)).json()) as Array<{
    id: string;
  }>;
  const bearId = bears[0]?.id;
  if (bearId === undefined) throw new Error('No bears – run npm run db:seed');

  const created = await fetch(`${API}/bears/${bearId}/comments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ author: 'Race test', text: 'Report me 50 times' }),
  });
  const { id } = (await created.json()) as { id: string };

  // all 50 requests are started at once and run concurrently
  const responses = await Promise.all(
    Array.from(
      { length: REPORTS },
      async () =>
        await fetch(`${API}/comments/${id}/report`, { method: 'POST' })
    )
  );
  const failed = responses.filter((r) => !r.ok).length;

  const [row] = await db
    .select({ reportCount: comments.reportCount, hiddenAt: comments.hiddenAt })
    .from(comments)
    .where(eq(comments.id, id));

  console.log(`comment:        ${id}`);
  console.log(`requests:       ${REPORTS} (failed: ${failed})`);
  console.log(`report_count:   ${row.reportCount} (expected ${REPORTS})`);
  console.log(`lost updates:   ${REPORTS - row.reportCount}`);
  console.log(`hidden_at:      ${row.hiddenAt?.toISOString() ?? 'null'}`);
} finally {
  await pool.end();
}
