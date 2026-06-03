import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// CORS: por padrão mantém o comportamento atual (reflete qualquer origem).
// Para restringir, defina ALLOWED_ORIGINS no .env (lista separada por vírgula),
// ex: ALLOWED_ORIGINS="https://hubvoid.vercel.app,https://hubvoid.com".
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    credentials: true,
    origin:
      allowedOrigins.length > 0
        ? (origin, cb) => {
            // Permite requisições sem Origin (curl, server-to-server) e as da allowlist
            if (!origin || allowedOrigins.includes(origin)) cb(null, true);
            else cb(new Error("Origin não permitida pelo CORS"));
          }
        : true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.CLERK_PUBLISHABLE_KEY) {
  // Clerk lê CLERK_PUBLISHABLE_KEY e CLERK_SECRET_KEY do process.env automaticamente.
  // A forma mais simples e robusta — sem publishableKeyFromHost que pode derivar chave errada.
  app.use(clerkMiddleware());
  logger.info("Clerk middleware ativo");
} else {
  logger.warn(
    "CLERK_PUBLISHABLE_KEY não configurado — rotas autenticadas retornarão 401",
  );
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    (_req as any).auth = { userId: null };
    next();
  });
}

app.use("/api", router);

// Global error handler para async route errors
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  if (!res.headersSent) {
    res.status(500).json({ error: err?.message || "Erro interno do servidor" });
  }
});

export default app;
