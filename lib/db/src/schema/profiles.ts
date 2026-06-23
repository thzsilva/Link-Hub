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
  bannerVideoUrl: text("banner_video_url"),
  bioImageUrl: text("bio_image_url"),
  bioImageSide: text("bio_image_side").default("left"),
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
  // Header de navegação no perfil público
  showHeader: boolean("show_header").default(false),
  // Configurações de seções
  showSections: boolean("show_sections").default(true),
  sectionSettings: jsonb("section_settings").default({}),
  sectionOrder: jsonb("section_order"),
  sectionTitles: jsonb("section_titles"),
  // Footer: patrocinadores/parceiros (logos) + texto customizado
  sponsors: jsonb("sponsors"),
  footerText: text("footer_text"),
  // Aparência do hero e fonte do nome
  logoUrl: text("logo_url"),
  logoSize: integer("logo_size").default(128),
  showUsername: boolean("show_username").default(true),
  bannerFit: text("banner_fit").default("cover"),
  bannerHeight: text("banner_height").default("normal"),
  bannerType: text("banner_type").default("image"), // 'image' | 'video' — o que aparece no topo
  heroDisplay: text("hero_display").default("name"),
  heroLayout: text("hero_layout").default("overlay"),
  heroAlign: text("hero_align").default("center"),
  socialIconsAlign: text("social_icons_align").default("center"),
  usernameFont: text("username_font").default("default"),
  isSuperAdmin: boolean("is_super_admin").default(false),
  isActive: boolean("is_active").default(true),
  // Assinatura / pagamento (Asaas)
  subscriptionStatus: text("subscription_status").default("trialing"), // trialing | active | past_due | canceled
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  asaasCustomerId: text("asaas_customer_id"),
  asaasSubscriptionId: text("asaas_subscription_id"),
  subscriptionExempt: boolean("subscription_exempt").default(false), // isento de pagamento (nunca bloqueia)
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
