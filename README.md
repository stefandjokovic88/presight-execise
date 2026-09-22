# Presight User Directory

Full-stack searchable user directory: React client, Node.js/Express API, SQLite persistence.

## Stack

- **Client:** React 19, Vite, Tailwind CSS 4, TanStack Query + Virtual
- **Server:** Express 5, better-sqlite3, TypeScript
- **Data:** SQLite (`server/data/users.db`), 10,000 seeded users

## Prerequisites

- Node.js 20+ (LTS recommended)
- Yarn 4 (via Corepack: `corepack enable`)
- Docker + Docker Compose (optional)

## Local setup

```bash
# From the repo root
yarn install

# Create / refresh the SQLite database (10,000 users)
yarn seed

# Terminal 1 — API (http://localhost:3001)
yarn start:server

# Terminal 2 — UI (http://localhost:5173, proxies /api → :3001)
yarn start:client
```

Open [http://localhost:5173](http://localhost:5173).

### Useful scripts

| Command | Description |
|---------|-------------|
| `yarn seed` | Wipe and re-seed SQLite |
| `yarn start:server` | API only (tsx) |
| `yarn start:client` | Vite dev server |
| `yarn start` | Start client + server via Lerna (parallel) |
| `yarn workspace presight-server build` | Compile server to `server/dist` |
| `yarn workspace presight-client build` | Production client build to `client/dist` |

Re-running `yarn seed` deletes `server/data/users.db` and recreates it.

If the API starts against an empty DB, it seeds automatically (`ensureDatabaseSeeded`).

### Production-style local run (single port)

```bash
yarn workspace presight-client build
yarn workspace presight-server build
PORT=8080 yarn workspace presight-server start:prod
```

Then open [http://localhost:8080](http://localhost:8080) — Express serves the API and the built client.

## Docker Compose

```bash
docker compose up --build
```

- App: [http://localhost:8080](http://localhost:8080)
- SQLite data is stored in the `sqlite_data` volume (`/app/server/data` in the container)
- First start seeds the database if it is empty

Stop:

```bash
docker compose down
```

Reset DB volume and re-seed on next start:

```bash
docker compose down -v
docker compose up --build
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/users` | Paginated users (`q`, `hobbies`, `nationalities`, `sortBy`, `sortDir`, `page`, `pageSize`) |
| `GET` | `/api/facets/hobbies` | Top 20 hobbies for current filters |
| `GET` | `/api/facets/nationalities` | Top 20 nationalities for current filters |

Filter semantics: hobbies = **AND**, nationalities = **OR**, combined with text search. Sort is deterministic (`field`, then `id`).

---

## Exercise brief

Build a small full-stack user directory application. The goal is to evaluate how you design a searchable, filterable, paginated UI backed by persisted data and clear API boundaries.

The application should include:

- A React client.
- A Node.js API server.
- A SQLite database used as the source of truth for user data.
- Docker configuration for running the application locally.

### Scenario

Users need to browse a large directory of people, search by name, and narrow results by nationality and hobbies. The filter sidebar should help users discover useful filters based on the result set they are currently viewing.

### Requirements

#### Data Model

Seed a SQLite database with enough records to make pagination, infinite scroll, search, and filter counts meaningful.

Each user should have:

- `avatar`
- `first_name`
- `last_name`
- `age`
- `nationality`
- `hobbies`, from 0 to 10 hobbies per user

Choose a data model that supports the required behavior.

SQLite must be the persisted source of user data.

#### API

Expose an API that supports:

- Paginated user results.
- Text filtering from user input across `first_name` and `last_name`.
- Filtering by one or more nationalities.
- Filtering by one or more hobbies.
- Sorting by `first_name`, `last_name`, `age`, and `nationality`.
- Pagination metadata so the client can determine whether more results are available.
- Top 20 hobbies for the active text filter and filter state, including `{ value, count }`.
- Top 20 nationalities for the active text filter and filter state, including `{ value, count }`.

The top 20 values and counts must reflect the currently applied text filter and selected filters, not the global dataset.

Filter semantics:

- Multiple selected hobbies should match users who have all selected hobbies.
- Multiple selected nationalities should match users from any selected nationality.
- Text, hobby, and nationality filters should apply together.

Sorting semantics:

- Sorted results must be deterministic. Use `id` as a final tie-breaker when values are equal.
- Pagination must respect the active sort without duplicate or missing users.

#### Client

Build a React interface that includes:

- A text filter input for `first_name` and `last_name`.
- A virtualized, infinitely scrolling list of user cards.
- A sidebar containing the top 20 hobbies and top 20 nationalities for the current result set, including counts.
- Controls for applying and removing hobby and nationality filters.
- Controls for choosing sort field and sort direction.
- Loading, empty, and error states.
- A responsive layout that remains usable on desktop and mobile.

User cards should follow this structure:

```text
|----------------------------------|
| avatar      first_name+last_name |
|             nationality      age |
|                                  |
|             (2 hobbies) (+n)     |
|----------------------------------|
```

Show up to 2 hobbies on the card. If the user has more hobbies, display the remaining count as `+n`.

Use a virtual scroll implementation for the list.

When the text filter or selected filters change, the client must refresh both:

- The paginated user list.
- The top 20 hobbies and nationalities in the sidebar.

The text filter value, selected hobbies, selected nationalities, sort field, and sort direction must be reflected in the URL query string. Reloading or sharing the URL should restore the same view state.

### Implementation Notes

- Keep the database setup easy to run locally.
- Include seed logic or a documented command that creates the SQLite database.
- Include a `Dockerfile` and `docker-compose.yml` that can run the application locally.

### Evaluation Focus

We will pay particular attention to:

- Correct data persistence and API behavior.
- Correct filtering, sorting, pagination, and top 20 counts.
- Smooth infinite scrolling with virtualization.
- URL-synced state.
- Clear loading, empty, and error states.
- Easy local and Docker-based setup.

### Deliverables

Please provide:

- Source code for the React client and Node.js server.
- A `Dockerfile` and `docker-compose.yml`.
- Instructions for setup, database seeding, and running locally.
- Instructions for running with Docker Compose.
