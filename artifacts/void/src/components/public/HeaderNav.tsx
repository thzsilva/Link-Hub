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
      className="w-full sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo/Branding */}
          <motion.div
            className="flex items-center gap-3 flex-1"
            whileHover={{ scale: 1.02 }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-white/20"
                loading="lazy"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-semibold text-sm uppercase tracking-wider text-white truncate">
                {displayName}
              </h1>
              <p className="text-xs text-white/40">@{username}</p>
            </div>
          </motion.div>

          {/* Social Navigation */}
          <motion.nav
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {socialLinks.slice(0, 5).map((link) => (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                className="p-2 text-white/70 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
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
