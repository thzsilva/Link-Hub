import {
  SiSpotify, SiInstagram, SiYoutube, SiTiktok, SiFacebook,
  SiTwitch, SiGithub, SiWhatsapp, SiTelegram,
  SiSoundcloud, SiX, SiApplemusic, SiPinterest, SiDiscord,
  SiPatreon, SiKick,
} from "react-icons/si";
import { Globe, Mail, Phone, Music2, ShoppingBag, Play, Linkedin } from "lucide-react";
import type { FC } from "react";

export type PlatformId =
  | "spotify" | "instagram" | "youtube" | "tiktok" | "twitter"
  | "facebook" | "twitch" | "linkedin" | "github" | "whatsapp"
  | "telegram" | "soundcloud" | "applemusic" | "pinterest"
  | "discord" | "patreon" | "kick" | "music"
  | "website" | "email" | "phone" | "shop" | "video" | "none";

export interface Platform {
  id: PlatformId;
  name: string;
  color: string;
  bgColor: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: FC<any>;
  /** URL patterns to auto-detect */
  patterns?: RegExp[];
}

export const PLATFORMS: Platform[] = [
  {
    id: "spotify",
    name: "Spotify",
    color: "#1DB954",
    bgColor: "#0d3320",
    Icon: SiSpotify,
    patterns: [/spotify\.com/, /spotify\.link/],
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "#E1306C",
    bgColor: "#3d0c1f",
    Icon: SiInstagram,
    patterns: [/instagram\.com/, /instagr\.am/],
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    bgColor: "#3d0000",
    Icon: SiYoutube,
    patterns: [/youtube\.com/, /youtu\.be/],
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "#69C9D0",
    bgColor: "#0a2426",
    Icon: SiTiktok,
    patterns: [/tiktok\.com/],
  },
  {
    id: "twitter",
    name: "X / Twitter",
    color: "#FFFFFF",
    bgColor: "#111111",
    Icon: SiX,
    patterns: [/twitter\.com/, /x\.com/],
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    bgColor: "#081e40",
    Icon: SiFacebook,
    patterns: [/facebook\.com/, /fb\.me/, /fb\.com/],
  },
  {
    id: "twitch",
    name: "Twitch",
    color: "#9146FF",
    bgColor: "#1f0d40",
    Icon: SiTwitch,
    patterns: [/twitch\.tv/],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    bgColor: "#051a33",
    Icon: Linkedin,
    patterns: [/linkedin\.com/],
  },
  {
    id: "github",
    name: "GitHub",
    color: "#FFFFFF",
    bgColor: "#0d1117",
    Icon: SiGithub,
    patterns: [/github\.com/],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    color: "#25D366",
    bgColor: "#0a2e1a",
    Icon: SiWhatsapp,
    patterns: [/whatsapp\.com/, /wa\.me/],
  },
  {
    id: "telegram",
    name: "Telegram",
    color: "#26A5E4",
    bgColor: "#052a40",
    Icon: SiTelegram,
    patterns: [/t\.me/, /telegram\.me/, /telegram\.org/],
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    color: "#FF5500",
    bgColor: "#3d1500",
    Icon: SiSoundcloud,
    patterns: [/soundcloud\.com/],
  },
  {
    id: "applemusic",
    name: "Apple Music",
    color: "#FC3C44",
    bgColor: "#3d0a0e",
    Icon: SiApplemusic,
    patterns: [/music\.apple\.com/],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    color: "#E60023",
    bgColor: "#3d0009",
    Icon: SiPinterest,
    patterns: [/pinterest\.com/, /pin\.it/],
  },
  {
    id: "discord",
    name: "Discord",
    color: "#5865F2",
    bgColor: "#0f1240",
    Icon: SiDiscord,
    patterns: [/discord\.gg/, /discord\.com/],
  },
  {
    id: "patreon",
    name: "Patreon",
    color: "#FF424D",
    bgColor: "#3d0c10",
    Icon: SiPatreon,
    patterns: [/patreon\.com/],
  },
  {
    id: "kick",
    name: "Kick",
    color: "#53FC18",
    bgColor: "#0c2e06",
    Icon: SiKick,
    patterns: [/kick\.com/],
  },
  {
    id: "music",
    name: "Música",
    color: "#A78BFA",
    bgColor: "#1e0940",
    Icon: Music2,
  },
  {
    id: "shop",
    name: "Loja",
    color: "#F59E0B",
    bgColor: "#3d2200",
    Icon: ShoppingBag,
  },
  {
    id: "video",
    name: "Vídeo",
    color: "#F87171",
    bgColor: "#3d0e0e",
    Icon: Play,
  },
  {
    id: "email",
    name: "E-mail",
    color: "#94A3B8",
    bgColor: "#1a2030",
    Icon: Mail,
    patterns: [/^mailto:/],
  },
  {
    id: "phone",
    name: "Telefone",
    color: "#4ADE80",
    bgColor: "#0c2e1a",
    Icon: Phone,
    patterns: [/^tel:/],
  },
  {
    id: "website",
    name: "Website",
    color: "#94A3B8",
    bgColor: "#1a2030",
    Icon: Globe,
  },
  {
    id: "none",
    name: "Sem ícone",
    color: "#555555",
    bgColor: "#111111",
    Icon: Globe,
  },
];

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p])) as Record<PlatformId, Platform>;

/** Auto-detect platform from URL */
export function detectPlatform(url: string): Platform | undefined {
  if (!url) return undefined;
  return PLATFORMS.find(
    (p) => p.patterns?.some((re) => re.test(url)),
  );
}

/** Get platform by id, fallback to website */
export function getPlatform(id: string | null | undefined): Platform {
  if (!id) return PLATFORM_MAP["website"];
  return PLATFORM_MAP[id as PlatformId] ?? PLATFORM_MAP["website"];
}

/** Convert any Spotify URL to embed URL */
export function toSpotifyEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    // Handles locale prefixes like /intl-pt/track/xxx
    const match = u.pathname.match(/\/(track|playlist|album|artist|episode|show)\/([A-Za-z0-9]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}
