import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  /** Cor de fundo do botão (ex: tema do perfil) */
  color?: string;
  /** Quantos px rolar antes de aparecer */
  threshold?: number;
}

/**
 * Botão flutuante "voltar ao topo".
 * Aparece após rolar `threshold` px e rola suavemente até o topo.
 */
export function BackToTop({ color = "#ffffff", threshold = 500 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
          className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl border border-white/20 backdrop-blur-md"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
