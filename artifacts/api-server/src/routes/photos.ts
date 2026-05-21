import { Router } from "express";
import { db } from "@workspace/db";
import { photosTable, profilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreatePhotoBody,
  UpdatePhotoBody,
  UpdatePhotoParams,
  DeletePhotoParams,
  ReorderPhotosBody,
  GetPublicPhotosParams,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router = Router();

async function getProfileId(clerkUserId: string): Promise<string | null> {
  const profile = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, clerkUserId))
    .limit(1)
    .then((r) => r[0]);
  return profile?.id ?? null;
}

router.get("/photos/public/:username", async (req, res): Promise<void> => {
  const paramsParsed = GetPublicPhotosParams.safeParse(req.params);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid username" }); return; }

  const profile = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.username, paramsParsed.data.username))
    .limit(1)
    .then((r) => r[0]);

  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  const photos = await db
    .select()
    .from(photosTable)
    .where(eq(photosTable.profileId, profile.id))
    .orderBy(photosTable.position);

  res.json(photos);
});

router.get("/photos", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.json([]); return; }

  const photos = await db
    .select()
    .from(photosTable)
    .where(eq(photosTable.profileId, profileId))
    .orderBy(photosTable.position);

  res.json(photos);
});

router.post("/photos", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = CreatePhotoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const maxPos = await db
    .select({ pos: photosTable.position })
    .from(photosTable)
    .where(eq(photosTable.profileId, profileId))
    .then((r) => (r.length > 0 ? Math.max(...r.map((x) => x.pos ?? 0)) + 1 : 0));

  const [photo] = await db
    .insert(photosTable)
    .values({ ...parsed.data, profileId, position: maxPos })
    .returning();

  res.status(201).json(photo);
});

router.put("/photos/reorder", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = ReorderPhotosBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  await Promise.all(
    parsed.data.ids.map((id, idx) =>
      db
        .update(photosTable)
        .set({ position: idx })
        .where(and(eq(photosTable.id, id), eq(photosTable.profileId, profileId))),
    ),
  );

  res.json({ ok: true });
});

router.put("/photos/:id", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const paramsParsed = UpdatePhotoParams.safeParse(req.params);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdatePhotoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const [photo] = await db
    .update(photosTable)
    .set(parsed.data)
    .where(and(eq(photosTable.id, paramsParsed.data.id), eq(photosTable.profileId, profileId)))
    .returning();

  if (!photo) { res.status(404).json({ error: "Photo not found" }); return; }
  res.json(photo);
});

router.delete("/photos/:id", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const paramsParsed = DeletePhotoParams.safeParse(req.params);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const [deleted] = await db
    .delete(photosTable)
    .where(and(eq(photosTable.id, paramsParsed.data.id), eq(photosTable.profileId, profileId)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Photo not found" }); return; }
  res.json({ ok: true });
});

export default router;
