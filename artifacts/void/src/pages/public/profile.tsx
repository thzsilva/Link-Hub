import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGetPublicProfile, useTrackEvent, customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, ExternalLink, Instagram, Music, Youtube, Mail, MessageCircle } from "lucide-react";
import { getPlatform, toSpotifyEmbedUrl, toMusicEmbedUrl } from "@/lib/platforms";
import { getTheme, getCSSVariables } from "@/lib/themes";
import { BioSection } from "@/components/public/BioSection";
import { VideoSection } from "@/components/public/VideoSection";
import { GallerySection } from "@/components/public/GallerySection";
import { ContactSection } from "@/components/public/ContactSection";
import { getFontStack } from "@/lib/fonts";
import { normalizeSectionOrder, type SectionKey } from "@/lib/sections";
import { BackToTop } from "@/components/BackToTop";

// Calendar-style date badge shown on top of event images
function EventDateBadge({ dateStr, theme }: { dateStr: string; theme: { primary: string; secondary: string } }) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
  const day = d.getDate();
  const year = d.getFullYear();
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col items-center justify-center rounded-xl px-3 py-2 backdrop-blur-md border border-white/20 shadow-lg min-w-[68px]"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.secondary }}>{month}</span>
      <span className="text-2xl sm:text-3xl font-black leading-none text-white">{day}</span>
      <span className="text-[10px] font-medium text-white/60 mt-0.5">{year}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="h-[50vh] w-full bg-white/5 animate-pulse" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-4 w-72 mb-2" />
        <Skeleton className="h-4 w-56 mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-14" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper — keeps max-width + padding consistent
// ---------------------------------------------------------------------------

