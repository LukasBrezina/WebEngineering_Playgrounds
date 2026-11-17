# Application Startup

How to run, configure and develop the project (API, web app and database).

## With Docker (everything in containers)

```bash
docker compose up --build
```

Starts three containers: `db` (PostgreSQL 18, named volume `pgdata`, healthcheck), `api` (waits until `db` is healthy, then runs migrations, the seed and the server) and `web` (nginx on `http://localhost:8080`, proxies `/api` to the API). API directly: `http://localhost:3000`.

## Local development (`npm run dev`)

The database is a separate service and must be running before `npm run dev`. The API reads `DATABASE_URL` from `.env` in the repository root (not committed, created from `.env.example`).

```bash
npm install
cp .env.example .env                      # DATABASE_URL=postgres://web:web@localhost:5432/web
docker compose up -d db                   # only the database, port 5432
npm run db:migrate -w apps/api            # create the tables (once, and after every new migration)
npm run db:seed -w apps/api               # fetch the bears from Wikipedia and upsert them
npm run dev                               # API (tsx watch, port 3000) + web app (Vite, port 5173)
```

Vite proxies `/api` to the API, so the browser only talks to `http://localhost:5173`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | API + web app with hot reload (needs a running database and `.env`) |
| `npm run db:generate -w apps/api` | Generates a new SQL migration from `apps/api/src/db/schema.ts` (drizzle-kit) |
| `npm run db:migrate -w apps/api` | Applies all pending migrations (`apps/api/src/db/drizzle/`) |
| `npm run db:seed -w apps/api` | Fetches the bears through the BFF code (`apps/api/src/source/`) and upserts them into `bears` |
| `npm test -w apps/api` | Runs the API test suite (Vitest) against the in-memory repositories, no database needed |
| `npm run lint` / `format:check` / `typecheck` / `build` | Quality checks for both workspaces (also run in CI) |

API documentation (OpenAPI 3.1, Swagger UI): `http://localhost:3000/api/docs`, raw document at `/api/docs/json`.

Health: `/health` is the liveness check (process only), `/health/ready` the readiness check (200 if the database answers `SELECT 1`, otherwise a 503 Problem).

## Environment variables

No real secrets are needed; the database credentials are local development defaults. All variables are validated with zod at startup (`apps/api/src/config.ts`), so a missing or wrong value stops the API immediately instead of failing on the first request.

| Variable | Workspace | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | api | **none (required)** | PostgreSQL connection string. Local: from `.env` (see `.env.example`); Docker: set in `compose.yaml` (`db` as host) |
| `DB_POOL_MAX` | api | `10` | Maximum number of connections in the `pg` pool |
| `PORT` | api | `3000` | Port the API listens on |
| `HOST` | api | `0.0.0.0` | Interface the API binds to |
| `WIKIPEDIA_API_URL` | api (seed) | `https://en.wikipedia.org/w/api.php` | Upstream URL used by `db:seed`; the API itself reads bears from the database |
| `CORS_ORIGINS` | api | `http://localhost:4173,http://localhost:5173` | Comma-separated CORS allow-list (`compose.yaml` adds `http://localhost:8080`) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | compose | `web` / `web` / `web` | Credentials of the `db` container; `compose.yaml` builds the API's `DATABASE_URL` from them |
| `VITE_API_BASE_URL` | web (build time) | empty | Empty: same-origin requests to `/api`. Absolute URL (e.g. `http://localhost:3000`): cross-origin requests, used for the CORS demo with `vite preview` |

Examples:

```bash
docker compose stop db     # /health/ready -> 503, /health stays 200
docker compose start db    # /health/ready -> 200
```

```bash
VITE_API_BASE_URL=http://localhost:3000 npm run build -w apps/web && npm run preview -w apps/web
```

## Libraries beyond the lecture stack

See [README.md](README.md#libraries-beyond-the-lecture-stack).
