// Font options for the profile name (hero).
// Fonts are loaded in index.html via Google Fonts.

export type FontId =
  | "default"
  | "anton"
  | "bebas"
  | "playfair"
  | "oswald"
  | "space"
  | "pacifico";

export interface FontOption {
  id: FontId;
  label: string;
  /** CSS font-family stack applied to the name */
  stack: string;
  /** Preview-friendly label rendered in the chosen font */
  sample?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "default", label: "Padrão", stack: "'Inter', system-ui, sans-serif" },
  { id: "anton", label: "Anton", stack: "'Anton', sans-serif" },
  { id: "bebas", label: "Bebas Neue", stack: "'Bebas Neue', sans-serif" },
  { id: "oswald", label: "Oswald", stack: "'Oswald', sans-serif" },
  { id: "space", label: "Space Grotesk", stack: "'Space Grotesk', sans-serif" },
  { id: "playfair", label: "Playfair", stack: "'Playfair Display', serif" },
  { id: "pacifico", label: "Pacifico", stack: "'Pacifico', cursive" },
];

export function getFontStack(id: string | null | undefined): string {
  const found = FONT_OPTIONS.find((f) => f.id === id);
  return found?.stack ?? FONT_OPTIONS[0].stack;
}
