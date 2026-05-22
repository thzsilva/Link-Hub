import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const DEMO_MODE = process.env.DEMO_MODE === "true";

let pool: any = null;
let db: any = null;

if (!DEMO_MODE) {
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

  pool = new Pool({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  db = drizzle(pool, { schema });
}

export { pool, db };

export * from "./schema";
