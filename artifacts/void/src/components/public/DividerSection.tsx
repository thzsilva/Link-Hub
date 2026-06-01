import { motion } from "framer-motion";

interface DividerSectionProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

export function DividerSection({
  imageUrl,
  title,
  subtitle,
}: DividerSectionProps) {
  if (!imageUrl && !title) {
    return null;
  }

  return (
    <motion.section
      className="w-full relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {imageUrl ? (
        <div className="relative h-72 sm:h-96 lg:h-[500px] w-full overflow-hidden group">
          {/* Image with enhanced effects */}
          <img
            src={imageUrl}
            alt={title || "Divider"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />

          {/* Multiple gradient overlays for premium effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Animated accent light */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl"
            animate={{
              y: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {(title || subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
              {title && (
                <motion.h2
                  className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {title}
                </motion.h2>
              )}
              {subtitle && (
                <motion.p
                  className="text-sm sm:text-lg text-white/70 mt-4 drop-shadow-lg max-w-2xl font-light"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 sm:py-20 lg:py-24 text-center relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

          <div className="relative z-10">
            {title && (
              <motion.h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  {title}
                </span>
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                className="text-white/60 text-lg font-light"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
