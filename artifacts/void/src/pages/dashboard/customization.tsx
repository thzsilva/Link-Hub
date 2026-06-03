import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useGetMe, customFetch } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { THEMES, type ThemeId, type LayoutColumns, getTheme, getCSSVariables } from "@/lib/themes";
import { Palette, Layout, Copy, Check, Upload as UploadIcon, Loader2, GripVertical, Type, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ColorPickerEnhanced } from "@/components/ColorPickerEnhanced";
import { ThemePreview } from "@/components/ThemePreview";
import ImageCropModal from "@/components/ImageCropModal";
import { uploadImage } from "@/lib/api-base";
import { FONT_OPTIONS, getFontStack } from "@/lib/fonts";
import { SECTION_META, normalizeSectionOrder, type SectionKey } from "@/lib/sections";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

type Sponsor = { imageUrl: string; name?: string; url?: string };

async function updateProfileFooter(data: { sponsors?: Sponsor[]; footerText?: string | null }) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao salvar rodapé");
  }
}

async function updateProfileAppearance(data: {
  heroDisplay?: string;
  heroLayout?: string;
  heroAlign?: string;
  socialIconsAlign?: string;
  usernameFont?: string;
  logoUrl?: string | null;
  logoSize?: number;
  showUsername?: boolean;
  showHeader?: boolean;
  bannerFit?: string;
  bannerHeight?: string;
  sectionOrder?: string[];
  sectionTitles?: Record<string, string>;
}) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar aparência");
  }
}

// Sortable row for the section-ordering UI (drag + rename)
function SortableSectionRow({
  id,
  label,
  icon,
  value,
  onChange,
}: {
  id: string;
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 ${isDragging ? "opacity-60" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-white touch-none flex-shrink-0"
        aria-label="Arrastar"
      >
        <GripVertical size={18} />
      </button>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="h-9 rounded-lg bg-black/30 border-white/15 text-sm"
      />
    </div>
  );
}

async function updateProfileVideo(data: { videoUrl: string | null }) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar vídeo");
  }
}

