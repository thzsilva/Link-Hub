import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

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
router.get("/debug/clerk", (req, res) => {
  const { userId } = (req as any).auth || {};

  if (!userId) {
    return res.json({
      status: "⚠️ Não autenticado",
      message: "userId é null - Clerk não conseguiu autenticar",
      userId: null,
      hasClerkKey: !!process.env.CLERK_PUBLISHABLE_KEY,
    });
  }

  res.json({
    status: "✅ Autenticado",
    message: "Clerk está funcionando",
    userId,
  });
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
