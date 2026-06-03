// Orderable sections of the public profile.
// HERO and FOOTER are fixed (always first/last) and not part of the order.

export type SectionKey =
  | "bio"
  | "video"
  | "gallery"
  | "events"
  | "links"
  | "spotify"
  | "contact";

export interface SectionMeta {
  key: SectionKey;
  label: string;
  icon: string; // emoji for the reorder UI
}

export const SECTION_META: SectionMeta[] = [
  { key: "bio", label: "Sobre", icon: "📝" },
  { key: "video", label: "Vídeo / Destaque", icon: "🎥" },
  { key: "gallery", label: "Galeria", icon: "🖼️" },
  { key: "events", label: "Eventos", icon: "📅" },
  { key: "links", label: "Links", icon: "🔗" },
  { key: "spotify", label: "Playlists", icon: "🎵" },
  { key: "contact", label: "Contato", icon: "💬" },
];

export const DEFAULT_SECTION_ORDER: SectionKey[] = SECTION_META.map((s) => s.key);

/**
 * Returns a valid, complete order: starts from the saved order (filtering out
 * unknown keys) and appends any sections missing from it, so new sections
 * always appear even if the saved order predates them.
 */
export function normalizeSectionOrder(saved: unknown): SectionKey[] {
  const valid = new Set<SectionKey>(DEFAULT_SECTION_ORDER);
  const result: SectionKey[] = [];
  if (Array.isArray(saved)) {
    for (const k of saved) {
      if (valid.has(k as SectionKey) && !result.includes(k as SectionKey)) {
        result.push(k as SectionKey);
      }
    }
  }
  for (const k of DEFAULT_SECTION_ORDER) {
    if (!result.includes(k)) result.push(k);
  }
  return result;
}
