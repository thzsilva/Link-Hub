import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function ScaleOnHover({
  children,
  scale = 1.05,
  duration = 0.3,
  className = "",
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale - 0.02 }}
      transition={{ duration, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
