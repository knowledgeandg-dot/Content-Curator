import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";

// Re-export drizzle-orm helpers so consumers use the same resolved instance
// and avoid TypeScript "separate private declarations" errors from dual resolution.
export { eq, and, or, sql, desc, asc, like, ilike, inArray, notInArray, isNull, isNotNull } from "drizzle-orm";
