import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2, Plus, CalendarDays, MapPin, ExternalLink, ImageIcon, Upload, Link2, Loader2, GripVertical, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageCropModal from "@/components/ImageCropModal";
import { uploadImage } from "@/lib/api-base";
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

const EVENTS_KEY = ["/api/events"];
const MONETIZATION_KEY = ["/api/dashboard/monetization"];

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  ticketUrl?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  isVisible: boolean;
  position: number;
  createdAt: string;
};

type EventFormData = {
  title: string;
  description: string;
  eventDate: string;
  street: string;
  city: string;
  state: string;
  ticketUrl: string;
  imageUrl: string;
  price: string;
  isVisible: boolean;
};

const emptyForm: EventFormData = {
  title: "",
  description: "",
  eventDate: "",
  street: "",
  city: "",
  state: "",
  ticketUrl: "",
  imageUrl: "",
  price: "",
  isVisible: true,
};

function formatCurrency(value: number | string | null | undefined): string {
  if (value == null || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatEventDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dateStr; }
}

function toInputDatetime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
}

// ---------------------------------------------------------------------------
// Image picker subcomponent (URL + upload)
// ---------------------------------------------------------------------------

type ImageMode = "upload" | "url";

function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [mode, setMode] = useState<ImageMode>(value ? "url" : "upload");
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setPendingFile(file);
    setCropImageSrc(local);
    setShowCropModal(true);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    setShowCropModal(false);
    setIsUploading(true);

    try {
      // Convert blob URL to fetch-able resource
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      const url = await uploadImage(blob, "event-image.jpg");

      // Update preview and parent
      setPreview(url);
      setUrlInput(url);
      onChange(url);
      toast({ title: "✓ Imagem do evento salva!" });
    } catch (error: any) {
      console.error("Erro ao processar imagem:", error);
      toast({
        title: error?.message || "Falha no upload. Tente novamente.",
        variant: "destructive"
      });
      setPreview(value || null);
    } finally {
      setIsUploading(false);
      setPendingFile(null);
      setCropImageSrc("");
      // Revoke the blob URL to free memory
      if (cropImageSrc) {
        URL.revokeObjectURL(cropImageSrc);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">Imagem do Evento</label>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["upload", "url"] as ImageMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold border-b-2 -mb-px transition-colors ${
              mode === m ? "border-white text-white" : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            {m === "upload" ? <Upload size={11} /> : <Link2 size={11} />}
            {m === "upload" ? "Upload" : "URL"}
          </button>
        ))}
        {(preview || value) && (
          <button
            type="button"
            onClick={() => { setPreview(null); setUrlInput(""); onChange(""); }}
            className="ml-auto px-3 py-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
          >
            Remover
          </button>
        )}
      </div>

      {mode === "upload" ? (
        <div
          className="relative border border-dashed border-white/20 hover:border-white/50 transition-colors cursor-pointer rounded-lg"
          onClick={() => !isUploading && !showCropModal && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading || showCropModal}
          />
          {preview ? (
            <div className="relative h-32 overflow-hidden rounded-lg">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              {(isUploading || showCropModal) && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-white" size={20} />
                  <span className="text-xs text-white/80 uppercase tracking-widest text-center px-2">
                    {showCropModal ? "Ajustando..." : "Enviando..."}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Upload size={20} strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-widest">Clique para selecionar</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setPreview(e.target.value || null); onChange(e.target.value); }}
            placeholder="https://..."
            className="rounded-none bg-black border-border font-mono text-sm"
          />
          {urlInput && (
            <div className="h-24 border border-white/10 overflow-hidden relative">
              <img
                src={urlInput}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
              />
            </div>
          )}
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCrop={handleCropComplete}
          onClose={() => {
            setShowCropModal(false);
            setCropImageSrc("");
            setPendingFile(null);
            URL.revokeObjectURL(cropImageSrc);
          }}
          aspectRatio={16 / 9}
          title="Ajustar Imagem do Evento"
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable event card (drag-and-drop)
// ---------------------------------------------------------------------------

function SortableEventCard({
  event,
  onToggleVisibility,
  onEdit,
  onDelete,
}: {
  event: EventItem;
  onToggleVisibility: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`rounded-none bg-black border-border overflow-hidden ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:text-white text-muted-foreground px-3 flex items-center flex-shrink-0 touch-none"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical size={20} />
        </button>

        {/* Image thumbnail */}
        {event.imageUrl && (
          <div className="w-24 md:w-32 flex-shrink-0 relative">
            <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-4 flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base leading-tight">{event.title}</h3>
              {!event.isVisible && (
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-1 py-0.5">Oculto</span>
              )}
            </div>
            {event.eventDate && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                <CalendarDays size={11} /> {formatEventDate(event.eventDate)}
              </div>
            )}
            {(event.street || event.city || event.state) && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                <MapPin size={11} />
                {[event.street, event.city && `${event.city}${event.state ? ` - ${event.state}` : ""}`].filter(Boolean).join(", ")}
              </div>
            )}
            {event.price != null && (
              <div className="flex items-center gap-1.5 text-green-400/80 text-xs font-mono">
                <DollarSign size={11} /> {formatCurrency(event.price)}
              </div>
            )}
            {event.description && (
              <p className="text-muted-foreground text-xs font-mono truncate">{event.description}</p>
            )}
            {event.ticketUrl && (
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50 hover:text-white">
                <ExternalLink size={10} /> Ingressos
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Switch checked={event.isVisible} onCheckedChange={() => onToggleVisibility(event)} className="data-[state=checked]:bg-white scale-75" />
            <Button variant="ghost" size="icon" onClick={() => onEdit(event)} className="text-muted-foreground hover:text-white rounded-none w-8 h-8">
              <Edit2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)} className="text-muted-foreground hover:text-red-500 rounded-none w-8 h-8">
              <Trash2 size={14} />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DashboardEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventFormData>(emptyForm);

  const { data: events, isLoading, error } = useQuery<EventItem[]>({
    queryKey: EVENTS_KEY,
    queryFn: async () => {
      return await customFetch<EventItem[]>("/api/events");
    },
  });

  // Local list for drag-and-drop ordering
  const [items, setItems] = useState<EventItem[]>([]);

  // Keep local list in sync with server data
  useEffect(() => {
    if (events) setItems(events);
  }, [events]);

  // Histórico de localização: valores únicos já usados (para sugerir/autocompletar)
  const uniq = (vals: (string | null | undefined)[]) =>
    Array.from(new Set(vals.map((v) => (v || "").trim()).filter(Boolean)));
  const pastStreets = uniq((events ?? []).map((e) => e.street));
  const pastCities = uniq((events ?? []).map((e) => e.city));
  const pastStates = uniq((events ?? []).map((e) => e.state));
  // Último evento que tem algum dado de localização
  const lastLocation = (events ?? []).find((e) => e.street || e.city || e.state);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reorderEvents = useMutation({
    mutationFn: (ids: string[]) =>
      customFetch("/api/events/reorder", {
        method: "PUT",
        body: JSON.stringify({ ids }),
      }),
    onError: (e: any) => {
      toast({ title: e.message || "Erro ao reordenar", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      const reordered = arrayMove(current, oldIndex, newIndex);
      reorderEvents.mutate(reordered.map((i) => i.id));
      return reordered;
    });
  };

  const createEvent = useMutation({
    mutationFn: (data: EventFormData) =>
      customFetch("/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : null,
          street: data.street || null,
          city: data.city || null,
          state: data.state || null,
          ticketUrl: data.ticketUrl || null,
          imageUrl: data.imageUrl || null,
          price: data.price ? parseFloat(data.price) : null,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
      queryClient.invalidateQueries({ queryKey: MONETIZATION_KEY });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "Evento criado!" });
    },
    onError: (e: any) => toast({ title: e.message || "Erro ao criar evento", variant: "destructive" }),
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData> }) => {
      const body: any = {};
      if (data.title !== undefined) body.title = data.title;
      if (data.description !== undefined) body.description = data.description || null;
      if (data.eventDate !== undefined) body.eventDate = data.eventDate ? new Date(data.eventDate).toISOString() : null;
      if (data.street !== undefined) body.street = data.street || null;
      if (data.city !== undefined) body.city = data.city || null;
      if (data.state !== undefined) body.state = data.state || null;
      if (data.ticketUrl !== undefined) body.ticketUrl = data.ticketUrl || null;
      if (data.imageUrl !== undefined) body.imageUrl = data.imageUrl || null;
      if (data.price !== undefined) body.price = data.price ? parseFloat(data.price) : null;
      if (data.isVisible !== undefined) body.isVisible = data.isVisible;

      return customFetch(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
      queryClient.invalidateQueries({ queryKey: MONETIZATION_KEY });
      setDialogOpen(false);
      setEditingEvent(null);
      setForm(emptyForm);
      toast({ title: "Evento atualizado!" });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => customFetch(`/api/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
      queryClient.invalidateQueries({ queryKey: MONETIZATION_KEY });
      toast({ title: "Evento removido." });
    },
  });

  const toggleVisibility = (event: EventItem) => {
    updateEvent.mutate({ id: event.id, data: { isVisible: !event.isVisible } });
  };

  const openCreate = () => { setEditingEvent(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (event: EventItem) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description ?? "",
      eventDate: toInputDatetime(event.eventDate),
      street: event.street ?? "",
      city: event.city ?? "",
      state: event.state ?? "",
      ticketUrl: event.ticketUrl ?? "",
      imageUrl: event.imageUrl ?? "",
      price: event.price ? String(event.price) : "",
      isVisible: event.isVisible,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (editingEvent) updateEvent.mutate({ id: editingEvent.id, data: form });
    else createEvent.mutate(form);
  };

  if (isLoading) return <div className="text-muted-foreground font-mono animate-pulse">Loading events...</div>;

  if (error) {
    const msg = (error as Error).message;
    const isMissingTable = msg.toLowerCase().includes("tabela") || msg.toLowerCase().includes("does not exist") || msg.toLowerCase().includes("relation");
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Events</h1>
        <div className="p-6 border border-red-500/30 bg-red-500/5 text-sm font-mono space-y-2">
          <p className="text-red-400 font-bold uppercase tracking-widest text-xs">
            {isMissingTable ? "Migração necessária" : "Erro"}
          </p>
          <p className="text-muted-foreground">{msg}</p>
          {isMissingTable && (
            <>
              <p className="text-white/70 mt-2">Execute este SQL no <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Supabase SQL Editor</a>:</p>
              <pre className="bg-black/50 p-3 text-xs overflow-x-auto text-green-400 border border-white/10 mt-2">{`CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date timestamptz,
  street text,
  city text,
  state text,
  ticket_url text,
  image_url text,
  price decimal(10,2),
  position integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);`}</pre>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Events</h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">Shows, lançamentos e datas especiais.</p>
        </div>
        <Button onClick={openCreate} className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold gap-2">
          <Plus size={14} />
          Add Event
        </Button>
      </div>

      {items.length > 1 && (
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono -mt-4">
          Arraste pelo ícone <GripVertical size={11} className="inline -mt-0.5" /> para definir a ordem de exibição no perfil.
        </p>
      )}

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="p-12 border border-border text-center text-muted-foreground font-mono">
            Nenhum evento. Adicione shows, lançamentos ou datas especiais.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {items.map((event) => (
                  <SortableEventCard
                    key={event.id}
                    event={event}
                    onToggleVisibility={toggleVisibility}
                    onEdit={openEdit}
                    onDelete={(id) => deleteEvent.mutate(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-none bg-black border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tighter">
              {editingEvent ? "Editar Evento" : "Novo Evento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Título *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Show no CEFET" className="rounded-none bg-black border-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Data e Hora</label>
                <Input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="rounded-none bg-black border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Valor (R$)</label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="rounded-none bg-black border-border" />
              </div>
            </div>

            {/* Atalho: preencher com a última localização usada */}
            {lastLocation && (
              <button
                type="button"
                onClick={() => setForm({ ...form, street: lastLocation.street ?? "", city: lastLocation.city ?? "", state: lastLocation.state ?? "" })}
                className="text-[11px] uppercase tracking-widest text-white/50 hover:text-white border border-white/15 hover:border-white/40 rounded-none px-3 py-1.5 transition-colors"
              >
                ↺ Usar último local{lastLocation.city ? ` (${lastLocation.city})` : ""}
              </button>
            )}

            {/* datalists de histórico para autocompletar */}
            <datalist id="ev-streets">{pastStreets.map((s) => <option key={s} value={s} />)}</datalist>
            <datalist id="ev-cities">{pastCities.map((s) => <option key={s} value={s} />)}</datalist>
            <datalist id="ev-states">{pastStates.map((s) => <option key={s} value={s} />)}</datalist>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Rua</label>
              <Input list="ev-streets" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Rua Augusta, 123" className="rounded-none bg-black border-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Cidade</label>
                <Input list="ev-cities" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="São Paulo" className="rounded-none bg-black border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Estado</label>
                <Input list="ev-states" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="SP" className="rounded-none bg-black border-border" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Descrição</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição do evento" className="rounded-none bg-black border-border" />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Link de Ingressos</label>
              <Input value={form.ticketUrl} onChange={(e) => setForm({ ...form, ticketUrl: e.target.value })} placeholder="https://..." className="rounded-none bg-black border-border font-mono text-sm" />
            </div>

            {/* Image picker */}
            <ImagePicker
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />

            <div className="flex items-center justify-between py-1 border-t border-border">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Visível no perfil</span>
              <Switch checked={form.isVisible} onCheckedChange={(v) => setForm({ ...form, isVisible: v })} className="data-[state=checked]:bg-white" />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!form.title.trim() || createEvent.isPending || updateEvent.isPending}
                className="flex-1 rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
              >
                {editingEvent ? "Salvar" : "Criar Evento"}
              </Button>
              <Button variant="outline" onClick={() => { setDialogOpen(false); setForm(emptyForm); setEditingEvent(null); }} className="rounded-none uppercase tracking-widest text-xs font-bold">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
