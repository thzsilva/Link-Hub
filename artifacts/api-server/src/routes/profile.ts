import { Router } from "express";
import { db } from "@workspace/db";
import {
  profilesTable,
  linksTable,
  photosTable,
  socialLinksTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetMeResponse,
  UpdateProfileBody,
  CheckUsernameAvailabilityQueryParams,
  GetPublicProfileParams,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router = Router();

async function getOrCreateProfile(clerkUserId: string, email?: string) {
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
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const profile = await getOrCreateProfile(userId);
  res.json(GetMeResponse.parse(profile));
});

router.put("/me", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await getOrCreateProfile(userId);

  if (parsed.data.username && parsed.data.username !== profile.username) {
    const existing = await db
      .select({ id: profilesTable.id })
      .from(profilesTable)
      .where(eq(profilesTable.username, parsed.data.username))
      .limit(1)
      .then((r) => r[0]);
    if (existing) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.username !== undefined) updateData.username = parsed.data.username;
  if (parsed.data.displayName !== undefined) updateData.displayName = parsed.data.displayName;
  if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
  if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.headerImageUrl !== undefined) updateData.headerImageUrl = parsed.data.headerImageUrl;
  if (parsed.data.accentColor !== undefined) updateData.accentColor = parsed.data.accentColor;
  if (parsed.data.bgColor !== undefined) updateData.bgColor = parsed.data.bgColor;
  if (parsed.data.cardStyle !== undefined) updateData.cardStyle = parsed.data.cardStyle;

  const [updated] = await db
    .update(profilesTable)
    .set(updateData)
    .where(eq(profilesTable.id, profile.id))
    .returning();

  res.json(updated);
});

router.get("/me/username-check", async (req, res): Promise<void> => {
  const parsed = CheckUsernameAvailabilityQueryParams.safeParse(req.query);
  if (!parsed.success || !parsed.data.username) {
    res.status(400).json({ error: "Username required" });
    return;
  }

  const existing = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.username, parsed.data.username))
    .limit(1)
    .then((r) => r[0]);

  res.json({ available: !existing });
});

router.get("/profile/:username", async (req, res): Promise<void> => {
  const { username } = req.params;

  const profile = await db
    .select()
    .from(profilesTable)
    .where(and(eq(profilesTable.username, username), eq(profilesTable.isActive, true)))
    .limit(1)
    .then((r) => r[0]);

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const [links, photos, socialLinks] = await Promise.all([
    db
      .select()
      .from(linksTable)
      .where(and(eq(linksTable.profileId, profile.id), eq(linksTable.isVisible, true)))
      .orderBy(linksTable.position),
    db
      .select()
      .from(photosTable)
      .where(eq(photosTable.profileId, profile.id))
      .orderBy(photosTable.position),
    db
      .select()
      .from(socialLinksTable)
      .where(eq(socialLinksTable.profileId, profile.id))
      .orderBy(socialLinksTable.position),
  ]);

  res.json({ profile, links, photos, socialLinks });
});

export default router;
