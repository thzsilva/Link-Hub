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
      className="w-full py-12 sm:py-16 border-b border-white/10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Main Bio */}
          {bio && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold uppercase tracking-tight"
                style={{ color: theme.primary }}
              >
                About
              </h2>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                {bio}
              </p>
            </motion.div>
          )}

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <h3
                className="text-2xl sm:text-3xl font-bold uppercase tracking-tight"
                style={{ color: theme.primary }}
              >
                Highlights
              </h3>
              <ul className="space-y-3">
                {highlights.map((highlight, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-start gap-3 text-white/70"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                  >
                    <span
                      className="text-xl mt-1 flex-shrink-0"
                      style={{ color: theme.secondary }}
                    >
                      ✓
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
