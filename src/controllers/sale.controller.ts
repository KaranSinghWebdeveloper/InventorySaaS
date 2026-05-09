import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { SaleService } from "../services/sale.service";

export class SaleController {
  constructor(private readonly saleService = new SaleService()) { }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Sale created", await this.saleService.create(req.user!.businessId, req.body), 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Sales fetched", await this.saleService.list(req.user!.businessId, req.query));
    } catch (error) {
      return next(error);
    }
  };
}
