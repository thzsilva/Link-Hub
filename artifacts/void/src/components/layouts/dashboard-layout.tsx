import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { data: me } = useGetMe();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const shareUrl = me?.username ? `${window.location.origin}/?user=${me.username}` : null;

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast({ title: "Link copiado!", description: shareUrl });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const navLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/links", label: "Links" },
    { href: "/dashboard/photos", label: "Photos" },
    { href: "/dashboard/events", label: "Events" },
    { href: "/dashboard/customization", label: "Customização" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/assinatura", label: "Assinatura" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col bg-gradient-to-b from-white/5 to-transparent">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="hubvoid" className="w-8 h-8 rounded-lg" />
            <h2 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">hubvoid</h2>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Creator Studio</p>
        </motion.div>

        <nav className="flex-1 space-y-1">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={link.href}
                className={`block px-4 py-2 text-sm uppercase tracking-widest font-bold transition-all rounded-lg ${
                  location === link.href
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Share section */}
        <motion.div
          className="mt-6 pt-6 border-t border-border space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground px-1">Compartilhar</p>
          {shareUrl ? (
            <>
              <motion.div
                className="px-3 py-2 border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] font-mono text-xs text-muted-foreground truncate rounded-lg hover:border-white/20 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                {shareUrl.replace(/^https?:\/\//, "")}
              </motion.div>
              <div className="flex gap-2">
                <motion.a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg uppercase tracking-widest text-xs font-bold gap-1 hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors"
                  >
                    <ExternalLink size={12} />
                    Ver
                  </Button>
                </motion.a>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="w-full rounded-lg uppercase tracking-widest text-xs font-bold gap-1 hover:bg-green-500/20 hover:border-green-500/50 transition-colors"
                  >
                    {copied ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copied ? "OK!" : "Copiar"}
                  </Button>
                </motion.div>
              </div>
            </>
          ) : (
            <div className="h-8 bg-white/5 animate-pulse rounded-lg" />
          )}
        </motion.div>

        <motion.div
          className="mt-4 pt-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10 uppercase tracking-widest text-xs font-bold rounded-lg transition-colors"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
          >
            Log Out
          </Button>
        </motion.div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <SubscriptionBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
