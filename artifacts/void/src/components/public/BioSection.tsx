import { motion } from "framer-motion";

interface BioSectionProps {
  displayName: string;
  bio?: string;
  highlights?: string[];
  theme: {
    primary: string;
    secondary: string;
  };
}

export function BioSection({
  displayName,
  bio,
  highlights,
  theme,
}: BioSectionProps) {
  if (!bio && (!highlights || highlights.length === 0)) {
    return null;
  }

  return (
    <motion.section
      className="w-full py-16 sm:py-24 border-b border-white/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Main Bio */}
          {bio && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-lg uppercase tracking-widest font-semibold text-white/80">
                About
              </h2>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light">
                {bio}
              </p>
            </motion.div>
          )}

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <h3 className="text-lg uppercase tracking-widest font-semibold text-white/80">
                Highlights
              </h3>
              <ul className="space-y-4">
                {highlights.map((highlight, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-start gap-3 text-white/70 font-light"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                  >
                    <span
                      className="text-lg mt-0.5 flex-shrink-0 font-bold"
                      style={{ color: theme.secondary }}
                    >
                      •
                    </span>
                    <span>{highlight}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
