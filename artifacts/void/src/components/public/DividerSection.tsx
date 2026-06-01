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
      transition={{ duration: 0.5 }}
    >
      {imageUrl ? (
        <div className="relative w-full aspect-video sm:aspect-auto sm:h-96 lg:h-[500px] overflow-hidden group">
          {/* Image with subtle zoom on hover */}
          <img
            src={imageUrl}
            alt={title || "Divider"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Subtle dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Text overlay if present */}
          {(title || subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-12 sm:pb-16 lg:pb-24 text-center z-10">
              {title && (
                <motion.h2
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white drop-shadow-xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {title}
                </motion.h2>
              )}
              {subtitle && (
                <motion.p
                  className="text-base sm:text-lg text-white/70 mt-4 drop-shadow-lg max-w-2xl font-light tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
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
        <div className="py-16 sm:py-20 text-center">
          {title && (
            <motion.h2
              className="text-3xl sm:text-4xl font-bold uppercase tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              className="text-white/60 mt-3 font-light"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}
    </motion.section>
  );
}
