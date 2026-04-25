import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../common/response/apiResponse";
import { PurchaseService } from "./purchase.service";

export class PurchaseController {
  constructor(private readonly purchaseService = new PurchaseService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Purchase created", await this.purchaseService.create(req.user!.businessId, req.body), 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Purchases fetched", await this.purchaseService.list(req.user!.businessId, req.query));
    } catch (error) {
      return next(error);
    }
  };
}
