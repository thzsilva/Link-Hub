import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  isOpen: boolean;
  image: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  caption?: string;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function Lightbox({
  isOpen,
  image,
  onClose,
  onNext,
  onPrev,
  caption,
  hasNext = false,
  hasPrev = false,
}: LightboxProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Conteúdo do lightbox */}
          <motion.div
            className="relative w-full h-full flex flex-col items-center justify-center p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagem com zoom */}
            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              <motion.img
                src={image}
                alt="Preview"
                className="max-w-full max-h-full object-contain cursor-zoom-in select-none"
                style={{ zoom }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => setZoom(zoom === 1 ? 1.5 : 1)}
              />
            </div>

            {/* Botões de navegação */}
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              {hasPrev && onPrev && (
                <motion.button
                  className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                >
                  <ChevronLeft size={28} />
                </motion.button>
              )}

              {hasNext && onNext && (
                <motion.button
                  className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-auto"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                >
                  <ChevronRight size={28} />
                </motion.button>
              )}
            </div>

            {/* Botão de fechar */}
            <motion.button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              <X size={28} />
            </motion.button>

            {/* Caption */}
            {caption && (
              <motion.div
                className="absolute bottom-4 left-4 right-4 bg-black/80 px-4 py-2 rounded-lg text-white text-sm max-w-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {caption}
              </motion.div>
            )}

            {/* Indicador de zoom */}
            <div className="absolute bottom-4 left-4 text-xs text-white/50">
              Clique para {zoom === 1 ? "ampliar" : "reduzir"} | ESC para fechar
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
