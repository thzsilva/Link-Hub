import { useQuery } from "@tanstack/react-query";
import { useGetPublicProfile, useTrackEvent } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, ExternalLink, ChevronRight } from "lucide-react";
import { getPlatform, toSpotifyEmbedUrl } from "@/lib/platforms";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEventDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="h-48 w-full bg-white/5 animate-pulse" />
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center">
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

export default function PublicProfile() {
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

  const accentColor = profile.accentColor || "#ffffff";

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
    <div className="min-h-[100dvh] bg-black text-white relative">
      {/* Header image */}
      {profile.headerImageUrl && (
        <div
          className="h-48 w-full opacity-50"
          style={{
            backgroundImage: `url(${profile.headerImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <main className="max-w-2xl mx-auto px-6 py-12 relative z-10 flex flex-col items-center text-center">
        {/* Avatar */}
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName || profile.username}
            className="w-24 h-24 rounded-full object-cover mb-6 border-2 border-white/20"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/10 mb-6 border-2 border-white/20 flex items-center justify-center text-2xl font-black uppercase">
            {(profile.displayName || profile.username).charAt(0)}
          </div>
        )}

        {/* Name + Bio */}
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          {profile.displayName || profile.username}
        </h1>
        {profile.bio && (
          <p className="text-muted-foreground font-mono mb-8 max-w-md">{profile.bio}</p>
        )}

        {/* Regular Links */}
        {regularLinks.length > 0 && (
          <div className="w-full space-y-3 mb-8">
            {regularLinks.map((link) => {
              const platform = getPlatform(link.icon ?? null);
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id, link.url)}
                  className="w-full flex items-center gap-3 border-2 text-white hover:bg-white hover:text-black transition-all p-4 font-bold tracking-widest uppercase text-sm"
                  style={{ borderColor: accentColor }}
                >
                  {/* Platform icon */}
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded"
                    style={{ background: platform.bgColor, color: platform.color }}
                  >
                    <platform.Icon size={16} />
                  </span>
                  <span className="flex-1 text-center pr-8">{link.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Spotify Embeds */}
        {spotifyLinks.length > 0 && (
          <div className="w-full space-y-4 mb-12">
            {spotifyLinks.map((link) => {
              const embedUrl = toSpotifyEmbedUrl(link.url);
              if (!embedUrl) return null;
              return (
                <div key={link.id} className="w-full">
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
          <div className="w-full mb-12">
            <h2 className="text-xl font-black tracking-tighter uppercase mb-6 text-left border-b border-white/20 pb-2">
              Eventos
            </h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-white/20 text-left hover:border-white/50 transition-colors overflow-hidden"
                >
                  {/* Event image */}
                  {event.imageUrl && (
                    <div className="w-full h-40 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).parentElement!.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg uppercase tracking-tight mb-2">{event.title}</h3>
                    {event.eventDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-mono mb-1">
                        <CalendarDays size={13} />
                        {formatEventDate(event.eventDate)}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-mono mb-2">
                        <MapPin size={13} />
                        {event.location}
                      </div>
                    )}
                    {event.description && (
                      <p className="text-muted-foreground text-sm font-mono mb-3">
                        {event.description}
                      </p>
                    )}
                    {event.ticketUrl && (
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold px-3 py-2 border text-white hover:bg-white hover:text-black transition-all"
                        style={{ borderColor: accentColor }}
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
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tighter uppercase border-b border-white/20 pb-2 flex-1">
                Gallery
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square bg-white/5 relative overflow-hidden group cursor-pointer"
                >
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
                className="mt-4 w-full flex items-center justify-center gap-2 border border-white/20 py-3 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-white hover:border-white/50 transition-colors"
              >
                Ver todas as {photos.length} fotos
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}

        {/* Social Links */}
        {socialLinks && socialLinks.length > 0 && (
          <div className="flex gap-4 mt-4 flex-wrap justify-center">
            {socialLinks.map((s) => {
              const platform = getPlatform(s.platform ?? null);
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                  title={platform.name}
                >
                  <platform.Icon size={16} />
                  <span className="sr-only">{s.platform}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p className="mt-12 text-xs text-white/20 font-mono tracking-widest">
          linkhub.io
        </p>
      </main>
    </div>
  );
}
