import { motion } from "framer-motion";
import { MoreVertical, Trash2, Copy } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LinkCardProps {
  id: string;
  title: string;
  url: string;
  clickCount?: number;
  onDelete?: (id: string) => void;
  onCopy?: (url: string) => void;
  onEdit?: (id: string) => void;
}

export function LinkCard({
  id,
  title,
  url,
  clickCount = 0,
  onDelete,
  onCopy,
  onEdit,
}: LinkCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group relative rounded-lg border-2 border-border bg-white/5 p-4 transition-all hover:border-white/40 hover:bg-white/10"
    >
      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-white mb-1 truncate">{title}</h3>
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      </div>

      {/* Clicks indicator */}
      {clickCount > 0 && (
        <div className="text-xs text-muted-foreground mt-3">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block"
          >
            🔗 {clickCount} {clickCount === 1 ? "click" : "clicks"}
          </motion.span>
        </div>
      )}

      {/* Menu */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black border-border">
            <DropdownMenuItem onClick={() => onEdit?.(id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopy?.(url)}>
              <Copy size={14} className="mr-2" />
              Copiar URL
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(id)}
              className="text-red-400"
            >
              <Trash2 size={14} className="mr-2" />
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
