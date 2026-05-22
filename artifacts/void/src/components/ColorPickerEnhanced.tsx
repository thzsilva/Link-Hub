import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ColorPickerEnhancedProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  suggestedColors?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#6C5CE7",
  "#A29BFE",
  "#74B9FF",
];

export function ColorPickerEnhanced({
  label,
  value,
  onChange,
  suggestedColors = DEFAULT_SUGGESTIONS,
}: ColorPickerEnhancedProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>

      {/* Picker Input */}
      <div className="flex gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex-1 flex items-center border-2 border-border rounded-lg overflow-hidden bg-white/5"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 cursor-pointer border-0"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="rounded-none border-0 font-mono text-sm flex-1"
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            {copied ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Copy size={16} />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Suggested Colors */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Cores sugeridas:</p>
        <div className="grid grid-cols-4 gap-2">
          {suggestedColors.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(color)}
              className={`w-full h-10 rounded-lg border-2 transition-all ${
                value.toUpperCase() === color.toUpperCase()
                  ? "border-white"
                  : "border-border hover:border-white/50"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
