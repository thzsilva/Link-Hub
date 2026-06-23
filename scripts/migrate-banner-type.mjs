// Migration: profiles.banner_type ('image' | 'video') — escolher o que aparece no topo.
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const lines = readFileSync(path.resolve(__dirname, "../.env"), "utf8").split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("#")) continue;
    const m = t.match(/^DATABASE_URL=(.*)$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  throw new Error("DATABASE_URL não encontrada");
}

const c = new pg.Client({ connectionString: loadDatabaseUrl(), ssl: { rejectUnauthorized: false } });
async function main() {
  await c.connect();
  await c.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_type text DEFAULT 'image';");
  const r = await c.query(
    "UPDATE profiles SET banner_type='video' WHERE banner_video_url IS NOT NULL AND (banner_type IS NULL OR banner_type='image');",
  );
  console.log("✓ banner_type criada; backfill video em", r.rowCount, "perfis");
  await c.end();
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
