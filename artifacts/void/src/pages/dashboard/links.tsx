import { useState, useEffect } from "react";
import {
  useGetMyLinks,
  useCreateLink,
  useDeleteLink,
  getGetMyLinksQueryKey,
  useReorderLinks,
  useUpdateLink,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit2, Check, X, Plus, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  PLATFORMS, detectPlatform, getPlatform, toSpotifyEmbedUrl,
  type PlatformId,
} from "@/lib/platforms";

// ---------------------------------------------------------------------------
// Icon Picker
// ---------------------------------------------------------------------------

function PlatformPicker({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (id: PlatformId) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = getPlatform(value);

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">Ícone da plataforma</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-border bg-black hover:border-white/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 flex items-center justify-center rounded-sm flex-shrink-0"
            style={{ backgroundColor: current.bgColor }}
          >
            <current.Icon size={14} style={{ color: current.color }} />
          </span>
          <span className="text-sm font-mono">{current.name}</span>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid grid-cols-4 gap-1.5 p-3 border border-border bg-black/95 max-h-56 overflow-y-auto">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.name}
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={`flex flex-col items-center gap-1 p-2 rounded-sm transition-colors hover:bg-white/10 ${
                value === p.id ? "ring-1 ring-white" : ""
              }`}
            >
              <span
                className="w-8 h-8 flex items-center justify-center rounded-sm"
                style={{ backgroundColor: p.bgColor }}
              >
                <p.Icon size={18} style={{ color: p.color }} />
              </span>
              <span className="text-[9px] text-muted-foreground truncate w-full text-center leading-tight">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable Link Row
// ---------------------------------------------------------------------------

function SortableLink({
  link,
  onDelete,
  onUpdate,
}: {
  link: any;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: link.title,
    url: link.url,
    icon: link.icon ?? null,
    isVisible: link.isVisible,
  });

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
  const platform = getPlatform(link.icon);
  const isSpotify = link.icon === "spotify" || link.cardType === "spotify";

  // Auto-detect icon when URL changes
  useEffect(() => {
    if (isEditing && editData.url && !editData.icon) {
      const detected = detectPlatform(editData.url);
      if (detected) setEditData((d) => ({ ...d, icon: detected.id }));
    }
  }, [editData.url]);

  const handleSave = () => {
    onUpdate(link.id, editData);
    setIsEditing(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`rounded-none bg-black border-border ${isDragging ? "opacity-50" : ""}`}
    >
      {isEditing ? (
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Título"
                className="h-9 rounded-none bg-black border-border font-bold"
              />
              <Input
                value={editData.url}
                onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                placeholder="https://..."
                className="h-9 rounded-none bg-black border-border font-mono text-sm"
              />
            </div>
          </div>

          <PlatformPicker
            value={editData.icon}
            onChange={(id) => setEditData({ ...editData, icon: id })}
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Visível</span>
              <Switch
                checked={editData.isVisible}
                onCheckedChange={(v) => setEditData({ ...editData, isVisible: v })}
                className="data-[state=checked]:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSave} className="text-green-500 hover:text-green-400 rounded-none gap-1">
                <Check size={14} /> Salvar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsEditing(false); setEditData({ title: link.title, url: link.url, icon: link.icon ?? null, isVisible: link.isVisible }); }}
                className="text-muted-foreground hover:text-white rounded-none gap-1"
              >
                <X size={14} /> Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-3 flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab hover:text-white text-muted-foreground p-1.5 flex-shrink-0">
            <GripVertical size={18} />
          </button>

          {/* Icon */}
          <div
            className="w-9 h-9 flex items-center justify-center rounded-sm flex-shrink-0"
            style={{ backgroundColor: platform.bgColor }}
          >
            <platform.Icon size={18} style={{ color: platform.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold truncate">{link.title}</h3>
              {isSpotify && (
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 border flex-shrink-0"
                  style={{ color: "#1DB954", borderColor: "#1DB954" + "40" }}>
                  embed
                </span>
              )}
              {!link.isVisible && (
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground border border-white/20 px-1.5 py-0.5 flex-shrink-0">
                  oculto
                </span>
              )}
            </div>
            <p className="text-muted-foreground font-mono text-xs truncate">{link.url}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Switch
              checked={link.isVisible}
              onCheckedChange={(checked) => onUpdate(link.id, { isVisible: checked })}
              className="data-[state=checked]:bg-white scale-75"
            />
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-white rounded-none w-8 h-8">
              <Edit2 size={15} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)} className="text-muted-foreground hover:text-red-500 rounded-none w-8 h-8">
              <Trash2 size={15} />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Add Link Dialog
// ---------------------------------------------------------------------------

function AddLinkDialog({
  open,
  onClose,
  onCreate,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; url: string; icon: string | null; cardType: string }) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<PlatformId | null>(null);

  // Auto-detect platform when url changes
  useEffect(() => {
    const detected = detectPlatform(url);
    if (detected && detected.id !== "none") {
      setIcon(detected.id);
      if (!title) setTitle(detected.name);
    }
  }, [url]);

  const handleSubmit = () => {
    if (!url.trim()) return;
    const isSpotify = icon === "spotify";
    onCreate({
      title: title.trim() || getPlatform(icon).name,
      url: url.trim(),
      icon: icon,
      cardType: isSpotify ? "spotify" : "default",
    });
  };

  const reset = () => {
    setTitle("");
    setUrl("");
    setIcon(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="rounded-none bg-black border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tighter">Novo Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">URL *</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-none bg-black border-border font-mono text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <p className="text-xs text-muted-foreground">Cole a URL — a plataforma é detectada automaticamente</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Título (opcional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Meu Spotify, Portfólio..."
              className="rounded-none bg-black border-border"
            />
          </div>

          <PlatformPicker value={icon} onChange={setIcon} />

          {/* Spotify preview */}
          {icon === "spotify" && url && toSpotifyEmbedUrl(url) && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Preview do embed</p>
              <iframe
                src={toSpotifyEmbedUrl(url)!}
                width="100%"
                height="100"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="border-0"
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={!url.trim() || isPending}
              className="flex-1 rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
            >
              {isPending ? "Criando..." : "Adicionar"}
            </Button>
            <Button variant="outline" onClick={() => { reset(); onClose(); }} className="rounded-none uppercase tracking-widest text-xs font-bold">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DashboardLinks() {
  const { data: links, isLoading } = useGetMyLinks();
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();
  const updateLink = useUpdateLink();
  const reorderLinks = useReorderLinks();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  if (links && items.length === 0 && links.length > 0) setItems(links);

  const handleCreate = (data: { title: string; url: string; icon: string | null; cardType: string }) => {
    createLink.mutate(
      { data: { title: data.title, url: data.url, icon: data.icon ?? undefined, cardType: data.cardType, isVisible: true } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() });
          setItems([]);
          setAddOpen(false);
          toast({ title: "Link adicionado!" });
        },
      },
    );
  };

  const handleUpdate = (id: string, data: any) => {
    updateLink.mutate({ id, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() });
        setItems([]);
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteLink.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() });
        setItems((p) => p.filter((i) => i.id !== id));
      },
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((cur) => {
        const o = cur.findIndex((i) => i.id === active.id);
        const n = cur.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(cur, o, n);
        reorderLinks.mutate({ data: { ids: reordered.map((i) => i.id) } });
        return reordered;
      });
    }
  };

  if (isLoading) return <div className="text-muted-foreground font-mono animate-pulse">Loading links...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Links</h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">Gerencie seus blocos de conteúdo.</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold gap-2"
        >
          <Plus size={14} />
          Novo Link
        </Button>
      </div>

      {/* Platform quick-add shortcuts */}
      <div className="flex flex-wrap gap-2">
        {["spotify", "instagram", "youtube", "tiktok", "twitter", "whatsapp"].map((id) => {
          const p = getPlatform(id);
          return (
            <button
              key={id}
              onClick={() => setAddOpen(true)}
              title={`Adicionar ${p.name}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-white/10 hover:border-white/40 transition-colors text-xs uppercase tracking-widest font-bold"
              style={{ color: p.color }}
            >
              <p.Icon size={13} />
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {!links || links.length === 0 ? (
          <div className="p-12 border border-border text-center text-muted-foreground font-mono">
            Nenhum link ainda. Clique em "Novo Link" para começar.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((link) => (
                <SortableLink key={link.id} link={link} onDelete={handleDelete} onUpdate={handleUpdate} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AddLinkDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={handleCreate}
        isPending={createLink.isPending}
      />
    </div>
  );
}
