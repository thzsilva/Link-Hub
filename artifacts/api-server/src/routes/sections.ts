import { Router } from "express";
import { db, sectionsTable, profilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import {
  CreateSectionBody,
  UpdateSectionBody,
  ReorderSectionsBody,
} from "@workspace/api-zod";

const router = Router();
const DEMO_MODE = process.env.DEMO_MODE === "true";

// Demo data
const demoSections = [
  {
    id: "section-1",
    profileId: "00000000-0000-0000-0000-000000000001",
    name: "Contato",
    position: 0,
    isVisible: true,
    bgColor: "#1f2937",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "section-2",
    profileId: "00000000-0000-0000-0000-000000000001",
    name: "Portfólio",
    position: 1,
    isVisible: true,
    bgColor: "#1f2937",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getProfileId(clerkUserId: string): Promise<string | null> {
  const profile = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, clerkUserId))
    .limit(1)
    .then((r) => r[0]);
  return profile?.id ?? null;
}

// GET /sections - Listar seções do usuário
router.get("/sections", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.json(demoSections);
    return;
  }

  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.json([]);
    return;
  }

  const sections = await db
    .select()
    .from(sectionsTable)
    .where(eq(sectionsTable.profileId, profileId))
    .orderBy(sectionsTable.position);

  res.json(sections);
});

// POST /sections - Criar nova seção
router.post("/sections", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    const parsed = CreateSectionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    res.status(201).json({ ...parsed.data, id: `demo-${Date.now()}` });
    return;
  }

  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, bgColor } = parsed.data;

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }

  // Pegar próxima posição
  const lastSection = await db
    .select({ pos: sectionsTable.position })
    .from(sectionsTable)
    .where(eq(sectionsTable.profileId, profileId))
    .orderBy(sectionsTable.position)
    .then((r) => r[r.length - 1]);

  const nextPosition = (lastSection?.pos ?? -1) + 1;

  try {
    const [section] = await db
      .insert(sectionsTable)
      .values({
        profileId,
        name,
        bgColor: bgColor || undefined,
        position: nextPosition,
        isVisible: true,
      })
      .returning();

    res.status(201).json(section);
  } catch (error: any) {
    console.error("Erro ao criar seção:", error.message);
    res.status(500).json({ error: "Erro ao criar seção" });
  }
});

// PUT /sections/:id - Atualizar seção
router.put("/sections/:id", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    const parsed = UpdateSectionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    res.json({ ...parsed.data, id: req.params.id });
    return;
  }

  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, bgColor, isVisible, position } = parsed.data;
  const sectionId = req.params.id;

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (bgColor !== undefined) updateData.bgColor = bgColor;
  if (isVisible !== undefined) updateData.isVisible = isVisible;
  if (position !== undefined) updateData.position = position;
  updateData.updatedAt = new Date();

  try {
    const [updated] = await db
      .update(sectionsTable)
      .set(updateData)
      .where(and(eq(sectionsTable.id, sectionId), eq(sectionsTable.profileId, profileId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Seção não encontrada" });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    console.error("Erro ao atualizar seção:", error.message);
    res.status(500).json({ error: "Erro ao atualizar seção" });
  }
});

// DELETE /sections/:id - Deletar seção
router.delete("/sections/:id", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.json({ ok: true });
    return;
  }

  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const sectionId = req.params.id;

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(sectionsTable)
      .where(and(eq(sectionsTable.id, sectionId), eq(sectionsTable.profileId, profileId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Seção não encontrada" });
      return;
    }

    res.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao deletar seção:", error.message);
    res.status(500).json({ error: "Erro ao deletar seção" });
  }
});

// PUT /sections/reorder - Reordenar seções
router.put("/sections/reorder", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    const parsed = ReorderSectionsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    res.json({ ok: true });
    return;
  }

  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = ReorderSectionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { ids } = parsed.data;

  const profileId = await getProfileId(userId);
  if (!profileId) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }

  try {
    await Promise.all(
      ids.map((id, idx) =>
        db
          .update(sectionsTable)
          .set({ position: idx })
          .where(and(eq(sectionsTable.id, id), eq(sectionsTable.profileId, profileId)))
      )
    );

    res.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao reordenar seções:", error.message);
    res.status(500).json({ error: "Erro ao reordenar seções" });
  }
});

export default router;
