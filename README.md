# FinanceControll

Privacy-first investment tracker. Your data, your control. Local by default, cloud by choice.

## Requirements

- [Bun](https://bun.sh) >= 1.0

## Setup

```bash
# Install dependencies
bun install

# Run development server (after Next.js setup)
bun run dev

# Build for production
bun run build
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **Database**: PGlite (local), Postgres/Supabase (cloud)
- **ORM**: Drizzle
- **UI**: shadcn/ui + Tailwind
- **Charts**: Recharts
