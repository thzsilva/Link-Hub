import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGetPublicProfile, useTrackEvent, customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, ExternalLink, Instagram, Music, Youtube, Mail, MessageCircle } from "lucide-react";
import { getPlatform, toSpotifyEmbedUrl } from "@/lib/platforms";
import { getTheme, getCSSVariables } from "@/lib/themes";
import { BioSection } from "@/components/public/BioSection";
import { VideoSection } from "@/components/public/VideoSection";
import { GallerySection } from "@/components/public/GallerySection";
import { ContactSection } from "@/components/public/ContactSection";

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

  const regularLinks =
    links?.filter((l) => l.isVisible && l.cardType !== "spotify") ?? [];
  const spotifyLinks =
    links?.filter((l) => l.isVisible && l.cardType === "spotify") ?? [];

  // ── Social links for hero icons ──
  const headerSocialLinks =
    socialLinks?.map((s) => {
      const platform = getPlatform(s.platform ?? null);
      let icon = <Music size={18} />;
      if (s.platform === "instagram") icon = <Instagram size={18} />;
      else if (s.platform === "youtube") icon = <Youtube size={18} />;
      else if (s.platform === "spotify") icon = <Music size={18} />;
      return { platform: s.platform || "link", url: s.url, icon, label: platform.name };
    }) ?? [];

  if ((profile as any).whatsappNumber)
    headerSocialLinks.push({
      platform: "whatsapp",
      url: `https://wa.me/${(profile as any).whatsappNumber}`,
      icon: <MessageCircle size={18} />,
      label: "WhatsApp",
    });
  if ((profile as any).email)
    headerSocialLinks.push({
      platform: "email",
      url: `mailto:${(profile as any).email}`,
      icon: <Mail size={18} />,
      label: "Email",
    });

  const displayName = profile.displayName || profile.username || "User";
  const hasSocials = headerSocialLinks.length >= 1;

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
          {profile.headerImageUrl ? (
            <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/7] max-h-[70vh] overflow-hidden">
              <img
                src={profile.headerImageUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

              {/* Name */}
              <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                <motion.h1
                  className="text-[3rem] sm:text-[4.5rem] lg:text-[6.5rem] xl:text-[7.5rem] font-black uppercase text-white text-center leading-[0.9] drop-shadow-2xl"
                  style={{ letterSpacing: "-0.03em" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  {displayName}
                </motion.h1>
              </div>

              {/* Social icons */}
              {hasSocials && (
                <motion.div
                  className="absolute bottom-5 sm:bottom-8 left-0 right-0 flex justify-center gap-3 sm:gap-4 z-10"
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
            <div className="relative w-full py-20 sm:py-32 lg:py-40 flex flex-col items-center justify-center gap-6 bg-black">
              {profile.avatarUrl && (
                <motion.img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <motion.h1
                className="text-[2.5rem] sm:text-[4rem] lg:text-[5.5rem] font-black uppercase text-white text-center leading-[0.9] px-4"
                style={{ letterSpacing: "-0.03em" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {displayName}
              </motion.h1>
              {hasSocials && (
                <motion.div
                  className="flex justify-center gap-3 sm:gap-4"
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

        {/* ━━━ BIO ━━━ */}
        <BioSection
          displayName={displayName}
          bio={profile.bio ?? undefined}
          theme={customTheme}
        />

        {/* ━━━ VIDEO ━━━ */}
        {(profile as any).videoUrl && (
          <Section>
            <SectionTitle>Destaque</SectionTitle>
            <VideoSection videoUrl={(profile as any).videoUrl} theme={customTheme} />
          </Section>
        )}

        {/* ━━━ GALLERY — columns follow layoutColumns ━━━ */}
        {photos && photos.length > 0 && (
          <Section id="gallery">
            <SectionTitle>Galeria</SectionTitle>
            <GallerySection
              photos={(photos as any) || []}
              username={username}
              theme={customTheme}
              layoutColumns={layoutColumns}
              onSeeAll={() => (window.location.href = `/?user=${username}&photos=true`)}
            />
          </Section>
        )}

        {/* ━━━ EVENTS — columns follow layoutColumns ━━━ */}
        {events && events.length > 0 && (
          <Section id="events">
            <SectionTitle>Próximos Eventos</SectionTitle>
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
                    {event.location && (
                      <div className="flex items-start gap-3 mb-3">
                        <MapPin
                          size={15}
                          style={{ color: customTheme.secondary }}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm text-white/70 font-light">{event.location}</p>
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

        {/* ━━━ LINKS — columns follow layoutColumns ━━━ */}
        {regularLinks.length > 0 && (
          <Section id="links">
            <SectionTitle>Links</SectionTitle>
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

        {/* ━━━ SPOTIFY ━━━ */}
        {spotifyLinks.length > 0 && (
          <Section id="playlists">
            <SectionTitle>Playlists</SectionTitle>
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: gridCols(spotifyLinks.length) }}
            >
              {spotifyLinks.map((link, index) => {
                const embedUrl = toSpotifyEmbedUrl(link.url);
                if (!embedUrl) return null;
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    {link.title && link.title !== "Spotify" && (
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-3">
                        {link.title}
                      </p>
                    )}
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="152"
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

        {/* ━━━ CONTACT ━━━ */}
        <ContactSection
          contact={{
            whatsapp: (profile as any).whatsappNumber,
            email: (profile as any).email,
            instagram: (profile as any).instagramHandle,
          }}
          theme={customTheme}
          displayName={profile.displayName || profile.username}
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

        {/* ━━━ FOOTER ━━━ */}
        <motion.footer
          className="w-full py-12 sm:py-16 border-t border-white/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6">
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
    </div>
  );
}
