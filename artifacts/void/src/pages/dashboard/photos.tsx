import { useState } from "react";
import { useGetMyPhotos, useCreatePhoto, useDeletePhoto, getGetMyPhotosQueryKey, useReorderPhotos } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@workspace/object-storage-web";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, GripVertical, Trash2 } from "lucide-react";

function SortablePhoto({ photo, onDelete }: { photo: any, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={`rounded-none bg-black border-border ${isDragging ? 'opacity-50' : ''}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <button {...attributes} {...listeners} className="cursor-grab hover:text-white text-muted-foreground p-2">
          <GripVertical size={20} />
        </button>
        <div className="w-16 h-16 bg-white/5 border border-white/10 relative overflow-hidden flex-shrink-0">
          <img src={photo.url} alt={photo.caption || "Photo"} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="flex-1 font-mono text-sm">
          {photo.caption || <span className="text-muted-foreground italic">No caption</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDelete(photo.id)} className="text-muted-foreground hover:text-red-500 rounded-none">
          <Trash2 size={20} />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPhotos() {
  const { data: photos, isLoading } = useGetMyPhotos();
  const createPhoto = useCreatePhoto();
  const deletePhoto = useDeletePhoto();
  const reorderPhotos = useReorderPhotos();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<any[]>([]);

  // Update local state when query data changes
  if (photos && items.length === 0 && photos.length > 0) {
    setItems(photos);
  }

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      createPhoto.mutate({
        data: {
          url: `/api/storage${response.objectPath}`,
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyPhotosQueryKey() });
          setItems([]); // Trigger re-sync
        }
      });
    }
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });
      const { uploadURL } = await res.json();
      
      // Upload directly to GCS via presigned URL
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      // Save metadata
      createPhoto.mutate({
        data: {
          url: `/api/storage/objects/uploads/${file.name}`, // In real app, get the path from the response if possible, or parse uploadURL
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyPhotosQueryKey() });
          setItems([]);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        reorderPhotos.mutate({
          data: {
            ids: newItems.map(i => i.id)
          }
        });
        
        return newItems;
      });
    }
  };

  const handleDelete = (id: string) => {
    deletePhoto.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyPhotosQueryKey() });
        setItems(items.filter(i => i.id !== id));
      }
    });
  };

  if (isLoading) return <div className="text-muted-foreground font-mono animate-pulse">Loading gallery...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Photos</h1>
          <p className="text-muted-foreground mt-2 font-mono">Curate your visual identity.</p>
        </div>
        <div className="relative">
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button disabled={isUploading} className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold pointer-events-none">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Upload Photo
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {(!photos || photos.length === 0) ? (
          <div className="p-12 border border-border text-center text-muted-foreground font-mono">
            Your gallery is empty. Upload some photos.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((photo) => (
                <SortablePhoto key={photo.id} photo={photo} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
