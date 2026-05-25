import { useGetDashboardStats, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function DashboardHome() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: me, isLoading: meLoading } = useGetMe();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = me?.username
    ? `${window.location.origin}/?user=${me.username}`
    : null;

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast({ title: "Link copiado!", description: shareUrl });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8">

      {/* Header — carrega independente */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Overview</h1>
          <div className="text-muted-foreground mt-2 font-mono text-sm">
            {meLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <>Bem-vindo, <span className="text-white">@{me?.username ?? "..."}</span></>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {meLoading ? (
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </>
          ) : shareUrl ? (
            <>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="rounded-none uppercase tracking-widest text-xs font-bold gap-2">
                  <ExternalLink size={13} />
                  Ver Perfil
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="rounded-none uppercase tracking-widest text-xs font-bold gap-2"
              >
                {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                {copied ? "Copiado!" : "Copiar Link"}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Cards de stats — carregam independente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(["Total Views", "Total Clicks", "Links Ativos", "Fotos"] as const).map((label, i) => {
          const values = [stats?.totalPageViews, stats?.totalClicks, stats?.totalLinks, stats?.totalPhotos];
          return (
            <Card key={label} className="rounded-none bg-black border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <div className="text-4xl font-black">{values[i] ?? 0}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Card de compartilhamento */}
      <Card className="rounded-none bg-black border border-white/30">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Seu link de compartilhamento
            </p>
            {meLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : shareUrl ? (
              <p className="font-mono text-sm text-white break-all">{shareUrl}</p>
            ) : (
              <p className="font-mono text-sm text-muted-foreground">
                Configure seu username em Appearance
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {shareUrl && (
              <>
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold gap-2">
                    <ExternalLink size={13} />
                    Abrir
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="rounded-none uppercase tracking-widest text-xs font-bold gap-2"
                >
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
