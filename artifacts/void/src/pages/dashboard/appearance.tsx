import { useState } from "react";
import { useGetMe, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function DashboardAppearance() {
  const { data: me, isLoading } = useGetMe();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    cardStyle: "minimal"
  });

  // Init form
  if (me && !formData.displayName && !formData.bio && formData.cardStyle === "minimal") {
    setFormData({
      displayName: me.displayName || "",
      bio: me.bio || "",
      cardStyle: me.cardStyle || "minimal"
    });
  }

  const handleSave = () => {
    updateProfile.mutate({
      data: formData
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated" });
      }
    });
  };

  if (isLoading) return <div className="text-muted-foreground font-mono animate-pulse">Loading identity...</div>;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Appearance</h1>
        <p className="text-muted-foreground mt-2 font-mono">Shape your public face.</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest border-b border-border pb-2">Profile</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-xs text-muted-foreground">Display Name</Label>
              <Input 
                value={formData.displayName} 
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                className="rounded-none bg-black border-border font-mono h-12"
                placeholder="YOUR NAME"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-xs text-muted-foreground">Bio</Label>
              <Textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="rounded-none bg-black border-border font-mono min-h-32"
                placeholder="Write your manifesto..."
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest border-b border-border pb-2">Card Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setFormData({...formData, cardStyle: 'minimal'})}
              className={`p-6 border text-left flex flex-col items-center justify-center gap-4 transition-all h-40 ${formData.cardStyle === 'minimal' ? 'border-white bg-white/5' : 'border-border bg-black hover:border-white/50'}`}
            >
              <div className="w-full py-3 bg-[#111] text-center text-sm font-bold tracking-widest uppercase border-b border-transparent">
                Minimal
              </div>
            </button>
            <button 
              onClick={() => setFormData({...formData, cardStyle: 'brutalist'})}
              className={`p-6 border text-left flex flex-col items-center justify-center gap-4 transition-all h-40 ${formData.cardStyle === 'brutalist' ? 'border-white bg-white/5' : 'border-border bg-black hover:border-white/50'}`}
            >
              <div className="w-full py-3 border-2 border-white text-center text-sm font-bold tracking-widest uppercase">
                Brutalist
              </div>
            </button>
            <button 
              onClick={() => setFormData({...formData, cardStyle: 'glass'})}
              className={`p-6 border text-left flex flex-col items-center justify-center gap-4 transition-all h-40 ${formData.cardStyle === 'glass' ? 'border-white bg-white/5' : 'border-border bg-black hover:border-white/50'}`}
            >
              <div className="w-full py-3 bg-white/5 backdrop-blur border border-white/10 text-center text-sm font-bold tracking-widest uppercase bg-gradient-to-br from-white/10 to-transparent">
                Glass
              </div>
            </button>
          </div>
        </section>

        <Button 
          onClick={handleSave} 
          disabled={updateProfile.isPending}
          className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold h-12 px-8"
        >
          {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
