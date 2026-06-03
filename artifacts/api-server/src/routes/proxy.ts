import { Router } from "express";

const router = Router();

/**
 * GET /api/proxy-image?url=<URL>
 *
 * Proxy de imagens com CORS correto.
 * Serve imagens do Supabase Storage com headers CORS para evitar bloqueios.
 */
router.get("/proxy-image", async (req, res): Promise<void> => {
  const { url } = req.query;

  console.log("Proxy request recebido:", { url, type: typeof url });

  if (!url) {
    console.error("URL parameter faltando");
    res.status(400).json({ error: "URL parameter is required" });
    return;
  }

  const urlString = Array.isArray(url) ? url[0] : url;

  if (typeof urlString !== "string" || !urlString.trim()) {
    console.error("URL inválida:", urlString);
    res.status(400).json({ error: "URL must be a valid string" });
    return;
  }

  // Validar que é uma URL do Supabase (anti-SSRF): hostname real precisa
  // terminar em ".supabase.co" e o protocolo ser http(s). Evita burlas como
  // "http://supabase.co.evil.com" ou "http://evil.com/?x=supabase.co".
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlString);
  } catch {
    res.status(400).json({ error: "URL inválida" });
    return;
  }
  const isHttp = parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
  const host = parsedUrl.hostname.toLowerCase();
  const isSupabaseHost = host === "supabase.co" || host.endsWith(".supabase.co");
  if (!isHttp || !isSupabaseHost) {
    console.error("URL não é do Supabase:", urlString);
    res.status(403).json({ error: "Apenas URLs do Supabase são permitidas" });
    return;
  }

  try {
    console.log(`🔄 Proxy de imagem: ${urlString.substring(0, 100)}...`);

    const response = await fetch(urlString, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    console.log(`Resposta do Supabase: ${response.status}`);

    if (!response.ok) {
      console.error(`Erro ao buscar imagem: ${response.status} ${response.statusText}`);
      res.status(response.status).json({ error: `Erro ao buscar imagem: ${response.statusText}` });
      return;
    }

    // Copiar headers de content-type e adicionar CORS
    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    console.log(`✅ Imagem servida: ${buffer.byteLength} bytes`);

    // Setar headers CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Cache-Control", "public, max-age=3600");

    if (contentType) {
      res.header("Content-Type", contentType);
    }

    res.send(Buffer.from(buffer));
  } catch (error: any) {
    console.error("❌ Erro no proxy de imagem:", error.message);
    res.status(500).json({ error: "Erro ao fazer proxy da imagem" });
  }
});

export default router;
