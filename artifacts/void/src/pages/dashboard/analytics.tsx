import { useGetAnalytics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardAnalytics() {
  const { data, isLoading } = useGetAnalytics();

  if (isLoading) return <div className="text-muted-foreground font-mono animate-pulse">Computing data...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Analytics</h1>
        <p className="text-muted-foreground mt-2 font-mono">Monitor your impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{data?.totalPageViews || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{data?.totalClicks || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none bg-black border-border">
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Views over time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {(data?.dailyViews && data.dailyViews.length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '0' }}
                  />
                  <Bar dataKey="count" fill="#fff" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono">
                No data available yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {data?.topLinks && data.topLinks.length > 0 && (
        <Card className="rounded-none bg-black border-border">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topLinks.map((link, i) => (
                <div key={link.linkId} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground font-mono text-sm">{i + 1}</span>
                    <span className="font-bold">{link.title}</span>
                  </div>
                  <span className="font-mono text-sm">{link.clickCount} clicks</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
