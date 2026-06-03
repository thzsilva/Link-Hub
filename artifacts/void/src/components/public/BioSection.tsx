import { motion } from "framer-motion";

interface BioSectionProps {
  displayName: string;
  bio?: string;
  theme: {
    primary: string;
    secondary: string;
  };
  title?: string;
  /** Foto do artista exibida ao lado da bio (estilo press kit) */
  imageUrl?: string | null;
}

export function BioSection({
  displayName,
  bio,
  theme,
  title = "Sobre",
  imageUrl,
}: BioSectionProps) {
  if (!bio) {
    return null;
  }

  const hasImage = !!imageUrl;

  return (
    <motion.section
      className="w-full py-20 sm:py-28 lg:py-32 border-b border-white/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-10 ${hasImage ? "max-w-6xl" : "max-w-3xl"}`}
      >
        <div
          className={
            hasImage
              ? "grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-center"
              : ""
          }
        >
          {/* Foto do artista */}
          {hasImage && (
            <motion.div
              className="relative w-full overflow-hidden rounded-2xl border border-white/10"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={imageUrl!}
                alt={displayName}
                className="w-full h-full object-cover aspect-[4/5] sm:aspect-[3/4]"
                loading="lazy"
              />
              {/* leve realce na cor do tema */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${theme.primary}22, transparent 40%)`,
                }}
              />
            </motion.div>
          )}

          {/* Bio */}
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, x: hasImage ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-white/60">
              {title}
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed font-light whitespace-pre-line">
              {bio}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
