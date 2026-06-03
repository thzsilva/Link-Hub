import { motion } from "framer-motion";

interface BioSectionProps {
  displayName: string;
  bio?: string;
  theme: {
    primary: string;
    secondary: string;
  };
  title?: string;
}

export function BioSection({
  displayName,
  bio,
  theme,
  title = "Sobre",
}: BioSectionProps) {
  if (!bio) {
    return null;
  }

  return (
    <motion.section
      className="w-full py-20 sm:py-32 border-b border-white/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="space-y-6 sm:space-y-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">
              {title}
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed font-light max-w-3xl">
              {bio}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
