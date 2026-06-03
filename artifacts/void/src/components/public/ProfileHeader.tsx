import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export interface HeaderNavItem {
  label: string;
  anchor: string; // element id to scroll to
}

interface ProfileHeaderProps {
  displayName: string;
  logoUrl?: string | null;
  navItems: HeaderNavItem[];
  socials?: Array<{ platform: string; url: string; icon: React.ReactNode; label: string }>;
  theme: { primary: string; secondary: string };
}

const HEADER_OFFSET = 72;

export function ProfileHeader({
  displayName,
  logoUrl,
  navItems,
  socials = [],
  theme,
}: ProfileHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (anchor: string) => {
    setMenuOpen(false);
    const el = document.getElementById(anchor);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Marca (logo ou nome) */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 min-w-0 flex-shrink-0"
          aria-label="Topo"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={displayName} className="h-7 sm:h-8 w-auto object-contain max-w-[160px]" />
          ) : (
            <span className="font-black uppercase tracking-tight text-base sm:text-lg text-white truncate max-w-[160px]">
              {displayName}
            </span>
          )}
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <button
              key={item.anchor}
              onClick={() => scrollTo(item.anchor)}
              className="text-xs lg:text-sm uppercase tracking-widest font-semibold text-white/70 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Direita: sociais (desktop) + menu (mobile) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2">
            {socials.slice(0, 4).map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white border border-white/15 hover:border-white/40 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Botão menu mobile */}
          {navItems.length > 0 && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white"
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.anchor}
                  onClick={() => scrollTo(item.anchor)}
                  className="text-left py-3 text-sm uppercase tracking-widest font-semibold text-white/80 hover:text-white border-b border-white/5 last:border-0"
                >
                  {item.label}
                </button>
              ))}
              {socials.length > 0 && (
                <div className="flex items-center gap-3 pt-4">
                  {socials.slice(0, 5).map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
