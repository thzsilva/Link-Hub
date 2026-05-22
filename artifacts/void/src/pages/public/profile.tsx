import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useGetPublicProfile, useTrackEvent } from "@workspace/api-client-react";
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
      fetch(`/api/events/public/${username}`)
        .then((r) => (r.ok ? r.json() : []))
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
    <div className="min-h-[100dvh] text-white" style={{ ...cssVars, backgroundColor: customTheme.background } as React.CSSProperties}>
      {/* Header com capa */}
      {profile.headerImageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img src={profile.headerImageUrl} alt="Header" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Perfil */}
        <motion.div
          className={`flex flex-col items-center text-center mb-12 relative z-20 ${profile.headerImageUrl ? '-mt-16' : 'mt-8'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {profile.avatarUrl && (
            <motion.img
              src={profile.avatarUrl}
              alt={profile.displayName || profile.username}
              className="w-32 h-32 rounded-full object-cover mb-6 border-4 shadow-lg"
              style={{ borderColor: customTheme.primary }}
              crossOrigin="anonymous"
              loading="lazy"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onError={(e) => {
                console.error("Erro ao carregar avatar:", profile.avatarUrl);
                const img = e.target as HTMLImageElement;
                if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                  img.src = `${profile.avatarUrl}?t=${Date.now()}`;
                } else if (img.src.includes("supabase") && !img.src.includes("proxy-image")) {
                  img.src = `/api/proxy-image?url=${encodeURIComponent(profile.avatarUrl)}`;
                } else {
                  img.style.display = "none";
                }
              }}
            />
          )}
          <motion.h1
            className="text-4xl font-black tracking-tighter uppercase mb-2"
            style={{ color: customTheme.primary }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {profile.displayName || profile.username}
          </motion.h1>
          <motion.p
            className="text-muted-foreground font-mono mb-4 max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
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
                      description={link.description}
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

        {/* Events */}
        {events && events.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 text-left border-b-2 pb-2" style={{ borderColor: customTheme.accent }}>
              Eventos
            </h2>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(layoutColumns, events.length)}, minmax(0, 1fr))`,
              }}
            >
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg overflow-hidden border-2 text-left transition-all hover:shadow-lg"
                  style={{ borderColor: `${customTheme.accent}50` }}
                >
                  {/* Event image */}
                  {event.imageUrl && (
                    <div className="w-full h-40 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4" style={{ backgroundColor: `${customTheme.secondary}10` }}>
                    <h3 className="font-bold text-lg uppercase tracking-tight mb-3">{event.title}</h3>
                    {event.eventDate && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-2">
                        <CalendarDays size={14} />
                        {new Date(event.eventDate).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-3">
                        <MapPin size={14} />
                        {event.location}
                      </div>
                    )}
                    {event.description && (
                      <p className="text-muted-foreground text-sm font-mono mb-4">{event.description}</p>
                    )}
                    {event.ticketUrl && (
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: customTheme.accent,
                          color: customTheme.background === "#000000" ? "#000" : "#fff",
                        }}
                      >
                        <ExternalLink size={12} />
                        Ingressos
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {photos && photos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 text-left border-b-2 pb-2" style={{ borderColor: customTheme.accent }}>
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.slice(0, 6).map((photo) => (
                <div key={photo.id} className="aspect-square bg-white/5 relative overflow-hidden group rounded-lg">
                  <img
                    src={photo.url}
                    alt={photo.caption || "Gallery photo"}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.display = "none";
                    }}
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity text-left">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {photos.length > 6 && (
              <Link
                href={`/${username}/photos`}
                className="mt-4 w-full flex items-center justify-center gap-2 border-2 py-3 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-white transition-colors rounded-lg"
                style={{ borderColor: `${customTheme.accent}50` }}
              >
                Ver todas as {photos.length} fotos
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}

        {/* Social Links */}
        {socialLinks && socialLinks.length > 0 && (
          <div className="flex gap-4 justify-center flex-wrap my-8">
            {socialLinks.map((s) => {
              const platform = getPlatform(s.platform ?? null);
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: `${customTheme.accent}20`,
                    color: customTheme.primary,
                  }}
                  title={platform.name}
                >
                  <platform.Icon size={16} />
                  <span className="text-xs font-bold uppercase">{platform.name}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="py-12 text-center border-t-2" style={{ borderColor: `${customTheme.accent}20` }}>
          <p className="text-xs text-white/30 font-mono tracking-widest">
            Built with ✨ by VOID
          </p>
        </div>
      </main>
    </div>
  );
}
