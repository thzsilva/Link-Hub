import { Router } from "express";
import { db } from "@workspace/db";
import { linksTable, profilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateLinkBody,
  UpdateLinkBody,
  UpdateLinkParams,
  DeleteLinkParams,
  ReorderLinksBody,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router = Router();
const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoLinks = [
  { id: "link-1", profileId: "00000000-0000-0000-0000-000000000001", title: "GitHub", url: "https://github.com", description: "Meus projetos open source", icon: null, thumbnailUrl: null, cardType: "default", position: 0, isVisible: true, clickCount: 42, createdAt: new Date().toISOString() },
  { id: "link-2", profileId: "00000000-0000-0000-0000-000000000001", title: "Portfólio", url: "https://example.com", description: "Trabalhos e cases", icon: null, thumbnailUrl: null, cardType: "default", position: 1, isVisible: true, clickCount: 28, createdAt: new Date().toISOString() },
  { id: "link-3", profileId: "00000000-0000-0000-0000-000000000001", title: "Twitter / X", url: "https://twitter.com", description: "Pensamentos e atualizações", icon: null, thumbnailUrl: null, cardType: "default", position: 2, isVisible: true, clickCount: 17, createdAt: new Date().toISOString() },
  { id: "link-4", profileId: "00000000-0000-0000-0000-000000000001", title: "Blog & Artigos", url: "https://example.com/blog", description: "Escrita sobre tecnologia e design", icon: null, thumbnailUrl: null, cardType: "default", position: 3, isVisible: true, clickCount: 9, createdAt: new Date().toISOString() },
  { id: "link-5", profileId: "00000000-0000-0000-0000-000000000001", title: "Fale Comigo", url: "mailto:joao@example.com", description: "Entre em contato", icon: null, thumbnailUrl: null, cardType: "default", position: 4, isVisible: true, clickCount: 5, createdAt: new Date().toISOString() },
];

async function getProfileId(clerkUserId: string): Promise<string | null> {
  const profile = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, clerkUserId))
    .limit(1)
    .then((r) => r[0]);
  return profile?.id ?? null;
}

router.get("/links", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json(demoLinks); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.json([]); return; }

  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.profileId, profileId))
    .orderBy(linksTable.position);

  res.json(links);
});

router.post("/links", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    const parsed = CreateLinkBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    res.status(201).json({ id: `demo-${Date.now()}`, ...parsed.data, profileId: "demo", position: demoLinks.length, clickCount: 0, createdAt: new Date().toISOString() });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = CreateLinkBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const maxPos = await db
    .select({ pos: linksTable.position })
    .from(linksTable)
    .where(eq(linksTable.profileId, profileId))
    .orderBy(linksTable.position)
    .then((r) => (r.length > 0 ? Math.max(...r.map((x) => x.pos ?? 0)) + 1 : 0));

  const [link] = await db
    .insert(linksTable)
    .values({ ...parsed.data, profileId, position: maxPos })
    .returning();

  res.status(201).json(link);
});

router.put("/links/reorder", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json({ ok: true }); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = ReorderLinksBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  await Promise.all(
    parsed.data.ids.map((id, idx) =>
      db
        .update(linksTable)
        .set({ position: idx })
        .where(and(eq(linksTable.id, id), eq(linksTable.profileId, profileId))),
    ),
  );

  res.json({ ok: true });
});

router.put("/links/:id", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    const paramsParsed = UpdateLinkParams.safeParse(req.params);
    if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
    const parsed = UpdateLinkBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const demo = demoLinks.find(l => l.id === paramsParsed.data.id);
    res.json(demo ? { ...demo, ...parsed.data } : { error: "Not found" });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const paramsParsed = UpdateLinkParams.safeParse(req.params);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateLinkBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const [link] = await db
    .update(linksTable)
    .set(parsed.data)
    .where(and(eq(linksTable.id, paramsParsed.data.id), eq(linksTable.profileId, profileId)))
    .returning();

  if (!link) { res.status(404).json({ error: "Link not found" }); return; }
  res.json(link);
});

router.delete("/links/:id", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json({ ok: true }); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const paramsParsed = DeleteLinkParams.safeParse(req.params);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const [deleted] = await db
    .delete(linksTable)
    .where(and(eq(linksTable.id, paramsParsed.data.id), eq(linksTable.profileId, profileId)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Link not found" }); return; }
  res.json({ ok: true });
});

export default router;
