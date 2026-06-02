// Centralized API base URL resolution.
// Used by both main.tsx (setBaseUrl for customFetch) and raw fetch() calls
// (e.g. file uploads via FormData that don't go through customFetch).

export const apiBaseUrl: string =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://link-hub-production.up.railway.app"
    : "http://localhost:3001");

/**
 * Build an absolute API URL from a relative path.
 * Use for raw fetch() calls (uploads) that bypass customFetch.
 */
export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${clean}`;
}

// ---------------------------------------------------------------------------
// File upload helper
// ---------------------------------------------------------------------------

// Holds the Clerk token getter so uploads can authenticate the same way
// customFetch does. Set once in App.tsx alongside setAuthTokenGetter.
let _uploadTokenGetter: (() => Promise<string | null>) | null = null;

export function setUploadTokenGetter(getter: (() => Promise<string | null>) | null): void {
  _uploadTokenGetter = getter;
}

/**
 * Upload an image file to /api/photos/upload using the absolute API base URL
 * and a Clerk Bearer token. Returns the public URL of the uploaded image.
 * Throws on failure with a human-readable message.
 */
export async function uploadImage(blob: Blob, filename: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", blob, filename);

  const headers: Record<string, string> = {};
  if (_uploadTokenGetter) {
    const token = await _uploadTokenGetter();
    if (token) headers["authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl("/api/photos/upload"), {
    method: "POST",
    body: fd,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro no upload (HTTP ${res.status})`);
  }

  const data = await res.json().catch(() => ({}));
  if (!data.url) {
    throw new Error("Servidor não retornou a URL da imagem");
  }
  return data.url as string;
}
