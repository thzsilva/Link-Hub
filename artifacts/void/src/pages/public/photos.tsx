import { useState } from "react";
import { motion } from "framer-motion";
import { useGetPublicPhotos } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicPhotos() {
  const { username } = useParams<{ username: string }>();
  const { data: photos, isLoading } = useGetPublicPhotos(username || "");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm uppercase tracking-widest text-white/50">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center px-4">
        <p className="mb-8 text-lg text-white/70">Nenhuma foto nesta galeria.</p>
        <Link href={`/profile/${username}`}>
          <Button className="rounded-lg uppercase tracking-widest text-xs font-bold px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Perfil
          </Button>
        </Link>
      </div>
    );
  }

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
    <div className="min-h-[100dvh] bg-black text-white">
      {/* Header Premium */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href={`/profile/${username}`}>
            <motion.button
              className="flex items-center gap-2 uppercase tracking-widest text-xs font-bold text-white/60 hover:text-white transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </motion.button>
          </Link>
          <motion.h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-tighter"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Galeria
          </motion.h1>
          <div className="w-16 text-right text-xs text-white/50">
            {photos.length} fotos
          </div>
        </div>
      </header>

      {/* Galeria com Mason Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <motion.div
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              className="break-inside-avoid mb-4 cursor-zoom-in relative group rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedPhotoIndex(index)}
              whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.3)" }}
            >
              <div className="relative overflow-hidden bg-white/5">
                <img
                  src={photo.url}
                  alt={photo.caption || "Foto da galeria"}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {photo.caption && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                  initial={{ y: 10, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs font-light text-white/80">{photo.caption}</p>
                </motion.div>
              )}

              {/* Badge de índice */}
              <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-xs font-bold px-2.5 py-1.5 rounded-lg text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {index + 1} / {photos.length}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={(open) => !open && setSelectedPhotoIndex(null)}>
        <DialogContent
          className="max-w-[100vw] w-screen h-[100dvh] max-h-[100dvh] p-0 bg-black/95 border-none m-0 rounded-none flex items-center justify-center focus:outline-none"
          onKeyDown={handleKeyDown}
        >
          {selectedPhotoIndex !== null && (
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              onClick={() => setSelectedPhotoIndex(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Fechar Botão */}
              <motion.button
                onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(null); }}
                className="absolute top-8 right-8 text-white/40 hover:text-white z-50 transition-colors p-2 hover:bg-white/5 rounded-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={32} strokeWidth={1.5} />
              </motion.button>

              {/* Botão Anterior */}
              <motion.button
                onClick={handlePrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white z-50 p-3 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.1, left: 24 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={40} strokeWidth={1.5} />
              </motion.button>

              {/* Imagem */}
              <motion.img
                src={photos[selectedPhotoIndex].url}
                alt={photos[selectedPhotoIndex].caption || ""}
                className="max-w-[90vw] max-h-[90vh] object-contain select-none"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                key={selectedPhotoIndex}
              />

              {/* Legenda */}
              {photos[selectedPhotoIndex].caption && (
                <motion.div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/80 font-light text-sm bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 max-w-md"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {photos[selectedPhotoIndex].caption}
                </motion.div>
              )}

              {/* Contador */}
              <div className="absolute top-8 left-8 text-white/40 text-sm font-light tracking-widest uppercase">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>

              {/* Botão Próximo */}
              <motion.button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white z-50 p-3 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.1, right: 24 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={40} strokeWidth={1.5} />
              </motion.button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
