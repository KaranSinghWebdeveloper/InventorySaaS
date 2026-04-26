import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { PurchaseService } from "../services/purchase.service";

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

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "Purchase fetched",
        await this.purchaseService.getById(req.user!.businessId, Number(req.params.id))
      );
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "Purchase updated",
        await this.purchaseService.update(req.user!.businessId, Number(req.params.id), req.body)
      );
    } catch (error) {
      return next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "Purchase status updated",
        await this.purchaseService.updateStatus(req.user!.businessId, Number(req.params.id), req.body)
      );
    } catch (error) {
      return next(error);
    }
  };
}
