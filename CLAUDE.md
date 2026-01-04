# CLAUDE.md - FinanceControll

This document provides context for Claude Code when working on this codebase.

## Project Overview

**FinanceControll** is a privacy-first investment tracker. Core philosophy: "Your data, your control" - local storage by default, cloud optional.

**Tech Stack**: Next.js 16 (App Router), React 19, TypeScript (strict), Drizzle ORM, PGlite (IndexedDB), Tailwind CSS 4, shadcn/ui, Bun

## Quick Reference

### Verification Commands

```bash
bun run build          # Build - MUST pass before committing
bun run lint           # Lint - MUST pass before committing
bun run dev            # Development server (localhost:3000)
```

### Database Commands

```bash
bun run db:generate    # Generate Drizzle migrations after schema changes
bun run db:push        # Push schema to database
bun run db:studio      # Visual database editor
```

**Note**: No test suite is configured yet. When tests are added, include verification command here.

## Architecture

### Storage Adapter Pattern

The app uses abstraction to support multiple database backends:

```
StorageAdapter (interface)
├── PGliteAdapter   - Local (IndexedDB) - IMPLEMENTED
├── PostgresAdapter - Cloud Postgres    - STUB (Phase 5)
└── SupabaseAdapter - Supabase hosted   - STUB (Phase 5)
```

Key files:
- `src/lib/storage/types.ts` - StorageAdapter interface and types
- `src/lib/storage/factory.ts` - Creates adapters based on config
- `src/lib/storage/context.tsx` - React context providing `useStorage()` hook
- `src/lib/storage/pglite-adapter.ts` - Local IndexedDB implementation

### Database Schema

Schema defined in `src/lib/db/schema.ts` using Drizzle ORM:
- **Portfolio** - Investment collection with base currency
- **Asset** - Individual investments (6 types: startup_equity, fund, state_obligation, crypto, public_equity, other)
- **Transaction** - Buy/sell records
- **Valuation** - Historical asset values
- **ExchangeRate** - Currency conversion rates

Migrations in `src/lib/db/migrations.ts` - raw SQL, idempotent (`IF NOT EXISTS`)

### Route Structure

```
src/app/
├── (onboarding)/setup/   → /setup      # Storage mode selection
├── (app)/dashboard/      → /dashboard  # Main app
├── layout.tsx                          # Root layout with StorageProvider
└── page.tsx                            # Landing page (redirects)
```

Middleware (`src/proxy.ts`) handles routing based on `storage-mode` cookie.

### State Management

Storage state via React Context:
```typescript
const { adapter, isLoading, error, mode, switchMode } = useStorage();
```

All pages are client components (`'use client'`) - use the hook to access storage.

## Code Conventions

- **TypeScript strict mode** with `noUncheckedIndexedAccess`
- **Path alias**: `@/*` → `./src/*`
- **Components**: PascalCase, in `src/components/`
- **UI Components**: shadcn/ui in `src/components/ui/` - use CVA for variants
- **Utility**: `cn()` from `src/lib/utils.ts` for className merging

### Adding New Storage Operations

1. Add method to `StorageAdapter` interface in `types.ts`
2. Implement in `pglite-adapter.ts` (and stub in postgres/supabase adapters)
3. Use via `adapter.db` with Drizzle query methods

### Adding New Schema Tables

1. Define table in `src/lib/db/schema.ts` with relations
2. Add raw SQL to `src/lib/db/migrations.ts` (idempotent)
3. Run `bun run db:generate` then `bun run db:push`

## File Locations

| Purpose | Location |
|---------|----------|
| Pages | `src/app/` |
| UI Components | `src/components/ui/` |
| Storage Logic | `src/lib/storage/` |
| DB Schema | `src/lib/db/schema.ts` |
| Migrations | `src/lib/db/migrations.ts` |
| Utilities | `src/lib/utils.ts` |
| Middleware | `src/proxy.ts` |

## Development Phases

- Tasks 0-5: Complete (setup, scaffold, storage adapters, schema, onboarding)
- Phase 5: Cloud adapters (Postgres, Supabase) - TODO
- Future: Portfolio CRUD, asset tracking, analytics

---

## Smart Nuggets

_This section captures learnings and gotchas discovered during development. Update as you learn._

### Cookie vs localStorage

Storage mode is persisted in BOTH:
- `localStorage` (client-side, for context initialization)
- HTTP cookie `storage-mode` (server-side, for middleware routing)

Both must be updated when switching modes. See `setup/page.tsx` for cookie setting pattern.

### Decimal Precision

All monetary values use `DECIMAL(20, 8)` - never use floats for money. Schema enforces this.

### PGlite Gotchas

- Database name format: `idb://financecontroll` (IndexedDB prefix required)
- Private/incognito mode detection - IndexedDB may not be available
- QuotaExceededError handling needed for storage limits

### shadcn/ui Usage

Components are copied, not imported from package. To add new components:
```bash
bunx shadcn@latest add [component-name]
```
