import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { sendError } from "../response/apiResponse";
import { logger } from "../../utils/logger";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    return sendError(res, error.message, error.errors, error.statusCode);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return sendError(res, "Duplicate resource", { target: error.meta?.target }, 409);
    }

    if (error.code === "P2025") {
      return sendError(res, "Resource not found", null, 404);
    }
  }

  logger.error(error);

  return sendError(res, "Internal server error", null, 500);
};
