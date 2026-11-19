# Playground 5 – Task 5: Lost update

`POST /api/comments/:commentId/report` increments `report_count`; at the third report the comment is hidden (`hidden_at` is set, hidden comments are no longer listed). The script `comments-transaction-test.ts` sends 50 concurrent reports for one comment.

## How to run

```bash
docker compose up -d db
npm run dev
npm run comments:transaction-test -w apps/api
```

The script creates a new comment, starts 50 `POST /api/comments/:id/report` requests at the same time (`Promise.all`) and then reads `report_count` from the database.

Both versions are in `apps/api/src/services/comments.ts`. The route in `apps/api/src/app.ts` uses the fixed `report`; to reproduce the race, change `commentService.report(...)` to `commentService.reportNaive(...)` in the route (`npm run dev` reloads automatically) and run the script again.

## Result

| Version | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 |
|---|---|---|---|---|---|
| Naive (`reportNaive`) | 4 / 50 | 10 / 50 | 4 / 50 | 3 / 50 | 2 / 50 |
| Fixed (`report`) | 50 / 50 | 50 / 50 | 50 / 50 | 50 / 50 | 50 / 50 |

With the naive version 40–48 of the 50 reports were lost in every run; in run 5 the comment was not even hidden (`report_count` 2, so `hidden_at` stayed `null`), although it was reported 50 times. The fixed version counted every report in all five runs.

## Explanation

**Naive version (lost update):**

```ts
const state = await comments.findReportState(id);   // SELECT report_count ...
const next = addReport(state);                       // + 1 in TypeScript
await comments.saveReportState(next);                // UPDATE ... SET report_count = <new value>
```

- Read and write are two separate statements without a transaction or a lock.
- The 50 requests run at the same time (the API handles them concurrently, the pool has 10 connections). Many of them read the same old value, e.g. `0`, before any of them has written.
- Each of them computes `0 + 1 = 1` and writes `1`. The later write overwrites the earlier one: the increments of the other requests are **lost**. The final value depends only on how many "rounds" of reads and writes happened, here 2–10 instead of 50.
- Read committed (PostgreSQL's default) does not prevent this: every statement only sees committed data, but nothing stops two requests from reading the same committed value and both writing their own result.

**Fixed version (transaction + row lock):**

```ts
await comments.transaction(async (tx) => {
  const state = await tx.findReportStateForUpdate(id); // SELECT ... FOR UPDATE
  const next = addReport(state);
  await tx.saveReportState(next);                      // UPDATE ...
});                                                    // COMMIT releases the lock
```

- `SELECT ... FOR UPDATE` locks the comment row. A second request that wants the same row **waits** until the first transaction commits, and then reads the already incremented value.
- So read, increment and write happen one after another for this row, and every report is counted: exactly 50.
- The **transaction boundary is in the service** (`report` decides where the transaction starts and ends), the repository only offers `transaction(fn)` and the locking read. The rule "hidden at three reports" stays in TypeScript, inside the same transaction.
- Alternative: an atomic `UPDATE comments SET report_count = report_count + 1 ... RETURNING report_count` lets the database do the increment in one statement and also ends with 50. `FOR UPDATE` was chosen because the read-modify-write logic (including `hidden_at`) stays in the service.
