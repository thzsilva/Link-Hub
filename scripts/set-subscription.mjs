// Utilitário de teste: muda o estado da assinatura de um perfil.
//
// Uso:
//   node scripts/set-subscription.mjs <username> expire    # expira (cancelada, trial no passado)
//   node scripts/set-subscription.mjs <username> pastdue   # pagamento pendente
//   node scripts/set-subscription.mjs <username> trial     # reinicia trial de 3 dias
//   node scripts/set-subscription.mjs <username> active    # ativa por 31 dias
//   node scripts/set-subscription.mjs <username> hide      # is_active=false (some do público / 404)
//   node scripts/set-subscription.mjs <username> show      # is_active=true
//   node scripts/set-subscription.mjs <username> exempt    # CORTESIA: nunca bloqueia, não paga
//   node scripts/set-subscription.mjs <username> unexempt  # remove a cortesia
//   node scripts/set-subscription.mjs <username> status    # só mostra o estado atual
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

const [username, action = "status"] = process.argv.slice(2);
if (!username) {
  console.error("Informe o username. Ex: node scripts/set-subscription.mjs Thzsilva expire");
  process.exit(1);
}

const SQL = {
  expire: "subscription_status='canceled', trial_ends_at = now() - interval '1 day', current_period_end = now() - interval '1 day'",
  pastdue: "subscription_status='past_due', trial_ends_at = now() - interval '1 day'",
  trial: "subscription_status='trialing', trial_ends_at = now() + interval '3 days', current_period_end = NULL",
  active: "subscription_status='active', current_period_end = now() + interval '31 days'",
  hide: "is_active = false",
  show: "is_active = true",
  exempt: "subscription_exempt = true",
  unexempt: "subscription_exempt = false",
};

const c = new pg.Client({ connectionString: loadDatabaseUrl(), ssl: { rejectUnauthorized: false } });

async function main() {
  await c.connect();
  if (action !== "status") {
    const set = SQL[action];
    if (!set) { console.error("Ação inválida:", action, "| use:", Object.keys(SQL).join(", "), "| status"); process.exit(1); }
    const r = await c.query(`UPDATE profiles SET ${set} WHERE username=$1`, [username]);
    if (r.rowCount === 0) { console.error("Perfil não encontrado:", username); process.exit(1); }
    console.log(`✓ '${action}' aplicado em '${username}'`);
  }
  const r = await c.query(
    "SELECT username, is_active, subscription_exempt, subscription_status, trial_ends_at, current_period_end FROM profiles WHERE username=$1",
    [username],
  );
  console.table(r.rows);
  await c.end();
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
