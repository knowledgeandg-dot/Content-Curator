---
name: Session auth in production
description: Root causes of session-based auth failing in Replit autoscale deployments, and the confirmed fixes.
---

# Session auth fails in autoscale deployments

## The rule
Never use in-memory `express-session` store with autoscale deployments. Use `connect-pg-simple` (PostgreSQL-backed sessions) so sessions survive across instances.

**Why:** Autoscale can route login POST to instance A and the following GET to instance B. Instance B has no in-memory session → 401. This looks like "login failed" even though the login endpoint returned 200.

## How to apply
In `app.ts`:
```ts
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1); // required for secure cookies behind Replit's proxy

app.use(session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true,  // auto-creates session table in prod on first boot
    pruneSessionInterval: 60 * 60,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,          // true in production (HTTPS via proxy)
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
```

## Also needed
- `app.set("trust proxy", 1)` — required so Express reads `X-Forwarded-Proto` and sets secure cookies correctly behind Replit's Google Frontend proxy.
- `createTableIfMissing: true` — creates the `session` table automatically in production (avoids needing to run DDL manually against the prod DB).
- `cookie.secure: true` in production — without this, browsers may reject the cookie on HTTPS-only contexts.
- `cookie.sameSite: "none"` in production — required when `secure: true` for cross-context compatibility.

## Debugging tip
When login-rm returns 401 in production but works in dev, first curl the production endpoint directly (`curl -v -X POST .../api/auth/login-rm -H 'Content-Type: application/json' -d '{"rmCode":"RM001"}'`). If curl returns 200, the endpoint is fine — the issue is session loss between instances, not the login logic itself.
