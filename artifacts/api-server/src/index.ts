import app from "./app";
import { logger } from "./lib/logger";

// Suporta tanto API_PORT (env unificado na raiz) quanto PORT (legado), padrão para 3001
const rawPort = process.env["API_PORT"] ?? process.env["PORT"] ?? "3001";

logger.info({ rawPort }, "Porta configurada como");

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Valor inválido para porta: "${rawPort}"`);
}

app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
