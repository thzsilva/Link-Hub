import { useGetDashboardStats, useGetMe, customFetch } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, Check, TrendingUp, Wallet, CalendarClock } from "lucide-react";
import { useState } from "react";

type MonetizationEvent = {
  id: string;
  title: string;
  date: string;
  price: number;
  status: "upcoming" | "completed";
};

type Monetization = {
  totalRevenue: number;
  upcomingRevenue: number;
  completedRevenue: number;
  events: MonetizationEvent[];
  trend: { date: string; revenue: number }[];
};

function formatBRL(value: number): string {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardHome() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: me, isLoading: meLoading } = useGetMe();
  const { data: money, isLoading: moneyLoading } = useQuery<Monetization>({
    queryKey: ["/api/dashboard/monetization"],
    queryFn: async () => await customFetch<Monetization>("/api/dashboard/monetization"),
  });
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

      {/* ━━━ Contabilidade / Monetização ━━━ */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-green-400" />
          <h2 className="text-lg font-black uppercase tracking-tighter">Contabilidade dos Eventos</h2>
        </div>

        {moneyLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : !money || money.events.length === 0 ? (
          <Card className="rounded-none bg-black border-border">
            <CardContent className="p-6 text-sm text-muted-foreground font-mono">
              Nenhum valor registrado ainda. Adicione um valor (R$) aos seus eventos na aba{" "}
              <span className="text-white">Events</span> para acompanhar quanto já entrou e quanto está por vir.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total */}
              <Card className="rounded-none bg-black border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-green-400" /> Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-green-400">{formatBRL(money.totalRevenue)}</div>
                </CardContent>
              </Card>

              {/* Já recebido (completed) */}
              <Card className="rounded-none bg-black border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Check size={12} /> Já recebido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{formatBRL(money.completedRevenue)}</div>
                </CardContent>
              </Card>

              {/* A receber (upcoming) */}
              <Card className="rounded-none bg-black border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <CalendarClock size={12} /> A receber
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{formatBRL(money.upcomingRevenue)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown por evento */}
            <Card className="rounded-none bg-black border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                  Detalhamento por evento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {money.events.map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between px-6 py-3 gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {ev.date ? new Date(ev.date).toLocaleDateString("pt-BR") : "—"}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border flex-shrink-0 ${
                          ev.status === "completed"
                            ? "border-green-500/40 text-green-400"
                            : "border-white/20 text-muted-foreground"
                        }`}
                      >
                        {ev.status === "completed" ? "Recebido" : "A receber"}
                      </span>
                      <span className="font-mono text-sm font-bold flex-shrink-0 w-28 text-right">
                        {formatBRL(ev.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
