import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { data: me } = useGetMe();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const shareUrl = me?.username ? `${window.location.origin}/${me.username}` : null;

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
    { href: "/dashboard/appearance", label: "Appearance" },
    { href: "/dashboard/analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tighter uppercase">VOID</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Creator Studio</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 text-sm uppercase tracking-widest font-bold transition-colors ${
                location === link.href
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Share section */}
        <div className="mt-6 pt-6 border-t border-border space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground px-1">Compartilhar</p>
          {shareUrl ? (
            <>
              <div className="px-2 py-1.5 border border-white/10 bg-white/5 font-mono text-xs text-muted-foreground truncate">
                {shareUrl.replace(/^https?:\/\//, "")}
              </div>
              <div className="flex gap-2">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-none uppercase tracking-widest text-xs font-bold gap-1"
                  >
                    <ExternalLink size={12} />
                    Ver
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-bold gap-1"
                >
                  {copied ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? "OK!" : "Copiar"}
                </Button>
              </div>
            </>
          ) : (
            <div className="h-8 bg-white/5 animate-pulse rounded-none" />
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 uppercase tracking-widest text-xs font-bold rounded-none"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
          >
            Log Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
