import { pgTable, text, boolean, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  headerImageUrl: text("header_image_url"),
  accentColor: text("accent_color").default("#ffffff"),
  bgColor: text("bg_color").default("#000000"),
  cardStyle: text("card_style").default("glass"),
  // Nova customização de tema
  themeId: text("theme_id").default("default"),
  layoutColumns: integer("layout_columns").default(1),
  customPrimaryColor: text("custom_primary_color"),
  customSecondaryColor: text("custom_secondary_color"),
  backgroundImageUrl: text("background_image_url"),
  backgroundBlur: integer("background_blur").default(0),
  // Video & Contact
  videoUrl: text("video_url"),
  whatsappNumber: text("whatsapp_number"),
  email: text("email"),
  instagramHandle: text("instagram_handle"),
  // Configurações de seções
  showSections: boolean("show_sections").default(true),
  sectionSettings: jsonb("section_settings").default({}),
  sectionOrder: jsonb("section_order"),
  // Footer: patrocinadores/parceiros (logos) + texto customizado
  sponsors: jsonb("sponsors"),
  footerText: text("footer_text"),
  // Aparência do hero e fonte do nome
  heroDisplay: text("hero_display").default("name"),
  heroAlign: text("hero_align").default("center"),
  socialIconsAlign: text("social_icons_align").default("center"),
  usernameFont: text("username_font").default("default"),
  isSuperAdmin: boolean("is_super_admin").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
