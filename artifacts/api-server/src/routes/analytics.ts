import { Router } from "express";
import { db } from "@workspace/db";
import { analyticsTable, linksTable, photosTable, profilesTable, eventsTable } from "@workspace/db";
import { eq, and, gte, sql, isNotNull } from "drizzle-orm";
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

router.get("/dashboard/monetization", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.json({
      totalRevenue: 15000.50,
      upcomingRevenue: 5000,
      completedRevenue: 10000.50,
      events: [
        { id: "event-1", title: "Show 25/06", date: "2024-06-25", price: 5000, status: "upcoming" },
        { id: "event-2", title: "Show 20/06", date: "2024-06-20", price: 3000, status: "completed" },
        { id: "event-3", title: "Workshop", date: "2024-06-15", price: 2000, status: "completed" },
      ],
      trend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
        revenue: Math.floor(Math.random() * 1000) + 100,
      })),
    });
    return;
  }

  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.json({ totalRevenue: 0, upcomingRevenue: 0, completedRevenue: 0, events: [], trend: [] });
    return;
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();

    // Get all events with price
    const allEvents = await db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        eventDate: eventsTable.eventDate,
        price: eventsTable.price,
        paymentReceived: eventsTable.paymentReceived,
      })
      .from(eventsTable)
      .where(and(eq(eventsTable.profileId, profileId), isNotNull(eventsTable.price)));

    // status: "received" when manually marked as paid, otherwise based on date
    const events = allEvents.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.eventDate?.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      price: Number(e.price ?? 0),
      paymentReceived: !!e.paymentReceived,
      status: e.paymentReceived
        ? "received"
        : (e.eventDate && new Date(e.eventDate) < now ? "pending" : "upcoming"),
    }));

    // Calculate totals based on the manual "received" flag
    const totalRevenue = allEvents.reduce((sum, e) => sum + (Number(e.price) || 0), 0);
    const completedRevenue = events.filter(e => e.paymentReceived).reduce((sum, e) => sum + e.price, 0);
    const upcomingRevenue = totalRevenue - completedRevenue;

    // Calculate trend (last 30 days, by event date)
    const trendRaw = await db
      .select({
        date: sql<string>`DATE(${eventsTable.eventDate})::text`,
        revenue: sql<number>`COALESCE(SUM(${eventsTable.price}), 0)`,
      })
      .from(eventsTable)
      .where(and(eq(eventsTable.profileId, profileId), isNotNull(eventsTable.price), gte(eventsTable.eventDate, thirtyDaysAgo)))
      .groupBy(sql`DATE(${eventsTable.eventDate})`)
      .orderBy(sql`DATE(${eventsTable.eventDate})`);

    const trend = trendRaw.map((r) => ({ date: r.date, revenue: Number(r.revenue) }));

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      upcomingRevenue: Number(upcomingRevenue.toFixed(2)),
      completedRevenue: Number(completedRevenue.toFixed(2)),
      events: events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      trend,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao buscar monetização", details: err?.message });
  }
});

export default router;
