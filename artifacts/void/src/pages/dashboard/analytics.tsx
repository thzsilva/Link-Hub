import { useGetMyLinks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, LinkIcon, Eye } from "lucide-react";

export default function DashboardAnalytics() {
  const { data: links, isLoading } = useGetMyLinks();

  if (isLoading) return <div className="text-muted-foreground animate-pulse">Carregando analytics...</div>;

  const totalClicks = (links || []).reduce((sum, link) => sum + (link.clickCount || 0), 0);
  const topLinks = [...(links || [])].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Analytics</h1>
        <p className="text-muted-foreground mt-2 font-mono text-sm">Veja como seus links estão performando</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-widest font-bold">Total de Cliques</CardTitle>
              <BarChart3 size={20} className="text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{totalClicks}</p>
            <p className="text-xs text-muted-foreground mt-2">Todos os links</p>
          </CardContent>
        </Card>

        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-widest font-bold">Links Ativos</CardTitle>
              <LinkIcon size={20} className="text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{(links || []).filter((l) => l.isVisible).length}</p>
            <p className="text-xs text-muted-foreground mt-2">Visíveis</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Top Links
        </h2>

        {!links || links.length === 0 ? (
          <Card className="rounded-none bg-black border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum link ainda 🚀
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(links || [])
              .filter((l) => l.clickCount > 0)
              .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
              .slice(0, 5)
              .map((link, idx) => (
                <Card key={link.id} className="rounded-none bg-black border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-black text-lg text-white/50">#{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{link.title}</p>
                          <p className="text-xs text-muted-foreground truncate font-mono">{link.url}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-green-400">{link.clickCount || 0}</p>
                        <p className="text-xs text-muted-foreground">cliques</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      <Card className="rounded-none bg-white/5 border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-mono">
            💡 Os cliques são rastreados automaticamente quando alguém clica em seus links.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