async function updateProfileContact(data: {
  whatsappNumber?: string | null;
  email?: string | null;
  instagramHandle?: string | null;
}) {
  try {
    return await customFetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    throw new Error(error.message || "Falha ao atualizar contato");
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
  const [videoUrl, setVideoUrl] = useState((profile as any)?.videoUrl || "");
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState((profile as any)?.whatsappNumber || "");
  const [email, setEmail] = useState((profile as any)?.email || "");
  const [instagramHandle, setInstagramHandle] = useState((profile as any)?.instagramHandle || "");
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Appearance: hero display, alignment, font, section order
  const [heroDisplay, setHeroDisplay] = useState<string>((profile as any)?.heroDisplay || "name");
  const [heroLayout, setHeroLayout] = useState<string>((profile as any)?.heroLayout || "overlay");
  const [logoUrl, setLogoUrl] = useState<string>((profile as any)?.logoUrl || "");
  const [logoSize, setLogoSize] = useState<number>(Number((profile as any)?.logoSize) || 128);
  const [showUsername, setShowUsername] = useState<boolean>((profile as any)?.showUsername !== false);
  const [bannerFit, setBannerFit] = useState<string>((profile as any)?.bannerFit || "cover");
  const [bannerHeight, setBannerHeight] = useState<string>((profile as any)?.bannerHeight || "normal");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  // Hydrate appearance/footer/section state once the profile finishes loading.
  // Without this, fields initialized while `profile` was still undefined keep
  // their defaults (e.g. showUsername=true) and a later save would overwrite
  // the user's saved values. Runs once per profile id.
  const hydratedRef = useRef<string | null>(null);
  useEffect(() => {
    const p = profile as any;
    if (!p?.id || hydratedRef.current === p.id) return;
    hydratedRef.current = p.id;
    setHeroDisplay(p.heroDisplay || "name");
    setHeroLayout(p.heroLayout || "overlay");
    setHeroAlign(p.heroAlign || "center");
    setSocialIconsAlign(p.socialIconsAlign?.includes?.("-") ? p.socialIconsAlign : `bottom-${p.socialIconsAlign || "center"}`);
    setUsernameFont(p.usernameFont || "default");
    setLogoUrl(p.logoUrl || "");
    setLogoSize(Number(p.logoSize) || 128);
    setShowUsername(p.showUsername !== false);
    setBannerVideoUrl(p.bannerVideoUrl || "");
    setBioImageUrl(p.bioImageUrl || "");
    setBioImageSide(p.bioImageSide || "left");
    setShowHeader(!!p.showHeader);
    setBannerFit(p.bannerFit || "cover");
    setBannerHeight(p.bannerHeight || "normal");
    setSectionOrder(normalizeSectionOrder(p.sectionOrder));
    setSectionTitles((p.sectionTitles || {}) as Record<string, string>);
    setSponsors(Array.isArray(p.sponsors) ? p.sponsors : []);
    setFooterText(p.footerText || "");
  }, [profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const url = await uploadImage(file, file.name || "logo.png");
      setLogoUrl(url);
      toast({ title: "✓ Logo enviada! Não esqueça de salvar a aparência." });
    } catch (err: any) {
      toast({ title: err?.message || "Falha no upload", variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = "";
    }
  };

  // Banner video + Bio photo (salvam na hora)
  const [bannerVideoUrl, setBannerVideoUrl] = useState<string>((profile as any)?.bannerVideoUrl || "");
  const [bioImageUrl, setBioImageUrl] = useState<string>((profile as any)?.bioImageUrl || "");
  const [bioImageSide, setBioImageSide] = useState<string>((profile as any)?.bioImageSide || "left");
  const [showHeader, setShowHeader] = useState<boolean>(!!(profile as any)?.showHeader);

  const toggleShowHeader = async () => {
    const next = !showHeader;
    setShowHeader(next);
    try {
      await updateProfileAppearance({ showHeader: next });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: next ? "Header habilitado" : "Header desabilitado" });
    } catch (err: any) {
      setShowHeader(!next);
      toast({ title: err?.message || "Erro ao salvar", variant: "destructive" });
    }
  };
  const [isUploadingBannerVideo, setIsUploadingBannerVideo] = useState(false);
  const [isUploadingBioImage, setIsUploadingBioImage] = useState(false);
  const bannerVideoRef = useRef<HTMLInputElement>(null);
  const bioImageRef = useRef<HTMLInputElement>(null);

  const saveMediaField = async (patch: { bannerVideoUrl?: string | null; bioImageUrl?: string | null; bioImageSide?: string }) => {
    await updateProfileFooter(patch as any); // PUT /api/me (aceita os campos do perfil)
    queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
  };

  const handleBioImageSide = async (side: string) => {
    setBioImageSide(side);
    try {
      await saveMediaField({ bioImageSide: side });
      toast({ title: side === "right" ? "Foto à direita" : "Foto à esquerda" });
    } catch (err: any) {
      toast({ title: err?.message || "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleBannerVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBannerVideo(true);
    try {
      const url = await uploadImage(file, file.name || "banner.mp4");
      setBannerVideoUrl(url);
      await saveMediaField({ bannerVideoUrl: url });
      toast({ title: "✓ Vídeo do banner salvo!" });
    } catch (err: any) {
      toast({ title: err?.message || "Falha no upload do vídeo", variant: "destructive" });
    } finally {
      setIsUploadingBannerVideo(false);
      if (bannerVideoRef.current) bannerVideoRef.current.value = "";
    }
  };

  const handleRemoveBannerVideo = async () => {
    setBannerVideoUrl("");
    try {
      await saveMediaField({ bannerVideoUrl: null });
      toast({ title: "Vídeo do banner removido." });
    } catch (err: any) {
      toast({ title: err?.message || "Erro ao remover", variant: "destructive" });
    }
  };

  const handleBioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBioImage(true);
    try {
      const url = await uploadImage(file, file.name || "bio.jpg");
      setBioImageUrl(url);
      await saveMediaField({ bioImageUrl: url });
      toast({ title: "✓ Foto da bio salva!" });
    } catch (err: any) {
      toast({ title: err?.message || "Falha no upload", variant: "destructive" });
    } finally {
      setIsUploadingBioImage(false);
      if (bioImageRef.current) bioImageRef.current.value = "";
    }
  };

  const handleRemoveBioImage = async () => {
    setBioImageUrl("");
    try {
      await saveMediaField({ bioImageUrl: null });
      toast({ title: "Foto da bio removida." });
    } catch (err: any) {
      toast({ title: err?.message || "Erro ao remover", variant: "destructive" });
    }
  };

  const [heroAlign, setHeroAlign] = useState<string>((profile as any)?.heroAlign || "center");
  const [socialIconsAlign, setSocialIconsAlign] = useState<string>(() => {
    const raw = (profile as any)?.socialIconsAlign || "bottom-center";
    return raw.includes("-") ? raw : `bottom-${raw}`;
  });
  const [usernameFont, setUsernameFont] = useState<string>((profile as any)?.usernameFont || "default");
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(
    normalizeSectionOrder((profile as any)?.sectionOrder)
  );
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>(
    ((profile as any)?.sectionTitles || {}) as Record<string, string>
  );
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Footer: sponsors + custom text
  const [sponsors, setSponsors] = useState<Sponsor[]>(
    Array.isArray((profile as any)?.sponsors) ? (profile as any).sponsors : []
  );
  const [footerText, setFooterText] = useState<string>((profile as any)?.footerText || "");
  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [isUploadingSponsor, setIsUploadingSponsor] = useState(false);
  const sponsorFileRef = useRef<HTMLInputElement>(null);

  const handleSponsorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSponsor(true);
    try {
      const url = await uploadImage(file, file.name || "sponsor.png");
      setSponsors((cur) => [...cur, { imageUrl: url, name: "", url: "" }]);
      toast({ title: "✓ Logo adicionada! Não esqueça de salvar." });
    } catch (err: any) {
      toast({ title: err?.message || "Falha no upload", variant: "destructive" });
    } finally {
      setIsUploadingSponsor(false);
      if (sponsorFileRef.current) sponsorFileRef.current.value = "";
    }
  };

  const updateSponsor = (index: number, patch: Partial<Sponsor>) => {
    setSponsors((cur) => cur.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };
  const removeSponsor = (index: number) => {
    setSponsors((cur) => cur.filter((_, i) => i !== index));
  };

  const handleSaveFooter = async () => {
    setIsSavingFooter(true);
    try {
      await updateProfileFooter({ sponsors, footerText: footerText.trim() || null });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: "✓ Rodapé atualizado!" });
    } catch (err: any) {
      toast({ title: err?.message || "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSavingFooter(false);
    }
  };

  const sectionSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleSectionDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSectionOrder((cur) => {
      const oldIndex = cur.indexOf(active.id as SectionKey);
      const newIndex = cur.indexOf(over.id as SectionKey);
      if (oldIndex === -1 || newIndex === -1) return cur;
      return arrayMove(cur, oldIndex, newIndex);
    });
  };

  const handleSaveAppearance = async () => {
    setIsSavingAppearance(true);
    try {
      await updateProfileAppearance({ heroDisplay, heroLayout, heroAlign, socialIconsAlign, usernameFont, logoUrl: logoUrl || null, logoSize, showUsername, bannerFit, bannerHeight });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: "✓ Aparência atualizada!" });
    } catch (err: any) {
      toast({ title: err?.message || "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSavingAppearance(false);
    }
  };

  // Toggle "Mostrar @username" salva imediatamente (switch aplica na hora)
  const toggleShowUsername = async () => {
    const next = !showUsername;
    setShowUsername(next);
    try {
      await updateProfileAppearance({ showUsername: next });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: next ? "@username visível" : "@username ocultado" });
    } catch (err: any) {
      setShowUsername(!next); // reverte em caso de erro
      toast({ title: err?.message || "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleSaveSectionOrder = async () => {
    setIsSavingOrder(true);
    try {
      // Only persist non-empty custom titles
      const cleanTitles: Record<string, string> = {};
      for (const [k, v] of Object.entries(sectionTitles)) {
        if (v && v.trim()) cleanTitles[k] = v.trim();
      }
      await updateProfileAppearance({ sectionOrder, sectionTitles: cleanTitles });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: "✓ Ordem das seções salva!" });
    } catch (err: any) {
      toast({ title: err?.message || "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Crop modal states
  const [showAvatarCropModal, setShowAvatarCropModal] = useState(false);
  const [showBannerCropModal, setShowBannerCropModal] = useState(false);
  const [avatarCropImageSrc, setAvatarCropImageSrc] = useState("");
  const [bannerCropImageSrc, setBannerCropImageSrc] = useState("");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);

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

  const handleSaveVideo = async () => {
    setIsSavingVideo(true);
    try {
      const trimmedUrl = videoUrl.trim();
      // Allow empty string to remove video
      await updateProfileVideo({ videoUrl: trimmedUrl || null });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: trimmedUrl ? "✓ Vídeo atualizado!" : "✓ Vídeo removido!" });
    } catch (error: any) {
      toast({ title: error.message || "Erro ao atualizar", variant: "destructive" });
      setVideoUrl((profile as any)?.videoUrl || "");
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      await updateProfileContact({
        whatsappNumber: whatsappNumber.trim() || null,
        email: email.trim() || null,
        instagramHandle: instagramHandle.trim() || null,
      });
      queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
      toast({ title: "✓ Informações de contato atualizadas!" });
    } catch (error: any) {
      toast({ title: error.message || "Erro ao atualizar", variant: "destructive" });
      setWhatsappNumber((profile as any)?.whatsappNumber || "");
      setEmail((profile as any)?.email || "");
      setInstagramHandle((profile as any)?.instagramHandle || "");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleAvatarCropComplete = async (croppedImageUrl: string) => {
    if (!pendingAvatarFile) return;

    setShowAvatarCropModal(false);
    setIsUploadingAvatar(true);

    try {
      // Convert blob URL to file
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      const url = await uploadImage(blob, "avatar.jpg");

      setAvatarPreview(url);

      // Update avatar in backend
      updateAvatarMutation.mutate(
        { avatarUrl: url },
        {
          onSuccess: (data) => {
            console.log("Avatar updated successfully:", data);
            queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
            toast({ title: "✓ Foto de perfil atualizada!" });
          },
          onError: (error: any) => {
            console.error("Avatar PUT /api/me error:", error);
            setAvatarPreview(profile?.avatarUrl || "");
            toast({ title: `Erro ao salvar: ${error.message || "desconhecido"}`, variant: "destructive" });
          },
        }
      );
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({ title: error?.message || "Falha no upload.", variant: "destructive" });
      setAvatarPreview(profile?.avatarUrl || "");
    } finally {
      setIsUploadingAvatar(false);
      setPendingAvatarFile(null);
      setAvatarCropImageSrc("");
    }
  };

  const handleBannerCropComplete = async (croppedImageUrl: string) => {
    if (!pendingBannerFile) return;

    setShowBannerCropModal(false);
    setIsUploadingBanner(true);

    try {
      // Convert blob URL to file
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      const url = await uploadImage(blob, "banner.jpg");

      setBannerPreview(url);

      // Update banner in backend
      try {
        await updateProfileBanner({ headerImageUrl: url });
        queryClient.invalidateQueries({ queryKey: ["useGetMe"] });
        toast({ title: "✓ Banner atualizado!" });
      } catch (error: any) {
        setBannerPreview(profile?.headerImageUrl || "");
        toast({ title: `Erro ao salvar: ${error.message || "desconhecido"}`, variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({ title: error?.message || "Falha no upload.", variant: "destructive" });
      setBannerPreview(profile?.headerImageUrl || "");
    } finally {
      setIsUploadingBanner(false);
      setPendingBannerFile(null);
      setBannerCropImageSrc("");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const local = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setAvatarCropImageSrc(local);
    setShowAvatarCropModal(true);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const local = URL.createObjectURL(file);
    setPendingBannerFile(file);
    setBannerCropImageSrc(local);
    setShowBannerCropModal(true);
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
      <div className="relative z-10 flex flex-col gap-8 px-4 sm:px-6 lg:px-8 pt-8 pb-12">
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
        style={{ order: 1 }}
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
        style={{ order: 2 }}
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

          {/* Foto da bio (ao lado do texto no perfil) */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Foto da bio</label>
            <p className="text-[11px] text-muted-foreground">Aparece ao lado da bio no perfil (estilo press kit). Se vazio, usa a foto de perfil.</p>
            <div className="flex items-center gap-3">
              {bioImageUrl && (
                <img src={bioImageUrl} alt="Bio" className="w-16 h-20 object-cover rounded-lg border border-white/15 flex-shrink-0" />
              )}
              <div className="flex gap-2">
                <input ref={bioImageRef} type="file" accept="image/*" className="hidden" onChange={handleBioImageUpload} disabled={isUploadingBioImage} />
                <Button variant="outline" onClick={() => bioImageRef.current?.click()} disabled={isUploadingBioImage} className="rounded-lg uppercase text-xs font-bold border-white/20 hover:bg-white/10 gap-2">
                  {isUploadingBioImage ? <Loader2 size={14} className="animate-spin" /> : <UploadIcon size={14} />}
                  {isUploadingBioImage ? "Enviando..." : bioImageUrl ? "Trocar Foto" : "Enviar Foto"}
                </Button>
                {bioImageUrl && (
                  <Button variant="ghost" onClick={handleRemoveBioImage} className="rounded-lg uppercase text-xs text-muted-foreground hover:text-red-400">
                    Remover
                  </Button>
                )}
              </div>
            </div>

            {/* Lado da foto */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Lado:</span>
              {([
                { v: "left", label: "Esquerda" },
                { v: "right", label: "Direita" },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => handleBioImageSide(opt.v)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    bioImageSide === opt.v
                      ? "border-white/60 bg-white/10 text-white"
                      : "border-white/15 text-muted-foreground hover:border-white/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Aparência do Nome / Hero */}
      <motion.div
        style={{ order: 5 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-5 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent flex items-center gap-2">
          <User size={18} /> Aparência do Nome
        </h2>

        {/* Hero display option */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">No topo do perfil, mostrar:</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "name", label: "Nome" },
              { v: "logo", label: "Logo/Foto" },
              { v: "both", label: "Ambos" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setHeroDisplay(opt.v)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  heroDisplay === opt.v
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-white/15 text-muted-foreground hover:border-white/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logo image upload (wordmark) */}
        {(heroDisplay === "logo" || heroDisplay === "both") && (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Logo (imagem)</label>
            <p className="text-[11px] text-muted-foreground">Envie a imagem do seu logo/marca (ex: PNG com fundo transparente). Ela aparece em destaque no lugar do nome.</p>

            {logoUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-black/40 p-3">
                <div className="flex-1 h-16 flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="max-h-16 w-auto object-contain" />
                </div>
                <button
                  onClick={() => setLogoUrl("")}
                  className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0 px-2 text-sm"
                >
                  Remover
                </button>
              </div>
            ) : null}

            <input
              ref={logoFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo}
            />
            <Button
              variant="outline"
              onClick={() => logoFileRef.current?.click()}
              disabled={isUploadingLogo}
              className="rounded-lg uppercase text-xs font-bold border-white/20 hover:bg-white/10 gap-2"
            >
              {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <UploadIcon size={14} />}
              {isUploadingLogo ? "Enviando..." : logoUrl ? "Trocar Logo" : "Enviar Logo"}
            </Button>

            {/* Logo/photo size slider — works for both the logo image and the avatar */}
            {(logoUrl || profile?.avatarUrl) && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Tamanho do logo/foto</label>
                  <span className="text-xs font-mono text-white/60">{logoSize}px</span>
                </div>
                <input
                  type="range"
                  min={48}
                  max={400}
                  step={4}
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                {/* live preview */}
                <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-3 flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Preview" style={{ maxHeight: `${Math.min(logoSize, 160)}px` }} className="w-auto max-w-full object-contain" />
                  ) : (
                    <img src={profile?.avatarUrl} alt="Preview" style={{ width: `${Math.min(logoSize, 160)}px`, height: `${Math.min(logoSize, 160)}px` }} className="rounded-full object-cover" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Banner: fit + height */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Ajuste do banner</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: "cover", label: "Preencher", desc: "Cobre todo o espaço (pode cortar)" },
                { v: "contain", label: "Conter", desc: "Mostra a imagem inteira" },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setBannerFit(opt.v)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                    bannerFit === opt.v
                      ? "border-white/60 bg-white/10 text-white"
                      : "border-white/15 text-muted-foreground hover:border-white/30"
                  }`}
                >
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="block text-[10px] opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Altura do banner</label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { v: "compact", label: "Baixo" },
                { v: "normal", label: "Normal" },
                { v: "tall", label: "Alto" },
                { v: "full", label: "Tela cheia" },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setBannerHeight(opt.v)}
                  className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${
                    bannerHeight === opt.v
                      ? "border-white/60 bg-white/10 text-white"
                      : "border-white/15 text-muted-foreground hover:border-white/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Show @username toggle — salva na hora */}
        <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-4 py-3">
          <div>
            <span className="text-sm font-medium text-white">Mostrar @username</span>
            <p className="text-[11px] text-muted-foreground">Desligue para não repetir o nome (ex: quando o logo já é o nome). Salva automaticamente.</p>
          </div>
          <button
            onClick={toggleShowUsername}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${showUsername ? "bg-white" : "bg-white/20"}`}
            aria-label="Mostrar @username"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${showUsername ? "translate-x-5 bg-black" : "bg-white"}`} />
          </button>
        </div>

        {/* Header de navegação toggle — salva na hora */}
        <div className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-4 py-3">
          <div>
            <span className="text-sm font-medium text-white">Header de navegação</span>
            <p className="text-[11px] text-muted-foreground">Barra fixa no topo com logo, links das seções e ícones (estilo press kit).</p>
          </div>
          <button
            onClick={toggleShowHeader}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${showHeader ? "bg-white" : "bg-white/20"}`}
            aria-label="Habilitar header"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${showHeader ? "translate-x-5 bg-black" : "bg-white"}`} />
          </button>
        </div>

        {/* Hero layout: overlay vs below banner (Komi style) */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Layout do topo</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: "overlay", label: "Sobre o banner", desc: "Nome em cima da imagem" },
              { v: "below", label: "Abaixo do banner", desc: "Banner, depois nome/logo" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setHeroLayout(opt.v)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                  heroLayout === opt.v
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-white/15 text-muted-foreground hover:border-white/30"
                }`}
              >
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="block text-[10px] opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Requer um banner. "Abaixo do banner" mostra o nome/logo embaixo da imagem (estilo Komi).</p>
        </div>

        {/* Hero alignment / position */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Posição do nome/logo</label>
          <div className="grid grid-cols-4 gap-2">
            {([
              { v: "top", label: "Superior" },
              { v: "left", label: "Esquerda" },
              { v: "center", label: "Centro" },
              { v: "right", label: "Direita" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setHeroAlign(opt.v)}
                className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${
                  heroAlign === opt.v
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-white/15 text-muted-foreground hover:border-white/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Social icons position (top/bottom × left/center/right) */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Posição dos ícones das redes</label>
          <div className="space-y-2">
            {([
              { row: "Topo", base: "top" },
              { row: "Base", base: "bottom" },
            ] as const).map((group) => (
              <div key={group.base} className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-10 flex-shrink-0">{group.row}</span>
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {([
                    { h: "left", label: "Esq." },
                    { h: "center", label: "Centro" },
                    { h: "right", label: "Dir." },
                  ] as const).map((opt) => {
                    const value = `${group.base}-${opt.h}`;
                    return (
                      <button
                        key={value}
                        onClick={() => setSocialIconsAlign(value)}
                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                          socialIconsAlign === value
                            ? "border-white/60 bg-white/10 text-white"
                            : "border-white/15 text-muted-foreground hover:border-white/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font selector */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Type size={13} /> Fonte do nome
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.id}
                onClick={() => setUsernameFont(f.id)}
                style={{ fontFamily: f.stack }}
                className={`rounded-lg border px-3 py-3 text-lg transition-all truncate ${
                  usernameFont === f.id
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-white/15 text-white/70 hover:border-white/30"
                }`}
                title={f.label}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Prévia</p>
            <p className="text-3xl sm:text-4xl font-black uppercase text-white leading-none" style={{ fontFamily: getFontStack(usernameFont) }}>
              {username || profile?.displayName || "Seu Nome"}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveAppearance}
            disabled={isSavingAppearance}
            className="rounded-lg px-6 uppercase font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {isSavingAppearance ? "Salvando..." : "Salvar Aparência"}
          </Button>
        </div>
      </motion.div>

      {/* Ordem das Seções */}
      <motion.div
        style={{ order: 10 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.09 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent flex items-center gap-2">
          <Layout size={18} /> Seções (ordem e nomes)
        </h2>
        <p className="text-xs text-muted-foreground">Arraste para reordenar e edite o texto para renomear cada seção no seu perfil público. Deixe em branco para usar o nome padrão.</p>

        <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sectionOrder.map((key) => {
                const meta = SECTION_META.find((m) => m.key === key);
                if (!meta) return null;
                return (
                  <SortableSectionRow
                    key={key}
                    id={key}
                    label={meta.label}
                    icon={meta.icon}
                    value={sectionTitles[key] ?? ""}
                    onChange={(v) => setSectionTitles((cur) => ({ ...cur, [key]: v }))}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSectionOrder}
            disabled={isSavingOrder}
            className="rounded-lg px-6 uppercase font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {isSavingOrder ? "Salvando..." : "Salvar Seções"}
          </Button>
        </div>
      </motion.div>

      {/* Rodapé / Patrocinadores */}
      <motion.div
        style={{ order: 11 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-5 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            Rodapé &amp; Patrocinadores
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Adicione logos de patrocinadores/parceiros e um texto no rodapé do seu perfil.</p>
        </div>

        {/* Sponsor logos */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Logos dos parceiros</label>

          {sponsors.length > 0 && (
            <div className="space-y-3">
              {sponsors.map((sp, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/15 bg-black/30 p-3">
                  <div className="w-16 h-12 flex-shrink-0 rounded bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                    <img src={sp.imageUrl} alt={sp.name || "Logo"} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                    <Input
                      value={sp.name || ""}
                      onChange={(e) => updateSponsor(i, { name: e.target.value })}
                      placeholder="Nome (opcional)"
                      className="h-9 rounded-lg bg-white/5 border-white/20 text-sm"
                    />
                    <Input
                      value={sp.url || ""}
                      onChange={(e) => updateSponsor(i, { url: e.target.value })}
                      placeholder="Link (opcional)"
                      className="h-9 rounded-lg bg-white/5 border-white/20 text-sm font-mono"
                    />
                  </div>
                  <button
                    onClick={() => removeSponsor(i)}
                    className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0 px-2"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={sponsorFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSponsorUpload}
            disabled={isUploadingSponsor}
          />
          <Button
            variant="outline"
            onClick={() => sponsorFileRef.current?.click()}
            disabled={isUploadingSponsor}
            className="rounded-lg uppercase text-xs font-bold border-white/20 hover:bg-white/10 gap-2"
          >
            {isUploadingSponsor ? <Loader2 size={14} className="animate-spin" /> : <UploadIcon size={14} />}
            {isUploadingSponsor ? "Enviando..." : "Adicionar Logo"}
          </Button>
        </div>

        {/* Footer text */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Texto do rodapé (opcional)</label>
          <textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Ex: Agradecimento aos patrocinadores, contato de booking, etc."
            maxLength={300}
            rows={3}
            className="w-full rounded-lg bg-white/5 border border-white/20 p-4 text-white text-sm resize-none focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors"
          />
          <p className="text-xs text-muted-foreground text-right">{footerText.length} / 300</p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveFooter}
            disabled={isSavingFooter}
            className="rounded-lg px-6 uppercase font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isSavingFooter ? "Salvando..." : "Salvar Rodapé"}
          </Button>
        </div>
      </motion.div>

      {/* Vídeo */}
      <motion.div
        style={{ order: 8 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.09 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">🎥 Seu Vídeo</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">URL do Vídeo</label>
            <p className="text-xs text-white/50 mb-3">Cole a URL de um vídeo do YouTube, Vimeo ou arquivo MP4</p>
            <Input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
              className="rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10"
              disabled={isSavingVideo}
            />
            <div className="mt-2 text-xs text-white/40 space-y-1">
              <p>✓ YouTube: youtube.com/watch?v=ID ou youtu.be/ID</p>
              <p>✓ Vimeo: vimeo.com/ID</p>
              <p>✓ Local: link direto para arquivo .mp4</p>
            </div>
          </div>

          {/* Preview do vídeo */}
          {videoUrl && (
            <motion.div
              className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Preview</p>
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border border-white/10">
                <iframe
                  src={
                    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
                      ? `https://www.youtube.com/embed/${videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1]}`
                      : videoUrl.includes("vimeo.com")
                      ? `https://player.vimeo.com/video/${videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]}`
                      : videoUrl
                  }
                  className="w-full h-full"
                  allow="autoplay"
                  frameBorder="0"
                  onError={() => {
                    // Erro no preview não é crítico
                    console.log("Erro ao renderizar preview do vídeo");
                  }}
                />
              </div>
            </motion.div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSaveVideo}
              disabled={isSavingVideo || videoUrl === ((profile as any)?.videoUrl || "")}
              className="rounded-lg px-6 uppercase font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isSavingVideo ? "Salvando..." : videoUrl ? "Atualizar Vídeo" : "Remover Vídeo"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Informações de Contato */}
      <motion.div
        style={{ order: 9 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.11 }}
      >
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">📞 Informações de Contato</h2>
        <p className="text-xs text-white/60">Deixe seus contatos para que visitantes possam chegar até você</p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* WhatsApp */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground block">WhatsApp</label>
            <Input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="55 11 99999-9999"
              className="rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10"
              disabled={isSavingContact}
            />
            <p className="text-xs text-white/40">Com código do país (55 para Brasil)</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10"
              disabled={isSavingContact}
            />
            <p className="text-xs text-white/40">Para mensagens diretas</p>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground block">Instagram</label>
            <Input
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="seu_usuario"
              className="rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-white/50 focus:bg-white/10"
              disabled={isSavingContact}
            />
            <p className="text-xs text-white/40">Sem @ (apenas usuário)</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveContact}
            disabled={
              isSavingContact ||
              (whatsappNumber === ((profile as any)?.whatsappNumber || "") &&
                email === ((profile as any)?.email || "") &&
                instagramHandle === ((profile as any)?.instagramHandle || ""))
            }
            className="rounded-lg px-6 uppercase font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isSavingContact ? "Salvando..." : "Salvar Contatos"}
          </Button>
        </div>
      </motion.div>

      {/* Upload de Foto de Perfil */}
      <motion.div
        style={{ order: 3 }}
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
            <motion.div
              className="flex flex-col items-center justify-center p-8 border-2 border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-transparent hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              {avatarPreview ? (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-75 transition-opacity duration-300 blur-lg" />
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="relative w-32 h-32 rounded-full object-cover border-4 border-white/20 mb-4 hover:border-white/40 transition-colors"
                      crossOrigin="anonymous"
                      loading="lazy"
                      onError={(e) => {
                        console.error("Erro ao carregar imagem diretamente:", avatarPreview);
                        const img = e.target as HTMLImageElement;
                        if (!img.src.includes("?t=") && img.src.includes("supabase")) {
                          img.src = `${avatarPreview}?t=${Date.now()}`;
                        } else if (img.src.includes("supabase") && !img.src.includes("proxy-image")) {
                          img.src = `/api/proxy-image?url=${encodeURIComponent(avatarPreview)}`;
                        } else {
                          img.style.display = "none";
                        }
                      }}
                      onLoad={() => {
                        console.log("✅ Imagem carregada com sucesso:", avatarPreview);
                      }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 text-muted-foreground border-2 border-dashed border-white/20"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <UploadIcon size={40} strokeWidth={1} />
                </motion.div>
              )}
              <p className="text-muted-foreground text-sm text-center">
                {profile.displayName || profile.username}
              </p>
            </motion.div>
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
        style={{ order: 4 }}
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

          {/* Vídeo do banner (mp4/webm) */}
          <div className="space-y-2 pt-4 mt-2 border-t border-white/10">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Vídeo do banner (opcional)</label>
            <p className="text-[11px] text-muted-foreground">Envie um vídeo curto (MP4/WEBM) — ele toca em loop no topo, no lugar da imagem. A imagem do banner vira o poster (capa). Máx 60MB.</p>

            {bannerVideoUrl && (
              <video src={bannerVideoUrl} className="w-full h-32 object-cover rounded-lg border border-white/15" muted autoPlay loop playsInline />
            )}

            <div className="flex gap-2">
              <input ref={bannerVideoRef} type="file" accept="video/*" className="hidden" onChange={handleBannerVideoUpload} disabled={isUploadingBannerVideo} />
              <Button variant="outline" onClick={() => bannerVideoRef.current?.click()} disabled={isUploadingBannerVideo} className="rounded-lg uppercase text-xs font-bold border-white/20 hover:bg-white/10 gap-2">
                {isUploadingBannerVideo ? <Loader2 size={14} className="animate-spin" /> : <UploadIcon size={14} />}
                {isUploadingBannerVideo ? "Enviando..." : bannerVideoUrl ? "Trocar Vídeo" : "Enviar Vídeo"}
              </Button>
              {bannerVideoUrl && (
                <Button variant="ghost" onClick={handleRemoveBannerVideo} className="rounded-lg uppercase text-xs text-muted-foreground hover:text-red-400">
                  Remover
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preview do Perfil */}
      <motion.div
        style={{ order: 6 }}
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
        style={{ order: 7 }}
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

      {/* Avatar Crop Modal */}
      {showAvatarCropModal && avatarCropImageSrc && (
        <ImageCropModal
          imageSrc={avatarCropImageSrc}
          onCrop={handleAvatarCropComplete}
          onClose={() => {
            setShowAvatarCropModal(false);
            setAvatarCropImageSrc("");
            setPendingAvatarFile(null);
            URL.revokeObjectURL(avatarCropImageSrc);
          }}
          aspectRatio={1}
          title="Ajustar Foto de Perfil"
        />
      )}

      {/* Banner Crop Modal */}
      {showBannerCropModal && bannerCropImageSrc && (
        <ImageCropModal
          imageSrc={bannerCropImageSrc}
          onCrop={handleBannerCropComplete}
          onClose={() => {
            setShowBannerCropModal(false);
            setBannerCropImageSrc("");
            setPendingBannerFile(null);
            URL.revokeObjectURL(bannerCropImageSrc);
          }}
          aspectRatio={4}
          title="Ajustar Banner"
        />
      )}
      </div>
    </div>
  );
}
