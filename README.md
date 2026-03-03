# Final Project

Express.js application with authentication, Neon Database, and Arcjet security.

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Neon account ([neon.tech](https://neon.tech))

---

## Development (Neon Local)

Neon Local runs a local proxy that creates **ephemeral database branches** for development. Each time you start the stack, you get a fresh database; when you stop, the branch is deleted.

### 1. Get Neon credentials

1. Create a project at [Neon Console](https://console.neon.tech)
2. Copy your **API Key** (Manage API Keys) and **Project ID** (Project Settings → General)
3. Optionally copy your **Parent Branch ID** (default branch) — omit to use the project default

### 2. Configure environment

```bash
cp .env.development.example .env.development
```

Edit `.env.development` and set:

- `NEON_API_KEY` – Neon API key
- `NEON_PROJECT_ID` – Neon project ID
- `NEON_PARENT_BRANCH_ID` – optional; omit to use default branch
- `JWT_SECRET` – secret for JWT signing
- `ARCJET_KEY` – optional; Arcjet API key

### 3. Start the stack

```bash
docker compose --env-file .env.development -f docker-compose.dev.yml up --build
```

This will:

- Start **Neon Local** and create an ephemeral branch
- Run migrations
- Start the app with hot-reload on port 4000

### 4. How it works

- **App** connects to `postgres://neon:npg@neon-local:5432/neondb` via the Neon serverless driver
- `NEON_LOCAL=true` enables HTTP-based connection to the local proxy
- Migrations run automatically on startup

### 5. API

- `GET http://localhost:4000/health` – Health check
- `POST http://localhost:4000/api/auth/sign-up` – Register
- `POST http://localhost:4000/api/auth/sign-in` – Login
- `POST http://localhost:4000/api/auth/sign-out` – Logout

---

## Production (Neon Cloud)

In production, the app connects to your **Neon Cloud** database. No Neon Local container is used.

### 1. Configure environment

```bash
cp .env.production.example .env.production
```

Edit `.env.production`:

- `DATABASE_URL` – Neon Cloud connection string (`postgres://...@...neon.tech/neondb?sslmode=require`)
- `JWT_SECRET` – strong random secret
- `ARCJET_KEY` – Arcjet API key
- `PORT` – optional; default 4000

### 2. Run migrations

Migrations must be applied before starting the app:

```bash
npm run db:migrate
```

Or with Docker:

```bash
docker run --rm --env-file .env.production -e DATABASE_URL=$DATABASE_URL your-image npx drizzle-kit migrate
```

### 3. Start the app

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Or build and run the image directly:

```bash
docker build -t final-project .
docker run -p 4000:4000 --env-file .env.production final-project
```

### 4. Environment injection

- Use `.env.production` for local production runs
- In CI/CD (e.g. GitHub Actions, K8s), inject `DATABASE_URL`, `JWT_SECRET`, `ARCJET_KEY` via secrets — never hardcode them

---

## Environment variable reference

| Variable | Development | Production |
|----------|-------------|------------|
| `DATABASE_URL` | Set by compose: `postgres://neon:npg@neon-local:5432/neondb` | Neon Cloud URL from console |
| `NEON_LOCAL` | `true` | Not set |
| `NEON_API_KEY` | Required (for Neon Local) | Not needed |
| `NEON_PROJECT_ID` | Required (for Neon Local) | Not needed |
| `JWT_SECRET` | Dev secret | Strong production secret |
| `ARCJET_KEY` | Optional | Recommended |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run app locally with watch (non-Docker) |
| `npm start` | Run app |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |
