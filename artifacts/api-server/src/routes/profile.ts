import { Router } from "express";
import { getAuth } from "@clerk/express";
import {
  GetMeResponse,
  UpdateProfileBody,
  CheckUsernameAvailabilityQueryParams,
} from "@workspace/api-zod";

const router = Router();

// ---------------------------------------------------------------------------
// Demo mode (quando DATABASE_URL não está configurado)
// ---------------------------------------------------------------------------

const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  clerkUserId: "user_demo",
  username: "johndoe",
  displayName: "João Silva",
  bio: "Designer & Desenvolvedor Full-Stack. Transformando ideias em produtos digitais.",
  avatarUrl: "https://i.pravatar.cc/300?img=12",
  headerImageUrl: "https://picsum.photos/seed/linkhub-header/1200/400",
  accentColor: "#6366f1",
  bgColor: "#0a0a0a",
  cardStyle: "glass",
  isSuperAdmin: false,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const demoLinks = [
  { id: "link-1", profileId: demoProfile.id, title: "GitHub", url: "https://github.com", description: "Meus projetos open source", icon: null, thumbnailUrl: null, cardType: "default", position: 0, isVisible: true, clickCount: 42, createdAt: new Date().toISOString() },
  { id: "link-2", profileId: demoProfile.id, title: "Portfólio", url: "https://example.com", description: "Trabalhos e cases", icon: null, thumbnailUrl: null, cardType: "default", position: 1, isVisible: true, clickCount: 28, createdAt: new Date().toISOString() },
  { id: "link-3", profileId: demoProfile.id, title: "Twitter / X", url: "https://twitter.com", description: "Pensamentos e atualizações", icon: null, thumbnailUrl: null, cardType: "default", position: 2, isVisible: true, clickCount: 17, createdAt: new Date().toISOString() },
  { id: "link-4", profileId: demoProfile.id, title: "Blog & Artigos", url: "https://example.com/blog", description: "Escrita sobre tecnologia e design", icon: null, thumbnailUrl: null, cardType: "default", position: 3, isVisible: true, clickCount: 9, createdAt: new Date().toISOString() },
  { id: "link-5", profileId: demoProfile.id, title: "Fale Comigo", url: "mailto:joao@example.com", description: "Entre em contato", icon: null, thumbnailUrl: null, cardType: "default", position: 4, isVisible: true, clickCount: 5, createdAt: new Date().toISOString() },
];

const demoPhotos = [
  { id: "photo-1", profileId: demoProfile.id, url: "https://picsum.photos/seed/seed-p1/600/600", caption: "Projeto em destaque", isCover: true, position: 0, createdAt: new Date().toISOString() },
  { id: "photo-2", profileId: demoProfile.id, url: "https://picsum.photos/seed/seed-p2/600/600", caption: "Workshop de Design 2024", isCover: false, position: 1, createdAt: new Date().toISOString() },
  { id: "photo-3", profileId: demoProfile.id, url: "https://picsum.photos/seed/seed-p3/600/600", caption: "Design System", isCover: false, position: 2, createdAt: new Date().toISOString() },
  { id: "photo-4", profileId: demoProfile.id, url: "https://picsum.photos/seed/seed-p4/600/600", caption: "Conferência Tech 2024", isCover: false, position: 3, createdAt: new Date().toISOString() },
  { id: "photo-5", profileId: demoProfile.id, url: "https://picsum.photos/seed/seed-p5/600/600", caption: "Bastidores", isCover: false, position: 4, createdAt: new Date().toISOString() },
  { id: "photo-6", profileId: demoProfile.id, url: "https://picsum.photos/seed/seed-p6/600/600", caption: "Lançamento", isCover: false, position: 5, createdAt: new Date().toISOString() },
];

const demoSocialLinks = [
  { id: "social-1", profileId: demoProfile.id, platform: "github", url: "https://github.com/joaosilva", position: 0 },
  { id: "social-2", profileId: demoProfile.id, platform: "twitter", url: "https://twitter.com/joaosilva", position: 1 },
  { id: "social-3", profileId: demoProfile.id, platform: "instagram", url: "https://instagram.com/joaosilva", position: 2 },
  { id: "social-4", profileId: demoProfile.id, platform: "linkedin", url: "https://linkedin.com/in/joaosilva", position: 3 },
];

// ---------------------------------------------------------------------------
// Rotas autenticadas (requerem banco de dados)
// ---------------------------------------------------------------------------

async function getDbModule() {
  const { db, profilesTable, linksTable, photosTable, socialLinksTable } = await import("@workspace/db");
  const { eq, and } = await import("drizzle-orm");
  return { db, profilesTable, linksTable, photosTable, socialLinksTable, eq, and };
}

async function getOrCreateProfile(clerkUserId: string, email?: string) {
  const { db, profilesTable, eq } = await getDbModule();

  let profile = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, clerkUserId))
    .limit(1)
    .then((r) => r[0]);

  if (!profile) {
    const base = email ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-") : `user${Date.now()}`;
    const username = `${base}-${Math.random().toString(36).slice(2, 6)}`.slice(0, 30);
    [profile] = await db
      .insert(profilesTable)
      .values({ clerkUserId, username })
      .returning();
  }

  return profile;
}

router.get("/me", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json(demoProfile); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const profile = await getOrCreateProfile(userId);
  // Serializa diretamente — res.json converte Date→ISO string automaticamente.
  // NÃO usar GetMeResponse.parse() aqui: Drizzle retorna Date objects para timestamps
  // e zod.string() rejeita Date, causando ZodError → 500.
  res.json(profile);
});

router.put("/me", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json(demoProfile); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  console.log("PUT /api/me - dados recebidos:", JSON.stringify(parsed.data, null, 2));

  const { db, profilesTable, eq } = await getDbModule();
  const profile = await getOrCreateProfile(userId);

  if (parsed.data.username && parsed.data.username !== profile.username) {
    const existing = await db
      .select({ id: profilesTable.id })
      .from(profilesTable)
      .where(eq(profilesTable.username, parsed.data.username))
      .limit(1)
      .then((r) => r[0]);
    if (existing) { res.status(400).json({ error: "Username already taken" }); return; }
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.username !== undefined) updateData.username = parsed.data.username;
  if (parsed.data.displayName !== undefined) updateData.displayName = parsed.data.displayName;
  if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
  if (parsed.data.avatarUrl !== undefined) {
    console.log("Salvando avatarUrl:", parsed.data.avatarUrl);
    updateData.avatarUrl = parsed.data.avatarUrl;
  }
  if (parsed.data.headerImageUrl !== undefined) updateData.headerImageUrl = parsed.data.headerImageUrl;
  if (parsed.data.accentColor !== undefined) updateData.accentColor = parsed.data.accentColor;
  if (parsed.data.bgColor !== undefined) updateData.bgColor = parsed.data.bgColor;
  if (parsed.data.cardStyle !== undefined) updateData.cardStyle = parsed.data.cardStyle;
  if (parsed.data.themeId !== undefined) updateData.themeId = parsed.data.themeId;
  if (parsed.data.layoutColumns !== undefined) updateData.layoutColumns = parsed.data.layoutColumns;
  if (parsed.data.customPrimaryColor !== undefined) updateData.customPrimaryColor = parsed.data.customPrimaryColor;
  if (parsed.data.customSecondaryColor !== undefined) updateData.customSecondaryColor = parsed.data.customSecondaryColor;
  if (parsed.data.backgroundImageUrl !== undefined) updateData.backgroundImageUrl = parsed.data.backgroundImageUrl;
  if (parsed.data.backgroundBlur !== undefined) updateData.backgroundBlur = parsed.data.backgroundBlur;

  console.log("PUT /api/me - updateData:", JSON.stringify(updateData, null, 2));

  const [updated] = await db
    .update(profilesTable)
    .set(updateData)
    .where(eq(profilesTable.id, profile.id))
    .returning();

  console.log("PUT /api/me - resultado:", JSON.stringify({ id: updated.id, avatarUrl: updated.avatarUrl }, null, 2));

  res.json(updated);
});

router.patch("/profile", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json(demoProfile); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { db, profilesTable, eq } = await getDbModule();
  const profile = await getOrCreateProfile(userId);

  const updateData: Record<string, unknown> = {};
  if (req.body.themeId !== undefined) updateData.themeId = req.body.themeId;
  if (req.body.layoutColumns !== undefined) updateData.layoutColumns = req.body.layoutColumns;
  if (req.body.customPrimaryColor !== undefined) updateData.customPrimaryColor = req.body.customPrimaryColor;
  if (req.body.customSecondaryColor !== undefined) updateData.customSecondaryColor = req.body.customSecondaryColor;
  if (req.body.backgroundImageUrl !== undefined) updateData.backgroundImageUrl = req.body.backgroundImageUrl;
  if (req.body.backgroundBlur !== undefined) updateData.backgroundBlur = req.body.backgroundBlur;

  const [updated] = await db
    .update(profilesTable)
    .set(updateData)
    .where(eq(profilesTable.id, profile.id))
    .returning();

  res.json(updated);
});

router.get("/me/username-check", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json({ available: true }); return; }

  const parsed = CheckUsernameAvailabilityQueryParams.safeParse(req.query);
  if (!parsed.success || !parsed.data.username) { res.status(400).json({ error: "Username required" }); return; }

  const { db, profilesTable, eq } = await getDbModule();
  const existing = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.username, parsed.data.username))
    .limit(1)
    .then((r) => r[0]);

  res.json({ available: !existing });
});

// ---------------------------------------------------------------------------
// Rota pública — sem autenticação, com fallback demo
// ---------------------------------------------------------------------------

router.get("/profile/:username", async (req, res): Promise<void> => {
  const { username } = req.params;

  // Modo demo: retorna dados estáticos sem precisar de banco
  if (DEMO_MODE) {
    if (username !== demoProfile.username) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({ profile: demoProfile, links: demoLinks, photos: demoPhotos, socialLinks: demoSocialLinks });
    return;
  }

  const { db, profilesTable, linksTable, photosTable, socialLinksTable, eq, and } = await getDbModule();

  const profile = await db
    .select()
    .from(profilesTable)
    .where(and(eq(profilesTable.username, username), eq(profilesTable.isActive, true)))
    .limit(1)
    .then((r) => r[0]);

  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const [links, photos, socialLinks] = await Promise.all([
    db.select().from(linksTable).where(and(eq(linksTable.profileId, profile.id), eq(linksTable.isVisible, true))).orderBy(linksTable.position),
    db.select().from(photosTable).where(eq(photosTable.profileId, profile.id)).orderBy(photosTable.position),
    db.select().from(socialLinksTable).where(eq(socialLinksTable.profileId, profile.id)).orderBy(socialLinksTable.position),
  ]);

  res.json({ profile, links, photos, socialLinks });
});

export default router;
