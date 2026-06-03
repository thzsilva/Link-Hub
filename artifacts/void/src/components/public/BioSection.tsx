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
  /** Lado da foto no desktop */
  imageSide?: "left" | "right";
}

export function BioSection({
  displayName,
  bio,
  theme,
  title = "Sobre",
  imageUrl,
  imageSide = "left",
}: BioSectionProps) {
  if (!bio) {
    return null;
  }

  const hasImage = !!imageUrl;

  // Foto
  const photo = hasImage && (
    <motion.div
      className="relative w-full max-w-md mx-auto md:mx-0"
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <img
          src={imageUrl!}
          alt={displayName}
          className="w-full h-full object-cover aspect-[3/4]"
          loading="lazy"
        />
        {/* realce sutil na cor do tema, vindo de baixo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${theme.primary}33, transparent 45%)` }}
        />
      </div>
      {/* moldura/acento decorativo */}
      <div
        className="absolute -bottom-3 -right-3 w-24 h-24 rounded-2xl -z-10 hidden sm:block"
        style={{ backgroundColor: theme.primary, opacity: 0.25 }}
      />
    </motion.div>
  );

  // Texto
  const text = (
    <motion.div
      className="space-y-5 sm:space-y-6"
      initial={{ opacity: 0, x: imageSide === "left" ? 24 : -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: 0.1 }}
    >
      {/* rótulo + acento */}
      <div className="flex items-center gap-3">
        <span className="h-px w-8" style={{ backgroundColor: theme.primary }} />
        <span className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-white/60">
          {title}
        </span>
      </div>

      {/* nome do artista */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-[0.95]">
        {displayName}
      </h2>

      {/* bio */}
      <p className="text-base sm:text-lg lg:text-xl text-white/75 leading-relaxed font-light whitespace-pre-line">
        {bio}
      </p>
    </motion.div>
  );

  return (
    <motion.section
      className="w-full py-20 sm:py-28 lg:py-32 border-b border-white/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${hasImage ? "max-w-6xl" : "max-w-3xl"}`}>
        {hasImage ? (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-16 items-center">
            {imageSide === "left" ? (
              <>
                {photo}
                {text}
              </>
            ) : (
              <>
                {/* No mobile a foto vem primeiro; no desktop fica à direita */}
                <div className="md:order-2">{photo}</div>
                <div className="md:order-1">{text}</div>
              </>
            )}
          </div>
        ) : (
          text
        )}
      </div>
    </motion.section>
  );
}
