import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateAdminArtistBody, UpdateAdminArtistParams } from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router = Router();
const DEMO_MODE = process.env.DEMO_MODE === "true";

async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
  const profile = await db
    .select({ isSuperAdmin: profilesTable.isSuperAdmin })
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, clerkUserId))
    .limit(1)
    .then((r) => r[0]);
  return profile?.isSuperAdmin === true;
}

router.get("/admin/artists", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json([]); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const admin = await isSuperAdmin(userId);
  if (!admin) { res.status(403).json({ error: "Forbidden" }); return; }

  const artists = await db.select().from(profilesTable).orderBy(profilesTable.createdAt);
  res.json(artists);
});

router.put("/admin/artists/:id", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json({ ok: true }); return; }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const admin = await isSuperAdmin(userId);
  if (!admin) { res.status(403).json({ error: "Forbidden" }); return; }

  const paramsParsed = UpdateAdminArtistParams.safeParse(req.params);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateAdminArtistBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db
    .update(profilesTable)
    .set({ isActive: parsed.data.isActive })
    .where(eq(profilesTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Artist not found" }); return; }
  res.json(updated);
});

export default router;
