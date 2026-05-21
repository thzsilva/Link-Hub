import { useState } from "react";
import { useGetMyLinks, useCreateLink, useDeleteLink, getGetMyLinksQueryKey, useReorderLinks, useUpdateLink } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function SortableLink({ link, onDelete, onUpdate }: { link: any, onDelete: (id: string) => void, onUpdate: (id: string, data: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: link.title, url: link.url, isVisible: link.isVisible });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const handleSave = () => {
    onUpdate(link.id, editData);
    setIsEditing(false);
  };

  return (
    <Card ref={setNodeRef} style={style} className={`rounded-none bg-black border-border ${isDragging ? 'opacity-50' : ''}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <button {...attributes} {...listeners} className="cursor-grab hover:text-white text-muted-foreground p-2">
          <GripVertical size={20} />
        </button>
        
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <Input 
                value={editData.title} 
                onChange={(e) => setEditData({...editData, title: e.target.value})} 
                className="h-8 rounded-none bg-black border-border font-bold" 
              />
              <Input 
                value={editData.url} 
                onChange={(e) => setEditData({...editData, url: e.target.value})} 
                className="h-8 rounded-none bg-black border-border font-mono text-sm" 
              />
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-lg">{link.title}</h3>
              <p className="text-muted-foreground font-mono text-sm truncate">{link.url}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-none">
                <Check size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {setIsEditing(false); setEditData({title: link.title, url: link.url, isVisible: link.isVisible})}} className="text-muted-foreground hover:text-white rounded-none">
                <X size={18} />
              </Button>
            </>
          ) : (
            <>
              <div className="mr-4 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Visible</span>
                <Switch 
                  checked={link.isVisible} 
                  onCheckedChange={(checked) => onUpdate(link.id, { isVisible: checked })} 
                  className="data-[state=checked]:bg-white"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-white rounded-none">
                <Edit2 size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-none">
                <Trash2 size={18} />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardLinks() {
  const { data: links, isLoading } = useGetMyLinks();
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();
  const updateLink = useUpdateLink();
  const reorderLinks = useReorderLinks();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<any[]>([]);

  // Sync state
  if (links && items.length === 0 && links.length > 0) {
    setItems(links);
  }

  const handleAddLink = () => {
    createLink.mutate({
      data: {
        title: "New Link",
        url: "https://",
        isVisible: true
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() });
        setItems([]);
      }
    });
  };

  const handleUpdate = (id: string, data: any) => {
    updateLink.mutate({
      id,
      data
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() });
        setItems([]);
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteLink.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() });
        setItems(items.filter(i => i.id !== id));
      }
    });
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
        
        reorderLinks.mutate({
          data: {
            ids: newItems.map(i => i.id)
          }
        });
        
        return newItems;
      });
    }
  };

  if (isLoading) return <div className="text-muted-foreground font-mono animate-pulse">Loading links...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Links</h1>
          <p className="text-muted-foreground mt-2 font-mono">Manage your content blocks.</p>
        </div>
        <Button onClick={handleAddLink} className="rounded-none bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold">
          Add Link
        </Button>
      </div>

      <div className="space-y-4">
        {(!links || links.length === 0) ? (
          <div className="p-12 border border-border text-center text-muted-foreground font-mono">
            No links yet. Create one to get started.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((link) => (
                <SortableLink key={link.id} link={link} onDelete={handleDelete} onUpdate={handleUpdate} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
