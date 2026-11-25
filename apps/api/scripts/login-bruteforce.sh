#!/usr/bin/env sh
# Playground 6, Task 4: brute force against the login -> 401 until the limit, then 429
# usage: sh apps/api/scripts/login-bruteforce.sh [base-url] (default http://localhost:8080)
BASE_URL=${1:-http://localhost:8080}

for i in $(seq 1 8); do
  curl -s -o /dev/null -w "attempt $i: %{http_code}  retry-after: %header{retry-after}\n" \
    -X POST "$BASE_URL/api/auth/login" \
    -H 'content-type: application/json' \
    -d '{"email":"victim@bears.test","password":"wrong-password-guess"}'
done
