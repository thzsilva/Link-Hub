import { motion } from "framer-motion";
import { Theme, ThemeId } from "@/lib/themes";

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemePreview({
  theme,
  isSelected,
  onClick,
}: ThemePreviewProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full p-4 rounded-lg border-2 transition-all overflow-hidden group ${
        isSelected
          ? "border-white bg-white/10"
          : "border-white/20 hover:border-white/40"
      }`}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-left">
        <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">
          {theme.name}
        </p>

        {/* Color swatches */}
        <div className="flex gap-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-white/30"
            style={{ backgroundColor: theme.primary }}
            title="Primary"
          />
          <div
            className="w-6 h-6 rounded-full border-2 border-white/30"
            style={{ backgroundColor: theme.secondary }}
            title="Secondary"
          />
          <div
            className="w-6 h-6 rounded-full border-2 border-white/30"
            style={{ backgroundColor: theme.accent }}
            title="Accent"
          />
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          layoutId="selected-indicator"
          className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}

      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        style={{ pointerEvents: "none" }}
      />
    </motion.button>
  );
}
