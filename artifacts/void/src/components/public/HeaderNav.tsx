import { motion } from "framer-motion";
import { Instagram, Music, Youtube, Mail, MessageCircle } from "lucide-react";

interface SocialLink {
  platform: "instagram" | "spotify" | "soundcloud" | "youtube" | "email" | "whatsapp";
  url: string;
  icon: React.ReactNode;
  label: string;
}

interface HeaderNavProps {
  avatarUrl?: string;
  displayName: string;
  username: string;
  socialLinks: SocialLink[];
  theme: {
    primary: string;
    secondary: string;
  };
}

export function HeaderNav({
  avatarUrl,
  displayName,
  username,
  socialLinks,
  theme,
}: HeaderNavProps) {
  return (
    <motion.header
      className="w-full bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Avatar */}
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
          >
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover border-2"
                style={{ borderColor: theme.primary }}
                loading="lazy"
              />
            )}
            <div>
              <h1 className="font-bold text-lg uppercase tracking-tight">{displayName}</h1>
              <p className="text-xs text-white/50">@{username}</p>
            </div>
          </motion.div>

          {/* Social Navigation */}
          <motion.nav
            className="flex items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {socialLinks.map((link, idx) => (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                style={{
                  color: theme.primary,
                }}
              >
                {link.icon}
              </motion.a>
            ))}
          </motion.nav>
        </div>
      </div>
    </motion.header>
  );
}
