// One-off migration: add street, city, state, price columns to events table.
// Migrates existing `location` text into `city` so no data is lost.
// Safe to run multiple times (uses IF NOT EXISTS).
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from root .env (first uncommented occurrence)
function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.resolve(__dirname, "../.env");
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^DATABASE_URL=(.*)$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  throw new Error("DATABASE_URL not found in env or .env");
}

const connectionString = loadDatabaseUrl();
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const statements = [
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS street text;`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS city text;`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS state text;`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS price decimal(10,2);`,
];

async function main() {
  await client.connect();
  console.log("Connected. Running migration...");

  for (const sql of statements) {
    await client.query(sql);
    console.log("✓", sql);
  }

  // Migrate existing location data into city (only where city is still empty)
  const hasLocation = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='events' AND column_name='location';`
  );
  if (hasLocation.rowCount > 0) {
    const res = await client.query(
      `UPDATE events SET city = location WHERE city IS NULL AND location IS NOT NULL;`
    );
    console.log(`✓ Migrated ${res.rowCount} location -> city`);
  } else {
    console.log("ℹ No legacy 'location' column found, skipping data migration.");
  }

  console.log("✅ Migration complete.");
  await client.end();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
