import { useState } from "react";
import { useGetPublicPhotos } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicPhotos() {
  const { username } = useParams<{ username: string }>();
  const { data: photos, isLoading } = useGetPublicPhotos(username || "");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (isLoading) return <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center font-mono animate-pulse">Loading gallery...</div>;

  if (!photos || photos.length === 0) return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center font-mono">
      <p className="mb-4">No photos in this gallery.</p>
      <Link href={`/${username}`}>
        <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs font-bold">Return to Profile</Button>
      </Link>
    </div>
  );

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white p-6 pb-24">
      <header className="mb-8 flex items-center justify-between">
        <Link href={`/${username}`}>
          <button className="flex items-center text-muted-foreground hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </Link>
        <h1 className="text-xl font-black uppercase tracking-tighter">Gallery</h1>
      </header>

      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 max-w-7xl mx-auto">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="break-inside-avoid mb-4 cursor-zoom-in relative group"
            onClick={() => setSelectedPhotoIndex(index)}
          >
            <img 
              src={photo.url} 
              alt={photo.caption || "Gallery photo"} 
              className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity font-mono text-sm">
                {photo.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={selectedPhotoIndex !== null} onOpenChange={(open) => !open && setSelectedPhotoIndex(null)}>
        <DialogContent 
          className="max-w-[100vw] w-screen h-[100dvh] max-h-[100dvh] p-0 bg-black/95 border-none m-0 rounded-none flex items-center justify-center focus:outline-none"
          onKeyDown={handleKeyDown}
        >
          {selectedPhotoIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center" onClick={() => setSelectedPhotoIndex(null)}>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(null); }}
                className="absolute top-6 right-6 text-white/50 hover:text-white z-50 transition-colors"
              >
                <X size={32} />
              </button>
              
              <button 
                onClick={handlePrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-50 p-4 transition-colors"
              >
                <ChevronLeft size={48} strokeWidth={1} />
              </button>
              
              <img 
                src={photos[selectedPhotoIndex].url} 
                alt={photos[selectedPhotoIndex].caption || ""} 
                className="max-w-[90vw] max-h-[90vh] object-contain select-none"
                onClick={(e) => e.stopPropagation()}
              />
              
              {photos[selectedPhotoIndex].caption && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white/80 font-mono text-sm bg-black/50 px-4 py-2 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                  {photos[selectedPhotoIndex].caption}
                </div>
              )}

              <button 
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-50 p-4 transition-colors"
              >
                <ChevronRight size={48} strokeWidth={1} />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
