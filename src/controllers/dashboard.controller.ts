import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  constructor(private readonly dashboardService = new DashboardService()) {}

  overview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "Dashboard overview fetched",
        await this.dashboardService.getOverview(req.user!.businessId)
      );
    } catch (error) {
      return next(error);
    }
  };
}
