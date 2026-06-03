import { Router } from "express";
import { getAuth } from "@clerk/express";

const router = Router();
const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoEvents = [
  {
    id: "event-1",
    profileId: "00000000-0000-0000-0000-000000000001",
    title: "Live Show — São Paulo",
    description: "Uma noite especial de música ao vivo.",
    eventDate: "2024-12-15T20:00:00.000Z",
    street: "Rua Augusta, 123",
    city: "São Paulo",
    state: "SP",
    ticketUrl: "https://example.com/tickets",
    imageUrl: null,
    position: 0,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "event-2",
    profileId: "00000000-0000-0000-0000-000000000001",
    title: "Workshop Criativo",
    description: "Aprenda design thinking na prática.",
    eventDate: "2024-12-22T14:00:00.000Z",
    street: null,
    city: "Online",
    state: null,
    ticketUrl: "https://example.com/workshop",
    imageUrl: null,
    position: 1,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
];

async function getDbModule() {
  const { db, eventsTable, profilesTable } = await import("@workspace/db");
  const { eq, and } = await import("drizzle-orm");
  return { db, eventsTable, profilesTable, eq, and };
}

async function getProfileId(clerkUserId: string): Promise<string | null> {
  const { db, profilesTable, eq } = await getDbModule();
  const profile = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, clerkUserId))
    .limit(1)
    .then((r) => r[0]);
  return profile?.id ?? null;
}

// ---------------------------------------------------------------------------
// Authenticated routes
// ---------------------------------------------------------------------------

router.get("/events", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json(demoEvents); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.json([]); return; }

  try {
    const { db, eventsTable, eq } = await getDbModule();
    const events = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.profileId, profileId))
      .orderBy(eventsTable.position);
    res.json(events);
  } catch (err: any) {
    if (err?.message?.includes("relation") && err?.message?.includes("does not exist")) {
      res.status(503).json({ error: "Tabela events não existe. Execute o SQL de migração no Supabase.", details: err.message });
    } else {
      res.status(500).json({ error: "Erro interno", details: err?.message });
    }
  }
});

router.post("/events", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.status(201).json({ id: `demo-${Date.now()}`, ...req.body, profileId: "demo", position: 0, isVisible: true, createdAt: new Date().toISOString() });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  try {
    const { db, eventsTable, eq } = await getDbModule();
    const maxPos = await db
      .select({ pos: eventsTable.position })
      .from(eventsTable)
      .where(eq(eventsTable.profileId, profileId))
      .then((r) => (r.length > 0 ? Math.max(...r.map((x) => x.pos ?? 0)) + 1 : 0));

    const { title, description, eventDate, street, city, state, ticketUrl, imageUrl, isVisible } = req.body;
    if (!title) { res.status(400).json({ error: "title is required" }); return; }

    const [event] = await db
      .insert(eventsTable)
      .values({
        profileId,
        title,
        description: description ?? null,
        eventDate: eventDate ? new Date(eventDate) : null,
        street: street ?? null,
        city: city ?? null,
        state: state ?? null,
        ticketUrl: ticketUrl ?? null,
        imageUrl: imageUrl ?? null,
        position: maxPos,
        isVisible: isVisible ?? true,
      })
      .returning();

    res.status(201).json(event);
  } catch (err: any) {
    if (err?.message?.includes("relation") && err?.message?.includes("does not exist")) {
      res.status(503).json({ error: "Tabela events não existe. Execute o SQL de migração no Supabase." });
    } else {
      res.status(500).json({ error: "Erro ao criar evento", details: err?.message });
    }
  }
});

// IMPORTANT: /events/reorder must come BEFORE /events/:id, otherwise Express
// matches "reorder" as an :id param.
router.put("/events/reorder", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json({ ok: true }); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) { res.status(400).json({ error: "ids must be an array" }); return; }

    const { db, eventsTable, eq, and } = await getDbModule();

    // Verify all events belong to this user
    const events = await db
      .select({ id: eventsTable.id })
      .from(eventsTable)
      .where(eq(eventsTable.profileId, profileId));

    const eventIds = new Set(events.map((e: { id: string }) => e.id));
    for (const id of ids) {
      if (!eventIds.has(id)) {
        res.status(403).json({ error: "Forbidden: event not owned by user" });
        return;
      }
    }

    // Update positions
    for (let i = 0; i < ids.length; i++) {
      await db
        .update(eventsTable)
        .set({ position: i })
        .where(and(eq(eventsTable.id, ids[i]), eq(eventsTable.profileId, profileId)));
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao reordenar eventos", details: err?.message });
  }
});

router.put("/events/:id", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json(req.body); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  try {
    const { db, eventsTable, eq, and } = await getDbModule();
    const { title, description, eventDate, street, city, state, ticketUrl, imageUrl, price, isVisible } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventDate !== undefined) updateData.eventDate = eventDate ? new Date(eventDate) : null;
    if (street !== undefined) updateData.street = street;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (ticketUrl !== undefined) updateData.ticketUrl = ticketUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (price !== undefined) updateData.price = price;
    if (req.body.paymentReceived !== undefined) updateData.paymentReceived = req.body.paymentReceived;
    if (isVisible !== undefined) updateData.isVisible = isVisible;

    const [updated] = await db
      .update(eventsTable)
      .set(updateData)
      .where(and(eq(eventsTable.id, req.params.id), eq(eventsTable.profileId, profileId)))
      .returning();

    if (!updated) { res.status(404).json({ error: "Event not found" }); return; }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao atualizar evento", details: err?.message });
  }
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json({ ok: true }); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  try {
    const { db, eventsTable, eq, and } = await getDbModule();
    const [deleted] = await db
      .delete(eventsTable)
      .where(and(eq(eventsTable.id, req.params.id), eq(eventsTable.profileId, profileId)))
      .returning();

    if (!deleted) { res.status(404).json({ error: "Event not found" }); return; }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao deletar evento", details: err?.message });
  }
});

// ---------------------------------------------------------------------------
// Public route
// ---------------------------------------------------------------------------

router.get("/events/public/:username", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json(demoEvents); return; }

  try {
  const { db, eventsTable, profilesTable, eq, and } = await getDbModule();
  const profile = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.username, req.params.username))
    .limit(1)
    .then((r) => r[0]);

  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const events = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.profileId, profile.id), eq(eventsTable.isVisible, true)))
    .orderBy(eventsTable.position);

  res.json(events);
  } catch {
    // Tabela ainda não existe — retorna lista vazia silenciosamente no perfil público
    res.json([]);
  }
});

export default router;
