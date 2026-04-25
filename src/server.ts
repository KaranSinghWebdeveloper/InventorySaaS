import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./database/prisma";
import { logger } from "./utils/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`API server listening on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down API server");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
