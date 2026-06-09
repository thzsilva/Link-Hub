import { Router } from "express";
import { getAuth } from "@clerk/express";

const router = Router();
const DEMO_MODE = process.env.DEMO_MODE === "true";

const PLAN_PRICE = 20; // R$ 20/mês

// ---------------------------------------------------------------------------
// Cliente Asaas (sandbox por padrão; produção quando ASAAS_ENV=production)
// ---------------------------------------------------------------------------
const ASAAS_BASE =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";

async function asaas(path: string, method: string, body?: unknown): Promise<any> {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurada");
  const resp = await fetch(`${ASAAS_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      access_token: key,
      "User-Agent": "hubvoid",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.errors?.[0]?.description || `Asaas HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getDbModule() {
  const { db, profilesTable } = await import("@workspace/db");
  const { eq, or } = await import("drizzle-orm");
  return { db, profilesTable, eq, or };
}

/**
 * Calcula o acesso do perfil:
 * - `active`: assinatura paga vigente, OU dentro do trial, OU período pago não expirado.
 * Retorna também quantos dias faltam (trial ou período).
 */
export function computeAccess(profile: any): {
  active: boolean;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  daysLeft: number;
  inTrial: boolean;
} {
  const now = Date.now();
  const status = profile?.subscriptionStatus || "trialing";
  const trialEnds = profile?.trialEndsAt ? new Date(profile.trialEndsAt).getTime() : 0;
  const periodEnds = profile?.currentPeriodEnd ? new Date(profile.currentPeriodEnd).getTime() : 0;

  const inTrial = status === "trialing" && trialEnds > now;
  const paidActive = status === "active" && (periodEnds === 0 || periodEnds > now);
  const active = inTrial || paidActive;

  const ref = inTrial ? trialEnds : periodEnds;
  const daysLeft = ref > now ? Math.ceil((ref - now) / (24 * 60 * 60 * 1000)) : 0;

  return {
    active,
    status,
    trialEndsAt: profile?.trialEndsAt ? new Date(profile.trialEndsAt).toISOString() : null,
    currentPeriodEnd: profile?.currentPeriodEnd ? new Date(profile.currentPeriodEnd).toISOString() : null,
    daysLeft,
    inTrial,
  };
}

// ---------------------------------------------------------------------------
// GET /api/me/subscription — status da assinatura (para o dashboard)
// ---------------------------------------------------------------------------
router.get("/me/subscription", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.json({ active: true, status: "active", trialEndsAt: null, currentPeriodEnd: null, daysLeft: 30, inTrial: false, price: PLAN_PRICE });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const { db, profilesTable, eq } = await getDbModule();
    const profile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.clerkUserId, userId))
      .limit(1)
      .then((r: any[]) => r[0]);

    if (!profile) { res.json({ active: false, status: "none", daysLeft: 0, inTrial: false, price: PLAN_PRICE }); return; }
    res.json({ ...computeAccess(profile), price: PLAN_PRICE });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao consultar assinatura", details: err?.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/subscription/checkout — cria cliente + assinatura no Asaas e
// retorna a página de pagamento (invoiceUrl) e o QR Code PIX (quando PIX).
// Não coletamos dados de cartão: o cartão é pago na página hospedada do Asaas.
// ---------------------------------------------------------------------------
router.post("/subscription/checkout", async (req, res): Promise<void> => {
  if (DEMO_MODE) {
    res.json({ invoiceUrl: "https://sandbox.asaas.com/i/demo", pix: null, subscriptionId: "demo" });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { name, email, cpfCnpj, billingType } = req.body || {};
  if (!name || !email || !cpfCnpj) {
    res.status(400).json({ error: "Nome, e-mail e CPF/CNPJ são obrigatórios." });
    return;
  }
  const method = ["PIX", "CREDIT_CARD", "BOLETO"].includes(billingType) ? billingType : "UNDEFINED";

  try {
    const { db, profilesTable, eq } = await getDbModule();
    const profile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.clerkUserId, userId))
      .limit(1)
      .then((r: any[]) => r[0]);
    if (!profile) { res.status(404).json({ error: "Perfil não encontrado" }); return; }

    // 1) Cliente Asaas (reusa se já existir)
    let customerId: string | undefined = profile.asaasCustomerId || undefined;
    if (!customerId) {
      const customer = await asaas("/customers", "POST", {
        name,
        email,
        cpfCnpj: String(cpfCnpj).replace(/\D/g, ""),
      });
      customerId = customer.id;
      await db.update(profilesTable).set({ asaasCustomerId: customerId }).where(eq(profilesTable.id, profile.id));
    }

    // 2) Assinatura mensal de R$20 (reusa se já existir)
    let subscriptionId: string | undefined = profile.asaasSubscriptionId || undefined;
    if (!subscriptionId) {
      const sub = await asaas("/subscriptions", "POST", {
        customer: customerId,
        billingType: method,
        value: PLAN_PRICE,
        nextDueDate: todayYMD(),
        cycle: "MONTHLY",
        description: "hubvoid — assinatura mensal",
      });
      subscriptionId = sub.id;
      await db.update(profilesTable).set({ asaasSubscriptionId: subscriptionId }).where(eq(profilesTable.id, profile.id));
    }

    // 3) Primeira cobrança → página de pagamento + (se PIX) QR Code
    const payments = await asaas(`/subscriptions/${subscriptionId}/payments`, "GET");
    const firstPayment = payments?.data?.[0];
    let pix: { encodedImage: string; payload: string } | null = null;
    if (firstPayment?.id) {
      try {
        const qr = await asaas(`/payments/${firstPayment.id}/pixQrCode`, "GET");
        if (qr?.encodedImage && qr?.payload) pix = { encodedImage: qr.encodedImage, payload: qr.payload };
      } catch {
        // Cobrança pode não ter PIX (ex.: método cartão) — segue só com invoiceUrl
      }
    }

    res.json({
      subscriptionId,
      invoiceUrl: firstPayment?.invoiceUrl || null,
      pix,
      value: PLAN_PRICE,
    });
  } catch (err: any) {
    console.error("Erro no checkout Asaas:", err?.message);
    res.status(502).json({ error: err?.message || "Falha ao iniciar assinatura" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/webhooks/asaas — recebe eventos de cobrança do Asaas
// Segurança: valida o header `asaas-access-token` contra ASAAS_WEBHOOK_TOKEN.
// ---------------------------------------------------------------------------
router.post("/webhooks/asaas", async (req, res): Promise<void> => {
  // Valida o token configurado no painel do Asaas (Configurações → Webhooks)
  const token = req.headers["asaas-access-token"];
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || token !== expected) {
    res.status(401).json({ error: "Unauthorized webhook" });
    return;
  }

  try {
    const event = req.body?.event as string | undefined;
    const payment = req.body?.payment;
    const subscription = req.body?.subscription;

    // Identifica o cliente/assinatura para mapear ao perfil
    const customerId: string | undefined = payment?.customer || subscription?.customer;
    const subscriptionId: string | undefined = payment?.subscription || subscription?.id;

    if (!customerId && !subscriptionId) {
      res.json({ ok: true, ignored: "sem customer/subscription" });
      return;
    }

    const { db, profilesTable, eq, or } = await getDbModule();
    const conditions = [];
    if (subscriptionId) conditions.push(eq(profilesTable.asaasSubscriptionId, subscriptionId));
    if (customerId) conditions.push(eq(profilesTable.asaasCustomerId, customerId));

    const profile = await db
      .select()
      .from(profilesTable)
      .where(conditions.length > 1 ? or(...conditions) : conditions[0])
      .limit(1)
      .then((r: any[]) => r[0]);

    if (!profile) {
      res.json({ ok: true, ignored: "perfil não encontrado" });
      return;
    }

    const update: Record<string, unknown> = {};

    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Acesso liberado; período vai até a próxima data de vencimento (ou +31 dias)
        const due = payment?.dueDate ? new Date(payment.dueDate) : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
        update.subscriptionStatus = "active";
        update.currentPeriodEnd = due;
        if (subscriptionId) update.asaasSubscriptionId = subscriptionId;
        if (customerId) update.asaasCustomerId = customerId;
        break;
      }
      case "PAYMENT_OVERDUE":
        update.subscriptionStatus = "past_due";
        break;
      case "SUBSCRIPTION_DELETED":
      case "SUBSCRIPTION_INACTIVATED":
      case "PAYMENT_DELETED":
      case "PAYMENT_REFUNDED":
        update.subscriptionStatus = "canceled";
        break;
      default:
        // Evento não tratado — apenas confirma o recebimento
        res.json({ ok: true, event });
        return;
    }

    await db.update(profilesTable).set(update).where(eq(profilesTable.id, profile.id));
    res.json({ ok: true, event, profileId: profile.id });
  } catch (err: any) {
    console.error("Erro no webhook Asaas:", err?.message);
    // Responder 200 para o Asaas não reenviar em loop por erro nosso de parsing;
    // logamos para investigar.
    res.status(200).json({ ok: false, error: err?.message });
  }
});

export default router;
