import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGetPublicProfile, useTrackEvent, customFetch } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, ExternalLink, ChevronRight } from "lucide-react";
import { getPlatform, toSpotifyEmbedUrl } from "@/lib/platforms";
import { getTheme, getCSSVariables } from "@/lib/themes";
import { LinkButton } from "@/components/LinkButton";
import { HeroSection } from "@/components/public/HeroSection";
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

  return (
    <div className="min-h-[100dvh] text-white overflow-hidden" style={{ ...cssVars, backgroundColor: customTheme.background } as React.CSSProperties}>
      {/* Header com capa premium */}
      <div className="relative h-64 w-full overflow-hidden">
        {profile.headerImageUrl ? (
          <>
            <img src={profile.headerImageUrl} alt="Capa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
          </>
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(135deg, ${customTheme.primary}40 0%, ${customTheme.secondary}40 100%)`
            }}
          />
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <HeroSection
          avatarUrl={profile.avatarUrl}
          displayName={profile.displayName || profile.username}
          username={profile.username}
          bio={profile.bio}
          headerImageUrl={profile.headerImageUrl}
          theme={customTheme}
          onWatchVideo={() => {
            const videoSection = document.getElementById('video-section');
            if (videoSection) {
              videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          hasVideo={!!(profile as any).videoUrl}
        />

        {/* Video Section */}
        <VideoSection
          videoUrl={(profile as any).videoUrl}
          theme={customTheme}
        />

        {/* Links regulares em grid */}
        {regularLinks.length > 0 && (
          <motion.div
            className="mb-16"
            id="links"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="grid gap-3 mb-8"
              style={{
                gridTemplateColumns: `repeat(${Math.min(layoutColumns, regularLinks.length)}, minmax(0, 1fr))`,
              }}
            >
              {regularLinks.map((link, index) => {
                const platform = getPlatform(link.icon ?? null);
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <LinkButton
                      icon={<platform.Icon size={20} />}
                      title={link.title}
                      description={link.description || undefined}
                      accentColor={customTheme.accent}
                      secondaryColor={customTheme.secondary}
                      backgroundColor={`${customTheme.secondary}20`}
                      onClick={() => handleLinkClick(link.id, link.url)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* Spotify Embeds */}
        {spotifyLinks.length > 0 && (
          <div className="space-y-4 mb-12">
            {spotifyLinks.map((link) => {
              const embedUrl = toSpotifyEmbedUrl(link.url);
              if (!embedUrl) return null;
              return (
                <div key={link.id}>
                  {link.title && link.title !== "Spotify" && (
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 text-left">
                      {link.title}
                    </p>
                  )}
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
              );
            })}
          </div>
        )}

        {/* Seção de Eventos */}
        {events && events.length > 0 && (
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h2
                className="text-3xl sm:text-4xl font-black tracking-tighter uppercase relative inline-block"
                style={{ color: customTheme.primary }}
              >
                Próximos Eventos
                <motion.div
                  className="h-1 absolute -bottom-3 left-0"
                  style={{ backgroundColor: customTheme.accent }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                />
              </h2>
            </div>

            <div
              className="grid gap-5 pt-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(layoutColumns, events.length)}, minmax(0, 1fr))`,
              }}
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group rounded-xl overflow-hidden border border-white/10 backdrop-blur-sm hover:border-white/30 transition-all duration-300"
                  style={{
                    backgroundColor: `${customTheme.secondary}08`,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {/* Imagem do evento */}
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
                        <CalendarDays size={16} style={{ color: customTheme.accent }} className="mt-1 flex-shrink-0" />
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
                        <MapPin size={16} style={{ color: customTheme.accent }} className="mt-1 flex-shrink-0" />
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
                          backgroundColor: customTheme.accent,
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
          </motion.div>
        )}

        {/* Gallery Section */}
        <GallerySection
          photos={photos || []}
          username={username}
          theme={customTheme}
          onSeeAll={() => window.location.href = `/?user=${username}&photos=true`}
        />

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
              console.error('Erro ao enviar mensagem:', error);
              throw error;
            }
          }}
        />

        {/* Links Sociais */}
        {socialLinks && socialLinks.length > 0 && (
          <motion.div
            className="flex gap-3 justify-center flex-wrap my-16 pb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {socialLinks.map((s, index) => {
              const platform = getPlatform(s.platform ?? null);
              return (
                <motion.a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all border border-white/10 hover:border-white/30"
                  style={{
                    backgroundColor: `${customTheme.accent}15`,
                  }}
                  title={platform.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, backgroundColor: `${customTheme.accent}25` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <platform.Icon size={18} style={{ color: customTheme.primary }} />
                  <span className="text-xs font-bold uppercase hidden sm:inline" style={{ color: customTheme.primary }}>
                    {platform.name}
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          className="py-12 text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-sm uppercase tracking-widest font-bold border-2 transition-all"
            style={{
              borderColor: customTheme.primary,
              color: customTheme.primary,
              backgroundColor: `${customTheme.primary}10`,
            }}
            whileHover={{
              backgroundColor: `${customTheme.primary}20`,
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink size={16} />
            Crie Seu Próprio Hub
          </motion.a>
        </motion.div>

        {/* Footer Premium */}
        <motion.div
          className="py-8 text-center border-t-2"
          style={{ borderColor: `${customTheme.accent}15` }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-white/40 font-light tracking-widest uppercase">
            Criado com <span style={{ color: customTheme.accent }}>✨</span> por hubvoid
          </p>
          <p className="text-xs text-white/30 font-light tracking-widest mt-2">
            © {new Date().getFullYear()} • Seu perfil profissional em um link
          </p>
        </motion.div>
      </main>
    </div>
  );
}
