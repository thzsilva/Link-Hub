import { Router, type IRouter, Request } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// As rotas de debug ficam DESATIVADAS por padrão (inclusive em produção).
// Para usá-las em desenvolvimento, defina ENABLE_DEBUG=true no .env.
// Sem o flag, todas respondem 404 — fechando o vazamento de info/erros.
const DEBUG_ENABLED = process.env.ENABLE_DEBUG === "true";
router.use((_req, res, next) => {
  if (!DEBUG_ENABLED) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  next();
});

// Helper para mostrar headers
function debugHeaders(req: Request) {
  return {
    authorization: req.headers.authorization ? "✅ Presente" : "❌ Ausente",
    "content-type": req.headers["content-type"],
    origin: req.headers.origin,
    cookie: req.headers.cookie ? "✅ Presente" : "❌ Ausente",
  };
}

// Endpoint de debug - remover em produção!
router.get("/debug/env", (_req, res) => {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT,
    PORT: process.env.PORT,
    DEMO_MODE: process.env.DEMO_MODE,
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Configurado" : "❌ Não configurado",
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY ? "✅ Configurado" : "❌ Não configurado",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? "✅ Configurado" : "❌ Não configurado",
  };
  res.json(env);
});

// Debug de headers e token
router.all("/debug/headers", (req, res) => {
  res.json({
    method: req.method,
    headers: debugHeaders(req),
    authObject: (req as any).auth || null,
    userId: (req as any).auth?.userId || null,
    message: (req as any).auth?.userId ? "✅ userId presente" : "❌ userId ausente",
  });
});

// Teste de conexão com banco de dados
router.get("/debug/db-connection", async (_req, res) => {
  try {
    const { db, profilesTable } = await import("@workspace/db");

    // Tenta fazer uma query simples
    const result = await db.select().from(profilesTable).limit(1);

    res.json({
      status: "✅ Conexão OK",
      message: "Banco de dados está acessível",
      databaseWorking: true,
      profilesCount: result.length,
    });
  } catch (error: any) {
    logger.error({ error }, "Erro ao conectar banco de dados");
    res.status(500).json({
      status: "❌ Erro de conexão",
      error: error?.message || "Desconhecido",
      databaseWorking: false,
    });
  }
});

// Teste de autenticação Clerk
router.get("/debug/clerk", async (req, res) => {
  try {
    const { userId } = (req as any).auth || {};

    if (!userId) {
      return res.json({
        status: "⚠️ Não autenticado",
        message: "userId é null - Clerk não conseguiu autenticar",
        userId: null,
        hasClerkKey: !!process.env.CLERK_PUBLISHABLE_KEY,
        authHeader: req.headers.authorization ? "✅ Presente" : "❌ Ausente",
        cookie: req.headers.cookie ? "✅ Presente" : "❌ Ausente",
      });
    }

    // Se conseguiu autenticar, busca mais detalhes
    const { db, profilesTable, eq } = await import("@workspace/db");
    const profile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.clerkUserId, userId))
      .limit(1)
      .then((r) => r[0]);

    res.json({
      status: "✅ Autenticado",
      message: "Clerk está funcionando",
      userId,
      profileExists: !!profile,
      profileUsername: profile?.username,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Database error",
      message: error?.message,
    });
  }
});

// Teste completo do PUT /api/me
router.put("/debug/test-profile-update", async (req, res) => {
  const { userId } = (req as any).auth || {};

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized - Clerk não autenticou",
      userId: null,
    });
  }

  try {
    const { db, profilesTable, eq } = await import("@workspace/db");

    // Tenta buscar o perfil
    const profile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.clerkUserId, userId))
      .limit(1)
      .then((r) => r[0]);

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
        message: "Perfil não existe no banco para este usuário",
        userId,
      });
    }

    // Tenta fazer update (sem mudar nada, só para testar)
    const result = await db
      .update(profilesTable)
      .set({ username: profile.username }) // Atualiza para o mesmo valor
      .where(eq(profilesTable.id, profile.id))
      .returning();

    res.json({
      status: "✅ Update funcionando",
      message: "Conseguiu fazer update no banco",
      profile: result[0],
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Database error",
      message: error?.message || "Desconhecido",
    });
  }
});

export default router;
