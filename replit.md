# BUICH 2026 Conference Portal

Full-stack participant registration, payment-verification, and admin-management portal for the Batam University International Conference on Health.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required production secret: `SESSION_SECRET` — long random value used to sign logins
- Admin bootstrap secrets: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (minimum 10 characters), and optional `ADMIN_NAME`. The server creates or promotes this user to admin when it starts. Keep these only in Replit Secrets—never commit them.
- Required for private proof uploads: `PRIVATE_OBJECT_DIR` — Replit private object-storage directory.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

- Participants create an account, log in, complete one BUICH registration, and receive a unique `BUICH-…` verification code.
- Registered participants upload a payment proof and transfer reference; their payment stays `pending` until verified.
- Admins sign in through the same portal and use `/admin` to review registration and payment statuses.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
