import { pgTable, text, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const linksTable = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  sectionId: uuid("section_id"),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  icon: text("icon"),
  thumbnailUrl: text("thumbnail_url"),
  cardType: text("card_type").default("default"),
  position: integer("position").default(0),
  isVisible: boolean("is_visible").default(true),
  clickCount: integer("click_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLinkSchema = createInsertSchema(linksTable).omit({
  id: true,
  createdAt: true,
  clickCount: true,
});

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof linksTable.$inferSelect;
