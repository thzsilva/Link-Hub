import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Icon com animação */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Icon size={32} className="text-muted-foreground" />
        </div>
      </motion.div>

      {/* Texto */}
      <h3 className="text-lg font-semibold text-white mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-sm text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Botão de ação */}
      {actionLabel && onAction && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onAction}
            className="bg-white text-black hover:bg-white/90 rounded-none"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
