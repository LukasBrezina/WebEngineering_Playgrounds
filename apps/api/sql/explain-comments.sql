\echo '=== number of comments in total and for u-arctos'
SELECT count(*) AS total,
       count(*) FILTER (WHERE bear_id = 'u-arctos') AS u_arctos
FROM comments;

\echo '=== indexes on comments'
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'comments';

\echo '=== comments query (first page), limit 20 + 1'
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM comments
WHERE bear_id = 'u-arctos'
ORDER BY created_at, id
LIMIT 21;