function Section({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      className={`w-full py-16 sm:py-20 lg:py-24 border-b border-white/5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        {children}
      </div>
    </motion.section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight mb-8 sm:mb-10 lg:mb-12">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function PublicProfileNew() {
  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get("user") || "";
  const { data, isLoading } = useGetPublicProfile(username);
  const trackEvent = useTrackEvent();

  // Public events
  const { data: events } = useQuery<any[]>({
    queryKey: [`/api/events/public/${username}`],
    queryFn: () =>
      customFetch<any[]>(`/api/events/public/${username}`, { method: "GET" })
        .then((d) => d || [])
        .catch(() => []),
    enabled: !!username,
    staleTime: 60_000,
  });

  if (isLoading) return <ProfileSkeleton />;

  if (!data?.profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="font-mono text-muted-foreground text-lg">
          Perfil não encontrado.
        </p>
        <a
          href="/"
          className="text-xs uppercase tracking-widest underline underline-offset-4 text-muted-foreground hover:text-white"
        >
          Criar o meu perfil →
        </a>
      </div>
    );
  }

  const { profile, links, socialLinks, photos: profilePhotos } = data;
  const photos = profilePhotos;

  const themeBase = getTheme(profile.themeId);
  const customTheme = {
    ...themeBase,
    primary: profile.customPrimaryColor || themeBase.primary,
    secondary: profile.customSecondaryColor || themeBase.secondary,
  };
  const cssVars = getCSSVariables(customTheme);
  const layoutColumns = profile.layoutColumns || 1;

  const handleLinkClick = (linkId: string, url: string) => {
    trackEvent.mutate({
      data: {
        profileId: profile.id,
        linkId,
        eventType: "link_click",
        referrer: document.referrer,
      },
    });
    window.open(url, "_blank");
  };

  // Links that render as embedded players (Spotify + SoundCloud)
  const embedLinks =
    links?.filter((l) => l.isVisible && (l.cardType === "spotify" || l.cardType === "soundcloud")) ?? [];
  const regularLinks =
    links?.filter((l) => l.isVisible && l.cardType !== "spotify" && l.cardType !== "soundcloud") ?? [];

  // ── Highlighted social icons (hero) ──
  // Built from the user's social-platform links + saved social links + contacts.
  const SOCIAL_ICON_PLATFORMS = new Set([
    "instagram", "youtube", "tiktok", "twitter", "facebook", "twitch", "linkedin",
    "github", "telegram", "soundcloud", "spotify", "applemusic", "pinterest",
    "discord", "patreon", "kick",
  ]);

  const headerSocialLinks: Array<{ platform: string; url: string; icon: React.ReactNode; label: string }> = [];
  const seenSocial = new Set<string>();
  const pushSocial = (platformId: string, url: string) => {
    if (!url || seenSocial.has(platformId)) return;
    seenSocial.add(platformId);
    const p = getPlatform(platformId);
    headerSocialLinks.push({ platform: platformId, url, icon: <p.Icon size={18} />, label: p.name });
  };

  // From links with a recognized social platform icon
  (links ?? [])
    .filter((l) => l.isVisible && l.icon && SOCIAL_ICON_PLATFORMS.has(l.icon))
    .forEach((l) => pushSocial(l.icon as string, l.url));

  // From saved social links table (if any)
  (socialLinks ?? []).forEach((s) => {
    if (s.platform) pushSocial(s.platform, s.url);
  });

  // From profile contact fields
  if ((profile as any).whatsappNumber)
    pushSocial("whatsapp", `https://wa.me/${(profile as any).whatsappNumber}`);
  if ((profile as any).instagramHandle)
    pushSocial("instagram", `https://instagram.com/${String((profile as any).instagramHandle).replace(/^@/, "")}`);
  if ((profile as any).email)
    pushSocial("email", `mailto:${(profile as any).email}`);

  const displayName = profile.displayName || profile.username || "User";
  const hasSocials = headerSocialLinks.length >= 1;

  // Hero appearance + font
  const heroDisplay = (profile as any).heroDisplay || "name"; // 'name' | 'logo' | 'both'
  const heroLayout = (profile as any).heroLayout || "overlay"; // 'overlay' | 'below'
  const heroAlign = (profile as any).heroAlign || "center"; // 'top' | 'left' | 'center' | 'right'
  const heroAlignClasses =
    heroAlign === "left"
      ? "items-start text-left justify-center"
      : heroAlign === "right"
        ? "items-end text-right justify-center"
        : heroAlign === "top"
          ? "items-center text-center justify-start pt-12 sm:pt-20"
          : "items-center text-center justify-center";
  // Social icons position: "{top|bottom}-{left|center|right}" (old "left/center/right" → bottom-*)
  const rawIconsAlign = (profile as any).socialIconsAlign || "bottom-center";
  const iconsAlign = rawIconsAlign.includes("-") ? rawIconsAlign : `bottom-${rawIconsAlign}`;
  const [socialV, socialH] = iconsAlign.split("-");
  const socialIsTop = socialV === "top";
  const socialJustify =
    socialH === "left" ? "justify-start" : socialH === "right" ? "justify-end" : "justify-center";
  const nameFont = getFontStack((profile as any).usernameFont);
  const heroLogoUrl = (profile as any).logoUrl || null;
  const logoSize = Number((profile as any).logoSize) || 128; // px max-height
  const showUsername = (profile as any).showUsername !== false; // default true
  const showHeroLogo = (heroDisplay === "logo" || heroDisplay === "both") && (!!heroLogoUrl || !!profile.avatarUrl);
  const showHeroName = heroDisplay !== "logo";

  // Banner sizing (adjustable)
  const bannerFitClass = (profile as any).bannerFit === "contain" ? "object-contain" : "object-cover";
  const bannerHeightKey = (profile as any).bannerHeight || "normal";
  const bannerSizeClass =
    bannerHeightKey === "compact"
      ? "aspect-[16/7] sm:aspect-[16/6] max-h-[45vh]"
      : bannerHeightKey === "tall"
        ? "aspect-[3/4] sm:aspect-[16/12] max-h-[85vh]"
        : bannerHeightKey === "full"
          ? "min-h-[88vh]"
          : "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/7] max-h-[70vh]"; // normal

  // Renders the brand: a wide logo image (size adjustable) when available, otherwise the circular avatar
  const renderHeroBrand = (avatarSize: string, _logoMaxH: string, extra = "") => {
    if (heroLogoUrl) {
      return (
        <motion.img
          src={heroLogoUrl}
          alt={displayName}
          style={{ maxHeight: `${logoSize}px` }}
          className={`w-auto max-w-[85%] object-contain ${extra}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
    }
    if (profile.avatarUrl) {
      return (
        <motion.img
          src={profile.avatarUrl}
          alt={displayName}
          className={`${avatarSize} rounded-full object-cover border-2 border-white/20 ${extra}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
    }
    return null;
  };
  const sectionOrder = normalizeSectionOrder((profile as any).sectionOrder);
  const orderOf = (key: SectionKey) => sectionOrder.indexOf(key);
  // Custom section titles (fallback to default label)
  const sectionTitles = ((profile as any).sectionTitles || {}) as Record<string, string>;
  const titleFor = (key: SectionKey, fallback: string) => {
    const t = sectionTitles[key];
    return t && t.trim() ? t : fallback;
  };

  // ── Grid helper: clamp columns for mobile/desktop ──
  const gridCols = (itemCount: number) =>
    `repeat(${Math.min(layoutColumns, itemCount)}, minmax(0, 1fr))`;

  return (
    <div
      className="min-h-[100dvh] text-white overflow-hidden"
      style={{ ...cssVars, backgroundColor: customTheme.background } as React.CSSProperties}
    >
      <main className="w-full bg-black">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO — full-bleed image + name overlay + social icons
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <motion.section
          className="relative w-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {profile.headerImageUrl && heroLayout === "below" ? (
            /* ── Komi style: banner on top, name/logo + icons BELOW the banner ── */
            <div>
              <div className={`relative w-full ${bannerSizeClass} overflow-hidden`}>
                <img
                  src={profile.headerImageUrl}
                  alt={displayName}
                  className={`w-full h-full ${bannerFitClass}`}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>

              <div
                className={`w-full bg-black px-6 sm:px-12 py-8 sm:py-10 flex flex-col gap-4 ${
                  heroAlign === "left"
                    ? "items-start text-left"
                    : heroAlign === "right"
                      ? "items-end text-right"
                      : "items-center text-center"
                }`}
              >
                {showHeroLogo && renderHeroBrand(
                  "w-24 h-24 sm:w-28 sm:h-28 shadow-2xl",
                  "max-h-24 sm:max-h-32 lg:max-h-40",
                )}
                {showHeroName && (
                  <motion.h1
                    className="text-[2.5rem] sm:text-[4rem] lg:text-[5.5rem] font-black uppercase text-white leading-[0.9]"
                    style={{ letterSpacing: "-0.03em", fontFamily: nameFont }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    {displayName}
                  </motion.h1>
                )}
                {showUsername && (
                  <motion.p
                    className="text-sm sm:text-base text-white/60 font-medium tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    @{profile.username}
                  </motion.p>
                )}
                {hasSocials && (
                  <motion.div
                    className={`flex ${socialJustify} gap-3 sm:gap-4 w-full mt-2`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {headerSocialLinks.map((link: any, i: number) => (
                      <motion.a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.label}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white transition-all duration-200"
                        style={{ backgroundColor: customTheme.primary }}
                        whileHover={{ scale: 1.15, opacity: 0.85 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                      >
                        {link.icon}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          ) : profile.headerImageUrl ? (
            <div className={`relative w-full ${bannerSizeClass} overflow-hidden`}>
              <img
                src={profile.headerImageUrl}
                alt={displayName}
                className={`w-full h-full ${bannerFitClass}`}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

              {/* Name / Logo */}
              <div className={`absolute inset-0 flex flex-col z-10 px-6 sm:px-12 gap-4 ${heroAlignClasses}`}>
                {showHeroLogo && renderHeroBrand(
                  "w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 border-white/30 shadow-2xl",
                  "max-h-28 sm:max-h-40 lg:max-h-52 drop-shadow-2xl",
                )}
                {showHeroName && (
                  <motion.h1
                    className="text-[3rem] sm:text-[4.5rem] lg:text-[6.5rem] xl:text-[7.5rem] font-black uppercase text-white text-center leading-[0.9] drop-shadow-2xl"
                    style={{ letterSpacing: "-0.03em", fontFamily: nameFont }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                  >
                    {displayName}
                  </motion.h1>
                )}
                {/* Username — positioned a bit lower, below the name/logo */}
                {showUsername && (
                  <motion.p
                    className="mt-2 sm:mt-4 text-sm sm:text-base text-white/70 font-medium tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                  >
                    @{profile.username}
                  </motion.p>
                )}
              </div>

              {/* Social icons */}
              {hasSocials && (
                <motion.div
                  className={`absolute ${socialIsTop ? "top-5 sm:top-8" : "bottom-5 sm:bottom-8"} left-0 right-0 flex ${socialJustify} gap-3 sm:gap-4 z-20 px-6 sm:px-12`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {headerSocialLinks.map((link: any, i: number) => (
                    <motion.a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.label}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white transition-all duration-200"
                      style={{ backgroundColor: customTheme.primary }}
                      whileHover={{ scale: 1.15, opacity: 0.85 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                    >
                      {link.icon}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            /* Fallback — no header image */
            <div className={`relative w-full py-20 sm:py-32 lg:py-40 flex flex-col gap-6 bg-black px-6 sm:px-12 ${heroAlign === "left" ? "items-start text-left" : heroAlign === "right" ? "items-end text-right" : "items-center text-center"}`}>
              {heroDisplay !== "name" && (heroLogoUrl || profile.avatarUrl) && renderHeroBrand(
                "w-28 h-28 sm:w-36 sm:h-36",
                "max-h-28 sm:max-h-40 lg:max-h-52",
              )}
              {showHeroName && (
                <motion.h1
                  className="text-[2.5rem] sm:text-[4rem] lg:text-[5.5rem] font-black uppercase text-white text-center leading-[0.9] px-4"
                  style={{ letterSpacing: "-0.03em", fontFamily: nameFont }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {displayName}
                </motion.h1>
              )}
              {/* Username — a bit lower */}
              {showUsername && (
                <motion.p
                  className="-mt-2 text-sm sm:text-base text-white/60 font-medium tracking-wide"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  @{profile.username}
                </motion.p>
              )}
              {hasSocials && (
                <motion.div
                  className={`flex ${socialJustify} gap-3 sm:gap-4 w-full`}
                  style={{ order: socialIsTop ? -1 : 1 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {headerSocialLinks.map((link: any, i: number) => (
                    <motion.a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.label}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white transition-all duration-200"
                      style={{ backgroundColor: customTheme.primary }}
                      whileHover={{ scale: 1.15, opacity: 0.85 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                    >
                      {link.icon}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </motion.section>

        {/* ━━━━━ ORDERABLE SECTIONS (CSS order follows profile.sectionOrder) ━━━━━ */}
        <div className="flex flex-col w-full">

        {/* ━━━ BIO ━━━ */}
        <div style={{ order: orderOf("bio") }}>
        <BioSection
          displayName={displayName}
          bio={profile.bio ?? undefined}
          theme={customTheme}
          title={titleFor("bio", "Sobre")}
        />
        </div>

        {/* ━━━ VIDEO ━━━ */}
        <div style={{ order: orderOf("video") }}>
        {(profile as any).videoUrl && (
          <Section>
            <SectionTitle>{titleFor("video", "Destaque")}</SectionTitle>
            <VideoSection videoUrl={(profile as any).videoUrl} theme={customTheme} />
          </Section>
        )}
        </div>

        {/* ━━━ GALLERY — columns follow layoutColumns ━━━ */}
        <div style={{ order: orderOf("gallery") }}>
        {photos && photos.length > 0 && (
          <Section id="gallery">
            <SectionTitle>{titleFor("gallery", "Galeria")}</SectionTitle>
            <GallerySection
              photos={(photos as any) || []}
              username={username}
              theme={customTheme}
              layoutColumns={layoutColumns}
              onSeeAll={() => (window.location.href = `/?user=${username}&photos=true`)}
            />
          </Section>
        )}
        </div>

        {/* ━━━ EVENTS — columns follow layoutColumns ━━━ */}
        <div style={{ order: orderOf("events") }}>
        {events && events.length > 0 && (
          <Section id="events">
            <SectionTitle>{titleFor("events", "Próximos Eventos")}</SectionTitle>
            <div
              className="grid gap-4 sm:gap-5"
              style={{ gridTemplateColumns: gridCols(events.length) }}
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300"
                  style={{ backgroundColor: `${customTheme.secondary}08` }}
                  viewport={{ once: true }}
                >
                  {event.imageUrl && (
                    <div className="relative w-full h-44 sm:h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {event.eventDate && <EventDateBadge dateStr={event.eventDate} theme={customTheme} />}
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-lg uppercase tracking-tight mb-3 line-clamp-2">
                      {event.title}
                    </h3>
                    {event.eventDate && (
                      <div className="flex items-start gap-3 mb-2">
                        <CalendarDays
                          size={15}
                          style={{ color: customTheme.secondary }}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm text-white/70 font-light">
                          {new Date(event.eventDate).toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                    {(event.street || event.city || event.state) && (
                      <div className="flex items-start gap-3 mb-3">
                        <MapPin
                          size={15}
                          style={{ color: customTheme.secondary }}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm text-white/70 font-light">
                          {[event.street, event.city && `${event.city}${event.state ? ` - ${event.state}` : ""}`].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm text-white/50 font-light mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    {event.ticketUrl && (
                      <motion.a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold px-4 py-2.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: customTheme.secondary,
                          color: "#000",
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink size={13} />
                        Comprar Ingressos
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}
        </div>

        {/* ━━━ LINKS — columns follow layoutColumns ━━━ */}
        <div style={{ order: orderOf("links") }}>
        {regularLinks.length > 0 && (
          <Section id="links">
            <SectionTitle>{titleFor("links", "Links")}</SectionTitle>
            <motion.div
              className="grid gap-3 sm:gap-4"
              style={{ gridTemplateColumns: gridCols(regularLinks.length) }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
            >
              {regularLinks.map((link) => {
                const platform = getPlatform(link.icon ?? null);
                return (
                  <motion.button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.url)}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                    }}
                    className="p-5 sm:p-6 border border-white/10 rounded-xl hover:border-white/30 hover:bg-white/5 transition-all duration-300 text-left group"
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-white/10 group-hover:bg-white/15 transition-all flex-shrink-0">
                        <platform.Icon
                          size={22}
                          className="text-white/80 group-hover:text-white transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-xs sm:text-sm text-white/50 mt-1 line-clamp-1">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </Section>
        )}
        </div>

        {/* ━━━ MÚSICA (Spotify + SoundCloud) ━━━ */}
        <div style={{ order: orderOf("spotify") }}>
        {embedLinks.length > 0 && (
          <Section id="playlists">
            <SectionTitle>{titleFor("spotify", "Playlists")}</SectionTitle>
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: gridCols(embedLinks.length) }}
            >
              {embedLinks.map((link, index) => {
                const embed = toMusicEmbedUrl(link.url);
                if (!embed) return null;
                const isSC = embed.provider === "soundcloud";
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    {link.title && link.title !== "Spotify" && link.title !== "SoundCloud" && (
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-3">
                        {link.title}
                      </p>
                    )}
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <iframe
                        src={embed.src}
                        width="100%"
                        height={isSC ? 166 : 152}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="border-0"
                        style={{ borderRadius: 0 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Section>
        )}
        </div>

        {/* ━━━ CONTACT ━━━ */}
        <div style={{ order: orderOf("contact") }}>
        <ContactSection
          contact={{
            whatsapp: (profile as any).whatsappNumber,
            email: (profile as any).email,
            instagram: (profile as any).instagramHandle,
          }}
          theme={customTheme}
          displayName={profile.displayName || profile.username}
          title={titleFor("contact", "Contato")}
          onSubmit={async (formData) => {
            try {
              await customFetch(`/api/contact-messages`, {
                method: "POST",
                body: JSON.stringify({
                  profileId: profile.id,
                  senderName: formData.name,
                  senderEmail: formData.email,
                  message: formData.message,
                }),
              });
            } catch (error) {
              console.error("Error sending message:", error);
              throw new Error(
                error instanceof Error
                  ? error.message
                  : "Falha ao enviar mensagem. Verifique sua conexão e tente novamente."
              );
            }
          }}
        />
        </div>

        </div>
        {/* ━━━━━ END ORDERABLE SECTIONS ━━━━━ */}

        {/* ━━━ FOOTER ━━━ */}
        <motion.footer
          className="w-full py-12 sm:py-16 border-t border-white/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6">
            {/* Patrocinadores / Parceiros */}
            {Array.isArray((profile as any).sponsors) && (profile as any).sponsors.length > 0 && (
              <div className="pb-8 mb-2 border-b border-white/10">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/40 mb-6">
                  Apoio &amp; Parceiros
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                  {((profile as any).sponsors as Array<{ imageUrl: string; name?: string; url?: string }>).map((sp, i) => {
                    const img = (
                      <img
                        src={sp.imageUrl}
                        alt={sp.name || `Parceiro ${i + 1}`}
                        title={sp.name || undefined}
                        className="h-10 sm:h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                        loading="lazy"
                      />
                    );
                    return sp.url ? (
                      <a key={i} href={sp.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        {img}
                      </a>
                    ) : (
                      <div key={i} className="shrink-0">{img}</div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Texto customizado do footer */}
            {(profile as any).footerText && (
              <p className="text-sm text-white/60 font-light max-w-2xl mx-auto whitespace-pre-line">
                {(profile as any).footerText}
              </p>
            )}

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                Crie seu hub profissional
              </p>
              <motion.a
                href="/"
                className="inline-block px-8 py-3 border border-white/30 rounded-lg hover:border-white/60 hover:bg-white/5 transition-all duration-300 text-xs uppercase tracking-wider font-bold"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Começar Agora
              </motion.a>
            </div>
            <nav className="flex items-center justify-center gap-6 text-xs text-white/40 pt-4 border-t border-white/5">
              <a href="/" className="hover:text-white/70 transition-colors pt-4">Início</a>
              <a href="/" className="hover:text-white/70 transition-colors pt-4">Privacidade</a>
              <a href="/" className="hover:text-white/70 transition-colors pt-4">Termos</a>
            </nav>
            <p className="text-xs text-white/30 font-light">
              © {new Date().getFullYear()} hubvoid
            </p>
          </div>
        </motion.footer>
      </main>

      {/* Botão flutuante de voltar ao topo */}
      <BackToTop color={customTheme.primary} />
    </div>
  );
}
