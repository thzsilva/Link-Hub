import { pgTable, text, boolean, integer, timestamp, uuid, numeric } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const eventsTable = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date", { withTimezone: true }),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  ticketUrl: text("ticket_url"),
  imageUrl: text("image_url"),
  price: numeric("price", { precision: 10, scale: 2 }),
  paymentReceived: boolean("payment_received").default(false),
  position: integer("position").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Event = typeof eventsTable.$inferSelect;
export type InsertEvent = typeof eventsTable.$inferInsert;
