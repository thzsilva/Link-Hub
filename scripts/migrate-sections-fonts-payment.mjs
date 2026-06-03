// Migration: add columns for the new features
//  - events.payment_received  (manual "received" toggle in accounting)
//  - profiles.section_order   (custom section ordering on public profile)
//  - profiles.hero_display    (show name / logo / both in hero)
//  - profiles.username_font   (font choice for the name)
// Safe to run multiple times (IF NOT EXISTS).
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const client = new pg.Client({ connectionString: loadDatabaseUrl(), ssl: { rejectUnauthorized: false } });

const statements = [
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_received boolean DEFAULT false;`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS section_order jsonb;`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hero_display text DEFAULT 'name';`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_font text DEFAULT 'default';`,
];

async function main() {
  await client.connect();
  console.log("Connected. Running migration...");
  for (const sql of statements) {
    await client.query(sql);
    console.log("✓", sql);
  }
  console.log("✅ Migration complete.");
  await client.end();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
