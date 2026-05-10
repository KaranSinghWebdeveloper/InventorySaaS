import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private readonly userService = new UserService()) { }

  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Authenticated user fetched", await this.userService.getProfile(req.user!.id));
    } catch (error) {
      return next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Profile updated", await this.userService.updateProfile(req.user!.id, req.body));
    } catch (error) {
      return next(error);
    }
  };
}
