import { motion } from "framer-motion";
import { Instagram, Music, Youtube, Mail, MessageCircle, Spotify } from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
  label: string;
}

interface HeroNameSectionProps {
  displayName: string;
  socialLinks: SocialLink[];
}

export function HeroNameSection({
  displayName,
  socialLinks,
}: HeroNameSectionProps) {
  // Mostrar ícones apenas se houver 3+ redes sociais
  const hasEnoughSocials = socialLinks.length >= 3;

  return (
    <motion.section
      className="w-full py-12 sm:py-16 border-b border-white/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-8 sm:space-y-10">
          {/* Large Display Name */}
          <motion.h1
            className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white"
            style={{
              letterSpacing: "-0.02em",
              fontFamily: "'Space Mono', 'Courier New', monospace",
              fontWeight: 700,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {displayName}
          </motion.h1>

          {/* Social Links - Only if 3+ socials */}
          {hasEnoughSocials && (
            <motion.div
              className="flex items-center justify-center gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white"
                  whileHover={{ scale: 1.15, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                >
                  {link.icon}
                </motion.a>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
