/**
 * Seed script — insere dados de teste no banco de dados local.
 *
 * Uso:
 *   npm run seed                                     (usa DATABASE_URL do .env do api-server)
 *   DATABASE_URL=postgresql://... npm run seed       (banco customizado)
 *
 * Após executar: acesse http://localhost:3000/johndoe para ver o perfil público.
 */

export {};

// Definir DATABASE_URL antes de importar @workspace/db (que valida a env no carregamento)
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/linkhub";

// Importações dinâmicas garantem que o env já está definido antes do módulo db inicializar
const { db, pool, profilesTable, linksTable, photosTable, socialLinksTable } =
  await import("@workspace/db");
const { eq } = await import("drizzle-orm");

const SEED_CLERK_ID = "user_seed_demo_001";
const SEED_USERNAME = "johndoe";

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // Remove dados anteriores do seed para poder rodar novamente
  const existing = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, SEED_CLERK_ID))
    .limit(1)
    .then((r: any[]) => r[0]);

  if (existing) {
    console.log("♻️  Removendo seed anterior...");
    await db.delete(profilesTable).where(eq(profilesTable.id, existing.id));
  }

  // Perfil principal
  const [profile] = await db
    .insert(profilesTable)
    .values({
      clerkUserId: SEED_CLERK_ID,
      username: SEED_USERNAME,
      displayName: "João Silva",
      bio: "Designer & Desenvolvedor Full-Stack. Transformando ideias em produtos digitais.",
      avatarUrl: "https://i.pravatar.cc/300?img=12",
      headerImageUrl: "https://picsum.photos/seed/linkhub-header/1200/400",
      accentColor: "#6366f1",
      bgColor: "#0a0a0a",
      cardStyle: "glass",
      isActive: true,
    })
    .returning();

  console.log(`✓ Perfil criado: @${profile.username} (${profile.displayName})`);

  // Links
  const links = await db
    .insert(linksTable)
    .values([
      {
        profileId: profile.id,
        title: "GitHub",
        url: "https://github.com",
        description: "Meus projetos open source",
        position: 0,
        isVisible: true,
      },
      {
        profileId: profile.id,
        title: "Portfólio",
        url: "https://example.com",
        description: "Trabalhos e cases",
        position: 1,
        isVisible: true,
      },
      {
        profileId: profile.id,
        title: "Twitter / X",
        url: "https://twitter.com",
        description: "Pensamentos e atualizações",
        position: 2,
        isVisible: true,
      },
      {
        profileId: profile.id,
        title: "Blog & Artigos",
        url: "https://example.com/blog",
        description: "Escrita sobre tecnologia e design",
        position: 3,
        isVisible: true,
      },
      {
        profileId: profile.id,
        title: "Fale Comigo",
        url: "mailto:joao@example.com",
        description: "Entre em contato",
        position: 4,
        isVisible: true,
      },
    ])
    .returning();

  console.log(`✓ ${links.length} links criados`);

  // Fotos (usando picsum.photos com seeds fixos para imagens consistentes)
  const photos = await db
    .insert(photosTable)
    .values([
      {
        profileId: profile.id,
        url: "https://picsum.photos/seed/seed-p1/600/600",
        caption: "Projeto em destaque",
        position: 0,
        isCover: true,
      },
      {
        profileId: profile.id,
        url: "https://picsum.photos/seed/seed-p2/600/600",
        caption: "Workshop de Design 2024",
        position: 1,
        isCover: false,
      },
      {
        profileId: profile.id,
        url: "https://picsum.photos/seed/seed-p3/600/600",
        caption: "Design System",
        position: 2,
        isCover: false,
      },
      {
        profileId: profile.id,
        url: "https://picsum.photos/seed/seed-p4/600/600",
        caption: "Conferência Tech 2024",
        position: 3,
        isCover: false,
      },
      {
        profileId: profile.id,
        url: "https://picsum.photos/seed/seed-p5/600/600",
        caption: "Bastidores",
        position: 4,
        isCover: false,
      },
      {
        profileId: profile.id,
        url: "https://picsum.photos/seed/seed-p6/600/600",
        caption: "Lançamento",
        position: 5,
        isCover: false,
      },
    ])
    .returning();

  console.log(`✓ ${photos.length} fotos criadas`);

  // Redes sociais
  const socialLinks = await db
    .insert(socialLinksTable)
    .values([
      {
        profileId: profile.id,
        platform: "github",
        url: "https://github.com/joaosilva",
        position: 0,
      },
      {
        profileId: profile.id,
        platform: "twitter",
        url: "https://twitter.com/joaosilva",
        position: 1,
      },
      {
        profileId: profile.id,
        platform: "instagram",
        url: "https://instagram.com/joaosilva",
        position: 2,
      },
      {
        profileId: profile.id,
        platform: "linkedin",
        url: "https://linkedin.com/in/joaosilva",
        position: 3,
      },
    ])
    .returning();

  console.log(`✓ ${socialLinks.length} redes sociais criadas`);

  console.log(`
✅ Seed concluído com sucesso!

   Perfil público: http://localhost:3000/${SEED_USERNAME}
   Galeria:        http://localhost:3000/${SEED_USERNAME}/photos

   Certifique-se de que o servidor e o frontend estão rodando:
     Terminal 1: npm run dev:api
     Terminal 2: npm run dev:web
  `);

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed falhou:", err.message ?? err);
  process.exit(1);
});
