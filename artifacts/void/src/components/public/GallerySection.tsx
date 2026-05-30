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
  onSeeAll?: () => void;
}

const DISPLAY_LIMIT = 6; // Show 6 photos in gallery preview

export function GallerySection({
  photos,
  username,
  theme,
  onSeeAll,
}: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  const displayPhotos = photos.slice(0, DISPLAY_LIMIT);
  const hasMore = photos.length > DISPLAY_LIMIT;

  const handlePhotoClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <motion.section
      className="mb-16 sm:mb-20"
      id="gallery"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 sm:mb-8 flex items-end justify-between">
        <div>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase"
            style={{ color: theme.primary }}
          >
            Galeria
          </h2>
          <motion.div
            className="h-1 mt-2"
            style={{ backgroundColor: theme.secondary }}
            initial={{ width: 0 }}
            whileInView={{ width: "40px" }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          />
        </div>
      </div>

      {/* Grid de fotos */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
        {displayPhotos.map((photo, index) => (
          <motion.button
            key={photo.id}
            className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handlePhotoClick(index)}
          >
            <img
              src={photo.url}
              alt={photo.caption || `Foto ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />

            {/* Overlay on hover */}
            <div
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              style={{
                backgroundColor: `${theme.primary}40`,
              }}
            >
              <div className="text-white text-center">
                <div className="text-sm sm:text-base font-bold">Visualizar</div>
                {photo.caption && (
                  <div className="text-xs text-white/70 mt-1 px-2 line-clamp-2">
                    {photo.caption}
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Ver galeria completa */}
      {hasMore && onSeeAll && (
        <motion.button
          onClick={onSeeAll}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm border-2 flex items-center justify-center gap-2 transition-all"
          style={{
            borderColor: theme.secondary,
            color: theme.secondary,
          }}
          whileHover={{ scale: 1.05, backgroundColor: `${theme.secondary}10` }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          Ver Galeria Completa ({photos.length})
          <ChevronRight size={18} />
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
    </motion.section>
  );
}
