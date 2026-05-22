import { pgTable, text, integer, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const sectionsTable = pgTable("sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").default(0),
  isVisible: boolean("is_visible").default(true),
  bgColor: text("bg_color"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSectionSchema = createInsertSchema(sectionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sectionsTable.$inferSelect;
