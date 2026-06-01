import { motion } from "framer-motion";

interface BioSectionProps {
  displayName: string;
  bio?: string;
  theme: {
    primary: string;
    secondary: string;
  };
}

export function BioSection({
  displayName,
  bio,
  theme,
}: BioSectionProps) {
  if (!bio) {
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
          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light max-w-2xl">
            {bio}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
