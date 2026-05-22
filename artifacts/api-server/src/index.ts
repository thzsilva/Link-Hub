import app from "./app";
import { logger } from "./lib/logger";

// Suporta tanto API_PORT (env unificado na raiz) quanto PORT (legado)
const rawPort = process.env["API_PORT"] ?? process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "API_PORT (ou PORT) não está definido. Verifique o .env na raiz do projeto.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Valor inválido para porta: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
