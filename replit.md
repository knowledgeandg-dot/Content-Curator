# Dream Valley — Live Inventory Tracker

An internal real estate inventory management system for a property company that sells plots of land. Two role-based interfaces: CRM admin (full control) and Sales (view-only, real-time).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/dream-valley run dev` — run the frontend (auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed initial CRM user, RM codes, and sample plots
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — secret for express-session

## Default Credentials (seeded)

- **CRM Admin:** `admin@dreamvalley.com` / `admin123`
- **Sales (RM Codes):** `RM001`, `RM002`, `RM003` (Active) — `RM004` (Inactive)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter routing
- API: Express 5 + express-session (session-based auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Excel export: ExcelJS
- Real-time: Server-Sent Events (SSE) via `/api/events`
- Password hashing: bcryptjs

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (plots, crm_users, rm_codes, activity_logs)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/sse.ts` — SSE broadcast helper
- `artifacts/dream-valley/src/pages/` — React pages (login, crm-dashboard, sales-dashboard, etc.)
- `artifacts/dream-valley/src/layouts/` — Auth guard layouts (CrmLayout, SalesLayout)
- `artifacts/dream-valley/src/hooks/use-plot-events.ts` — SSE hook for real-time plot updates
- `scripts/src/seed.ts` — Database seed script

## Architecture decisions

- **Session-based auth over JWT** — simpler for an internal tool; sessions stored server-side with `express-session`.
- **Dual login modes** — CRM uses email/password (bcrypt); Sales uses RM codes. Both share the same session system but write different session fields.
- **Drizzle helpers re-exported from `@workspace/db`** — avoids a pnpm peer-dep resolution conflict where two instances of `drizzle-orm` would produce TypeScript "separate private declarations" errors.
- **SSE for real-time** — Server-Sent Events preferred over WebSockets for this read-heavy push use case (no bi-directional comms needed).
- **Excel export via ExcelJS** — styled header row, generated on the server, streamed as a buffer response.

## Product

- **CRM Dashboard** — Full CRUD for plots, stats summary cards, RM code management, activity log timeline, Excel export
- **Sales Dashboard** — View-only grid of Available plots with real-time updates, filters (PLC Type, Facing, Area range), and plot search

## User preferences

_Populate as you build._

## Gotchas

- Always import `eq`, `desc`, `and`, `sql`, etc. from `@workspace/db` (not directly from `drizzle-orm`) to avoid the dual-instance TypeScript error.
- After any schema change in `lib/db/`, run `pnpm run typecheck:libs` before typechecking artifacts.
- The `/api/events` SSE endpoint must be kept out of the standard JSON request lifecycle — no JSON body parsing or auth middleware that calls `next()` should wrap it.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
