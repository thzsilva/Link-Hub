import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGetPublicProfile, useTrackEvent, customFetch } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, ExternalLink, ChevronRight } from "lucide-react";
import { getPlatform, toSpotifyEmbedUrl } from "@/lib/platforms";
import { getTheme, getCSSVariables } from "@/lib/themes";
import { LinkButton } from "@/components/LinkButton";

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
  const { username } = useParams<{ username: string }>();
  const { data, isLoading } = useGetPublicProfile(username || "");
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
        {/* Perfil com efeito premium */}
        <motion.div
          className="flex flex-col items-center text-center mb-16 relative z-20 -mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Avatar com efeito de brilho */}
          {profile.avatarUrl && (
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-75 animate-pulse"
                style={{ backgroundColor: customTheme.primary }}
              />
              <motion.img
                src={profile.avatarUrl}
                alt={profile.displayName || profile.username}
                className="relative w-40 h-40 rounded-full object-cover border-4 shadow-2xl"
                style={{ borderColor: customTheme.primary }}
                crossOrigin="anonymous"
                loading="lazy"
                whileHover={{ scale: 1.05 }}
                onError={(e) => {
                  console.error("Erro ao carregar avatar:", profile.avatarUrl);
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                    img.src = `${profile.avatarUrl}?t=${Date.now()}`;
                  } else if (img.src.includes("supabase") && !img.src.includes("proxy-image") && profile.avatarUrl) {
                    img.src = `/api/proxy-image?url=${encodeURIComponent(profile.avatarUrl)}`;
                  } else {
                    img.style.display = "none";
                  }
                }}
              />
            </motion.div>
          )}

          {/* Nome e bio com tipografia premium */}
          <motion.h1
            className="text-5xl sm:text-6xl font-black tracking-tighter uppercase mb-3 leading-tight max-w-2xl"
            style={{ color: customTheme.primary }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {profile.displayName || profile.username}
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-white/70 font-light max-w-xl leading-relaxed px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {profile.bio}
          </motion.p>
        </motion.div>

        {/* Links regulares em grid */}
        {regularLinks.length > 0 && (
          <motion.div
            className="mb-12"
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

        {/* Galeria de Fotos */}
        {photos && photos.length > 0 && (
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
                Galeria
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {photos.slice(0, 6).map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square relative overflow-hidden group rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300"
                  style={{
                    backgroundColor: `${customTheme.secondary}08`,
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || "Foto da galeria"}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-3 text-xs font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left">
                      {photo.caption}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {photos.length > 6 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/profile/${username}/photos`}
                  className="w-full flex items-center justify-center gap-3 py-4 text-sm uppercase tracking-widest font-bold rounded-lg border border-white/10 hover:border-white/30 transition-all duration-300 group"
                  style={{
                    backgroundColor: `${customTheme.accent}10`,
                  }}
                >
                  <span>Ver todas as {photos.length} fotos</span>
                  <motion.div
                    className="flex items-center"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}

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

        {/* Footer Premium */}
        <motion.div
          className="py-12 text-center border-t-2"
          style={{ borderColor: `${customTheme.accent}15` }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-white/40 font-light tracking-widest uppercase">
            Criado com <span style={{ color: customTheme.accent }}>✨</span> por Link-Hub
          </p>
          <p className="text-xs text-white/30 font-light tracking-widest mt-2">
            © {new Date().getFullYear()} • Seu perfil profissional em um link
          </p>
        </motion.div>
      </main>
    </div>
  );
}
