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
        <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden group">
          <img
            src={imageUrl}
            alt={title || "Divider"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

          {(title || subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              {title && (
                <motion.h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white drop-shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {title}
                </motion.h2>
              )}
              {subtitle && (
                <motion.p
                  className="text-white/80 mt-2 drop-shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 sm:py-16 text-center">
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
              className="text-white/60 mt-2"
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
