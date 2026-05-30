import { motion } from "framer-motion";

interface HeroSectionProps {
  avatarUrl?: string;
  displayName: string;
  username: string;
  bio?: string;
  headerImageUrl?: string;
  theme: {
    primary: string;
    secondary: string;
    background: string;
  };
  onWatchVideo?: () => void;
  hasVideo?: boolean;
}

export function HeroSection({
  avatarUrl,
  displayName,
  username,
  bio,
  headerImageUrl,
  theme,
  onWatchVideo,
  hasVideo = false,
}: HeroSectionProps) {
  return (
    <>
      {/* Header com imagem de capa */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden -mx-6 sm:-mx-8 md:-mx-12 mb-0">
        {headerImageUrl ? (
          <>
            <img
              src={headerImageUrl}
              alt="Capa do perfil"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
          </>
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme.primary}40 0%, ${theme.secondary}40 100%)`,
            }}
          />
        )}
      </div>

      {/* Hero content */}
      <motion.div
        className="flex flex-col items-center text-center -mt-20 sm:-mt-24 md:-mt-32 relative z-20 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Avatar com efeito de brilho */}
        {avatarUrl && (
          <motion.div
            className="relative mb-6 sm:mb-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
          >
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-75 animate-pulse"
              style={{ backgroundColor: theme.primary }}
            />
            <motion.img
              src={avatarUrl}
              alt={displayName || username}
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 shadow-2xl"
              style={{ borderColor: theme.primary }}
              crossOrigin="anonymous"
              loading="lazy"
              whileHover={{ scale: 1.05 }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                  img.src = `${avatarUrl}?t=${Date.now()}`;
                } else if (
                  img.src.includes("supabase") &&
                  !img.src.includes("proxy-image") &&
                  avatarUrl
                ) {
                  img.src = `/api/proxy-image?url=${encodeURIComponent(avatarUrl)}`;
                } else {
                  img.style.display = "none";
                }
              }}
            />
          </motion.div>
        )}

        {/* Nome com tipografia premium */}
        <motion.h1
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2 sm:mb-3 leading-tight max-w-2xl"
          style={{ color: theme.primary }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {displayName || username}
        </motion.h1>

        {/* Username */}
        <motion.p
          className="text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          @{username}
        </motion.p>

        {/* Bio */}
        {bio && (
          <motion.p
            className="text-base sm:text-lg md:text-xl text-white/70 font-light max-w-2xl leading-relaxed px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {bio}
          </motion.p>
        )}

        {/* CTAs - Video e Explore */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {hasVideo && onWatchVideo && (
            <motion.button
              onClick={onWatchVideo}
              className="px-6 sm:px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all"
              style={{
                backgroundColor: theme.primary,
                color: "#fff",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎥 Assistir Vídeo
            </motion.button>
          )}

          {/* Quick links para navegação */}
          <motion.a
            href="#links"
            className="px-6 sm:px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm border-2 transition-all"
            style={{
              borderColor: theme.secondary,
              color: theme.secondary,
            }}
            whileHover={{ scale: 1.05, backgroundColor: `${theme.secondary}10` }}
            whileTap={{ scale: 0.95 }}
          >
            Explorar Links
          </motion.a>
        </motion.div>
      </motion.div>
    </>
  );
}
