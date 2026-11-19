# Playground 5 – Task 4: Index measurement

`EXPLAIN ANALYZE` of the comments query without and with the index on (`bear_id`, `created_at`, `id`).

## How to measure

### 1. Start the database and fill it

```bash
docker compose up --build -d                 # db + api (runs migrations and the bear seed) + web
npm run db:seed:comments -w apps/api         # 100,000 comments, one second apart, spread over all bears
```

`db:seed:comments` adds rows every time it runs. For a clean start: `docker compose down -v` (deletes the volume) and `docker compose up --build -d` again.

### 2. Measure with the index

The index exists after migration `0001`.

```bash
docker compose exec -T db psql -U web -d web -f - < apps/api/sql/explain-comments.sql
```

### 3. Drop the index and measure without it

```bash
docker compose exec -T db psql -U web -d web -c "DROP INDEX comments_bear_id_created_at_id_idx;" -c "ANALYZE comments;"
docker compose exec -T db psql -U web -d web -f - < apps/api/sql/explain-comments.sql
```

### 4. Restore the index

Same statement as in migration `0001`. Running `db:migrate` again would not recreate it, because the migration is already recorded as applied.

```bash
docker compose exec -T db psql -U web -d web -c 'CREATE INDEX "comments_bear_id_created_at_id_idx" ON "comments" USING btree ("bear_id","created_at","id");' -c "ANALYZE comments;"
```

`explain-comments.sql` prints the row counts, the existing indexes and the plan of the comments query (first page of `u-arctos`, the query the API sends without cursor). Each variant was run three times; the table below uses the median.

## Result

100,000 comments, 12,500 of them for `u-arctos`, `LIMIT 21`, PostgreSQL 18.7.

| | Without index | With index |
|---|---|---|
| Plan | `Seq Scan` → `Sort` (top-N heapsort) → `Limit` | `Index Scan` → `Limit`, no sort |
| Rows read | 100,000 (87,500 removed by the filter) | 21 |
| Buffers (8 kB pages) | 1,241 | 6 |
| Execution time | **4.470 ms** (runs: 4.219 / 4.626 / 4.470) | **0.028 ms** (runs: 0.028 / 0.031 / 0.023) |
| Factor | | about **160×** faster, about **200×** fewer pages read |

## Plan without index

```
 Limit  (cost=2824.26..2824.31 rows=21 width=67) (actual time=4.454..4.456 rows=21.00 loops=1)
   Buffers: shared hit=1241
   ->  Sort  (cost=2824.26..2855.72 rows=12583 width=67) (actual time=4.453..4.454 rows=21.00 loops=1)
         Sort Key: created_at, id
         Sort Method: top-N heapsort  Memory: 30kB
         Buffers: shared hit=1241
         ->  Seq Scan on comments  (cost=0.00..2485.00 rows=12583 width=67) (actual time=0.002..3.350 rows=12500.00 loops=1)
               Filter: (bear_id = 'u-arctos'::text)
               Rows Removed by Filter: 87500
               Buffers: shared hit=1235
 Planning:
   Buffers: shared hit=44
 Planning Time: 0.083 ms
 Execution Time: 4.470 ms
```

## Plan with index

```
 Limit  (cost=0.42..9.64 rows=21 width=67) (actual time=0.016..0.020 rows=21.00 loops=1)
   Buffers: shared hit=6
   ->  Index Scan using comments_bear_id_created_at_id_idx on comments  (cost=0.42..5477.81 rows=12470 width=67) (actual time=0.015..0.019 rows=21.00 loops=1)
         Index Cond: (bear_id = 'u-arctos'::text)
         Index Searches: 1
         Buffers: shared hit=6
 Planning:
   Buffers: shared hit=47
 Planning Time: 0.102 ms
 Execution Time: 0.028 ms
```

## Interpretation

- **Without the index** PostgreSQL has no way to find the comments of one bear: it reads the whole table (`Seq Scan`, 1,235 pages), throws away 87,500 rows of other bears and then sorts the remaining 12,500 rows to get the first 21. The cost grows with the size of the whole table, not with the page size.
- **With the index** the rows are already stored in the order `bear_id, created_at, id`. PostgreSQL jumps directly to `bear_id = 'u-arctos'`, reads the next 21 entries in the right order and stops. There is no `Sort` node, and only 6 pages are touched.
- **Column order matters:** `bear_id` comes first because it is compared with `=`, then `created_at, id` because they are the sort and range columns. An index (`created_at`, `bear_id`) could not jump to one bear.
- The previous index from migration `0000` was (`bear_id`, `created_at`). It was replaced, because the cursor compares (`created_at`, `id`), and without `id` in the index the tie-breaker would not be covered.
