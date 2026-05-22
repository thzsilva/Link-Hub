import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGetMe } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { THEMES, type ThemeId, type LayoutColumns, getTheme, getCSSVariables } from "@/lib/themes";
import { Palette, Layout, Copy, Check, Upload as UploadIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ColorPickerEnhanced } from "@/components/ColorPickerEnhanced";
import { ThemePreview } from "@/components/ThemePreview";

async function updateProfileCustomization(data: {
  themeId?: string;
  layoutColumns?: number;
  customPrimaryColor?: string | null;
  customSecondaryColor?: string | null;
}) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Falha ao atualizar perfil");
  return res.json();
}

async function updateProfileAvatar(data: { avatarUrl: string }) {
  const res = await fetch("/api/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Falha ao atualizar foto de perfil");
  return res.json();
}

export default function DashboardCustomization() {
  const { data: profile } = useGetMe();
  const queryClient = useQueryClient();
  const updateProfileMutation = useMutation({
    mutationFn: updateProfileCustomization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
    },
  });
  const updateAvatarMutation = useMutation({
    mutationFn: updateProfileAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
    },
  });
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>((profile?.themeId as ThemeId) || "default");
  const [layoutColumns, setLayoutColumns] = useState<LayoutColumns>((profile?.layoutColumns as LayoutColumns) || 1);
  const [customPrimary, setCustomPrimary] = useState(profile?.customPrimaryColor || "");
  const [customSecondary, setCustomSecondary] = useState(profile?.customSecondaryColor || "");
  const [profileUrl, setProfileUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const currentTheme = getTheme(selectedTheme);
  const theme = customPrimary || customSecondary ? { ...currentTheme, primary: customPrimary || currentTheme.primary, secondary: customSecondary || currentTheme.secondary } : currentTheme;

  const handleSaveCustomization = () => {
    updateProfileMutation.mutate(
      {
        themeId: selectedTheme,
        layoutColumns,
        customPrimaryColor: customPrimary || null,
        customSecondaryColor: customSecondary || null,
      },
      {
        onSuccess: () => {
          toast({ title: "✓ Customização salva!" });
        },
        onError: () => {
          toast({ title: "Erro ao salvar customização", variant: "destructive" });
        },
      },
    );
  };

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/${profile?.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copiado!" });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setAvatarPreview(local);
    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
      console.log("Upload response status:", res.status);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Upload error:", err);
        toast({ title: err.error || "Erro no upload", variant: "destructive" });
        setAvatarPreview(profile?.avatarUrl || "");
        return;
      }
      const data = await res.json();
      console.log("Upload response:", data);
      const { url } = data;
      if (!url) {
        toast({ title: "Erro: URL não retornada do servidor", variant: "destructive" });
        setAvatarPreview(profile?.avatarUrl || "");
        return;
      }

      // NÃO revogar URL local ainda - usaremos para preview enquanto salva no banco
      setAvatarPreview(url);

      // Atualizar avatar no backend
      console.log("Enviando avatarUrl para PUT /api/me:", url);
      updateAvatarMutation.mutate(
        { avatarUrl: url },
        {
          onSuccess: (data) => {
            console.log("Avatar updated successfully:", data);
            // Agora sim, revoga a URL temporária após sucesso
            URL.revokeObjectURL(local);
            // Recarregar o perfil para garantir que a foto está atualizada
            queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
            toast({ title: "✓ Foto de perfil atualizada!" });
          },
          onError: (error: any) => {
            console.error("Avatar PUT /api/me error:", error);
            // Se falhar, volta para a URL anterior
            setAvatarPreview(profile?.avatarUrl || "");
            toast({ title: `Erro ao salvar: ${error.message || "desconhecido"}`, variant: "destructive" });
          },
        }
      );
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ title: "Falha no upload.", variant: "destructive" });
      setAvatarPreview(profile?.avatarUrl || "");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!profile) return <div className="text-muted-foreground animate-pulse">Carregando...</div>;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black uppercase tracking-tighter">Customização</h1>
        <p className="text-muted-foreground mt-2 font-mono text-sm">Personalize a aparência do seu perfil</p>
      </motion.div>

      {/* Upload de Foto de Perfil */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-bold uppercase tracking-tight">Foto de Perfil</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Seu Avatar</label>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-border rounded-lg bg-white/5">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20 mb-4"
                  crossOrigin="anonymous"
                  loading="lazy"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem diretamente:", avatarPreview);
                    // Tentar com timestamp first
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                      img.src = `${avatarPreview}?t=${Date.now()}`;
                    } else if (img.src.includes("supabase") && !img.src.includes("proxy-image")) {
                      // Fallback para proxy se for Supabase
                      img.src = `/api/proxy-image?url=${encodeURIComponent(avatarPreview)}`;
                    } else {
                      img.style.display = "none";
                    }
                  }}
                  onLoad={() => {
                    console.log("✅ Imagem carregada com sucesso:", avatarPreview);
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-4 text-muted-foreground">
                  <UploadIcon size={40} strokeWidth={1} />
                </div>
              )}
              <p className="text-muted-foreground text-sm text-center">
                {profile.displayName || profile.username}
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Fazer Upload</label>
            <div
              className="relative border-2 border-dashed border-white/20 hover:border-white/50 transition-colors cursor-pointer rounded-lg p-8 text-center"
              onClick={() => !isUploadingAvatar && fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
              />
              {isUploadingAvatar ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-white" size={24} />
                  <span className="text-xs text-white/80 uppercase tracking-widest">Enviando...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <UploadIcon size={32} className="text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-bold text-white">Clique para selecionar</p>
                    <p className="text-xs text-muted-foreground">ou arraste uma imagem</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Máximo 5MB. Formatos: JPG, PNG, GIF</p>
          </div>
        </div>
      </motion.div>

      {/* Preview do Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="rounded-none bg-black border-border overflow-hidden">
        <div className="bg-gradient-to-r p-8" style={{ backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
          <div className="flex items-end gap-4">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-20 h-20 rounded-full border-4 border-black"
                crossOrigin="anonymous"
                loading="lazy"
                onError={(e) => {
                  console.error("Erro ao carregar avatar do perfil:", profile.avatarUrl);
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                    img.src = `${profile.avatarUrl}?t=${Date.now()}`;
                  } else if (img.src.includes("supabase") && !img.src.includes("proxy-image")) {
                    img.src = `/api/proxy-image?url=${encodeURIComponent(profile.avatarUrl)}`;
                  } else {
                    img.style.display = "none";
                  }
                }}
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.displayName || profile.username}</h2>
              <p className="text-white/80 text-sm">@{profile.username}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm mb-4">{profile.bio}</p>
          <div className="space-y-2">
            <Button className="w-full rounded-none" style={{ backgroundColor: theme.accent, color: "white" }}>
              Exemplo de Link
            </Button>
            <Button className="w-full rounded-none bg-white/10 text-white hover:bg-white/20">
              Outro Link
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* URL do Perfil */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Seu perfil público</label>
        <div className="flex gap-2">
          <Input value={`${window.location.origin}/${profile.username}`} readOnly className="rounded-none bg-black border-border font-mono text-sm" />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={copyProfileUrl} variant="outline" className="rounded-none">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {/* Seletor de Temas */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Palette size={18} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Temas</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.values(THEMES).map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ThemePreview
                  theme={t}
                  isSelected={selectedTheme === t.id}
                  onClick={() => setSelectedTheme(t.id)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Layout */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Layout size={18} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Layout</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {([1, 2, 3] as LayoutColumns[]).map((cols, index) => (
              <motion.button
                key={cols}
                onClick={() => setLayoutColumns(cols)}
                className={`p-4 border-2 rounded-lg transition-all ${layoutColumns === cols ? "border-white bg-white/10" : "border-white/20 hover:border-white/40"}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`grid gap-1 mb-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {[...Array(cols)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-8 bg-white/20 rounded-sm"
                      animate={layoutColumns === cols ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase">{cols} {cols === 1 ? "coluna" : "colunas"}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Cores Customizadas */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-bold uppercase tracking-tight">Cores Customizadas (opcional)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <ColorPickerEnhanced
              label="Cor Primária"
              value={customPrimary || theme.primary}
              onChange={setCustomPrimary}
              suggestedColors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#FF1744", "#2979F0", "#00BCD4", "#FF6F00"]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ColorPickerEnhanced
              label="Cor Secundária"
              value={customSecondary || theme.secondary}
              onChange={setCustomSecondary}
              suggestedColors={["#98D8C8", "#6C5CE7", "#A29BFE", "#74B9FF", "#81C784", "#FFB74D", "#E57373", "#9575CD"]}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Salvar */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleSaveCustomization}
            disabled={updateProfileMutation.isPending}
            className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
          >
            {updateProfileMutation.isPending ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Salvando...
              </motion.span>
            ) : (
              "Salvar Customização"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
