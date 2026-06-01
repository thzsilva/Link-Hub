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
      className="w-full sticky top-0 z-40 border-b border-white/5"
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%), radial-gradient(circle at 0% 0%, ${theme.primary}10 0%, transparent 50%)`
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 backdrop-blur-xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Avatar */}
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            {avatarUrl ? (
              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                />
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="relative w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  style={{ borderColor: theme.primary }}
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white/80"
                style={{ backgroundColor: theme.primary }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1
                className="font-bold text-lg uppercase tracking-tighter"
                style={{ color: theme.primary }}
              >
                {displayName}
              </h1>
              <p className="text-xs text-white/40 font-light">@{username}</p>
            </div>
          </motion.div>

          {/* Social Navigation */}
          <motion.nav
            className="flex items-center gap-2 sm:gap-3"
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
                className="relative p-2.5 rounded-lg transition-all duration-300 group"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
                  border: `1px solid ${theme.primary}30`,
                }}
                whileHover={{
                  scale: 1.15,
                  backgroundColor: `${theme.primary}30`,
                  borderColor: `${theme.primary}60`,
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}40, ${theme.secondary}40)` }}
                />
                <span style={{ color: theme.primary }} className="relative">
                  {link.icon}
                </span>
              </motion.a>
            ))}
          </motion.nav>
        </div>
      </div>
    </motion.header>
  );
}
