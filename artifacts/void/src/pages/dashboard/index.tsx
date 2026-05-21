import { useGetDashboardStats, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardHome() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: me, isLoading: meLoading } = useGetMe();

  if (statsLoading || meLoading) {
    return <div className="text-muted-foreground animate-pulse font-mono">Loading signal...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Overview</h1>
          <p className="text-muted-foreground mt-2 font-mono">Welcome back, {me?.username}.</p>
        </div>
        <Link href={`/${me?.username}`}>
          <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs font-bold">
            View Live Profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.totalPageViews || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.totalClicks || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Active Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.totalLinks || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none bg-black border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Gallery Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats?.totalPhotos || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
