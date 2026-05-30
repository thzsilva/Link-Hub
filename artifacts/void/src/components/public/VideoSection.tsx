import { motion } from "framer-motion";
import { detectAndGetEmbedUrl, getVideoIframeProps } from "@/lib/video-embed";

interface VideoSectionProps {
  videoUrl?: string;
  theme: {
    primary: string;
    secondary: string;
  };
}

export function VideoSection({ videoUrl, theme }: VideoSectionProps) {
  if (!videoUrl) return null;

  const videoSource = detectAndGetEmbedUrl(videoUrl);

  if (videoSource.type === "unknown") {
    return null;
  }

  const iframeProps = getVideoIframeProps(videoSource);

  return (
    <motion.section
      id="video-section"
      className="mb-16 sm:mb-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mb-6 sm:mb-8">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase"
          style={{ color: theme.primary }}
        >
          Sua História
        </h2>
        <motion.div
          className="h-1 mt-2"
          style={{ backgroundColor: theme.secondary }}
          initial={{ width: 0 }}
          whileInView={{ width: "40px" }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        />
      </div>

      <div className="space-y-4">
        {/* Video player container */}
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
          {videoSource.type === "mp4" ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
              controlsList="nodownload"
              poster=""
            />
          ) : (
            <iframe
              {...iframeProps}
              width="100%"
              height="100%"
              frameBorder="0"
              className="w-full h-full"
            />
          )}
        </div>

        {/* Informações do vídeo */}
        <p className="text-sm sm:text-base text-white/60 text-center">
          {videoSource.type === "youtube" && "Vídeo do YouTube"}
          {videoSource.type === "vimeo" && "Vídeo do Vimeo"}
          {videoSource.type === "mp4" && "Vídeo local"}
        </p>
      </div>
    </motion.section>
  );
}
