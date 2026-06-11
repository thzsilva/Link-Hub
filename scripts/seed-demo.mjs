// Cria/recria o perfil de DEMONSTRAÇÃO (DJ fictício) acessível em /?user=demo (ou /demo).
// Idempotente: apaga o perfil 'demo' (cascade) e recria com conteúdo de exemplo.
// É isento de assinatura (subscription_exempt) para nunca bloquear.
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
const img = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  await c.connect();

  // Remove o demo anterior (cascade apaga links/photos/events)
  await c.query("DELETE FROM profiles WHERE username = 'demo'");

  // Perfil
  const p = await c.query(
    `INSERT INTO profiles
      (clerk_user_id, username, display_name, bio, avatar_url, header_image_url,
       theme_id, hero_display, hero_layout, hero_align, custom_primary_color, custom_secondary_color,
       whatsapp_number, email, instagram_handle, layout_columns,
       subscription_exempt, is_active, subscription_status)
     VALUES
      ('demo-seed-user','demo','DJ NOVA',
       'DJ e produtora de música eletrônica. Sets que misturam house, techno e brasilidade. Já tocou nos principais clubes e festivais do país. Disponível para shows, festivais e eventos privados.',
       $1,$2,'default','both','below','center','#7C3AED','#EC4899',
       '5511999999999','contato@djnova.com','djnova',2,
       true,true,'active')
     RETURNING id`,
    [img("djnova-avatar", 500, 500), img("djnova-banner", 1600, 700)],
  );
  const id = p.rows[0].id;

  // Links (Spotify/SoundCloud viram player; demais viram botões/ícones)
  const links = [
    ["Spotify", "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", "spotify", "spotify", 0],
    ["SoundCloud", "https://soundcloud.com/discover", "soundcloud", "soundcloud", 1],
    ["Instagram", "https://instagram.com/djnova", "instagram", "default", 2],
    ["YouTube", "https://youtube.com/@youtube", "youtube", "default", 3],
    ["Press Kit (PDF)", "https://example.com/presskit", "website", "default", 4],
  ];
  for (const [title, url, icon, cardType, pos] of links) {
    await c.query(
      `INSERT INTO links (profile_id, title, url, icon, card_type, position, is_visible)
       VALUES ($1,$2,$3,$4,$5,$6,true)`,
      [id, title, url, icon, cardType, pos],
    );
  }

  // Eventos (futuros)
  const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString();
  const events = [
    ["RAVE THE WORLD — São Paulo", "Festival open air com line-up internacional.", inDays(20), "Av. Pres. Castelo Branco, 0", "São Paulo", "SP", "https://example.com/ingressos", img("ev-sp", 800, 600), 5000, 0],
    ["NOVA NIGHT — Rio de Janeiro", "Noite exclusiva no rooftop com vista pro mar.", inDays(45), "Av. Atlântica, 1702", "Rio de Janeiro", "RJ", "https://example.com/ingressos", img("ev-rj", 800, 600), 8000, 1],
    ["Sunset Sessions — Floripa", "Pôr do sol com set especial à beira-mar.", inDays(70), "Praia Mole", "Florianópolis", "SC", "https://example.com/ingressos", img("ev-sc", 800, 600), 6000, 2],
  ];
  for (const [title, desc, date, street, city, state, ticket, image, price, pos] of events) {
    await c.query(
      `INSERT INTO events (profile_id, title, description, event_date, street, city, state, ticket_url, image_url, price, position, is_visible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)`,
      [id, title, desc, date, street, city, state, ticket, image, price, pos],
    );
  }

  // Galeria
  for (let i = 1; i <= 6; i++) {
    await c.query(
      `INSERT INTO photos (profile_id, url, caption, position, is_cover) VALUES ($1,$2,$3,$4,$5)`,
      [id, img(`gallery-${i}`, 900, 900), `Show ${i}`, i - 1, i === 1],
    );
  }

  console.log("✓ Perfil de demonstração criado: acesse /?user=demo");
  await c.end();
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
