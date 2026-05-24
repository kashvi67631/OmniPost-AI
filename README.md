# OmniPost AI

Premium AI content distribution dashboard built with Next.js, Prisma, PostgreSQL, and NextAuth.

## Stack

- **Frontend:** Next.js App Router, Tailwind CSS, Framer Motion
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL (Neon / Supabase / local)
- **ORM:** Prisma 7 with `@prisma/adapter-pg`
- **Auth:** NextAuth.js (Credentials — email-based)

## Setup

### 1. Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — run `openssl rand -base64 32`
- `AUTH_URL` — `http://localhost:3000` for local dev

### 2. Database

```bash
npm install
npx prisma migrate dev
npm run db:seed
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/publish` | POST | Create dispatch, generate posts, persist to DB |
| `/api/history` | GET | List user dispatch history |
| `/api/analytics` | GET | Aggregated KPIs and charts |
| `/api/posts` | GET | Generated posts (optional `?dispatchId=`) |
| `/api/user` | GET/PATCH | Profile and usage |
| `/api/templates` | GET | System + user templates |
| `/api/templates/[id]/use` | POST | Increment template usage |

All authenticated routes accept `x-user-email` header or NextAuth session.

## Data Models

- **User** — id, name, email, image, timezone, company
- **Dispatch** — content, platforms, status, user relation
- **GeneratedPost** — twitterThread, linkedinPost, metadata
- **DispatchAnalytics** — clicks, engagements, impressions
- **Template** — reusable content frameworks (seeded)

## Deploy on Vercel

### 1. Create a PostgreSQL database

Use [Neon](https://neon.tech) (recommended) or Supabase. Copy the **pooled** connection string.

### 2. Add environment variables in Vercel

Go to **Project → Settings → Environment Variables** and add for **Production** and **Preview**:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `AUTH_SECRET` | Run `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-app.vercel.app` |

Redeploy after saving env vars.

### 3. Run database migrations (one time)

From your machine with `DATABASE_URL` set to the production DB:

```bash
npx prisma migrate deploy
npm run db:seed
```

### 4. Deploy

Push to GitHub — Vercel will build automatically. The build does **not** require `DATABASE_URL` at compile time; it is only needed at **runtime** when API routes execute.
