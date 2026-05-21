import { useGetAdminArtists, useUpdateAdminArtist, getGetAdminArtistsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { data: artists, isLoading } = useGetAdminArtists();
  const updateArtist = useUpdateAdminArtist();
  const queryClient = useQueryClient();

  const toggleStatus = (id: string, currentStatus: boolean) => {
    updateArtist.mutate({
      id,
      data: { isActive: !currentStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminArtistsQueryKey() });
      }
    });
  };

  if (isLoading) return <div className="text-muted-foreground font-mono animate-pulse">Accessing mainframe...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-red-500">System Admin</h1>
        <p className="text-muted-foreground mt-2 font-mono">God mode enabled.</p>
      </div>

      <div className="space-y-4">
        {artists?.map((artist) => (
          <Card key={artist.id} className="rounded-none bg-black border-border">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{artist.displayName || artist.username}</h3>
                <p className="text-muted-foreground font-mono text-sm">@{artist.username}</p>
              </div>
              <Button 
                variant={artist.isActive ? "destructive" : "outline"} 
                className="rounded-none uppercase tracking-widest text-xs font-bold"
                onClick={() => toggleStatus(artist.id, artist.isActive)}
              >
                {artist.isActive ? "Suspend" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
