# Presight User Directory

Full-stack searchable user directory: React client, dual backends (Node.js/Express **or** Java/Spring Boot), SQLite persistence.

## Stack

- **Client:** React 19, Vite, Tailwind CSS 4, TanStack Query + Virtual
- **Server (Node):** Express 5, better-sqlite3, TypeScript — `server/`
- **Server (Java):** Spring Boot 3, JDBC + SQLite — `server-java/`
- **Data:** Separate SQLite DBs (`server/data/users.db` or `server-java/data/users.db`), 10,000 seeded users each

Run **only one backend at a time** on port `3001` so the Vite proxy keeps working unchanged.

## Prerequisites

- Node.js 20+ (LTS recommended)
- Yarn 4 (via Corepack: `corepack enable`)
- JDK 21+ (for the Java backend)
- Docker + Docker Compose (optional)

## Local setup (Node backend)

```bash
# From the repo root
yarn install

# Create / refresh the SQLite database (10,000 users)
yarn seed

# Terminal 1 — API (http://localhost:3001)
yarn start:server

# Terminal 2 — UI (http://localhost:5173, proxies /api → :3001)
yarn start:client

# Or both in parallel
yarn start
```

Open [http://localhost:5173](http://localhost:5173).

## Local setup (Java backend)

Same client; swap only the API process (stop the Node server first).

```bash
# From the repo root — first time / wipe & re-seed
yarn seed:java

# Terminal 1 — Spring Boot API (http://localhost:3001)
yarn start:server:java

# Terminal 2 — same UI
yarn start:client

# Or both in parallel
yarn start:java
```

If `server-java/data/users.db` is empty on startup, Spring Boot seeds automatically.

### Useful scripts

| Command                                | Description                                      |
| -------------------------------------- | ------------------------------------------------ |
| `yarn seed`                            | Wipe and re-seed Node SQLite                     |
| `yarn seed:java`                       | Wipe and re-seed Java SQLite                     |
| `yarn start:server`                    | Node API (tsx)                                   |
| `yarn start:server:java`               | Java API (Spring Boot)                           |
| `yarn start:client`                    | Vite dev server                                  |
| `yarn start`                           | Client + Node server via Lerna (parallel)        |
| `yarn start:java`                      | Client + Java server (parallel)                  |
| `yarn build:java`                      | Package Spring Boot JAR                          |
| `yarn workspace presight-server build` | Compile Node server to `server/dist`             |
| `yarn workspace presight-client build` | Production client build to `client/dist`         |

Re-running `yarn seed` / `yarn seed:java` deletes the corresponding DB and recreates it.

### Production-style local run (single port)

**Node:**

```bash
yarn workspace presight-client build
yarn workspace presight-server build
PORT=8080 yarn workspace presight-server start:prod
```

**Java:**

```bash
yarn workspace presight-client build
yarn build:java
PORT=8080 CLIENT_DIST="$(pwd)/client/dist" java -jar server-java/target/presight-server-java-1.0.0.jar
```

Then open [http://localhost:8080](http://localhost:8080) — the chosen server serves the API and the built client.

## Docker Compose

Use a Compose **profile** so only one backend runs:

```bash
# Node
docker compose --profile node up --build

# Java
docker compose --profile java up --build
```

Shortcuts: `yarn docker:up` (node) / `yarn docker:up:java`.

- App: [http://localhost:8080](http://localhost:8080)
- Node SQLite volume: `sqlite_data_node` → `/app/server/data`
- Java SQLite volume: `sqlite_data_java` → `/app/data`
- First start seeds the database if it is empty

Stop:

```bash
docker compose down
```

Reset DB volume and re-seed on next start:

```bash
docker compose down -v
docker compose --profile node up --build   # or --profile java
```

## Logging

Both backends log `/api` and `/health` requests to **stdout** (method, URL, status, duration), plus stack traces on failures. Local and Docker use the same stream — only where you watch differs.

**Local** — use the terminal where the API is running:

```bash
yarn start:server        # Node
yarn start:server:java   # Java
```

**Docker** — follow the active Compose service:

```bash
docker compose logs -f app-node   # Node profile
docker compose logs -f app-java   # Java profile
```

**Try it** — with logs visible, hit the API (local `:3001`, Docker `:8080`):

```bash
# Local
curl -i "http://localhost:3001/api/users?pageSize=1"
curl -i "http://localhost:3001/api/nope"
curl -i "http://localhost:3001/health"

# Docker (single port)
curl -i "http://localhost:8080/api/users?pageSize=1"
curl -i "http://localhost:8080/api/nope"
curl -i "http://localhost:8080/health"
```

Example log lines:

```text
GET /api/users?pageSize=1 -> 200 (42 ms)
GET /api/nope -> 404 (3 ms)
GET /health -> 200 (2 ms)
```

Static UI assets are not logged, so the stream stays readable.

## API overview

Identical contract for Node and Java:

| Method | Path          | Description                                                                                |
| ------ | ------------- | ------------------------------------------------------------------------------------------ |
| `GET`  | `/health`     | Health check                                                                               |
| `GET`  | `/api/users`  | Paginated users (`q`, `hobbies`, `nationalities`, `sortBy`, `sortDir`, `page`, `pageSize`) |
| `GET`  | `/api/facets` | Top 20 hobbies + nationalities for current filters (`q`, `hobbies`, `nationalities`)       |

Filter semantics: hobbies = **AND**, nationalities = **OR**, combined with text search. Sort is deterministic (`field`, then `id`).

### Swagger / OpenAPI

Both backends expose interactive API docs (and a machine-readable OpenAPI document you can import into Postman, Insomnia, etc.):

| Backend | Swagger UI | OpenAPI JSON |
| ------- | ---------- | ------------ |
| Node    | [http://localhost:3001/api-docs](http://localhost:3001/api-docs) | [http://localhost:3001/api-docs.json](http://localhost:3001/api-docs.json) |
| Java    | [http://localhost:3001/api-docs](http://localhost:3001/api-docs) | [http://localhost:3001/api-docs.json](http://localhost:3001/api-docs.json) |

With Docker / production-style single-port runs, use port `8080` instead of `3001`.

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
