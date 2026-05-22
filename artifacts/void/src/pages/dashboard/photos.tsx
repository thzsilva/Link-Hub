import { useState, useRef } from "react";
import {
  useGetMyPhotos,
  useCreatePhoto,
  useDeletePhoto,
  getGetMyPhotosQueryKey,
  useReorderPhotos,
  useUpdatePhoto,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { GripVertical, Trash2, Plus, Edit2, Check, X, ImageIcon, Upload, Link2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SortablePhoto({
  photo,
  onDelete,
  onEditCaption,
}: {
  photo: any;
  onDelete: (id: string) => void;
  onEditCaption: (id: string, caption: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionInput, setCaptionInput] = useState(photo.caption ?? "");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const handleSaveCaption = () => {
    onEditCaption(photo.id, captionInput);
    setEditingCaption(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`rounded-none bg-black border-border ${isDragging ? "opacity-50" : ""}`}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-white text-muted-foreground p-2 flex-shrink-0"
        >
          <GripVertical size={20} />
        </button>

        {/* Thumbnail */}
        <div className="w-16 h-16 bg-white/5 border border-white/10 relative overflow-hidden flex-shrink-0 rounded-sm group/thumb">
          {photo.url ? (
            <img
              src={photo.url}
              alt={photo.caption || "Photo"}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                const parent = img.parentElement;
                if (parent && !parent.querySelector("[data-broken]")) {
                  const el = document.createElement("div");
                  el.setAttribute("data-broken", "1");
                  el.className = "absolute inset-0 flex flex-col items-center justify-center text-red-400 gap-1";
                  el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg><span style="font-size:9px;text-transform:uppercase;letter-spacing:.05em">Quebrada</span>`;
                  parent.appendChild(el);
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ImageIcon size={20} />
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="flex-1 min-w-0">
          {editingCaption ? (
            <div className="flex gap-2">
              <Input
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                className="h-8 rounded-none bg-black border-border font-mono text-sm"
                placeholder="Caption..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveCaption();
                  if (e.key === "Escape") setEditingCaption(false);
                }}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveCaption}
                className="h-8 w-8 text-green-500 rounded-none flex-shrink-0"
              >
                <Check size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingCaption(false)}
                className="h-8 w-8 text-muted-foreground rounded-none flex-shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <div
              className="group flex items-center gap-2 cursor-pointer"
              onClick={() => setEditingCaption(true)}
            >
              {photo.caption ? (
                <span className="font-mono text-sm truncate">{photo.caption}</span>
              ) : (
                <span className="font-mono text-sm text-muted-foreground italic">Sem legenda</span>
              )}
              <Edit2 size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </div>
          )}
          <p className="font-mono text-xs text-muted-foreground truncate mt-0.5 max-w-xs">
            {photo.url}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(photo.id)}
          className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-none flex-shrink-0"
        >
          <Trash2 size={20} />
        </Button>
      </CardContent>
    </Card>
  );
}

type AddMode = "upload" | "url";

export default function DashboardPhotos() {
  const { data: photos, isLoading } = useGetMyPhotos();
  const createPhoto = useCreatePhoto();
  const deletePhoto = useDeletePhoto();
  const updatePhoto = useUpdatePhoto();
  const reorderPhotos = useReorderPhotos();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Sync server data → local state for DnD
  if (photos && items.length === 0 && photos.length > 0) {
    setItems(photos);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const resetDialog = () => {
    setUrlInput("");
    setCaptionInput("");
    setUploadPreview(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const savePhoto = (url: string) => {
    createPhoto.mutate(
      { data: { url, caption: captionInput.trim() || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyPhotosQueryKey() });
          setItems([]);
          setDialogOpen(false);
          resetDialog();
          toast({ title: "Foto adicionada!" });
        },
        onError: () => {
          toast({ title: "Erro ao salvar foto.", variant: "destructive" });
        },
      },
    );
  };

  // ── URL mode ──
  const handleAddByUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    savePhoto(url);
  };

  // ── Upload mode ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande (máximo 10 MB)", variant: "destructive" });
      return;
    }

    // Preview local imediato
    const localUrl = URL.createObjectURL(file);
    setUploadPreview(localUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Erro no upload" }));
        const errorMsg = errData.error || "Erro no upload";
        console.error("Upload error:", errorMsg);
        toast({
          title: "Erro no upload",
          description: errorMsg,
          variant: "destructive",
        });
        setIsUploading(false);
        setUploadPreview(null);
        return;
      }

      const data = await res.json();
      const { url } = data;
      if (!url) {
        toast({ title: "Erro: servidor não retornou URL", variant: "destructive" });
        setIsUploading(false);
        setUploadPreview(null);
        return;
      }

      URL.revokeObjectURL(localUrl);
      savePhoto(url);
    } catch (e: any) {
      console.error("Upload exception:", e);
      toast({
        title: "Falha na conexão",
        description: e?.message || "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadPreview(null);
    }
  };

  const handleEditCaption = (id: string, caption: string) => {
    updatePhoto.mutate(
      { id, data: { caption: caption || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyPhotosQueryKey() });
          setItems([]);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deletePhoto.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyPhotosQueryKey() });
          setItems((prev) => prev.filter((i) => i.id !== id));
          toast({ title: "Foto removida." });
        },
      },
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((current) => {
        const oldIndex = current.findIndex((i) => i.id === active.id);
        const newIndex = current.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(current, oldIndex, newIndex);
        reorderPhotos.mutate({ data: { ids: reordered.map((i) => i.id) } });
        return reordered;
      });
    }
  };

  if (isLoading)
    return <div className="text-muted-foreground font-mono animate-pulse">Loading gallery...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Photos</h1>
          <p className="text-muted-foreground mt-2 font-mono">Curate your visual identity.</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold gap-2"
        >
          <Plus size={14} />
          Add Photo
        </Button>
      </div>

      <div className="space-y-4">
        {!photos || photos.length === 0 ? (
          <div className="p-12 border border-border text-center text-muted-foreground font-mono">
            Sua galeria está vazia. Adicione fotos pelo link de imagem.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((photo) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  onDelete={handleDelete}
                  onEditCaption={handleEditCaption}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Photo Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) resetDialog();
          setDialogOpen(open);
        }}
      >
        <DialogContent className="rounded-none bg-black border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tighter">Adicionar Foto</DialogTitle>
          </DialogHeader>

          {/* Tabs: Upload / URL */}
          <div className="flex border-b border-border mt-2">
            <button
              onClick={() => setAddMode("upload")}
              className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors border-b-2 -mb-px ${
                addMode === "upload"
                  ? "border-white text-white"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              <Upload size={13} />
              Upload
            </button>
            <button
              onClick={() => setAddMode("url")}
              className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold transition-colors border-b-2 -mb-px ${
                addMode === "url"
                  ? "border-white text-white"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              <Link2 size={13} />
              Por URL
            </button>
          </div>

          <div className="space-y-4 mt-4">
            {addMode === "upload" ? (
              /* ── Upload ── */
              <>
                {/* Drop zone */}
                <div
                  className="relative border-2 border-dashed border-white/20 hover:border-white/50 transition-colors cursor-pointer rounded-none"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />

                  {uploadPreview ? (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-white" size={28} />
                          <span className="text-xs uppercase tracking-widest text-white/80">Enviando...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                      <Upload size={32} strokeWidth={1.5} />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-white">
                          Clique para selecionar
                        </p>
                        <p className="text-xs mt-1">JPG, PNG, WEBP até 10 MB</p>
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                          Se receber erro de storage, certifique-se que o bucket <code className="bg-white/5 px-1">linkhub</code> foi criado no Supabase (Storage → New bucket → Public)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Legenda (opcional)
                  </label>
                  <Input
                    value={captionInput}
                    onChange={(e) => setCaptionInput(e.target.value)}
                    placeholder="Ex: Show em São Paulo 2024"
                    className="rounded-none bg-black border-border"
                    disabled={isUploading}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => { setDialogOpen(false); resetDialog(); }}
                  className="w-full rounded-none uppercase tracking-widest text-xs font-bold"
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              /* ── URL ── */
              <>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    URL da Imagem *
                  </label>
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="rounded-none bg-black border-border font-mono text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAddByUrl()}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole o link direto de qualquer imagem (Imgur, Google Fotos, etc.)
                  </p>
                </div>

                {urlInput.trim() && (
                  <div className="w-full aspect-video bg-white/5 border border-white/10 overflow-hidden relative">
                    <img
                      src={urlInput.trim()}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Legenda (opcional)
                  </label>
                  <Input
                    value={captionInput}
                    onChange={(e) => setCaptionInput(e.target.value)}
                    placeholder="Ex: Show em São Paulo 2024"
                    className="rounded-none bg-black border-border"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddByUrl}
                    disabled={!urlInput.trim() || createPhoto.isPending}
                    className="flex-1 rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
                  >
                    {createPhoto.isPending ? "Adicionando..." : "Adicionar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setDialogOpen(false); resetDialog(); }}
                    className="rounded-none uppercase tracking-widest text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
