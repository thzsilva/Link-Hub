import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGetPublicProfile, useTrackEvent, customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, ExternalLink, Instagram, Music, Youtube, Mail, MessageCircle } from "lucide-react";
import { getPlatform, toSpotifyEmbedUrl } from "@/lib/platforms";
import { getTheme, getCSSVariables } from "@/lib/themes";
import { LinkButton } from "@/components/LinkButton";
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
      <div className="h-48 w-full bg-white/5 animate-pulse" />
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        <Skeleton className="w-24 h-24 rounded-full mb-6" />
        <Skeleton className="h-8 w-52 mb-3" />
        <Skeleton className="h-4 w-72 mb-2" />
        <Skeleton className="h-4 w-56 mb-10" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-14 mb-4" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function PublicProfileNew() {
  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get('user') || '';
  const { data, isLoading } = useGetPublicProfile(username);
  const trackEvent = useTrackEvent();

  // Public events — separate query
  const { data: events } = useQuery<any[]>({
    queryKey: [`/api/events/public/${username}`],
    queryFn: () =>
      customFetch<any[]>(`/api/events/public/${username}`, { method: 'GET' })
        .then((data) => data || [])
        .catch(() => []),
    enabled: !!username,
    staleTime: 60_000,
  });

  if (isLoading) return <ProfileSkeleton />;

  if (!data?.profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="font-mono text-muted-foreground text-lg">Perfil não encontrado.</p>
        <a href="/" className="text-xs uppercase tracking-widest underline underline-offset-4 text-muted-foreground hover:text-white">
          Criar o meu perfil →
        </a>
      </div>
    );
  }

  const { profile, links, socialLinks, photos: profilePhotos } = data;
  const photos = profilePhotos;

  // Obtém tema customizado
  const theme = getTheme(profile.themeId);
  const customTheme = {
    ...theme,
    primary: profile.customPrimaryColor || theme.primary,
    secondary: profile.customSecondaryColor || theme.secondary,
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

  const regularLinks = links?.filter((l) => l.isVisible && l.cardType !== "spotify") ?? [];
  const spotifyLinks = links?.filter((l) => l.isVisible && l.cardType === "spotify") ?? [];

  // Build social links for header navigation
  const headerSocialLinks = socialLinks?.map((s) => {
    const platform = getPlatform(s.platform ?? null);
    let icon = <Music size={20} />;

    if (s.platform === "instagram") icon = <Instagram size={20} />;
    else if (s.platform === "youtube") icon = <Youtube size={20} />;
    else if (s.platform === "spotify") icon = <Music size={20} />;

    return {
      platform: s.platform || "link",
      url: s.url,
      icon,
      label: platform.name,
    };
  }) ?? [];

  // Add contact methods to header
  if ((profile as any).whatsappNumber) {
    headerSocialLinks.push({
      platform: "whatsapp",
      url: `https://wa.me/${(profile as any).whatsappNumber}`,
      icon: <MessageCircle size={20} />,
      label: "WhatsApp",
    });
  }

  if ((profile as any).email) {
    headerSocialLinks.push({
      platform: "email",
      url: `mailto:${(profile as any).email}`,
      icon: <Mail size={20} />,
      label: "Email",
    });
  }

  const displayName = profile.displayName || profile.username || "User";
  const hasSocials = headerSocialLinks.length >= 1;

  return (
    <div className="min-h-[100dvh] text-white overflow-hidden" style={{ ...cssVars, backgroundColor: customTheme.background } as React.CSSProperties}>

      <main className="w-full bg-black">
        {/* ── HERO ── image + name overlay + social icons */}
        <motion.section
          className="relative w-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Image */}
          {profile.headerImageUrl ? (
            <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/8] max-h-[75vh] overflow-hidden">
              <img
                src={profile.headerImageUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

              {/* Name overlay on the image */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.h1
                  className="text-[3.5rem] sm:text-[5rem] lg:text-[7rem] font-black uppercase text-white text-center leading-none px-4"
                  style={{ letterSpacing: "-0.03em" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  {displayName}
                </motion.h1>
              </div>

              {/* Social icons over the bottom of the image — theme colored */}
              {hasSocials && (
                <motion.div
                  className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center gap-4 z-10"
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
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white transition-all duration-200"
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
            /* Fallback: no header image — show name + avatar */
            <div className="relative w-full py-24 sm:py-36 flex flex-col items-center justify-center gap-6 bg-black">
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
                className="text-[3rem] sm:text-[4.5rem] lg:text-[6rem] font-black uppercase text-white text-center leading-none px-4"
                style={{ letterSpacing: "-0.03em" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {displayName}
              </motion.h1>
              {hasSocials && (
                <motion.div
                  className="flex justify-center gap-4"
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
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white transition-all duration-200"
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

        {/* Bio Section — appears only once */}
        <BioSection
          displayName={displayName}
          bio={profile.bio ?? undefined}
          theme={customTheme}
        />

        {/* Video Section */}
        {(profile as any).videoUrl && (
          <VideoSection
            videoUrl={(profile as any).videoUrl}
            theme={customTheme}
          />
        )}

        {/* Gallery Section */}
        {photos && photos.length > 0 && (
          <motion.section
            className="w-full py-20 sm:py-32 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter mb-12 sm:mb-16">
                Gallery
              </h2>
              <GallerySection
                photos={(photos as any) || []}
                username={username}
                theme={customTheme}
                onSeeAll={() => (window.location.href = `/?user=${username}&photos=true`)}
              />
            </div>
          </motion.section>
        )}

        {/* Events Section */}
        {events && events.length > 0 && (
          <motion.section
            className="w-full py-20 sm:py-32 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter mb-12 sm:mb-16">
                Upcoming Events
              </h2>
              <div>
                <div
                  className="grid gap-5"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(layoutColumns, events.length)}, minmax(0, 1fr))`,
                  }}
                >
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="group rounded-xl overflow-hidden border border-white/10 backdrop-blur-sm hover:border-white/30 transition-all duration-300"
                      style={{
                        backgroundColor: `${customTheme.secondary}08`,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
                      }}
                      viewport={{ once: true }}
                    >
                      {event.imageUrl && (
                        <div className="relative w-full h-48 overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}

                      <div className="p-5">
                        <h3 className="font-bold text-xl uppercase tracking-tight mb-4 line-clamp-2">
                          {event.title}
                        </h3>

                        {event.eventDate && (
                          <div className="flex items-start gap-3 mb-3">
                            <CalendarDays size={16} style={{ color: customTheme.secondary }} className="mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Data & Hora</p>
                              <p className="text-sm font-light">
                                {new Date(event.eventDate).toLocaleDateString("pt-BR", {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                        {event.location && (
                          <div className="flex items-start gap-3 mb-4">
                            <MapPin size={16} style={{ color: customTheme.secondary }} className="mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Local</p>
                              <p className="text-sm font-light">{event.location}</p>
                            </div>
                          </div>
                        )}

                        {event.description && (
                          <p className="text-sm text-white/60 font-light mb-4 line-clamp-2">{event.description}</p>
                        )}

                        {event.ticketUrl && (
                          <motion.a
                            href={event.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold px-4 py-3 rounded-lg transition-all"
                            style={{
                              backgroundColor: customTheme.secondary,
                              color: customTheme.background === "#000000" ? "#000" : "#fff",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ExternalLink size={14} />
                            Comprar Ingressos
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            </motion.section>
        )}

        {/* Links Section */}
        {regularLinks.length > 0 && (
          <motion.section
            className="w-full py-20 sm:py-32 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter mb-12 sm:mb-16">
                Links
              </h2>
              <motion.div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(layoutColumns, regularLinks.length)}, minmax(0, 1fr))`,
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {regularLinks.map((link) => {
                  const platform = getPlatform(link.icon ?? null);
                  return (
                    <motion.button
                      key={link.id}
                      onClick={() => handleLinkClick(link.id, link.url)}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                      }}
                      className="p-6 sm:p-7 border border-white/15 rounded-xl hover:border-white/40 hover:bg-white/8 transition-all duration-300 text-left group backdrop-blur-sm"
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-white/10 group-hover:bg-white/15 transition-all flex-shrink-0">
                          <platform.Icon size={24} className="text-white/80 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white group-hover:text-white transition-colors text-base">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-sm text-white/60 mt-2 line-clamp-2">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Spotify Embeds Section */}
        {spotifyLinks.length > 0 && (
          <motion.section
            className="w-full py-20 sm:py-32 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter mb-12 sm:mb-16">
                Playlists
              </h2>
              <div className="space-y-8">
                {spotifyLinks.map((link, index) => {
                  const embedUrl = toSpotifyEmbedUrl(link.url);
                  if (!embedUrl) return null;
                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {link.title && link.title !== "Spotify" && (
                        <p className="text-xs uppercase tracking-widest text-white/70 mb-4">
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
                          style={{ borderRadius: "0px" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* Contact Section */}
        <ContactSection
          contact={{
            whatsapp: (profile as any).whatsappNumber,
            email: (profile as any).email,
            instagram: (profile as any).instagramHandle,
          }}
          theme={customTheme}
          displayName={profile.displayName || profile.username}
          onSubmit={async (data) => {
            try {
              await customFetch(`/api/contact-messages`, {
                method: 'POST',
                body: JSON.stringify({
                  profileId: profile.id,
                  senderName: data.name,
                  senderEmail: data.email,
                  message: data.message,
                }),
              });
            } catch (error) {
              console.error('Error sending message:', error);
              throw new Error(
                error instanceof Error
                  ? error.message
                  : 'Failed to send message. Please check your connection and try again.'
              );
            }
          }}
        />

        {/* Footer Section */}
        <motion.footer
          className="w-full py-16 sm:py-24 border-t border-white/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              {/* Main CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/60 mb-4">
                    Create your professional hub
                  </p>
                  <motion.a
                    href="/"
                    className="inline-block px-10 py-4 border border-white/40 rounded-xl hover:border-white/70 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm uppercase tracking-wider font-bold"
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Now
                  </motion.a>
                </div>
              </motion.div>

              {/* Footer Links */}
              <nav className="flex items-center justify-center gap-8 text-xs text-white/50 pt-6 border-t border-white/5">
                <a href="/" className="hover:text-white/80 transition-colors mt-6">Home</a>
                <a href="/" className="hover:text-white/80 transition-colors mt-6">Privacy</a>
                <a href="/" className="hover:text-white/80 transition-colors mt-6">Terms</a>
              </nav>

              {/* Copyright */}
              <p className="text-xs text-white/40 font-light tracking-wide">
                © {new Date().getFullYear()} hubvoid • Crafted with precision
              </p>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
