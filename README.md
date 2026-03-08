# Hooper's Hub NYC

Every basketball court in New York City. One app.

Built with Next.js 14, Supabase, Mapbox GL, and Stripe.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# For the seed script — Supabase Dashboard → Settings → Database → Connection string (URI)
DATABASE_URL=postgresql://postgres:[password]@[host].supabase.co:5432/postgres
```

### 3. Set up the database

Run migrations in the Supabase SQL Editor in order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_seed_public_courts.sql`
3. `supabase/migrations/003_monetization.sql`

Then seed the courts table from the command line:

```bash
npm run db:seed-courts
```

This inserts 30 real NYC basketball courts across all 5 boroughs and is safe to re-run (idempotent).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Setup

### Required env var for seeding

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection string (URI mode) |

### Seed command

```bash
npm run db:seed-courts
```

- Populates `courts` table with 30 real NYC basketball courts (all boroughs)
- Safe to re-run — skips automatically if courts already exist
- Uses `pg` (node-postgres) with a direct database connection

### Manual alternative

Paste `supabase/migrations/004_seed_courts.sql` into the Supabase SQL Editor and run it.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed-courts` | Seed NYC basketball courts into Supabase |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (Postgres + PostGIS)
- **Maps**: Mapbox GL JS via react-map-gl
- **Payments**: Stripe
- **Deployment**: Vercel
