import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbox } from "@/components/Lightbox";
import { ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface GallerySectionProps {
  photos: Photo[];
  username: string;
  theme: {
    primary: string;
    secondary: string;
  };
  layoutColumns?: number;
  onSeeAll?: () => void;
}

const DISPLAY_LIMIT = 9;

export function GallerySection({
  photos,
  username,
  theme,
  layoutColumns = 1,
  onSeeAll,
}: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const displayPhotos = photos.slice(0, DISPLAY_LIMIT);
  const hasMore = photos.length > DISPLAY_LIMIT;

  // Columns for the grid: respect user preference, with smart defaults
  // Mobile always 1 col, tablet 2 cols, desktop uses layoutColumns (capped at 4)
  const cols = Math.max(1, Math.min(layoutColumns, 4));

  const handlePhotoClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  const handlePrev = () => {
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  return (
    <>
      {/* Photo grid — respects layoutColumns on desktop */}
      <motion.div
        className="grid gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(cols, displayPhotos.length)}, minmax(0, 1fr))`,
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.05 },
          },
        }}
      >
        {displayPhotos.map((photo, index) => (
          <motion.button
            key={photo.id}
            className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
            }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            onClick={() => handlePhotoClick(index)}
          >
            <img
              src={photo.url}
              alt={photo.caption || `Foto ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-white text-center px-3">
                <div className="text-sm font-bold uppercase tracking-wider">Ver</div>
                {photo.caption && (
                  <div className="text-xs text-white/70 mt-1 line-clamp-2">{photo.caption}</div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* See all button */}
      {hasMore && onSeeAll && (
        <motion.button
          onClick={onSeeAll}
          className="mt-8 w-full sm:w-auto px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm border border-white/30 flex items-center justify-center gap-2 transition-all hover:bg-white/5 hover:border-white/50"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Ver Galeria Completa ({photos.length})
          <ChevronRight size={16} />
        </motion.button>
      )}

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        image={photos[selectedIndex]?.url}
        caption={photos[selectedIndex]?.caption}
        onClose={() => setLightboxOpen(false)}
        onNext={selectedIndex < photos.length - 1 ? handleNext : undefined}
        onPrev={selectedIndex > 0 ? handlePrev : undefined}
        hasNext={selectedIndex < photos.length - 1}
        hasPrev={selectedIndex > 0}
      />
    </>
  );
}
