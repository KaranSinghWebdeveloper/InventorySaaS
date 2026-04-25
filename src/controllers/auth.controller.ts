import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      return sendSuccess(res, "Registration successful", result, 201);
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      return sendSuccess(res, "Login successful", result);
    } catch (error) {
      return next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = this.authService.refresh(req.body.refreshToken);
      return sendSuccess(res, "Token refreshed", { tokens });
    } catch (error) {
      return next(error);
    }
  };
}
