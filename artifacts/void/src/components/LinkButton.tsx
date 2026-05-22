import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface LinkButtonProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  accentColor: string;
  secondaryColor: string;
  backgroundColor: string;
  onClick: () => void;
}

export function LinkButton({
  icon,
  title,
  description,
  accentColor,
  secondaryColor,
  backgroundColor,
  onClick,
}: LinkButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left group relative overflow-hidden rounded-lg border-2 p-4 transition-all"
      style={{
        borderColor: accentColor,
        backgroundColor: backgroundColor,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          secondaryColor + "40";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = backgroundColor;
      }}
    >
      {/* Background shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}20, transparent)` }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
      />

      {/* Content container */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg"
          style={{
            backgroundColor: accentColor + "20",
            color: accentColor,
          }}
        >
          {icon}
        </motion.div>

        {/* Text */}
        <div className="flex-1">
          <p className="font-bold text-sm text-white">{title}</p>
          {description && (
            <p className="text-xs opacity-70 text-white">{description}</p>
          )}
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={16} className="text-white" />
        </motion.div>
      </div>

      {/* Click ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: accentColor,
          opacity: 0,
        }}
        whileTap={{
          opacity: [0.3, 0],
          scale: [1, 1.5],
        }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
}
