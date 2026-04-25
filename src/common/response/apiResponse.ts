import { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown;
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200
): Response<ApiResponse<T>> =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null
  });

export const sendError = (
  res: Response,
  message: string,
  errors: unknown,
  statusCode = 500
) =>
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors
  });
