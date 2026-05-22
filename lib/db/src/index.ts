import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const url = process.env.DATABASE_URL;

// Supabase e outros provedores cloud exigem SSL.
// A flag é ativada automaticamente quando a URL não é localhost.
const isLocal =
  url.includes("localhost") ||
  url.includes("127.0.0.1") ||
  url.includes("::1");

export const pool = new Pool({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

export * from "./schema";
