import { Router } from "express";
import { db } from "@workspace/db";
import { analyticsTable, linksTable, photosTable, profilesTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { TrackEventBody } from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router = Router();
const DEMO_MODE = process.env.DEMO_MODE === "true";

async function getProfileId(clerkUserId: string): Promise<string | null> {
  const profile = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, clerkUserId))
    .limit(1)
    .then((r) => r[0]);
  return profile?.id ?? null;
}

router.post("/analytics", async (req, res): Promise<void> => {
  if (DEMO_MODE) { res.json({ ok: true }); return; }

  const parsed = TrackEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(analyticsTable).values({
    profileId: parsed.data.profileId,
    linkId: parsed.data.linkId ?? null,
    eventType: parsed.data.eventType,
    referrer: parsed.data.referrer ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  });

  if (parsed.data.linkId) {
    await db
      .update(linksTable)
      .set({ clickCount: sql`${linksTable.clickCount} + 1` })
      .where(eq(linksTable.id, parsed.data.linkId));
  }

  res.json({ ok: true });
});

router.get("/analytics", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.json({
      totalPageViews: 142,
      totalClicks: 53,
      dailyViews: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 20) + 5,
      })),
      topLinks: [
        { linkId: "link-1", title: "GitHub", clickCount: 42 },
        { linkId: "link-2", title: "Portfólio", clickCount: 28 },
        { linkId: "link-3", title: "Twitter / X", clickCount: 17 },
      ],
    });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.json({ totalPageViews: 0, totalClicks: 0, dailyViews: [], topLinks: [] });
    return;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [pageViews, clicks, dailyViewsRaw, topLinksRaw] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(analyticsTable)
      .where(and(eq(analyticsTable.profileId, profileId), eq(analyticsTable.eventType, "page_view"), gte(analyticsTable.createdAt, thirtyDaysAgo)))
      .then((r) => Number(r[0]?.count ?? 0)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(analyticsTable)
      .where(and(eq(analyticsTable.profileId, profileId), eq(analyticsTable.eventType, "link_click"), gte(analyticsTable.createdAt, thirtyDaysAgo)))
      .then((r) => Number(r[0]?.count ?? 0)),
    db
      .select({
        date: sql<string>`DATE(${analyticsTable.createdAt})::text`,
        count: sql<number>`count(*)`,
      })
      .from(analyticsTable)
      .where(and(eq(analyticsTable.profileId, profileId), eq(analyticsTable.eventType, "page_view"), gte(analyticsTable.createdAt, thirtyDaysAgo)))
      .groupBy(sql`DATE(${analyticsTable.createdAt})`)
      .orderBy(sql`DATE(${analyticsTable.createdAt})`),
    db
      .select({ linkId: linksTable.id, title: linksTable.title, clickCount: linksTable.clickCount })
      .from(linksTable)
      .where(eq(linksTable.profileId, profileId))
      .orderBy(sql`${linksTable.clickCount} DESC`)
      .limit(5),
  ]);

  res.json({
    totalPageViews: pageViews,
    totalClicks: clicks,
    dailyViews: dailyViewsRaw.map((r) => ({ date: r.date, count: Number(r.count) })),
    topLinks: topLinksRaw.map((r) => ({ linkId: r.linkId, title: r.title, clickCount: r.clickCount ?? 0 })),
  });
});

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.json({
      totalLinks: 5,
      totalPhotos: 6,
      totalPageViews: 142,
      totalClicks: 53,
      recentActivity: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 20) + 5,
      })),
    });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.json({ totalLinks: 0, totalPhotos: 0, totalPageViews: 0, totalClicks: 0, recentActivity: [] });
    return;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [linksCount, photosCount, pageViews, clicks, recentActivity] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(linksTable).where(eq(linksTable.profileId, profileId)).then((r) => Number(r[0]?.count ?? 0)),
    db.select({ count: sql<number>`count(*)` }).from(photosTable).where(eq(photosTable.profileId, profileId)).then((r) => Number(r[0]?.count ?? 0)),
    db.select({ count: sql<number>`count(*)` }).from(analyticsTable).where(and(eq(analyticsTable.profileId, profileId), eq(analyticsTable.eventType, "page_view"), gte(analyticsTable.createdAt, thirtyDaysAgo))).then((r) => Number(r[0]?.count ?? 0)),
    db.select({ count: sql<number>`count(*)` }).from(analyticsTable).where(and(eq(analyticsTable.profileId, profileId), eq(analyticsTable.eventType, "link_click"), gte(analyticsTable.createdAt, thirtyDaysAgo))).then((r) => Number(r[0]?.count ?? 0)),
    db
      .select({ date: sql<string>`DATE(${analyticsTable.createdAt})::text`, count: sql<number>`count(*)` })
      .from(analyticsTable)
      .where(and(eq(analyticsTable.profileId, profileId), eq(analyticsTable.eventType, "page_view"), gte(analyticsTable.createdAt, thirtyDaysAgo)))
      .groupBy(sql`DATE(${analyticsTable.createdAt})`)
      .orderBy(sql`DATE(${analyticsTable.createdAt})`)
      .limit(14),
  ]);

  res.json({
    totalLinks: linksCount,
    totalPhotos: photosCount,
    totalPageViews: pageViews,
    totalClicks: clicks,
    recentActivity: recentActivity.map((r) => ({ date: r.date, count: Number(r.count) })),
  });
});

export default router;
