import { useState, useCallback } from "react";
import ReactEasyCrop, { Area } from "react-easy-crop";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onClose: () => void;
  aspectRatio?: number;
  title?: string;
}

export default function ImageCropModal({
  imageSrc,
  onCrop,
  onClose,
  aspectRatio = 4,
  title = "Ajustar Imagem",
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            onCrop(url);
            setIsProcessing(false);
            onClose();
          }
        }, "image/jpeg", 0.95);
      };
    } catch (error) {
      console.error("Erro ao fazer crop:", error);
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, onCrop, onClose]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-black border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 relative min-h-[300px] sm:min-h-[400px]">
          <ReactEasyCrop
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Zoom Control */}
        <div className="border-t border-white/10 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Zoom ({(zoom * 100).toFixed(0)}%)
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">-</span>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">+</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="ghost"
              className="rounded-lg text-muted-foreground hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={getCroppedImage}
              disabled={isProcessing}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {isProcessing ? "Processando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
