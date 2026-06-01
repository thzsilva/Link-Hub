import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGetPublicProfile, useTrackEvent, customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, ExternalLink, Instagram, Music, Youtube, Mail, MessageCircle } from "lucide-react";
import { getPlatform, toSpotifyEmbedUrl } from "@/lib/platforms";
import { getTheme, getCSSVariables } from "@/lib/themes";
import { LinkButton } from "@/components/LinkButton";
import { HeaderNav } from "@/components/public/HeaderNav";
import { BioSection } from "@/components/public/BioSection";
import { DividerSection } from "@/components/public/DividerSection";
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

  return (
    <div className="min-h-[100dvh] text-white overflow-hidden" style={{ ...cssVars, backgroundColor: customTheme.background } as React.CSSProperties}>
      {/* Sticky Header Navigation */}
      <HeaderNav
        avatarUrl={profile.avatarUrl ?? undefined}
        displayName={profile.displayName || profile.username || "User"}
        username={profile.username || "user"}
        socialLinks={headerSocialLinks as any}
        theme={customTheme}
      />

      <main className="w-full bg-black">
        {/* Hero Image/Divider */}
        <DividerSection
          imageUrl={profile.headerImageUrl ?? undefined}
          title={profile.displayName || profile.username || "Profile"}
          subtitle={profile.bio ? profile.bio.substring(0, 100) + "..." : undefined}
        />

        {/* Bio & Highlights Section */}
        <BioSection
          displayName={profile.displayName || profile.username || "User"}
          bio={profile.bio ?? undefined}
          highlights={
            events && events.length > 0
              ? (
                  [
                    `${events.length} upcoming events`,
                    `${photos?.length || 0} featured photos`,
                    regularLinks.length > 0 ? `${regularLinks.length} ways to connect` : undefined,
                  ]
                    .filter((x): x is string => Boolean(x))
                    .slice(0, 3)
                )
              : undefined
          }
          theme={customTheme}
        />

        {/* Video Divider & Section */}
        {(profile as any).videoUrl && (
          <>
            <DividerSection
              title="Featured"
              subtitle="Watch my story"
            />
            <VideoSection
              videoUrl={(profile as any).videoUrl}
              theme={customTheme}
            />
          </>
        )}

        {/* Gallery Section */}
        {photos && photos.length > 0 && (
          <motion.section
            className="w-full py-16 sm:py-24 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter mb-12">
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
            className="w-full py-16 sm:py-24 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter mb-12">
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
            </motion.section>
          </>
        )}

        {/* Links Section */}
        {regularLinks.length > 0 && (
          <motion.section
            className="w-full py-16 sm:py-24 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter mb-12">
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
                      className="p-6 border border-white/10 rounded-lg hover:border-white/30 hover:bg-white/5 transition-all duration-300 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
                          <platform.Icon size={24} className="text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-sm text-white/50 mt-1 line-clamp-2">
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
            className="w-full py-16 sm:py-24 border-b border-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter mb-12">
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

        {/* Contact Divider & Section */}
        <DividerSection
          title="Let's Connect"
          subtitle="Get in touch"
        />
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
              console.error('Erro ao enviar mensagem:', error);
              throw error;
            }
          }}
        />

        {/* Footer Section */}
        <motion.footer
          className="w-full py-12 sm:py-16 border-t border-white/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              {/* Main CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <p className="text-sm uppercase tracking-widest text-white/60">
                  Create your professional hub
                </p>
                <motion.a
                  href="/"
                  className="inline-block px-8 py-3 border border-white/30 rounded-lg hover:border-white/60 hover:bg-white/5 transition-all duration-300 text-sm uppercase tracking-widest font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Now
                </motion.a>
              </motion.div>

              {/* Footer Links */}
              <nav className="flex items-center justify-center gap-6 text-xs text-white/40 pt-4">
                <a href="/" className="hover:text-white/70 transition-colors">Home</a>
                <span>•</span>
                <a href="/" className="hover:text-white/70 transition-colors">Privacy</a>
                <span>•</span>
                <a href="/" className="hover:text-white/70 transition-colors">Terms</a>
              </nav>

              {/* Copyright */}
              <p className="text-xs text-white/30 font-light">
                © {new Date().getFullYear()} hubvoid
              </p>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
