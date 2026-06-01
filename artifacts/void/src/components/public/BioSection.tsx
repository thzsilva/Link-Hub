import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
      className="w-full py-16 sm:py-24 relative overflow-hidden border-b border-white/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: theme.primary }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: theme.secondary }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Main Bio */}
          {bio && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: theme.secondary }}
                    initial={{ height: 0 }}
                    whileInView={{ height: 32 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                  <h2
                    className="text-2xl sm:text-3xl font-black uppercase tracking-tighter"
                    style={{ color: theme.primary }}
                  >
                    About
                  </h2>
                </div>
              </div>
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
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: theme.secondary }}
                    initial={{ height: 0 }}
                    whileInView={{ height: 32 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                  <h3
                    className="text-2xl sm:text-3xl font-black uppercase tracking-tighter"
                    style={{ color: theme.primary }}
                  >
                    Highlights
                  </h3>
                </div>
              </div>
              <ul className="space-y-4">
                {highlights.map((highlight, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-start gap-4 p-3 rounded-lg backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300"
                    style={{
                      backgroundColor: `${theme.secondary}08`,
                    }}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 + idx * 0.08 }}
                    whileHover={{
                      backgroundColor: `${theme.secondary}15`,
                      x: 8,
                    }}
                  >
                    <span
                      className="text-xl mt-0.5 flex-shrink-0"
                      style={{ color: theme.secondary }}
                    >
                      <Star size={20} fill="currentColor" />
                    </span>
                    <span className="text-white/80 text-sm sm:text-base font-light">
                      {highlight}
                    </span>
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
