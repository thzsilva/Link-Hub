import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGetMe, customFetch } from "@workspace/api-client-react";
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
  try {
    return await customFetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar perfil");
  }
}

async function updateProfileAvatar(data: { avatarUrl: string }) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar foto de perfil");
  }
}

async function updateProfileUsername(data: { username: string; displayName?: string }) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar nome de usuário");
  }
}

async function updateProfileBio(data: { bio: string }) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar descrição");
  }
}

async function updateProfileBanner(data: { headerImageUrl: string | null }) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar banner");
  }
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
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>((profile?.themeId as ThemeId) || "default");
  const [layoutColumns, setLayoutColumns] = useState<LayoutColumns>((profile?.layoutColumns as LayoutColumns) || 1);
  const [customPrimary, setCustomPrimary] = useState(profile?.customPrimaryColor || "");
  const [customSecondary, setCustomSecondary] = useState(profile?.customSecondaryColor || "");
  const [profileUrl, setProfileUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || "");
  const [bannerPreview, setBannerPreview] = useState(profile?.headerImageUrl || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);

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

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      toast({ title: "Nome de usuário não pode estar vazio", variant: "destructive" });
      return;
    }
    setIsSavingUsername(true);
    try {
      await updateProfileUsername({
        username: username.trim(),
        displayName: username.trim() // Atualizar displayName também
      });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: "✓ Nome de usuário atualizado!" });
    } catch (error: any) {
      toast({ title: error.message || "Erro ao atualizar", variant: "destructive" });
      setUsername(profile?.username || "");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      await updateProfileBio({ bio: bio.trim() });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: "✓ Descrição atualizada!" });
    } catch (error: any) {
      toast({ title: error.message || "Erro ao atualizar", variant: "destructive" });
      setBio(profile?.bio || "");
    } finally {
      setIsSavingBio(false);
    }
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

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setBannerPreview(local);
    setIsUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: err.error || "Erro no upload", variant: "destructive" });
        setBannerPreview(profile?.headerImageUrl || "");
        return;
      }
      const data = await res.json();
      const { url } = data;
      if (!url) {
        toast({ title: "Erro: URL não retornada do servidor", variant: "destructive" });
        setBannerPreview(profile?.headerImageUrl || "");
        return;
      }
      setBannerPreview(url);

      // Update banner in backend
      try {
        await updateProfileBanner({ headerImageUrl: url });
        URL.revokeObjectURL(local);
        queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
        toast({ title: "✓ Banner atualizado!" });
      } catch (error: any) {
        setBannerPreview(profile?.headerImageUrl || "");
        toast({ title: `Erro ao salvar: ${error.message || "desconhecido"}`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ title: "Falha no upload.", variant: "destructive" });
      setBannerPreview(profile?.headerImageUrl || "");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  if (!profile) return <div className="text-muted-foreground animate-pulse">Carregando...</div>;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Elegant background with animated blur circles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content with relative positioning */}
      <div className="relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
            Customização
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Personalize a aparência do seu perfil</p>
        </motion.div>

      {/* Nome de Usuário */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Nome de Usuário</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="seu-username"
            className="rounded-lg bg-white/5 border-white/20 font-mono focus:border-white/50 focus:bg-white/10 transition-colors"
            disabled={isSavingUsername}
          />
          <Button
            onClick={handleSaveUsername}
            disabled={isSavingUsername || username === profile?.username}
            className="rounded-lg px-6 uppercase font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 whitespace-nowrap"
          >
            {isSavingUsername ? "Salvando..." : "Salvar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Seu perfil público será acessível em: <span className="font-mono text-white/70">{window.location.origin}/?user={username || "seu-username"}</span></p>
      </motion.div>

      {/* Descrição / Bio */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.07 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Descrição</h2>
        <div className="space-y-3">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Descreva você em poucas palavras..."
            maxLength={150}
            className="w-full rounded-lg bg-white/5 border border-white/20 p-4 text-white text-sm resize-none focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors"
            rows={3}
            disabled={isSavingBio}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{bio.length} / 150 caracteres</p>
            <Button
              onClick={handleSaveBio}
              disabled={isSavingBio || bio === (profile?.bio || "")}
              className="rounded-lg px-6 uppercase font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isSavingBio ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Upload de Foto de Perfil */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">Foto de Perfil</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Seu Avatar</label>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-transparent hover:bg-white/10 transition-colors">
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
              className="relative border-2 border-dashed border-white/20 hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer rounded-xl p-8 text-center backdrop-blur-sm"
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

      {/* Upload de Banner/Imagem de Fundo */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Banner/Imagem de Fundo</h2>
        <div className="space-y-4">
          {/* Banner Preview */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Prévia do Banner</label>
            <div className="relative rounded-xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:bg-white/10 transition-colors">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner"
                  className="w-full h-32 sm:h-40 object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                      img.src = `${bannerPreview}?t=${Date.now()}`;
                    } else if (img.src.includes("supabase") && !img.src.includes("proxy-image")) {
                      img.src = `/api/proxy-image?url=${encodeURIComponent(bannerPreview)}`;
                    } else {
                      img.style.display = "none";
                    }
                  }}
                />
              ) : (
                <div className="w-full h-32 sm:h-40 bg-white/10 flex items-center justify-center text-muted-foreground">
                  <UploadIcon size={32} strokeWidth={1} />
                </div>
              )}
            </div>
          </div>

          {/* Banner Upload Area */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Upload Banner</label>
            <div
              className="relative border-2 border-dashed border-white/20 hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer rounded-xl p-8 text-center backdrop-blur-sm"
              onClick={() => !isUploadingBanner && bannerFileRef.current?.click()}
            >
              <input
                ref={bannerFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
                disabled={isUploadingBanner}
              />
              {isUploadingBanner ? (
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
            <p className="text-xs text-muted-foreground">Máximo 5MB. Formatos: JPG, PNG, GIF. Recomendado: 1920x480px</p>
            {bannerPreview && (
              <Button
                onClick={() => {
                  setBannerPreview("");
                  updateProfileBanner({ headerImageUrl: null }).catch((err) =>
                    toast({ title: "Erro ao remover banner", variant: "destructive" })
                  );
                }}
                variant="ghost"
                className="w-full text-red-400 hover:bg-red-500/20 text-xs"
              >
                Remover Banner
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Preview do Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="rounded-xl bg-black/50 border-white/10 overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
        {/* Banner or Gradient Header */}
        <div
          className="w-full h-48 bg-gradient-to-r relative overflow-hidden"
          style={bannerPreview ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        >
          {bannerPreview && <div className="absolute inset-0 bg-black/30" />}
        </div>
        <div className="px-8 py-6 flex items-end gap-4" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || profile.username}
                className="w-20 h-20 rounded-full border-4 border-black"
                crossOrigin="anonymous"
                loading="lazy"
                onError={(e) => {
                  console.error("Erro ao carregar avatar do perfil:", profile.avatarUrl);
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                    img.src = `${profile.avatarUrl}?t=${Date.now()}`;
                  } else if (img.src.includes("supabase") && !img.src.includes("proxy-image") && profile.avatarUrl) {
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
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Seu perfil público</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={`${window.location.origin}/?user=${profile.username}`} readOnly className="rounded-lg bg-white/5 border-white/20 font-mono text-sm focus:border-white/50 flex-1" />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={copyProfileUrl} className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 whitespace-nowrap">
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
          className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Temas</h2>
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
          className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Layout size={18} className="text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Layout</h2>
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
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">Cores Customizadas (opcional)</h2>
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
    </div>
  );
}
