/**
 * Video embed utility functions
 * Handles YouTube, Vimeo, and local MP4 detection and conversion
 */

export interface VideoSource {
  type: 'youtube' | 'vimeo' | 'mp4' | 'unknown';
  id?: string;
  embedUrl?: string;
  originalUrl: string;
}

/**
 * Validates and parses YouTube URLs
 * Supports: youtube.com, youtu.be, youtube-nocookie.com
 */
export function parseYouTubeUrl(url: string): string | null {
  if (!url) return null;

  // Remove whitespace
  url = url.trim();

  // youtu.be format
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com format with v parameter
  const longMatch = url.match(/(?:youtube\.com\/watch\?.*v=|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];

  // If it's 11 chars (just the ID)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  return null;
}

/**
 * Validates and parses Vimeo URLs
 * Supports: vimeo.com and player.vimeo.com
 */
export function parseVimeoUrl(url: string): string | null {
  if (!url) return null;

  url = url.trim();

  // vimeo.com format
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return match[1];

  // player.vimeo.com format
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) return playerMatch[1];

  // Just the ID
  if (/^\d+$/.test(url)) return url;

  return null;
}

/**
 * Detects if URL is a valid MP4 file
 */
export function isMP4Url(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.endsWith('.mp4');
  } catch {
    return url.endsWith('.mp4');
  }
}

/**
 * Detects if URL is YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url) !== null;
}

/**
 * Detects if URL is Vimeo
 */
export function isVimeoUrl(url: string): boolean {
  return parseVimeoUrl(url) !== null;
}

/**
 * Gets YouTube embed URL from various input formats
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = parseYouTubeUrl(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

/**
 * Gets Vimeo embed URL from various input formats
 */
export function getVimeoEmbedUrl(url: string): string | null {
  const id = parseVimeoUrl(url);
  if (!id) return null;
  return `https://player.vimeo.com/video/${id}?h=&autoplay=1`;
}

/**
 * Detects and returns appropriate embed URL for video source
 */
export function detectAndGetEmbedUrl(url: string | undefined | null): VideoSource {
  if (!url) {
    return {
      type: 'unknown',
      originalUrl: '',
    };
  }

  // Check YouTube
  const youtubeEmbed = getYouTubeEmbedUrl(url);
  if (youtubeEmbed) {
    return {
      type: 'youtube',
      id: parseYouTubeUrl(url) || undefined,
      embedUrl: youtubeEmbed,
      originalUrl: url,
    };
  }

  // Check Vimeo
  const vimeoEmbed = getVimeoEmbedUrl(url);
  if (vimeoEmbed) {
    return {
      type: 'vimeo',
      id: parseVimeoUrl(url) || undefined,
      embedUrl: vimeoEmbed,
      originalUrl: url,
    };
  }

  // Check MP4
  if (isMP4Url(url)) {
    return {
      type: 'mp4',
      originalUrl: url,
    };
  }

  // Unknown format
  return {
    type: 'unknown',
    originalUrl: url,
  };
}

/**
 * Gets the appropriate iframe attributes for a video source
 */
export function getVideoIframeProps(source: VideoSource) {
  if (source.type === 'youtube' && source.embedUrl) {
    return {
      src: source.embedUrl,
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      allowFullScreen: true,
    };
  }

  if (source.type === 'vimeo' && source.embedUrl) {
    return {
      src: source.embedUrl,
      allow: "autoplay; fullscreen; picture-in-picture",
      allowFullScreen: true,
    };
  }

  return null;
}

/**
 * Validates if a URL is a valid video source (YouTube, Vimeo, or MP4)
 */
export function isValidVideoUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const source = detectAndGetEmbedUrl(url);
  return source.type !== 'unknown';
}
