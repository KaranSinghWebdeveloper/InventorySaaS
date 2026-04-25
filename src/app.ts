import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { API_PREFIX } from "./config/constants";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./common/middleware/errorHandler";
import { apiRateLimiter } from "./common/middleware/rateLimiter";
import { requestLogger } from "./common/middleware/requestLogger";
import { v1Routes } from "./routes/v1.routes";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(apiRateLimiter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(API_PREFIX, v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);
