import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { PosSaleService } from "../services/pos-sale.service";

export class PosSaleController {
  constructor(private readonly posSaleService = new PosSaleService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "POS sale created",
        await this.posSaleService.create(req.user!.businessId, req.user!.id, req.body),
        201
      );
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "POS sales fetched",
        await this.posSaleService.list(req.user!.businessId, req.query)
      );
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "POS sale fetched",
        await this.posSaleService.getById(req.user!.businessId, Number(req.params.id))
      );
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "POS sale updated",
        await this.posSaleService.update(req.user!.businessId, Number(req.params.id), req.body)
      );
    } catch (error) {
      return next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.posSaleService.delete(req.user!.businessId, Number(req.params.id));
      return sendSuccess(res, "POS sale deleted", null);
    } catch (error) {
      return next(error);
    }
  };
}
