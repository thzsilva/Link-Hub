import { useGetPublicProfile, useGetPublicPhotos, useTrackEvent } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading } = useGetPublicProfile(username || "");
  const { data: photos } = useGetPublicPhotos(username || "");
  const trackEvent = useTrackEvent();

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono animate-pulse">Loading...</div>;
  
  if (!data?.profile) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">Profile not found.</div>;

  const { profile, links, socialLinks } = data;

  const handleLinkClick = (linkId: string, url: string) => {
    trackEvent.mutate({
      data: {
        profileId: profile.id,
        linkId,
        eventType: 'link_click',
        referrer: document.referrer
      }
    });
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white relative">
      {profile.headerImageUrl && (
        <div 
          className="h-48 w-full opacity-50"
          style={{ backgroundImage: `url(${profile.headerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      
      <main className="max-w-2xl mx-auto px-6 py-12 relative z-10 flex flex-col items-center text-center">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.displayName || profile.username} className="w-24 h-24 rounded-full object-cover mb-6 border-2 border-white/20" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/10 mb-6 border-2 border-white/20 flex items-center justify-center text-2xl font-black uppercase">
            {(profile.displayName || profile.username).charAt(0)}
          </div>
        )}
        
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">{profile.displayName || profile.username}</h1>
        {profile.bio && <p className="text-muted-foreground font-mono mb-8 max-w-md">{profile.bio}</p>}

        <div className="w-full space-y-4 mb-12">
          {links?.filter(l => l.isVisible).map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id, link.url)}
              className="w-full block bg-black border-2 border-white text-white hover:bg-white hover:text-black transition-all p-4 font-bold tracking-widest uppercase text-sm"
            >
              {link.title}
            </button>
          ))}
        </div>

        {photos && photos.length > 0 && (
          <div className="w-full">
            <h2 className="text-xl font-black tracking-tighter uppercase mb-6 text-left border-b border-white/20 pb-2">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo) => (
                <div key={photo.id} className="aspect-square bg-white/5 relative overflow-hidden">
                  <img src={photo.url} alt={photo.caption || "Gallery photo"} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {photos.length > 6 && (
              <Button variant="ghost" className="mt-6 uppercase tracking-widest text-xs font-bold w-full rounded-none border border-white/20">
                View All Photos
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
