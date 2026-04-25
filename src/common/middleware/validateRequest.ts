import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { BadRequestError } from "../errors/httpErrors";

const formatZodError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));

export const validateRequest =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      return next(new BadRequestError("Validation failed", formatZodError(parsed.error)));
    }

    req.body = parsed.data.body ?? req.body;
    req.params = parsed.data.params ?? req.params;
    req.query = parsed.data.query ?? req.query;

    return next();
  };
