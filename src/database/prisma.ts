import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const prisma = new PrismaClient({
  log:
    env.NODE_ENV === "development"
      ? [
          { emit: "event", level: "query" },
          { emit: "event", level: "error" },
          { emit: "event", level: "warn" }
        ]
      : [{ emit: "event", level: "error" }]
});

prisma.$on("error", (event) => logger.error(event));
prisma.$on("warn", (event) => logger.warn(event));

if (env.NODE_ENV === "development") {
  prisma.$on("query", (event) => logger.debug({ query: event.query, duration: event.duration }));
}
