export type LayoutColumns = 1 | 2 | 3;
export type ThemeId = "default" | "dark" | "sunset" | "ocean" | "forest" | "neon" | "vintage" | "minimal" | "bold" | "vibrant";

export interface Theme {
  id: ThemeId;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
  isDark: boolean;
}

export const THEMES: Record<ThemeId, Theme> = {
  default: {
    id: "default",
    name: "Default",
    primary: "#ffffff",
    secondary: "#000000",
    accent: "#1DB954",
    background: "#000000",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    isDark: true,
  },
  dark: {
    id: "dark",
    name: "Dark",
    primary: "#1a1a1a",
    secondary: "#ffffff",
    accent: "#6366f1",
    background: "#0f0f0f",
    text: "#ffffff",
    textMuted: "#888888",
    isDark: true,
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    primary: "#ff6b6b",
    secondary: "#ffd93d",
    accent: "#ff8787",
    background: "#1a1625",
    text: "#ffffff",
    textMuted: "#d4a5a5",
    isDark: true,
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    accent: "#0284c7",
    background: "#0f172a",
    text: "#ffffff",
    textMuted: "#94a3b8",
    isDark: true,
  },
  forest: {
    id: "forest",
    name: "Forest",
    primary: "#22c55e",
    secondary: "#84cc16",
    accent: "#16a34a",
    background: "#1a2e1a",
    text: "#ffffff",
    textMuted: "#a3e635",
    isDark: true,
  },
  neon: {
    id: "neon",
    name: "Neon",
    primary: "#ff00ff",
    secondary: "#00ffff",
    accent: "#ffff00",
    background: "#0a0e27",
    text: "#ffffff",
    textMuted: "#888888",
    isDark: true,
  },
  vintage: {
    id: "vintage",
    name: "Vintage",
    primary: "#d4a574",
    secondary: "#8b7355",
    accent: "#cd853f",
    background: "#2d2416",
    text: "#f5f5dc",
    textMuted: "#a0957e",
    isDark: true,
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    primary: "#ffffff",
    secondary: "#f0f0f0",
    accent: "#000000",
    background: "#fafafa",
    text: "#000000",
    textMuted: "#666666",
    isDark: false,
  },
  bold: {
    id: "bold",
    name: "Bold",
    primary: "#ff1744",
    secondary: "#d32f2f",
    accent: "#ff5252",
    background: "#121212",
    text: "#ffffff",
    textMuted: "#b0b0b0",
    isDark: true,
  },
  vibrant: {
    id: "vibrant",
    name: "Vibrant",
    primary: "#7c3aed",
    secondary: "#ec4899",
    accent: "#06b6d4",
    background: "#1e1b4b",
    text: "#ffffff",
    textMuted: "#c4b5fd",
    isDark: true,
  },
};

export function getTheme(id: string | null | undefined): Theme {
  if (!id || !(id in THEMES)) return THEMES.default;
  return THEMES[id as ThemeId];
}

export function getCSSVariables(theme: Theme) {
  return {
    "--color-primary": theme.primary,
    "--color-secondary": theme.secondary,
    "--color-accent": theme.accent,
    "--color-background": theme.background,
    "--color-text": theme.text,
    "--color-text-muted": theme.textMuted,
  } as React.CSSProperties;
}
