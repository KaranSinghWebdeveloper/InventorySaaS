import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../errors/httpErrors";

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    return next();
  };
